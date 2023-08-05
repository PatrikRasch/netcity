import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";

import { TargetData } from "../interfaces";

interface Props {
  liked: boolean;
  disliked: boolean;
  setDisliked: (value: boolean) => void;
  loggedInUserId: string;
  openProfileId: string;
  postDocRef: DocumentReference;
  postData: TargetData | null;
  postNumOfDislikes: number;
  setPostNumOfDislikes: (value: number) => void;
  removeLike: () => Promise<void>;
  removeDislike: () => Promise<void>;
  postDislikes: object;
}

function Dislikes({
  liked,
  disliked,
  setDisliked,
  loggedInUserId,
  openProfileId,
  postDocRef,
  postData,
  postNumOfDislikes,
  setPostNumOfDislikes,
  removeLike,
  removeDislike,
  postDislikes,
}: Props) {
  const addDislike = async () => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (postDislikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postDislikes as true
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...postData?.dislikes, [loggedInUserId]: true }; // Define new object to hold the dislikes
    await updateDoc(postDocRef, { dislikes: newDislikes }); // Update the backend with the new dislikes
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

  //1 The dislike icon on each post. Shows if the user has disliked a post.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartDisliked} alt="" className="max-h-6" />;
    }
  };

  return (
    <div className="flex gap-2">
      <button onClick={() => handleClickDislike()}>{showDislikedOrNot()}</button>
      <div>{postNumOfDislikes}</div>
    </div>
  );
}

export default Dislikes;
