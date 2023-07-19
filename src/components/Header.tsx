import React from "react";
import profilePicture from "./../assets/images/profile-picture.jpg";

const Header = () => {
  return (
    <div>
      <div className="h-[100px]  grid grid-cols-3 items-center text-center text-3xl">
        <div className="">Logo</div>
        <div className="">Public</div>
        <img
          src={profilePicture}
          alt=""
          className="rounded-[50px] justify-self-center aspect-square object-cover max-h-[65px]"
        />
      </div>
      <div className="h-1 bg-black w-[100vw]"></div>
    </div>
  );
};

export default Header;
