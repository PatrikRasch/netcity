import React from "react";

import profilePicture2 from "./../assets/images/autumn-girl.jpg";
import likeIcon from "./../assets/icons/heartPlus.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import commentIcon from "./../assets/icons/comment.png";

function Post() {
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
          <div>Annabelle Bullock</div>
          <div className="opacity-50 text-sm">16. July 2023</div>
        </div>
        <div>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Esse harum quas nesciunt conse
          quatur nihil hic accusamus iusto ab dolorum. Suscipit? baredu
        </div>
      </div>
      <div className="w-full h-[2px] bg-gray-300"></div>
      <div className="grid grid-cols-[1fr,1fr,2fr] h-[33px] items-center justify-items-center">
        {/*//1 Like/Dislike */}
        {/*//1 Like */}
        <div className="flex gap-2">
          <img src={likeIcon} alt="" className="max-h-6" />
          <div>14</div>
        </div>
        {/*//1 Dislike */}
        <div className="flex gap-2">
          <img src={dislikeIcon} alt="" className="max-h-6" />
          <div>2</div>
        </div>
        {/* //1 Comment */}
        <div className="flex gap-2">
          <img src={commentIcon} alt="" className="max-h-6" />
          <div>3</div>
        </div>
      </div>
    </div>
  );
}

export default Post;
