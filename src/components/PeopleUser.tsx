import React, { useState, useEffect, Dispatch } from "react";
import { useNavigate } from "react-router-dom";

import arrowDropdown from "../assets/icons/arrow-dropdown.png";

import { db } from "../config/firebase.config";
import { doc, getDoc, updateDoc, runTransaction } from "firebase/firestore";

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
  getAllUsers: () => Promise<void>;
}

function PeopleUser({
  userFirstName,
  userLastName,
  userProfilePicture,
  userId,
  alreadyFriends,
  sentFriendRequest,
  receivedFriendRequest,
  getAllUsers,
}: Props) {
  const navigate = useNavigate();
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const [friendsWithUser, setFriendsWithUser] = useState(false);
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);

  useEffect(() => {
    if (receivedFriendRequest) setReceivedFriendRequestFromUser(true);
    if (alreadyFriends) setFriendsWithUser(true);
    if (sentFriendRequest) setSentFriendRequestToUser(true);
  }, []);

  useEffect(() => {
    friendStatus();
    friendStatusButton();
  }, [friendsWithUser, receivedFriendRequest, sentFriendRequestToUser]);

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  const userDocRef = doc(db, "users", userId); // Used throughout component
  const loggedInUserDocRef = doc(db, "users", loggedInUserId); // Used throughout component

  //1 Adds loggedInUserId into the received friend requests object of the user receiving the friend request
  const sendFriendRequest = async () => {
    // Update the user receiving the request
    try {
      // sentFriendRequest(true)
      setSentFriendRequestToUser(true);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      // setAllSentFriendRequests(allSentFriendRequests, {...userData, id: doc.id})
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
      setSentFriendRequestToUser(false);
      console.error(err);
    }
  };

  //1 Removes the friend requests from the objects
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(false);
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
      setSentFriendRequestToUser(true);
      console.error(err);
    }
  };

  //2 Ability to accept and/or reject friend requests
  //2 If already friends, show option to remove friend

  const acceptFriendRequest = async () => {
    // Update the user accepting the request
    try {
      setReceivedFriendRequestFromUser(false);
      setFriendsWithUser(true);
      await runTransaction(db, async (transaction) => {
        // Update userData
        const userDoc = await transaction.get(userDocRef); // Get user data
        const userData = userDoc.data();
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} }; // Update friendlist
        delete userData?.currentSentFriendRequests[loggedInUserId]; // Delete sent request
        transaction.update(userDocRef, {
          friends: newCurrentFriendsSender,
          currentSentFriendRequests: { ...userData?.currentSentFriendRequests },
        });
        // Update loggedInUser data
        const loggedInUserDoc = await getDoc(loggedInUserDocRef); // Get loggedInUser data
        const loggedInUserData = loggedInUserDoc.data();
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [userId]: {} }; // Update friendlist
        delete loggedInUserData?.currentReceivedFriendRequests[userId];
        transaction.update(loggedInUserDocRef, {
          friends: newCurrentFriendsReceiver,
          currentReceivedFriendRequests: {
            ...loggedInUserData?.currentReceivedFriendRequests,
          },
        });
      });
    } catch (err) {
      setReceivedFriendRequestFromUser(true);
      setFriendsWithUser(false);
      console.error(err);
    }
  };

  //2 Will this function be virtually the same as the removeFriendRequest function?
  const declineFriendRequest = () => {
    console.log("Declined");
  };

  //2 Will this function be virtually the same as the removeFriendRequest function?
  const deleteFriend = () => {
    console.log("Friend delete");
  };

  const friendsDropdownMenu = () => {
    return (
      <div className="z-10 absolute bg-red-400">
        <div>LOL</div>
      </div>
    );
  };

  const friendStatusButton = () => {
    if (friendsWithUser)
      return (
        <button
          className="cursor-pointer"
          onClick={() => {
            friendsDropdownMenu();
          }}
        >
          <div className="bg-green-400 text-white rounded-md p-1 grid grid-cols-[70%,30%] items-center">
            <div>Friends</div>
            <img src={arrowDropdown} alt="" className="max-w-[30px]" />
            <div></div>
          </div>
        </button>
      );
    if (sentFriendRequestToUser)
      return (
        <button
          className="cursor-pointer"
          onClick={() => {
            removeFriendRequest();
          }}
        >
          <div className="bg-gray-400 text-white rounded-md p-1">
            <div>Friend Request Sent</div>
          </div>
        </button>
      );
    else
      return (
        <button
          className="cursor-pointer"
          onClick={() => {
            sendFriendRequest();
          }}
        >
          <div className="bg-[#00A7E1] text-white rounded-md p-1">
            <div>Add Friend</div>
          </div>
        </button>
      );
  };

  const friendStatus = () => {
    // - Renders the base set up most commonly used
    if (!receivedFriendRequestFromUser)
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
          {friendStatusButton()}
        </div>
      );
    // - Renders receivedFriendRequest set up
    if (receivedFriendRequestFromUser)
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
                onClick={() => acceptFriendRequest()}
              >
                Accept
              </button>
              <button
                className="cursor-pointer bg-red-300 text-white rounded-md p-2 w-[85px]"
                onClick={() => declineFriendRequest()}
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      );
  };

  return <div className="pl-4 pr-4 pt-2 pb-2">{friendStatus()}</div>;
}

export default PeopleUser;
