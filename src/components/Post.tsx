import React from "react";

import profilePicture2 from "./../assets/images/autumn-girl.jpg";
import likeIcon from "./../assets/icons/heartPlus.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import commentIcon from "./../assets/icons/comment.png";

import { postProp } from "../interfaces";
import { FirstNameProp } from "../interfaces";
import { LastNameProp } from "../interfaces";

//2 Must take in props with postUser, postDate, postText, postNumOfLikes, postNumOfDislikes, postNumOfComments
//2    When a new post is made, the numbers should be 0 (or "no comments").
//2    The date should be set to today's date

//2 Posts needs to be populated with data that comes from Firebase.
//2   When a user makes a post, all of its data should populate a Post component

interface Props {
  postFirstName: postProp["firstName"];
  postLastName: postProp["lastName"];
  postText: postProp["postText"];
  postDate: postProp["postDate"];
  postNumOfLikes: postProp["postNumOfLikes"];
  postNumOfDislikes: postProp["postNumOfDislikes"];
  postNumOfComments: postProp["postNumOfComments"];
}

function Post(props: Props) {
  const { postFirstName } = props;
  const { postLastName } = props;
  const { postText } = props;
  const { postNumOfLikes } = props;
  const { postNumOfDislikes } = props;
  const { postNumOfComments } = props;
  const { postDate } = props;

  const today = new Date();

  return (
    <div className="w-full min-h-[150px] bg-white shadow-xl">
      <div className="min-h-[120px] p-4 gap-2">
        <div className="flex gap-4 items-center">
          <div className="min-w-[40px] max-w-min">
            <img
              src={profilePicture2}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <div>{postFirstName + " " + postLastName}</div>
          <div className="opacity-50 text-sm">{postDate}</div>
        </div>
        <div>{postText}</div>
      </div>
      <div className="w-full h-[2px] bg-gray-300"></div>
      <div className="grid grid-cols-[1fr,1fr,2fr] h-[33px] items-center justify-items-center">
        {/*//1 Like/Dislike */}
        {/*//1 Like */}
        <div className="flex gap-2">
          <img src={likeIcon} alt="" className="max-h-6" />
          <div>{postNumOfLikes}</div>
        </div>
        {/*//1 Dislike */}
        <div className="flex gap-2">
          <img src={dislikeIcon} alt="" className="max-h-6" />
          <div>{postNumOfDislikes}</div>
        </div>
        {/* //1 Comment */}
        <div className="flex gap-2">
          <img src={commentIcon} alt="" className="max-h-6" />
          <div>{postNumOfComments}</div>
        </div>
      </div>
    </div>
  );
}

export default Post;
