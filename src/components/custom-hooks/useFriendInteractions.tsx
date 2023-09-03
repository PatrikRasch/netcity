import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { db } from "../../config/firebase.config";
import { doc, getDoc, runTransaction, DocumentData, DocumentReference } from "firebase/firestore";

import { useLoggedInUserId } from "../context/LoggedInUserProfileDataContextProvider";

const useFriendInteractions = () => {
  const { loggedInUserId } = useLoggedInUserId();
  // const [friendsWithUser, setFriendsWithUser] = useState(false);
  // const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);
  // const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);
  // const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>();

  // // // - Document references. Used throughout component
  // const loggedInUserDocRef = doc(db, "users", loggedInUserId);

  // // -  Gets and categorises all users
  // const getLoggedInUserData = async () => {
  //   try {
  //     const loggedInUserDocRef = doc(db, "users", loggedInUserId);
  //     const loggedInUserDoc = await getDoc(loggedInUserDocRef);
  //     const loggedInUserData = loggedInUserDoc.data();
  //     setLoggedInUserData(loggedInUserData);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // // - Updates the state of the non-logged in user, used within the friend interaction functions below
  // const updateUserData = async (newData: DocumentData) => {
  //   try {
  //     setUserData(newData);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // // - Updates the state of the logged in user, used within the friend interaction functions below
  // const updateLoggedInUserData = async (newData: DocumentData) => {
  //   try {
  //     setLoggedInUserData(newData);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // - Friend interaction function → Send a friend request
  const sendFriendRequest = async (
    userDocRef: DocumentReference,
    userData: DocumentData,
    loggedInUserDocRef: DocumentReference,
    loggedInUserData: DocumentData,
    openProfileId: string
  ) => {
    try {
      // setSentFriendRequestToUser(true);
      await runTransaction(db, async (transaction) => {
        // Handle the user receiving the request
        // Prepare the new data
        const newCurrentReceivedFriendRequests = {
          ...userData?.currentReceivedFriendRequests,
          [loggedInUserId]: {},
        };
        // // Update state
        // const updatedUserData = { ...userData, currentReceivedFriendRequests: newCurrentReceivedFriendRequests };
        // await updateUserData(updatedUserData);

        // Handle the user sending the request
        // Prepare the new data
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [openProfileId]: {},
        };
        // // Update state
        // const updatedLoggedInUserData = {
        //   ...loggedInUserData,
        //   currentSentFriendRequests: newCurrentSentFriendRequests,
        // };
        // await updateLoggedInUserData(updatedLoggedInUserData);

        // Run the transactions to update the backend
        transaction.update(userDocRef, {
          currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
        });
        transaction.update(loggedInUserDocRef, {
          currentSentFriendRequests: newCurrentSentFriendRequests,
        });
      });
    } catch (err) {
      // setSentFriendRequestToUser(false);
      console.error(err);
    }
  };

  // - Friend interaction function → Remove a sent friend request
  const removeFriendRequest = async (
    userDocRef: DocumentReference,
    userData: DocumentData,
    loggedInUserDocRef: DocumentReference,
    loggedInUserData: DocumentData,
    openProfileId: string
  ) => {
    // Update the user receiving the request
    try {
      // setSentFriendRequestToUser(false);
      await runTransaction(db, async (transaction) => {
        // Delete friend request for both users (receiver & sender)
        if (
          userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(openProfileId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentSentFriendRequests[openProfileId];

          // Handle the user receiving the request
          // Prepare the new data
          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests };
          // // Update state
          // const updatedUserData = {
          //   ...userData,
          //   currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          // };
          // await updateUserData(updatedUserData);

          // Handle the user sending the request
          // Prepare the new data
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests };
          // // Update state
          // const updatedLoggedInUserData = {
          //   ...loggedInUserData,
          //   currentSentFriendRequests: newCurrentSentFriendRequests,
          // };
          // await updateLoggedInUserData(updatedLoggedInUserData);

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
      // setSentFriendRequestToUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Accept a received friend request
  const acceptFriendRequest = async (
    userDocRef: DocumentReference,
    userData: DocumentData,
    loggedInUserDocRef: DocumentReference,
    loggedInUserData: DocumentData,
    openProfileId: string
  ) => {
    try {
      // Update the user accepting the request
      // setReceivedFriendRequestFromUser(false);
      // setFriendsWithUser(true);
      await runTransaction(db, async (transaction) => {
        // Handling the user who sent the request first
        // Prepare the new data
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} };
        delete userData?.currentSentFriendRequests[loggedInUserId]; // Delete sent request

        // Handling the user who received the request
        // Prepare the new data

        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [openProfileId]: {} };
        delete loggedInUserData?.currentReceivedFriendRequests[openProfileId];

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
      // setReceivedFriendRequestFromUser(true);
      // setFriendsWithUser(false);
      console.error(err);
    }
  };

  // - Friend interaction function → Decline a received friend request
  const declineFriendRequest = async (
    userDocRef: DocumentReference,
    userData: DocumentData,
    loggedInUserDocRef: DocumentReference,
    loggedInUserData: DocumentData,
    openProfileId: string
  ) => {
    try {
      // setReceivedFriendRequestFromUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.currentSentFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.currentSentFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentReceivedFriendRequests[openProfileId];

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
      // setReceivedFriendRequestFromUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Delete a current friend
  const deleteFriend = async (
    userDocRef: DocumentReference,
    userData: DocumentData,
    loggedInUserDocRef: DocumentReference,
    loggedInUserData: DocumentData,
    openProfileId: string
  ) => {
    try {
      // setFriendsWithUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.friends.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.friends.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.friends[loggedInUserId];
          delete loggedInUserData?.friends[openProfileId];
          // Prepares new data to be sent to Firebase
          const newUserFriends = { ...userData?.friends };
          const newLoggedInUserFriends = { ...loggedInUserData?.friends };
          // Updates Firebase with the new data
          transaction.update(userDocRef, { friends: newUserFriends });
          transaction.update(loggedInUserDocRef, { friends: newLoggedInUserFriends });
        }
      });
    } catch (err) {
      // setFriendsWithUser(true);
      console.error(err);
    }
  };

  return { sendFriendRequest, removeFriendRequest, acceptFriendRequest, declineFriendRequest, deleteFriend };
};

export default useFriendInteractions;

// // - Make the context
// const friendsWithUserContext = createContext<string>("l");
// const receivedFriendRequestFromUserContext = createContext<string>("l");
// const sentFriendRequestToUserContext = createContext<string>("l");

// // - Make the custom hook
// export function useFriendsWithUser() {
//   return useContext(friendsWithUserContext);
// }
// export function useReceivedFriendRequestFromUser() {
//   return useContext(receivedFriendRequestFromUserContext);
// }
// export function useSentFriendRequestToUser() {
//   return useContext(sentFriendRequestToUserContext);
// }
