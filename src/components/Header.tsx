import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";

import feedIconUnselected from "./../assets/icons/feedIcon/feedIconUnselected.svg";
import feedIconSelected from "./../assets/icons/feedIcon/feedIconSelected.svg";
import peopleIconUnselected from "./../assets/icons/peopleIcon/peopleIconUnselected.svg";
import peopleIconSelected from "./../assets/icons/peopleIcon/peopleIconSelected.svg";

interface Props {
  feedOpen: boolean;
  setFeedOpen(value: boolean): void;
  peopleOpen: boolean;
  setPeopleOpen(value: boolean): void;
}

const Header = ({ feedOpen, setFeedOpen, peopleOpen, setPeopleOpen }: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div>
      <div className="h-[80px] bg-white grid grid-cols-3 items-center text-center text-3xl">
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate("/public");
            setFeedOpen(true);
            setPeopleOpen(false);
            setProfileOpen(false);
          }}
        >
          <img src={feedOpen ? feedIconSelected : feedIconUnselected} alt="" className="w-[50px]" />
          <div className={`w-[50px] bg-purpleMain rounded-3xl h-1 absolute bottom-0 ${feedOpen ? "" : "hidden"}`}></div>
        </div>
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate("/people");
            setFeedOpen(false);
            setPeopleOpen(true);
            setProfileOpen(false);
          }}
        >
          <img src={peopleOpen ? peopleIconSelected : peopleIconUnselected} alt="" className="w-[50px]" />
          <div
            className={`w-[50px] bg-purpleMain rounded-3xl h-1 absolute bottom-0 ${peopleOpen ? "" : "hidden"}`}
          ></div>
        </div>
        <div className="justify-self-center">
          <img
            src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
            alt=""
            className="rounded-[50px] justify-self-center cursor-pointer object-cover max-h-[55px] aspect-square"
            onClick={() => {
              navigate(`/profile/${loggedInUserId}`);
              setFeedOpen(false);
              setPeopleOpen(false);
              setProfileOpen(true);
            }}
          />
          <div
            className={`w-[50px] bg-purpleMain rounded-3xl h-1 absolute bottom-0 ${profileOpen ? "" : "hidden"}`}
          ></div>
        </div>
      </div>
      <div className="h-[2px] bg-grayLineThin w-[100vw]"></div>
    </div>
  );
};

export default Header;
