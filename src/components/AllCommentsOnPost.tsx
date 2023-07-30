import React from "react";
import Comment from "./Comment";

interface Props {
  openProfileId: string;
  comments: CommentsData[];
  loggedInUserId: string;
  postId: string;
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

const AllCommentsOnPost = ({ openProfileId, comments, loggedInUserId, postId }: Props) => {
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
          commentById={comment.userId}
          openProfileId={openProfileId}
          loggedInUserId={loggedInUserId}
          commentId={comment.id}
          postId={postId}
        />
      </div>
    ));
  };

  return <div>{populateCommentsOnPage()}</div>;
};

export default AllCommentsOnPost;
