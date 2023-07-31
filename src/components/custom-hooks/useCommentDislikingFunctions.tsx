import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";
import firebase from "firebase/compat/app";

interface TargetCommentData {
  date: string;
  firstName: string;
  lastName: string;
  likes: object;
  dislikes: object;
  text: string;
  timestamp: firebase.firestore.Timestamp;
}

export function useCommentDislikingFunctions(
  loggedInUserId: string,
  commentDoc: DocumentReference,
  commentData: TargetCommentData | null,
  setCommentNumOfDislikes: (value: number) => void
) {
  const [disliked, setDisliked] = useState(false);
  const [commentDislikes, setCommentDislikes] = useState({});

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

  return { addDislike, removeDislike, disliked, setDisliked };
}
