import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
// import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

const Header = () => {
  // const [profilePicture, setProfilePicture] = useState(emptyProfilePicture);
  const navigate = useNavigate();
  return (
    <div>
      <div className="h-[100px]  grid grid-cols-3 items-center text-center text-3xl">
        <div className="" onClick={() => navigate("/people")}>
          People
        </div>
        <div className="cursor-pointer justify-self-center" onClick={() => navigate("/public")}>
          Public
        </div>
        <div onClick={() => navigate("/profile")}>Profile</div>
        {/* <img
          src={profilePicture}
          alt=""
          className="rounded-[50px] justify-self-center cursor-pointer aspect-square object-cover max-h-[65px]"
          onClick={() => navigate("/profile")}
        /> */}
      </div>
      <div className="h-1 bg-black w-[100vw]"></div>
    </div>
  );
};

export default Header;
