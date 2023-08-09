import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";

const Header = () => {
  const emptyProfilePicture = useEmptyProfilePicture();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const navigate = useNavigate();

  return (
    <div>
      <div className="h-[100px] grid grid-cols-3 items-center text-center text-3xl">
        <div className="cursor-pointer justify-self-center" onClick={() => navigate("/people")}>
          People
        </div>
        <div className="cursor-pointer justify-self-center" onClick={() => navigate("/public")}>
          Public
        </div>
        <img
          src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
          alt=""
          className="rounded-[50px] justify-self-center cursor-pointer aspect-square object-cover max-h-[65px]"
          onClick={() => navigate(`/profile/${loggedInUserId}`)}
        />
      </div>
      <div className="h-1 bg-black w-[100vw]"></div>
    </div>
  );
};

export default Header;
