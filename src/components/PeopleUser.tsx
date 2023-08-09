import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../config/firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

import { FirstNameProp, LastNameProp, ProfilePicture, UserData } from "../interfaces";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

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
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [alreadyFriends, setAlreadyFriends] = useState(false);

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  useEffect(() => {
    //2 Scan through the user to see if they are already friends or if they have received or sent a request
  }, []);

  //1 Adds loggedInUserId into the received friend requests object of the user receiving the friend request
  const sendFriendRequest = async () => {
    // Update the user receiving the request
    const userDocRef = doc(db, "users", userId);
    try {
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const newCurrentReceivedFriendRequests = {
        ...userData?.currentReceivedFriendRequests,
        [loggedInUserId]: {},
      };
      await updateDoc(userDocRef, {
        currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
      });
    } catch (err) {
      console.error(err);
    }
    // Update the user sending the request
    const loggedInUserDocRef = doc(db, "users", loggedInUserId);
    try {
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      const newCurrentSentFriendRequests = {
        ...loggedInUserData?.currentSentFriendRequests,
        [userId]: {},
      };
      await updateDoc(loggedInUserDocRef, {
        currentSentFriendRequests: newCurrentSentFriendRequests,
      });
      setFriendRequestSent(true);
    } catch (err) {
      console.error(err);
    }
  };

  //1 Removes the friend requests from the objects
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    const userDocRef = doc(db, "users", userId);
    const loggedInUserDocRef = doc(db, "users", loggedInUserId);
    try {
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      if (
        userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
        loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)
      ) {
        delete userData?.currentReceivedFriendRequests[loggedInUserId];
        delete loggedInUserData?.currentSentFriendRequests[userId];

        const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests };
        const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests };

        await updateDoc(userDocRef, {
          currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
        });
        await updateDoc(loggedInUserDocRef, {
          currentSentFriendRequests: newCurrentSentFriendRequests,
        });
      }
    } catch (err) {
      console.error(err);
    }
    setFriendRequestSent(false);
  };

  //2 When friend request sent, "Friend request sent".
  //2 If this is clicked, the friend request is cancelled

  //2 If already friends, show option to remove friend

  const acceptFriendRequest = () => {
    console.log("Accepted");
  };

  const showFriendRequestSentOrNot = () => {
    if (friendRequestSent)
      return (
        <button className="cursor-pointer" onClick={() => removeFriendRequest()}>
          <div className="bg-gray-400 text-white rounded-md p-1">
            <div>Request Sent</div>
          </div>
        </button>
      );
    else
      return (
        <button className="cursor-pointer" onClick={() => sendFriendRequest()}>
          <div className="bg-[#00A7E1] text-white rounded-md p-1">
            <div>Add Friend</div>
          </div>
        </button>
      );
  };

  return (
    <div className="pl-4 pr-4 pt-2 pb-2">
      <div className="p-4 grid grid-cols-[10fr,10fr,13fr] gap-[20px] items-center rounded-lg bg-white shadow-md">
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
        {showFriendRequestSentOrNot()}
      </div>
    </div>
  );
}

export default PeopleUser;
