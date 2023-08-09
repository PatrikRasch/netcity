import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import { TargetData } from "../../interfaces";

export function usePostLikingFunctions(
  loggedInUserId: string,
  postDoc: DocumentReference,
  postData: TargetData | null,
  setPostNumOfLikes: (value: number) => void
) {
  const [liked, setLiked] = useState(false);
  const [postLikes, setPostLikes] = useState({});

  //2 It can't add the likes correctly because they aren't being fetched from the backend properly when a like is added?
  //2 The addLike function only knows about the like that has just now been added?
  //2 That's because postLikes is declared within this custom hook as an empty object
  //2 Instead, it should base its state on what it gets from the backend
  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (postLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postLikes as true
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...postData?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    try {
      await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
    } catch (err) {
      console.error(err);
    }
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
