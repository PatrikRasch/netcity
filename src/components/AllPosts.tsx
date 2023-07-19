import React from "react";
import Post from "./Post";

function AllPosts() {
  return (
    <div>
      <Post />
      <div className="w-full h-[15px] bg-gray-100"></div>
      <Post />
      <div className="w-full h-[15px] bg-gray-100"></div>
      <Post />
    </div>
  );
}

export default AllPosts;
