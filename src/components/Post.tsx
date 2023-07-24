import React, { useState, useEffect } from "react";

import profilePicture2 from "./../assets/images/autumn-girl.jpg";
import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";
import commentIcon from "./../assets/icons/comment.png";

import { db } from "./../config/firebase.config";
import { doc, getDoc, updateDoc, collection } from "firebase/firestore";

import { PostProp } from "../interfaces";
import { TargetData } from "../interfaces";

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
  const [disliked, setDisliked] = useState(false);
  const [postNumOfLikes, setPostNumOfLikes] = useState(0);
  const [postNumOfDislikes, setPostNumOfDislikes] = useState(0);
  const [postData, setPostData] = useState<TargetData | null>(null);
  const { postFirstName } = props;
  const { postLastName } = props;
  const { postText } = props;
  const { postLikes } = props;
  const { postDislikes } = props;
  const { postNumOfComments } = props;
  const { postDate } = props;
  const { userId } = props;
  const { postId } = props;

  useEffect(() => {
    console.log("loop");
    setPostNumOfLikes(Object.keys(postLikes).length);
    setPostNumOfDislikes(-Object.keys(postDislikes).length);
  }, []);

  const usersDoc = doc(db, "users", userId);
  const postsProfileCollection = collection(usersDoc, "postsProfile");
  const postDoc = doc(postsProfileCollection, postId);

  //1 Get the data from this post from the backend and store it in the "postData" state
  const getPostData = async () => {
    try {
      const targetDoc = await getDoc(postDoc);
      const targetData = targetDoc.data();
      setPostData(targetData as TargetData | null);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    console.log("use effect");
    getPostData();
  }, []);

  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (postLikes as { [key: string]: boolean })[userId] = true; // Add the userId into postLikes as true
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...postData?.likes, [userId]: true }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const removeLike = async () => {
    setLiked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postLikes as { [key: string]: boolean })[userId]; // Remove the userId from postLikes
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.likes as { [key: string]: boolean })[userId]; // Delete the userId from the postData object
    const newLikes = { ...postData?.likes }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const addDislike = async () => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (postDislikes as { [key: string]: boolean })[userId] = true; // Add the userId into postDislikes as true
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...postData?.dislikes, [userId]: true }; // Define new object to hold the dislikes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new dislikes
  };

  const removeDislike = async () => {
    setDisliked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postDislikes as { [key: string]: boolean })[userId]; // Remove the userId from postLikes
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.dislikes as { [key: string]: boolean })[userId]; // Delete the userId from the postData object
    const newDislikes = { ...postData?.dislikes }; // Define new object to hold the likes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new likes
  };

  //2 Could potentially add in a revert of the frontend update if the backend update
  //2 was to fail for whatever reason, and then alert the user of the issue. Optimistic UI, that is.

  const handleClickLike = async () => {
    // If post not liked
    if (!liked) {
      if (disliked) {
        removeDislike();
      }
      addLike();
    }
    // If post already liked
    if (liked) {
      removeLike();
    }
  };

  const handleClickDislike = async () => {
    // If post not disliked
    if (!disliked) {
      if (liked) {
        removeLike();
      }
      addDislike();
    }
    // If post already liked
    if (disliked) {
      removeDislike();
    }
  };

  //1 Gets the initial post data from Firebase
  const getPost = async () => {
    const usersDoc = doc(db, "users", userId);
    const postsProfileCollection = collection(usersDoc, "postsProfile");
    const postDoc = doc(postsProfileCollection, postId);
    const targetDoc = await getDoc(postDoc);
    const data = targetDoc.data();
    if (data?.likes?.hasOwnProperty(userId)) setLiked(true);
    if (data?.dislikes?.hasOwnProperty(userId)) setDisliked(true);
  };
  useEffect(() => {
    console.log("loop");
    getPost();
  }, []);

  //1 The like icon on each post. Shows if the user has liked a post.
  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartLiked} alt="" className="max-h-6" />;
    }
  };
  //1 The dislike icon on each post. Shows if the user has disliked a post.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartDisliked} alt="" className="max-h-6" />;
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
          <button onClick={() => handleClickDislike()}>{showDislikedOrNot()}</button>
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

//3 If user clicks on like/dislike, add the userId into the object as true
//3   Update the backend with the like

//3 For tomorrow: What is the difference on postLikes and postData?
//3   1. postLikes is the prop for the "likes" key-value pair  for the post, coming from AllPosts
//3   2. postData is state declared in this component, which gets populated by the getPostData() function

//3 Next goal is to ensure that when a like is removed, it is reflected on the screen.
//3 Work with the useEffect below and handleClick. Gotta do something with state
//3 That updates every time the like button is clicked.

//3 Only allow a userId to have either liked or disliked a post.
//3 - If a user dislikes a post after having liked it, remove the like
//3 - If a user likes post after having disliked it, remove the dislike
