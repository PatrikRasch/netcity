import React, { useState, useEffect } from 'react'
import { updateDoc, DocumentReference } from 'firebase/firestore'

import likeGrayEmpty from './../assets/icons/like/likeGrayEmpty.svg'
import likePurpleFilled from './../assets/icons/like/likePurpleFilled.svg'

import { TargetData, TargetCommentData } from '../interfaces'

interface Props {
  totalLikes: object
  liked: boolean
  disliked: boolean
  setLiked: (value: boolean) => void
  numOfLikes: number
  setNumOfLikes: (value: number) => void
  removeLike: (value: DocumentReference) => Promise<void>
  removeDislike: (value: DocumentReference) => Promise<void>
  loggedInUserId: string
  docRef: DocumentReference
  data: TargetData | TargetCommentData | null
  isPost: boolean
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
  isPost,
}: Props) {
  const addLike = async (commentDocRef: DocumentReference) => {
    setLiked(true) // Set liked to true, makes heart red
    // Frontend updates:
    ;(totalLikes as { [key: string]: boolean })[loggedInUserId] = true // Add the userId into postLikes as true
    setNumOfLikes(Object.keys(totalLikes).length) // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...data?.likes, [loggedInUserId]: true } // Define new object to hold the likes
    try {
      await updateDoc(commentDocRef, { likes: newLikes }) // Update the backend with the new likes
    } catch (err) {
      console.error(err)
    }
  }

  const handleClickLike = async () => {
    if (docRef !== undefined) {
      if (!liked) {
        if (disliked) {
          removeDislike(docRef)
        }
        addLike(docRef)
      }
      if (liked) {
        removeLike(docRef)
      }
    }
  }

  //1 The like icon on each post. Shows if the user has liked a post.
  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeGrayEmpty} alt="" className="max-h-7" />
    } else {
      return <img src={likePurpleFilled} alt="" className="max-h-7" />
    }
  }

  const postOrComment = () => {
    if (isPost) {
      return (
        <button
          onClick={() => handleClickLike()}
          className={`font-mainFont flex w-full cursor-pointer items-center justify-center gap-2 rounded-3xl p-1 font-semibold lg:h-[35px] ${
            liked ? 'bg-purpleSoft text-purpleMain' : 'bg-graySoft text-grayMain lg:hover:bg-grayHover'
          }`}
        >
          {showLikedOrNot()}
          <div>{numOfLikes}</div>
        </button>
      )
    } else {
      return (
        <button
          className={`font-mainFont flex w-full justify-center gap-1 ${liked ? 'text-purpleMain' : 'text-grayMain'}`}
        >
          <div onClick={() => handleClickLike()} className="cursor-pointer">
            {showLikedOrNot()}
          </div>
          <div className="cursor-default">{numOfLikes}</div>
        </button>
      )
    }
  }

  return postOrComment()
}

export default Likes
