import React from "react";
import Header from "./Header";
import AllPosts from "./AllPosts";
import profilePicture from "./../assets/images/profile-picture.jpg";

function Public() {
  return (
    <div>
      <Header />
      <div className="grid justify-items-center gap-4 mt-4">
        <img
          src={profilePicture}
          alt=""
          className="aspect-square object-cover h-[80px] rounded-[50px]"
        />
        <textarea
          placeholder="Make a post"
          className="min-h-[120px] w-full resize-none text-center text-xl p-2"
          maxLength={150}
        />
      </div>
      <div className="w-full h-[15px] bg-gray-100"></div>
      <AllPosts />
    </div>
  );
}

export default Public;
