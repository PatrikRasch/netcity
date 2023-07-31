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

export function useCommentLikingFunctions(
  loggedInUserId: string,
  commentDoc: DocumentReference,
  commentData: TargetCommentData | null,
  setCommentNumOfLikes: (value: number) => void
) {
  const [liked, setLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState({});

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

  return { addLike, removeLike, liked, setLiked };
}
