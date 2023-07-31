import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import { TargetData } from "../../interfaces";

export function useDislikingFunctions(
  loggedInUserId: string,
  postDoc: DocumentReference,
  postData: TargetData | null,
  setPostNumOfDislikes: (value: number) => void
) {
  const [disliked, setDisliked] = useState(false);
  const [postDislikes, setPostDislikes] = useState({});

  const addDislike = async () => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (postDislikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postDislikes as true
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...postData?.dislikes, [loggedInUserId]: true }; // Define new object to hold the dislikes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new dislikes
  };

  const removeDislike = async () => {
    setDisliked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postDislikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.dislikes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newDislikes = { ...postData?.dislikes }; // Define new object to hold the likes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new likes
  };

  return { addDislike, removeDislike, disliked, setDisliked };
}

export default useDislikingFunctions;
