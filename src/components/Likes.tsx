import React, { useState, useEffect } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";

import { TargetData, TargetCommentData } from "../interfaces";

interface Props {
  totalLikes: object;
  liked: boolean;
  disliked: boolean;
  setLiked: (value: boolean) => void;
  numOfLikes: number;
  setNumOfLikes: (value: number) => void;
  removeLike: (value: DocumentReference) => Promise<void>;
  removeDislike: (value: DocumentReference) => Promise<void>;
  loggedInUserId: string;
  docRef: DocumentReference;
  data: TargetData | TargetCommentData | null;
}

function Likes({
  totalLikes,
  liked,
  disliked,
  setLiked,
  numOfLikes,
  setNumOfLikes,
  removeLike,
  removeDislike,
  loggedInUserId,
  docRef,
  data,
}: Props) {
  const addLike = async (commentDocRef: DocumentReference) => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (totalLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postLikes as true
    setNumOfLikes(Object.keys(totalLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...data?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    try {
      await updateDoc(commentDocRef, { likes: newLikes }); // Update the backend with the new likes
    } catch (err) {
      console.error(err);
    }
  };

  const handleClickLike = async () => {
    if (docRef !== undefined) {
      if (!liked) {
        if (disliked) {
          removeDislike(docRef);
        }
        addLike(docRef);
      }
      if (liked) {
        removeLike(docRef);
      }
    }
  };

  //1 The like icon on each post. Shows if the user has liked a post.
  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartLiked} alt="" className="max-h-6" />;
    }
  };

  return (
    <div className="flex gap-2">
      {/* <button>pic</button> */}
      <button onClick={() => handleClickLike()}>{showLikedOrNot()}</button>
      {/* <div>5</div> */}
      <div>{numOfLikes}</div>
    </div>
  );
}

export default Likes;
