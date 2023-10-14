import React, { useState } from 'react'
import Comment from './Comment'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { DocumentReference } from 'firebase/firestore'

interface Props {
  comments: CommentsData[]
  postId: string
  postTotalNumOfComments: number
  numOfCommentsShowing: number
  setNumOfCommentsShowing: (value: number) => void
  showMakeComment: boolean
  showLoadMoreCommentsButton: boolean
  setShowLoadMoreCommentsButton(value: boolean): void
  setShowMakeComment(value: boolean): void
  context: string
  feedPostDocRef: DocumentReference
  profilePostDocRef: DocumentReference
  getNumOfComments: (value: DocumentReference) => Promise<void>
  setPostTotalNumOfComments: (value: number) => void
}

interface CommentsData {
  posterId: string
  firstName: string
  lastName: string
  text: string
  date: string
  likes: object
  dislikes: object
  userId: string
  comments: object
  id: string
  postId: string
}

const AllCommentsOnPost = ({
  comments,
  postId,
  postTotalNumOfComments,
  numOfCommentsShowing,
  setNumOfCommentsShowing,
  showMakeComment,
  showLoadMoreCommentsButton,
  setShowLoadMoreCommentsButton,
  setShowMakeComment,
  context,
  feedPostDocRef,
  profilePostDocRef,
  getNumOfComments,
  setPostTotalNumOfComments,
}: Props) => {
  const { loggedInUserId } = useLoggedInUserId()
  // if (postTotalNumOfComments > numOfCommentsShowing && numOfCommentsShowing !== 0) {
  //   setShowLoadMoreCommentsButton(true);
  // }

  const showMoreCommentsButton = () => {
    if (postTotalNumOfComments === 0 || !showMakeComment || !showLoadMoreCommentsButton) return

    const commentsLeft = postTotalNumOfComments - numOfCommentsShowing
    if (postTotalNumOfComments > numOfCommentsShowing) {
      return (
        <button
          className="font-mainFont font-semibold text-grayMedium"
          onClick={() => {
            setNumOfCommentsShowing(numOfCommentsShowing + 5)
          }}
        >
          Load more comments ({commentsLeft})
        </button>
      )
    }
    if (postTotalNumOfComments <= numOfCommentsShowing) {
      return (
        <button
          className="font-mainFont font-semibold text-grayMedium"
          onClick={() => {
            setNumOfCommentsShowing(0)
            setShowMakeComment(false)
          }}
        >
          Hide all comments
        </button>
      )
    }
  }

  const populateCommentsOnPage = () => {
    const commentsToRender = comments.filter((_, index) => index < numOfCommentsShowing)
    return (
      <div>
        {commentsToRender.map((comment, index) => {
          return (
            <div key={comment.id}>
              <Comment
                commentFirstName={comment.firstName}
                commentLastName={comment.lastName}
                commentText={comment.text}
                commentDate={comment.date}
                commentLikes={comment.likes}
                commentDislikes={comment.dislikes}
                commentById={comment.userId}
                loggedInUserId={loggedInUserId}
                commentId={comment.id}
                postId={postId}
                commentIndex={index}
                context={context}
                feedPostDocRef={feedPostDocRef}
                profilePostDocRef={profilePostDocRef}
                getNumOfComments={getNumOfComments}
                setPostTotalNumOfComments={setPostTotalNumOfComments}
                postTotalNumOfComments={postTotalNumOfComments}
              />
            </div>
          )
        })}
        <div className={`grid ${postTotalNumOfComments === 0 ? '' : 'pb-1 pt-1'}`}>
          <div className="grid grid-cols-[50px,1fr] items-center gap-4">
            <div></div>
            <div>{showMoreCommentsButton()}</div>
          </div>
        </div>
      </div>
    )
  }

  return <div>{populateCommentsOnPage()}</div>
}

export default AllCommentsOnPost
