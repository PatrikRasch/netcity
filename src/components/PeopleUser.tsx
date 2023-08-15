import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import arrowDropdown from "../assets/icons/arrow-dropdown.png";

import { db } from "../config/firebase.config";
import {
  doc,
  getDoc,
  updateDoc,
  runTransaction,
  DocumentData,
  onSnapshot,
} from "firebase/firestore";

import { FirstNameProp, LastNameProp, ProfilePicture, UserData } from "../interfaces";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

interface Props {
  userFirstName: FirstNameProp["firstName"];
  userLastName: LastNameProp["lastName"];
  userProfilePicture: ProfilePicture["profilePicture"];
  userId: UserData["id"];
  loggedInUserData: DocumentData | undefined;
  getAndCategoriseUsers: () => Promise<void>;
  updateLoggedInUserData: () => Promise<void>;
}

function PeopleUser({
  userFirstName,
  userLastName,
  userProfilePicture,
  userId,
  loggedInUserData,
  getAndCategoriseUsers,
  updateLoggedInUserData,
}: Props) {
  const navigate = useNavigate();
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId } = useLoggedInUserId();
  const [friendsWithUser, setFriendsWithUser] = useState(false);
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);

  const [isFriendsDropdownMenuOpen, setIsFriendsDropdownMenuOpen] = useState(false);

  // alreadyFriends={usersFriendsIds.hasOwnProperty(user.id)}
  // sentFriendRequest={usersSentFriendRequestsIds.hasOwnProperty(user.id)}
  // receivedFriendRequest={usersReceivedFriendRequestsIds.hasOwnProperty(user.id)}

  const [userData, setUserData] = useState<DocumentData>();

  useEffect(() => {
    const getUserData = async () => {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      setUserData(userDoc.data());
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(userId))
      setReceivedFriendRequestFromUser(true);
    if (loggedInUserData?.friends.hasOwnProperty(userId)) setFriendsWithUser(true);
    if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId))
      setSentFriendRequestToUser(true);
  }, []);

  useEffect(() => {
    friendStatus();
    friendStatusButton();
  }, [friendsWithUser, receivedFriendRequestFromUser, sentFriendRequestToUser]);

  const navigateToUser = () => {
    navigate(`/profile/${userId}`);
  };

  // useEffect(() => {
  //   const getUpdatedLoggedInUserData = () => {
  //     console.log(loggedInUserData);
  //   };
  //   getUpdatedLoggedInUserData();
  // }, [sentFriendRequestToUser, receivedFriendRequestFromUser, friendsWithUser]);

  // const unsubscribe = onSnapshot(sortedPostsProfile, (snapshot) => {
  //   const postsProfileDataArray: PostData[] = []; // Empty array that'll be used for updating state
  //   // Push each doc (post) into the postsProfileDataArray array.
  //   snapshot.forEach((doc) => {
  //     const postData = doc.data() as PostData; // "as PostData" is type validation
  //     postsProfileDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
  //   });
  //   setPosts(postsProfileDataArray); // Update state with all the posts
  // }); // Gets all docs from postsProfile collection

  const userDocRef = doc(db, "users", userId); // Used throughout component
  const loggedInUserDocRef = doc(db, "users", loggedInUserId); // Used throughout component

  // const unsubscribe = onSnapshot(loggedInUserDocRef, (snapshot) => {
  //   if (snapshot.exists()) {
  //     console.log("Document data:", snapshot.data());
  //   }
  // });

  // - Adds loggedInUserId into the received friend requests object of the user receiving the friend request
  const sendFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(true);
      await runTransaction(db, async (transaction) => {
        const newCurrentReceivedFriendRequests = {
          ...userData?.currentReceivedFriendRequests,
          [loggedInUserId]: {},
        };
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [userId]: {},
        };

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

  //1 Removes the friend requests from the objects
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(false);
      await runTransaction(db, async (transaction) => {
        if (
          userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentSentFriendRequests[userId];

          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests };
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests };

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

  //2 Ability to accept and/or reject friend requests
  //2 If already friends, show option to remove friend

  const acceptFriendRequest = async () => {
    try {
      // Update the user accepting the request
      setReceivedFriendRequestFromUser(false);
      setFriendsWithUser(true);
      await runTransaction(db, async (transaction) => {
        // Update userData
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} }; // Update friendlist
        delete userData?.currentSentFriendRequests[loggedInUserId]; // Delete sent request
        transaction.update(userDocRef, {
          friends: newCurrentFriendsSender,
          currentSentFriendRequests: { ...userData?.currentSentFriendRequests },
        });
        // Update loggedInUser data
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

  // - Delete selected friend from friendlist
  const deleteFriend = async () => {
    try {
      setFriendsWithUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.friends.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.friends.hasOwnProperty(userId)
        ) {
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

  useEffect(() => {
    updateLoggedInUserData();
  }, [
    sendFriendRequest,
    removeFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    deleteFriend,
  ]);

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
              console.log("clicked");
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
