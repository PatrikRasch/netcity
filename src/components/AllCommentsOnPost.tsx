import React, { useState } from "react";
import Comment from "./Comment";

interface Props {
  openProfileId: string;
  comments: CommentsData[];
  loggedInUserId: string;
  postId: string;
  postTotalNumOfComments: number;
  numOfCommentsShowing: number;
  setNumOfCommentsShowing: (value: number) => void;
  showMakeComment: boolean;
  showLoadMoreCommentsButton: boolean;
  setShowLoadMoreCommentsButton(value: boolean): void;
  setShowMakeComment(value: boolean): void;
}

interface CommentsData {
  posterId: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: object;
  dislikes: object;
  userId: string;
  comments: object;
  id: string;
  postId: string;
}

const AllCommentsOnPost = ({
  openProfileId,
  comments,
  loggedInUserId,
  postId,
  postTotalNumOfComments,
  numOfCommentsShowing,
  setNumOfCommentsShowing,
  showMakeComment,
  showLoadMoreCommentsButton,
  setShowLoadMoreCommentsButton,
  setShowMakeComment,
}: Props) => {
  if (numOfCommentsShowing === 0) setShowLoadMoreCommentsButton(false);
  if (postTotalNumOfComments > numOfCommentsShowing && numOfCommentsShowing !== 0) {
    setShowLoadMoreCommentsButton(true);
  }

  const showMoreCommentsButton = () => {
    if (postTotalNumOfComments === 0 || !showMakeComment || !showLoadMoreCommentsButton) return;

    const commentsLeft = postTotalNumOfComments - numOfCommentsShowing;
    if (postTotalNumOfComments > numOfCommentsShowing) {
      return (
        <button
          className="text-blue-500"
          onClick={() => {
            setNumOfCommentsShowing(numOfCommentsShowing + 5);
          }}
        >
          Load more comments ({commentsLeft})
        </button>
      );
    }
    if (postTotalNumOfComments <= numOfCommentsShowing) {
      return (
        <button
          className="text-blue-500"
          onClick={() => {
            setNumOfCommentsShowing(0);
            setShowMakeComment(false);
          }}
        >
          Hide all comments
        </button>
      );
    }
  };

  const populateCommentsOnPage = () => {
    const commentsToRender = comments.filter((_, index) => index < numOfCommentsShowing);
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
                openProfileId={openProfileId}
                loggedInUserId={loggedInUserId}
                commentId={comment.id}
                postId={postId}
                commentIndex={index}
              />
            </div>
          );
        })}
        {showMoreCommentsButton()}
      </div>
    );
  };

  return <div>{populateCommentsOnPage()}</div>;
};

export default AllCommentsOnPost;
