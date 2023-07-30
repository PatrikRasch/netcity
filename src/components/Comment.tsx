import React, { useState, useEffect } from "react";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";
import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

import { db } from "./../config/firebase.config";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import firebase from "firebase/compat/app";

export interface TargetCommentData {
  date: string;
  firstName: string;
  lastName: string;
  likes: object;
  dislikes: object;
  text: string;
  timestamp: firebase.firestore.Timestamp;
}

interface Props {
  commentFirstName: string;
  commentLastName: string;
  commentText: string;
  commentDate: string;
  commentLikes: object;
  commentDislikes: object;
  commentById: string;
  openProfileId: string;
  loggedInUserId: string;
  commentId: string;
  postId: string;
}

const Comment = ({
  commentFirstName,
  commentLastName,
  commentText,
  commentDate,
  commentLikes,
  commentDislikes,
  commentById,
  openProfileId,
  loggedInUserId,
  commentId,
  postId,
}: Props) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [commentNumOfLikes, setCommentNumOfLikes] = useState(0);
  const [commentNumOfDislikes, setCommentNumOfDislikes] = useState(0);
  const [profilePicture, setProfilePicture] = useState("");
  const [commentData, setCommentData] = useState<TargetCommentData | null>(null);

  //2 Do we have to get comment data in this manner here?

  // //1 Access this comment document from Firestore
  const usersDoc = doc(db, "users", openProfileId); // Grab the user
  const postsProfileCollection = collection(usersDoc, "postsProfile"); // Grab the posts on the user's profile
  const postDoc = doc(postsProfileCollection, postId); // grab this post
  const commentsCollection = collection(postDoc, "comments");
  const commentDoc = doc(commentsCollection, commentId);

  // //1 Get the data from this comment from the backend and store it in the "commentData" state
  const getCommentData = async () => {
    try {
      const targetComment = await getDoc(commentDoc); // Fetch the data
      const data = targetComment.data();
      setCommentData(data as TargetCommentData | null); // Store the comment data in state
      if (data?.likes?.hasOwnProperty(loggedInUserId)) setLiked(true); // Has the user already liked the comment?
      if (data?.dislikes?.hasOwnProperty(loggedInUserId)) setDisliked(true); // Has the user already disliked the comment?
      getCommentProfilePicture(data?.userId); // Grab the profile picture of the user who made the comment
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getCommentData();
    setCommentNumOfLikes(Object.keys(commentLikes).length);
    setCommentNumOfDislikes(-Object.keys(commentDislikes).length);
  }, []);

  const getCommentProfilePicture = async (userId: string) => {
    console.log(userId);
    if (!userId) return <h1>Loading...</h1>;
    const usersDoc = doc(db, "users", userId);

    const targetUser = await getDoc(usersDoc);
    const data = targetUser.data();
    const profilePictureRef = data?.profilePicture;
    setProfilePicture(profilePictureRef);
  };

  const handleClickLike = async () => {
    // If comment not liked
    if (!liked) {
      if (disliked) {
        removeDislike();
      }
      addLike();
    }
    // If comment already liked
    if (liked) {
      removeLike();
    }
  };

  const handleClickDislike = async () => {
    // If comment not disliked
    if (!disliked) {
      if (liked) {
        removeLike();
      }
      addDislike();
    }
    // If comment already liked
    if (disliked) {
      removeDislike();
    }
  };

  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (commentLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into commentLikes as true
    setCommentNumOfLikes(Object.keys(commentLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...commentData?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    await updateDoc(commentDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const removeLike = async () => {
    setLiked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (commentLikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from commentLikes
    setCommentNumOfLikes(Object.keys(commentLikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (commentData?.likes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the commentData object
    const newLikes = { ...commentData?.likes }; // Define new object to hold the likes
    await updateDoc(commentDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const addDislike = async () => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (commentDislikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into commentDislikes as true
    setCommentNumOfDislikes(-Object.keys(commentDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...commentData?.dislikes, [loggedInUserId]: true }; // Define new object to hold the dislikes
    await updateDoc(commentDoc, { dislikes: newDislikes }); // Update the backend with the new dislikes
  };

  const removeDislike = async () => {
    setDisliked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (commentDislikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from commentLikes
    setCommentNumOfDislikes(-Object.keys(commentDislikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (commentData?.dislikes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the commentData object
    const newDislikes = { ...commentData?.dislikes }; // Define new object to hold the likes
    await updateDoc(commentDoc, { dislikes: newDislikes }); // Update the backend with the new likes
  };

  //1 The like icon on each comment. Shows if the user has liked a comment.
  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartLiked} alt="" className="max-h-6" />;
    }
  };
  //1 The dislike icon on each comment. Shows if the user has disliked a comment.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartDisliked} alt="" className="max-h-6" />;
    }
  };

  return (
    <div className="grid pt-2 pl-4 pr-4">
      <div className="grid grid-cols-[1fr,8fr] gap-4 items-center">
        <img
          src={profilePicture === "" ? emptyProfilePicture : profilePicture}
          alt="User who made comment"
          className="rounded-[50%] max-w-[38px] self-start aspect-square object-cover"
        />
        <div className="flex flex-col">
          <div className="bg-gray-200  rounded-xl p-2">
            <div className="text-[12px] font-bold">{commentFirstName + " " + commentLastName}</div>
            <div className=" grid grid-cols-[4fr,1fr] gap-4">{commentText}</div>
          </div>

          <div className="grid grid-cols-[50px,50px] h-max mt-1 mb-1 items-start justify-items-start">
            <div className="flex gap-1">
              <button onClick={() => handleClickLike()}>{showLikedOrNot()}</button>
              <div>{commentNumOfLikes}</div>
            </div>
            {/*//1 Dislike */}
            <div className="flex gap-1">
              <button onClick={() => handleClickDislike()}>{showDislikedOrNot()}</button>
              <div>{commentNumOfDislikes}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
