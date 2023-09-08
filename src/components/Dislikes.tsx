import React, { useEffect, useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";

import { TargetData, TargetCommentData } from "../interfaces";

interface Props {
  totalDislikes: object;
  liked: boolean;
  disliked: boolean;
  setDisliked: (value: boolean) => void;
  numOfDislikes: number;
  setNumOfDislikes: (value: number) => void;
  removeLike: (value: DocumentReference) => Promise<void>;
  removeDislike: (value: DocumentReference) => Promise<void>;
  loggedInUserId: string;
  docRef?: DocumentReference;
  data: TargetData | TargetCommentData | null;
}

function Dislikes({
  totalDislikes,
  liked,
  disliked,
  setDisliked,
  numOfDislikes,
  setNumOfDislikes,
  removeLike,
  removeDislike,
  loggedInUserId,
  docRef,
  data,
}: Props) {
  const addDislike = async (commentDocRef: DocumentReference) => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (totalDislikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postDislikes as true
    setNumOfDislikes(-Object.keys(totalDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...data?.dislikes, [loggedInUserId]: true }; // Define new object to hold the dislikes
    await updateDoc(commentDocRef, { dislikes: newDislikes }); // Update the backend with the new dislikes
  };

  const handleClickDislike = async () => {
    if (docRef !== undefined) {
      if (!disliked) {
        if (liked) {
          removeLike(docRef);
        }
        addDislike(docRef);
      }
      if (disliked) {
        removeDislike(docRef);
      }
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
      <div>{numOfDislikes}</div>
    </div>
  );
}

export default Dislikes;
