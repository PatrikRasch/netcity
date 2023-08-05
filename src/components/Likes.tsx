import React, { useState } from "react";
import { updateDoc, DocumentReference } from "firebase/firestore";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";

import { TargetData } from "../interfaces";

interface Props {
  liked: boolean;
  disliked: boolean;
  setLiked: (value: boolean) => void;
  loggedInUserId: string;
  openProfileId: string;
  postDocRef: DocumentReference;
  postData: TargetData | null;
  postNumOfLikes: number;
  setPostNumOfLikes: (value: number) => void;
  removeLike: () => Promise<void>;
  removeDislike: () => Promise<void>;
  postLikes: object;
}

function Likes({
  liked,
  disliked,
  setLiked,
  loggedInUserId,
  openProfileId,
  postDocRef,
  postData,
  postNumOfLikes,
  setPostNumOfLikes,
  removeLike,
  removeDislike,
  postLikes,
}: Props) {
  //2 It can't add the likes correctly because they aren't being fetched from the backend properly when a like is added?
  //2 The addLike function only knows about the like that has just now been added?
  //2 That's because postLikes is declared within this custom hook as an empty object
  //2 Instead, it should base its state on what it gets from the backend

  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (postLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postLikes as true
    // console.log(postLikes);
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...postData?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    try {
      await updateDoc(postDocRef, { likes: newLikes }); // Update the backend with the new likes
    } catch (err) {
      console.error(err);
    }
  };

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
      <div>{postNumOfLikes}</div>
    </div>
  );
}

export default Likes;
