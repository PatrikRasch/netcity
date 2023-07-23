import React, { useState, useEffect } from "react";

import profilePicture2 from "./../assets/images/autumn-girl.jpg";
import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import commentIcon from "./../assets/icons/comment.png";

import { db } from "./../config/firebase.config";
import { doc, getDoc, updateDoc, collection } from "firebase/firestore";

import { PostProp } from "../interfaces";

//3 Must take in props with postUser, postDate, postText, postNumOfLikes, postNumOfDislikes, postNumOfComments
//3    When a new post is made, the numbers should be 0 (or "no comments").
//3    The date should be set to today's date

//3 Posts needs to be populated with data that comes from Firebase.
//3   When a user makes a post, all of its data should populate a Post component

interface Props {
  postFirstName: PostProp["firstName"];
  postLastName: PostProp["lastName"];
  postText: PostProp["postText"];
  postDate: PostProp["postDate"];
  postLikes: PostProp["postLikes"];
  postDislikes: PostProp["postDislikes"];
  postNumOfComments: PostProp["postNumOfComments"];
  userId: PostProp["userId"];
  postId: PostProp["postId"];
}

function Post(props: Props) {
  const [liked, setLiked] = useState(false);
  const [likeObject, setLikeObject] = useState(null);
  const { postFirstName } = props;
  const { postLastName } = props;
  const { postText } = props;
  const { postLikes } = props;
  const { postDislikes } = props;
  const { postNumOfComments } = props;
  const { postDate } = props;
  const { userId } = props;
  const { postId } = props;

  const postNumOfLikes = Object.keys(postLikes).length;
  const postNumOfDislikes = Object.keys(postDislikes).length;

  //2 If user clicks on like/dislike, add the userId into the object as true
  //2   Update the backend with the like

  const handleClickLike = async () => {
    setLiked(true);
    (postLikes as any)[userId] = true;
    const usersDoc = doc(db, "users", userId);
    const postsProfileCollection = collection(usersDoc, "postsProfile");
    const postDoc = doc(postsProfileCollection, postId);
    const targetDoc = await getDoc(postDoc);
    const data = targetDoc.data();
    if (data) {
      const newLikes = { ...data.likes, [userId]: true };
      await updateDoc(postDoc, { likes: newLikes });
    }
  };

  const getPost = async () => {
    const usersDoc = doc(db, "users", userId);
    const postsProfileCollection = collection(usersDoc, "postsProfile");
    const postDoc = doc(postsProfileCollection, postId);
    const targetDoc = await getDoc(postDoc);
    const data = targetDoc.data();
    if (data?.likes?.hasOwnProperty(userId)) setLiked(true);
  };

  useEffect(() => {
    getPost();
  }, []);

  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartLiked} alt="" className="max-h-6" />;
    }
  };

  //2 Every post needs a subcollection that holds all the comments?
  //2 Every post needs a way to track which users has liked the post,
  //2 so that a user can only like a post once.
  //2 Comments will demand this, but with even more complexity.

  return (
    <div className="w-full min-h-[150px] bg-white shadow-xl">
      <div className="min-h-[120px] p-4 gap-2">
        <div className="flex gap-4 items-center">
          <div className="min-w-[40px] max-w-min">
            <img
              src={profilePicture2}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <div>{postFirstName + " " + postLastName}</div>
          <div className="opacity-50 text-sm">{postDate}</div>
        </div>
        <div>{postText}</div>
      </div>
      <div className="w-full h-[2px] bg-gray-300"></div>
      <div className="grid grid-cols-[1fr,1fr,2fr] h-[33px] items-center justify-items-center">
        {/*//1 Like/Dislike */}
        {/*//1 Like */}
        <div className="flex gap-2">
          <button onClick={() => handleClickLike()}>{showLikedOrNot()}</button>
          <div>{postNumOfLikes}</div>
        </div>
        {/*//1 Dislike */}
        <div className="flex gap-2">
          <img src={dislikeIcon} alt="" className="max-h-6" />
          <div>{postNumOfDislikes}</div>
        </div>
        {/* //1 Comment */}
        <div className="flex gap-2">
          <img src={commentIcon} alt="" className="max-h-6" />
          <div>{postNumOfComments}</div>
        </div>
      </div>
    </div>
  );
}

export default Post;
