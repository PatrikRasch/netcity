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
  alreadyFriends: boolean;
  sentFriendRequest: boolean;
  receivedFriendRequest: boolean;
}

function PeopleUser({
  userFirstName,
  userLastName,
  userProfilePicture,
  userId,
  alreadyFriends,
  sentFriendRequest,
  receivedFriendRequest,
}: Props) {
  const navigate = useNavigate();
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  const userDocRef = doc(db, "users", userId); // Used throughout component
  const loggedInUserDocRef = doc(db, "users", loggedInUserId); // Used throughout component

  //1 Adds loggedInUserId into the received friend requests object of the user receiving the friend request
  const sendFriendRequest = async () => {
    // Update the user receiving the request
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
    } catch (err) {
      console.error(err);
    }
  };

  // alreadyFriends
  // sentFriendRequest
  // receivedFriendRequest

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
  };

  //2 When friend request sent, "Friend request sent".
  //2 If this is clicked, the friend request is cancelled

  //2 If already friends, show option to remove friend

  const acceptFriendRequest = () => {
    console.log("Accepted");
  };

  const friendStatusText = () => {
    if (alreadyFriends)
      return (
        <div className="bg-green-400 text-white rounded-md p-1">
          <div>Friends</div>
        </div>
      );
    if (sentFriendRequest)
      return (
        <div className="bg-gray-400 text-white rounded-md p-1">
          <div>Friends Request Sent</div>
        </div>
      );
    else
      return (
        <div className="bg-[#00A7E1] text-white rounded-md p-1">
          <div>Add Friend</div>
        </div>
      );
  };

  //2 Need to build a system for allowing different text for all state
  //2 While also allowing a different structure for received friend requests

  //1 friendStatus
  // - Either render receivedFriendRequest set up, else renders the base set up
  //1 friendStatusText

  // const;

  const friendStatus = () => {
    // - Renders receivedFriendRequest set up
    if (receivedFriendRequest)
      return (
        <div className="rounded-lg bg-white shadow-md p-4">
          <div className="grid grid-cols-[1fr,10fr] gap-[20px] items-center">
            <img
              src={userProfilePicture === "" ? emptyProfilePicture : userProfilePicture}
              alt=""
              className="rounded-[50%] aspect-square object-cover cursor-pointer max-w-[100px]"
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
          </div>
          <div className="grid grid-cols-[1fr,1fr] gap-2 justify-center mt-4">
            <div className="justify-self-center self-center">Reply to request</div>
            <div className="flex gap-3">
              <button
                className="cursor-pointer bg-[#00A7E1] text-white rounded-md p-2 w-[85px]"
                onClick={() => console.log("Accepted")}
              >
                Accept
              </button>
              <button
                className="cursor-pointer bg-red-300 text-white rounded-md p-2 w-[85px]"
                onClick={() => console.log("Declined")}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      );
    // - Renders the base set up most commonly used
    else {
      return (
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
          <button
            className="cursor-pointer"
            onClick={() => {
              sendFriendRequest();
            }}
          >
            <div>{friendStatusText()}</div>
          </button>
        </div>
      );
    }
  };

  return <div className="pl-4 pr-4 pt-2 pb-2">{friendStatus()}</div>;
}

export default PeopleUser;
