import React from "react";
import Comment from "./Comment";

interface Props {
  openProfileId: string;
  comments: CommentsData[];
  loggedInUserId: string;
  commentId: string;
}

interface CommentsData {
  posterId: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: object;
  dislikes: object;
  comments: object;
  id: string;
}

const AllCommentsOnPost = ({ openProfileId, comments, loggedInUserId }: Props) => {
  const populateCommentsOnPage = () => {
    return comments.map((comment) => (
      <div key={comment.id}>
        <Comment
          commentFirstName={comment.firstName}
          commentLastName={comment.lastName}
          commentText={comment.text}
          commentDate={comment.date}
          commentLikes={comment.likes}
          commentDislikes={comment.dislikes}
          openProfileId={openProfileId}
          loggedInUserId={loggedInUserId}
          commentId={comment.id}
        />
      </div>
    ));
  };

  return <div>{populateCommentsOnPage()}</div>;
};

export default AllCommentsOnPost;
