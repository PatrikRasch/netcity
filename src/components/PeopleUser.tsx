import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import arrowDropdown from "../assets/icons/arrow-dropdown.png";

import { db } from "../config/firebase.config";
import { doc, getDoc, runTransaction, DocumentData } from "firebase/firestore";

import { FirstNameProp, LastNameProp, ProfilePicture, UserData } from "../interfaces";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

interface Props {
  userFirstName: FirstNameProp["firstName"];
  userLastName: LastNameProp["lastName"];
  userProfilePicture: ProfilePicture["profilePicture"];
  userId: UserData["id"];
  getAndCategoriseUsers: () => Promise<void>;
  loggedInUserData: DocumentData | undefined;
  setLoggedInUserData: (value: object) => void;
}

function PeopleUser({
  userFirstName,
  userLastName,
  userProfilePicture,
  userId,
  loggedInUserData,
  setLoggedInUserData,
}: Props) {
  const navigate = useNavigate();
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const [friendsWithUser, setFriendsWithUser] = useState(false);
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);
  const [isFriendsDropdownMenuOpen, setIsFriendsDropdownMenuOpen] = useState(false);
  const [userData, setUserData] = useState<DocumentData>();

  useEffect(() => {
    getUserData();
    if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(userId)) setReceivedFriendRequestFromUser(true);
    if (loggedInUserData?.friends.hasOwnProperty(userId)) setFriendsWithUser(true);
    if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)) setSentFriendRequestToUser(true);
  }, []);

  useEffect(() => {
    friendStatus();
    friendStatusButton();
  }, [friendsWithUser, receivedFriendRequestFromUser, sentFriendRequestToUser]);

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  // - Gets and sets the data in state for the user. Only used when the component mounts
  const getUserData = async () => {
    const userDoc = await getDoc(userDocRef);
    setUserData(userDoc.data());
  };

  // - Updates the state of the logged in user, used within the friend interaction functions below
  const updateLoggedInUserData = async (newData: DocumentData) => {
    try {
      setLoggedInUserData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the state of the non-logged in user, used within thte friend interaction functions below
  const updateUserData = async (newData: DocumentData) => {
    try {
      setUserData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  // - Document references. Used throughout component
  const userDocRef = doc(db, "users", userId);
  const loggedInUserDocRef = doc(db, "users", loggedInUserId);

  // - Friend interaction function → Send a friend request
  const sendFriendRequest = async () => {
    try {
      setSentFriendRequestToUser(true);
      await runTransaction(db, async (transaction) => {
        // Handle the user receiving the request
        // Prepare the new data
        const newCurrentReceivedFriendRequests = {
          ...userData?.currentReceivedFriendRequests,
          [loggedInUserId]: {},
        };
        // Update state
        const updatedUserData = { ...userData, currentReceivedFriendRequests: newCurrentReceivedFriendRequests };
        await updateUserData(updatedUserData);

        // Handle the user sending the request
        // Prepare the new data
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [userId]: {},
        };
        // Update state
        const updatedLoggedInUserData = {
          ...loggedInUserData,
          currentSentFriendRequests: newCurrentSentFriendRequests,
        };
        await updateLoggedInUserData(updatedLoggedInUserData);

        // Run the transactions to update the backend
        transaction.update(userDocRef, {
          currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
        });
        transaction.update(loggedInUserDocRef, {
          currentSentFriendRequests: newCurrentSentFriendRequests,
        });
      });
    } catch (err) {
      setSentFriendRequestToUser(false);
      console.error(err);
    }
  };

  // - Friend interaction function → Remove a sent friend request
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(false);
      await runTransaction(db, async (transaction) => {
        // Delete friend request for both users (receiver & sender)
        if (
          userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentSentFriendRequests[userId];

          // Handle the user receiving the request
          // Prepare the new data
          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests };
          // Update state
          const updatedUserData = {
            ...userData,
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          };
          await updateUserData(updatedUserData);

          // Handle the user sending the request
          // Prepare the new data
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests };
          // Update state
          const updatedLoggedInUserData = {
            ...loggedInUserData,
            currentSentFriendRequests: newCurrentSentFriendRequests,
          };
          await updateLoggedInUserData(updatedLoggedInUserData);

          // Run the transactions to update the backend
          transaction.update(userDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          });
          transaction.update(loggedInUserDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          });
        }
      });
    } catch (err) {
      setSentFriendRequestToUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Accept a received friend request
  const acceptFriendRequest = async () => {
    try {
      // Update the user accepting the request
      setReceivedFriendRequestFromUser(false);
      setFriendsWithUser(true);
      await runTransaction(db, async (transaction) => {
        // Handling the user who sent the request first
        // Prepare the new data
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} };
        delete userData?.currentSentFriendRequests[loggedInUserId]; // Delete sent request
        // Update state
        const updatedUserData = { ...userData, friends: newCurrentFriendsSender };
        await updateUserData(updatedUserData);

        // Handling the user who received the request
        // Prepare the new data
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [userId]: {} };
        delete loggedInUserData?.currentReceivedFriendRequests[userId];
        // Update state
        const updatedLoggedInUserData = { ...loggedInUserData, friends: newCurrentFriendsReceiver };
        await updateLoggedInUserData(updatedLoggedInUserData);

        // Run the transactions to update the backend
        transaction.update(userDocRef, {
          friends: newCurrentFriendsSender,
          currentSentFriendRequests: { ...userData?.currentSentFriendRequests },
        });
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

  // - Friend interaction function → Decline a received friend request
  const declineFriendRequest = async () => {
    try {
      setReceivedFriendRequestFromUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.currentSentFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(userId)
        ) {
          // Deletes the users from each other's state
          delete userData?.currentSentFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentReceivedFriendRequests[userId];

          // Handle the user receiving the request
          const newCurrentSentFriendRequests = { ...userData?.currentSentFriendRequests }; // Prepare the new data

          // Handle the user sending the request
          const newCurrentReceivedFriendRequests = { ...loggedInUserData?.currentReceivedFriendRequests }; // Prepare the new data

          // Run the transactions for the backend
          transaction.update(userDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          });
          transaction.update(loggedInUserDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          });
        }
      });
    } catch (err) {
      setReceivedFriendRequestFromUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Delete a current friend
  const deleteFriend = async () => {
    try {
      setFriendsWithUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (userData?.friends.hasOwnProperty(loggedInUserId) && loggedInUserData?.friends.hasOwnProperty(userId)) {
          // Deletes the users from each other's state
          delete userData?.friends[loggedInUserId];
          delete loggedInUserData?.friends[userId];
          // Prepares new data to be sent to Firebase
          const newUserFriends = { ...userData?.friends };
          const newLoggedInUserFriends = { ...loggedInUserData?.friends };
          // Updates Firebase with the new data
          transaction.update(userDocRef, { friends: newUserFriends });
          transaction.update(loggedInUserDocRef, { friends: newLoggedInUserFriends });
        }
      });
    } catch (err) {
      setFriendsWithUser(true);
      console.error(err);
    }
  };

  const friendsDropdownMenu = () => {
    if (isFriendsDropdownMenuOpen) {
      return (
        <div className="flex relative">
          <button
            className="cursor-pointer"
            onClick={() => {
              setIsFriendsDropdownMenuOpen(!isFriendsDropdownMenuOpen);
            }}
          >
            <div className="bg-green-400 text-white rounded-t-md p-1 grid w-[110px] grid-cols-[70%,30%] items-center">
              <div>Friends</div>
              <img src={arrowDropdown} alt="" className="max-w-[30px] rotate-180" />
            </div>
          </button>
          <button
            className="absolute top-[100%] bg-red-400 rounded-b-md p-1 w-[110px] text-center"
            onClick={() => {
              deleteFriend();
            }}
          >
            <div>Delete friend</div>
          </button>
        </div>
      );
    }
    if (!isFriendsDropdownMenuOpen) {
      return (
        <div>
          <button
            className="cursor-pointer"
            onClick={() => {
              setIsFriendsDropdownMenuOpen(!isFriendsDropdownMenuOpen);
            }}
          >
            <div className="bg-green-400 text-white rounded-md p-1 grid w-[110px] grid-cols-[70%,30%] items-center">
              <div>Friends</div>
              <img src={arrowDropdown} alt="" className="max-w-[30px]" />
            </div>
          </button>
        </div>
      );
    }
  };

  const friendStatusButton = () => {
    if (friendsWithUser) return friendsDropdownMenu();
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
                onClick={() => {
                  acceptFriendRequest();
                }}
              >
                Accept
              </button>
              <button
                className="cursor-pointer bg-red-300 text-white rounded-md p-2 w-[85px]"
                onClick={() => {
                  declineFriendRequest();
                }}
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
