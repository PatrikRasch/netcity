import React, { useEffect, useState } from 'react'
import { updateDoc, DocumentReference } from 'firebase/firestore'

import dislikeIconUnselected from './../assets/icons/dislikeIcon/dislikeIconUnselected.svg'
import dislikeIconSelected from './../assets/icons/dislikeIcon/dislikeIconSelected.svg'

import { TargetData, TargetCommentData } from '../interfaces'

interface Props {
  totalDislikes: object
  liked: boolean
  disliked: boolean
  setDisliked: (value: boolean) => void
  numOfDislikes: number
  setNumOfDislikes: (value: number) => void
  removeLike: (value: DocumentReference) => Promise<void>
  removeDislike: (value: DocumentReference) => Promise<void>
  loggedInUserId: string
  docRef?: DocumentReference
  data: TargetData | TargetCommentData | null
  isPost: boolean
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
  isPost,
}: Props) {
  const addDislike = async (commentDocRef: DocumentReference) => {
    setDisliked(true) // Set disliked to true, makes heart black
    // Frontend updates:
    ;(totalDislikes as { [key: string]: boolean })[loggedInUserId] = true // Add the userId into postDislikes as true
    setNumOfDislikes(Object.keys(totalDislikes).length) // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...data?.dislikes, [loggedInUserId]: true } // Define new object to hold the dislikes
    await updateDoc(commentDocRef, { dislikes: newDislikes }) // Update the backend with the new dislikes
  }

  const handleClickDislike = async () => {
    if (docRef !== undefined) {
      if (!disliked) {
        if (liked) {
          removeLike(docRef)
        }
        addDislike(docRef)
      }
      if (disliked) {
        removeDislike(docRef)
      }
    }
  }

  //1 The dislike icon on each post. Shows if the user has disliked a post.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIconUnselected} alt="" className="max-h-6" />
    } else {
      return <img src={dislikeIconSelected} alt="" className="max-h-6" />
    }
  }

  const postOrComment = () => {
    if (isPost) {
      return (
        <button
          onClick={() => handleClickDislike()}
          className={`font-mainFont weight flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl p-1 font-semibold lg:h-[40px] ${
            disliked ? 'bg-redSoft text-redMain' : 'bg-graySoft text-grayMain'
          }`}
        >
          {showDislikedOrNot()}
          <div>{numOfDislikes}</div>
        </button>
      )
    } else {
      return (
        <button
          className={`font-mainFont flex w-full justify-center gap-1 ${
            disliked ? 'text-redMain' : 'text-grayMain'
          }`}
        >
          <div onClick={() => handleClickDislike()} className="cursor-pointer">
            {showDislikedOrNot()}
          </div>
          <div className="cursor-default">{numOfDislikes}</div>
        </button>
      )
    }
  }

  return postOrComment()
}

export default Dislikes
