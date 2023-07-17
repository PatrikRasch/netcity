import React from "react";
import profilePicture from "./assets/images/profile-picture.jpg";

function MakePost() {
  return (
    <div>
      <div className="w-full min-h-[150px] bg-white shadow-xl">
        <div className="min-h-[120px] flex p-4 gap-2">
          <div className="min-w-[50px] max-w-min">
            <img
              src={profilePicture}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <textarea
            placeholder="Make a post"
            className="w-full bg-transparent resize-none"
            maxLength={150}
          />
        </div>
        {/* <div className="w-full h-[2px] bg-gray-300"></div> */}
        <button className="min-h-[30px] w-full bg-[#00A7E1] text-white">Post</button>
      </div>
      <div className="w-full h-[15px] bg-gray-100"></div>
    </div>
  );
}

export default MakePost;
