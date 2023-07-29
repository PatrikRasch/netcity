import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";
import { LoggedInUserIdProp } from "../interfaces";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.config";

interface Props {
  loggedInUserId: LoggedInUserIdProp["loggedInUserId"];
  setLoggedInUserId: LoggedInUserIdProp["setLoggedInUserId"];
}

const Header = ({ loggedInUserId, setLoggedInUserId }: Props) => {
  const [profilePicture, setProfilePicture] = useState(emptyProfilePicture);
  const navigate = useNavigate();

  const getProfilePicture = async (userId: string) => {
    if (!userId) return <h1>Loading...</h1>;
    const usersDoc = doc(db, "users", userId);
    const targetUser = await getDoc(usersDoc);
    const data = targetUser.data();
    const profilePictureRef = data?.profilePicture;
    setProfilePicture(profilePictureRef);
  };

  getProfilePicture(loggedInUserId);

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
          src={profilePicture}
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
