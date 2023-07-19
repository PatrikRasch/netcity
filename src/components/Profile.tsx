import React, { useState } from "react";
import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";
import profilePicture from "./../assets/images/profile-picture.jpg";

//3 Feature work plan:
//2 1. Fetch the data from firestore and display firstname + lastname
//2 2. Allow user to make post. When text input and post clicked, add post to firebase user's post
//2    Only display the posts added to the user's page
//2 3. Set up routing to about when about it clicked
//2 4. Set up routing to and from public

const Profile = () => {
  const [showPosts, setShowPosts] = useState(true);

  const showPostsOrAbout = () => {
    if (showPosts)
      return (
        <div>
          <MakePost />
          <AllPosts />
        </div>
      );
    else return <About />;
  };

  return (
    <div>
      {/*//1 Profile picture and name */}
      <div className="grid grid-cols-[120px,1fr] items-center justify-center gap-4 p-8">
        <img
          src={profilePicture}
          alt="profile"
          className="rounded-[50%] aspect-square object-cover"
        />
        <div className="text-3xl">Patrik Rasch</div>
      </div>

      {/*//1 Posts/About selection */}
      <div className="grid w-[100svw] justify-center">
        <div className="flex w-[65svw] rounded-lg h-12 border-2 border-black">
          <div className="bg-[#00A7E1] text-white w-[100%] h-[100%] flex justify-center items-center">
            Posts
          </div>
          <div className="w-[100%] flex justify-center items-center">About</div>
        </div>
      </div>
      <div className="w-full h-[12px] bg-gray-100"></div>
      {/*//1 Posts or About */}
      {showPostsOrAbout()}

      <div className="w-full h-[15px] bg-gray-100"></div>
    </div>
  );
};

export default Profile;
