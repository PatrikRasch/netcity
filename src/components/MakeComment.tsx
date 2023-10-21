import React, { useState, useRef } from 'react'

import { collection, doc, addDoc, DocumentReference } from 'firebase/firestore'
import { useDateFunctions } from './custom-hooks/useDateFunctions'

import postBlackFilled from './../assets/icons/post/postBlackFilled.svg'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

interface Props {
  loggedInUserFirstName: string
  loggedInUserLastName: string
  loggedInUserProfilePicture: string
  loggedInUserId: string
  openProfileId?: string
  postId: string
  getAllComments: (value: DocumentReference) => Promise<void>
  postDocRef: DocumentReference
  numOfCommentsShowing: number
  setNumOfCommentsShowing: (value: number) => void
  getNumOfComments: (value: DocumentReference) => Promise<void>
  context: string
  feedPostDocRef: DocumentReference
  profilePostDocRef: DocumentReference
  postTotalNumOfComments: number
  setPostTotalNumOfComments: (value: number) => void
}

function MakeComment({
  loggedInUserFirstName,
  loggedInUserLastName,
  loggedInUserProfilePicture,
  loggedInUserId,
  openProfileId,
  postId,
  getAllComments,
  postDocRef,
  numOfCommentsShowing,
  setNumOfCommentsShowing,
  getNumOfComments,
  context,
  feedPostDocRef,
  profilePostDocRef,
  postTotalNumOfComments,
  setPostTotalNumOfComments,
}: Props) {
  const emptyProfilePicture = useEmptyProfilePicture()
  const [postCommentInput, setPostCommentInput] = useState('')
  const [fullTimestamp, setFullTimestamp] = useState({})
  const { dateDayMonthYear } = useDateFunctions()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [validateMakeComment, setValidateMakeComment] = useState(false)

  const postComment = async (commentData: {
    timestamp: object
    firstName: string
    lastName: string
    text: string
    date: string
    likes: object
    dislikes: object
    userId: string
    postId: string
  }) => {
    //2 Start by adding document to the backend
    try {
      const commentCollection = collection(postDocRef, 'comments')
      await addDoc(commentCollection, commentData)
      setNumOfCommentsShowing(numOfCommentsShowing + 1)
      getAllComments(postDocRef)
    } catch (err) {
      console.error(err)
    }
  }

  // //1 Gets the reference to the postsProfile collection for the user
  // const getPostsProfileRef = () => {
  //   if (!openProfileId) return console.log("No userProfileId"); //6 Need to make this error better later
  //   const targetUser = doc(db, "users", openProfileId);
  //   return collection(targetUser, "postsProfile");
  // };

  //1 Changes the height of the comment input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 1 // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24) // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows // Sets new number of rows
  }

  const resetTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 1
  }

  return (
    <div className="grid grid-cols-[50px,1fr,50px] items-center pb-3 pt-3 lg:grid-cols-[50px,1fr,40px] lg:gap-4">
      <img
        src={loggedInUserProfilePicture === '' ? emptyProfilePicture : loggedInUserProfilePicture}
        alt="logged in user"
        className="aspect-square max-w-[38px] justify-self-center rounded-[50%] object-cover"
      />
      <div
        className={`font-mainFont grid gap-4 rounded-3xl border-2 bg-graySoft pl-2 ${
          validateMakeComment ? 'border-purpleMain' : 'border-transparent'
        } transition-border duration-500`}
      >
        <textarea
          ref={textareaRef}
          placeholder={validateMakeComment ? 'Write something before commenting' : 'Write a comment'}
          className={`m-2 w-full flex-grow resize-none overflow-y-auto bg-transparent placeholder-grayMediumPlus outline-none`}
          maxLength={1000}
          value={postCommentInput}
          onChange={(e) => {
            if (validateMakeComment) setValidateMakeComment(false)
            setPostCommentInput(e.target.value)
            handleTextareaChange()
            setFullTimestamp(new Date())
          }}
          rows={1}
        ></textarea>
      </div>
      <button
        className="self-center justify-self-center rounded-[50%]"
        onClick={(e) => {
          if (postCommentInput.length === 0) return setValidateMakeComment(true)
          postComment({
            timestamp: fullTimestamp,
            firstName: loggedInUserFirstName,
            lastName: loggedInUserLastName,
            text: postCommentInput,
            date: dateDayMonthYear,
            likes: {},
            dislikes: {},
            userId: loggedInUserId,
            postId: postId,
          })
          setPostTotalNumOfComments(postTotalNumOfComments + 1)
          if (context === 'feed') getNumOfComments(feedPostDocRef)
          if (context === 'profile') getNumOfComments(profilePostDocRef)
          setPostCommentInput('')
          resetTextarea()
        }}
      >
        <img src={postBlackFilled} alt="" className="max-w-[33px] outline-none" />
      </button>
    </div>
  )
}

export default MakeComment
