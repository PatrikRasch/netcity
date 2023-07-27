import React from "react";
import { useNavigate } from "react-router-dom";

import { FirstNameProp, LastNameProp, ProfilePicture, UserData } from "../interfaces";

import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

interface Props {
  userFirstName: FirstNameProp["firstName"];
  userLastName: LastNameProp["lastName"];
  userProfilePicture: ProfilePicture["profilePicture"];
  userId: UserData["id"];
}

//3 Begin code day by writing list of tasks to be achieved in order.
//2 Already done: passing profile pictures to individual posts and MakePost
//2               Displaying profile pictures in the "People" tab

//3 1. Make each user a "card" that is separated from the one below. Add shadow and separation colour
//2 2. Work on allowing users to enter other user's profiles and see their posts

function PeopleUser({ userFirstName, userLastName, userProfilePicture, userId }: Props) {
  const navigate = useNavigate();

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="pl-4 pr-4 pt-2 pb-2">
      <div className="p-4 grid grid-cols-[1fr,1fr,1fr] gap-[20px] items-center rounded-lg bg-white shadow-md">
        <img
          src={userProfilePicture === "" ? emptyProfilePicture : userProfilePicture}
          alt=""
          className="rounded-[50%] aspect-square object-cover cursor-pointer"
          onClick={() => {
            navigateToUser();
          }}
        />
        <div
          className="flex cursor-pointer"
          onClick={() => {
            navigateToUser();
          }}
        >
          {userFirstName} {userLastName}
        </div>
        <button className="cursor-pointer bg-[#00A7E1] text-white rounded-md">Add Friend</button>
      </div>
    </div>
  );
}

export default PeopleUser;
