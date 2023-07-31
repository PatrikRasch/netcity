import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import { TargetData } from "../../interfaces";

export function useLikingFunctions(
  loggedInUserId: string,
  postDoc: DocumentReference,
  postData: TargetData | null,
  setPostNumOfLikes: (value: number) => void
) {
  const [liked, setLiked] = useState(false);
  const [postLikes, setPostLikes] = useState({});

  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (postLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postLikes as true
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...postData?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const removeLike = async () => {
    setLiked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postLikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.likes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newLikes = { ...postData?.likes }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  return { addLike, removeLike, liked, setLiked };
}
