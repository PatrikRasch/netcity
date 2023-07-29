import React, { useState } from "react";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";
import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

interface Props {
  commentFirstName: string;
  commentLastName: string;
  commentText: string;
  commentDate: string;
  commentLikes: object;
  commentDislikes: object;
  openProfileId: string;
  loggedInUserId: string;
  commentId: string;
}

const Comment = ({
  commentFirstName,
  commentLastName,
  commentText,
  commentDate,
  commentLikes,
  commentDislikes,
  openProfileId,
  loggedInUserId,
  commentId,
}: Props) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [commentNumOfLikes, setCommentNumOfLikes] = useState(0);
  const [commentNumOfDislikes, setCommentNumOfDislikes] = useState(0);

  const handleClickLike = async () => {
    // If post not liked
    if (!liked) {
      if (disliked) {
        // removeDislike();
      }
      //   addLike();
    }
    // If post already liked
    if (liked) {
      //   removeLike();
    }
  };

  const handleClickDislike = async () => {
    // If post not disliked
    if (!disliked) {
      if (liked) {
        // removeLike();
      }
      //   addDislike();
    }
    // If post already liked
    if (disliked) {
      //   removeDislike();
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
  //1 The dislike icon on each post. Shows if the user has disliked a post.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartDisliked} alt="" className="max-h-6" />;
    }
  };

  return (
    <div className="grid pt-2 pl-4 pr-4">
      <div className="grid grid-cols-[1fr,8fr] gap-4 items-center">
        <img
          src={emptyProfilePicture === "" ? emptyProfilePicture : emptyProfilePicture}
          alt="User who made comment"
          className="rounded-[50%] max-w-[38px] self-start aspect-square object-cover"
        />
        <div className="flex flex-col">
          <div className="bg-gray-200  rounded-xl p-2">
            <div className="text-[12px] font-bold">{commentFirstName + " " + commentLastName}</div>
            <div className=" grid grid-cols-[4fr,1fr] gap-4">{commentText}</div>
          </div>

          <div className="grid grid-cols-[50px,50px] h-max mt-1 mb-1 items-start justify-items-start">
            <div className="flex gap-1">
              <button onClick={() => handleClickLike()}>{showLikedOrNot()}</button>
              <div>{commentNumOfLikes}</div>
            </div>
            {/*//1 Dislike */}
            <div className="flex gap-1">
              <button onClick={() => handleClickDislike()}>{showDislikedOrNot()}</button>
              <div>{commentNumOfDislikes}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
