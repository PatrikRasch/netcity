import React, { useState, useEffect } from "react";

import PeopleUser from "./PeopleUser";

import { db } from "./../config/firebase.config";
import { DocumentData, collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

import { UserData } from "../interfaces";

//1 Feature Work Plan:
//3 1. Fetch all registered users from Firebase
//3 2. Make a list of users
//3 3. Display the people in a list
//3 4. Make the users clickable
//3 5. Navigate to the user's profile if clicked
//3 6. Allow liking and disliking on other profiles
//3 7. Ability to add friends

//3 Must go through all components and ensure consistency when updating

const People = () => {
  const { loggedInUserId } = useLoggedInUserId();
  // State for selecting which category of users to show
  const [showOtherUsers, setShowOtherUsers] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [showReceivedFriendRequests, setShowReceivedFriendRequests] = useState(false);
  const [showSentFriendRequests, setShowSentFriendRequests] = useState(false);

  const [numOfReceivedFriendRequests, setNumOfReceivedFriendRequests] = useState(0);

  const [allUsers, setAllUsers] = useState<DocumentData>();
  // Holds all the users in their various categories
  const [allOtherUsers, setAllOtherUsers] = useState<UserData[]>([]);
  const [allFriends, setAllFriends] = useState<UserData[]>([]);
  const [allReceivedFriendRequests, setAllReceivedFriendRequests] = useState<UserData[]>([]);
  const [allSentFriendRequests, setAllSentFriendRequests] = useState<UserData[]>([]);

  const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>();

  const loggedInUserDocRef = doc(db, "users", loggedInUserId);

  useEffect(() => {
    getAndCategoriseUsers();
  }, []);

  useEffect(() => {
    updateNumOfReceivedFriendsRequests();
  }, []);

  const updateNumOfReceivedFriendsRequests = async () => {
    const loggedInUserDoc = await getDoc(loggedInUserDocRef);
    const loggedInUserData = loggedInUserDoc.data();
    const receivedRequests = loggedInUserData?.currentReceivedFriendRequests;
    setNumOfReceivedFriendRequests(Object.keys(receivedRequests).length);
  };

  const usersCollection = collection(db, "users");

  // - Allows for editing a global property in Firestore if necessary
  const editGlobalFirestoreProperty = async () => {
    try {
      const allUsersRef = await getDocs(usersCollection);
      allUsersRef.forEach(async (doc) => {
        await updateDoc(doc.ref, { openProfile: true });
      });
    } catch (err) {
      console.error(err);
    }
  };

  // -  Gets and categorises all users
  const getAndCategoriseUsers = async () => {
    try {
      const allUsers = await getDocs(usersCollection);
      setAllUsers(allUsers);
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      setLoggedInUserData(loggedInUserData);
      const otherUsersArray: UserData[] = [];
      const usersFriendsArray: UserData[] = [];
      const usersSentFriendRequestsArray: UserData[] = [];
      const usersReceivedFriendRequestsArray: UserData[] = [];

      allUsers?.forEach((doc: DocumentData) => {
        const userData = doc.data() as UserData;
        if (doc.id === loggedInUserId) return; // Remove logged in user from the list of users
        if (loggedInUserData?.friends.hasOwnProperty(doc.id))
          return usersFriendsArray.push({ ...userData, id: doc.id }); // Are they already friends?
        if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(doc.id))
          return usersReceivedFriendRequestsArray.push({ ...userData, id: doc.id }); // Have they requested to be friends with loggedInUser?
        if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(doc.id))
          // if (usersSentFriendRequestsIds.hasOwnProperty(doc.id))
          return usersSentFriendRequestsArray.push({ ...userData, id: doc.id });
        // Has logged in user already sent them a friend request?
      });
      allUsers?.forEach((doc: DocumentData) => {
        const userData = doc.data() as UserData;
        return otherUsersArray.push({ ...userData, id: doc.id });
      });

      setAllFriends(usersFriendsArray);
      setAllReceivedFriendRequests(usersReceivedFriendRequestsArray);
      setAllSentFriendRequests(usersSentFriendRequestsArray);
      setAllOtherUsers(otherUsersArray);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the list of friends of the logged in user
  const updateFriends = async () => {
    try {
      const usersFriendsArray: UserData[] = [];
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData;
        if (loggedInUserData?.friends.hasOwnProperty(user.id))
          return usersFriendsArray.push({ ...userData, id: user.id });
        else return;
      });
      setAllFriends(usersFriendsArray);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the list of received friend requests of the logged in user
  const updateReceivedFriendRequests = async () => {
    try {
      const usersReceivedFriendRequestsArray: UserData[] = [];
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData;
        // if (user.id === loggedInUserId) return; // Remove logged in user from the list of users
        if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(user.id))
          return usersReceivedFriendRequestsArray.push({ ...userData, id: user.id });
        else return;
      });
      setAllReceivedFriendRequests(usersReceivedFriendRequestsArray);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the list of sent friend requests of the logged in user
  const updateSentFriendRequests = async () => {
    try {
      const usersSentFriendRequestsArray: UserData[] = [];
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData;
        if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(user.id)) {
          return usersSentFriendRequestsArray.push({ ...userData, id: user.id });
        } else return;
      });
      setAllSentFriendRequests(usersSentFriendRequestsArray);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the list of users the logged in user has no connections with
  const updateOtherUsers = async () => {
    try {
      const otherUsersArray: UserData[] = [];
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData;
        if (user.id === loggedInUserId) return; // Remove logged in user from the list of users
        otherUsersArray.push({ ...userData, id: user.id });
        // if (
        //   !loggedInUserData?.currentSentFriendRequests.hasOwnProperty(user.id) &&
        //   !loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(user.id) &&
        //   !loggedInUserData?.friends.hasOwnProperty(user.id)
        // )
        //   return otherUsersArray.push({ ...userData, id: user.id });
        // else return;
      });
      setAllOtherUsers(otherUsersArray);
    } catch (err) {
      console.error(err);
    }
  };

  // - Allows for switching of the categories when called with the correct string
  const sectionControlSwitcher = (sectionToShow: string) => {
    setShowOtherUsers(false);
    setShowFriends(false);
    setShowReceivedFriendRequests(false);
    setShowSentFriendRequests(false);

    const sectionMap: Record<string, (value: boolean) => void> = {
      setShowOtherUsers,
      setShowFriends,
      setShowReceivedFriendRequests,
      setShowSentFriendRequests,
    };
    const section = sectionMap[sectionToShow];
    if (section) section(true);
  };

  // - Returns the category that is to be rendered
  const getUsersToRender = () => {
    if (showOtherUsers) return allOtherUsers;
    if (showFriends) return allFriends;
    if (showReceivedFriendRequests) return allReceivedFriendRequests;
    if (showSentFriendRequests) return allSentFriendRequests;
  };

  // - Displays all the users within the open category
  const populateUsersOnPage = () => {
    return getUsersToRender()?.map((user: UserData) => (
      <div key={user.id}>
        <PeopleUser
          userId={user.id}
          userFirstName={user.firstName}
          userLastName={user.lastName}
          userProfilePicture={user.profilePicture}
          getAndCategoriseUsers={getAndCategoriseUsers}
          loggedInUserData={loggedInUserData}
          setLoggedInUserData={setLoggedInUserData}
          numOfReceivedFriendRequests={numOfReceivedFriendRequests}
          setNumOfReceivedFriendRequests={setNumOfReceivedFriendRequests}
        />
      </div>
    ));
  };

  const pageTitle = () => {
    if (showOtherUsers) return "All People";
    if (showFriends) return `My Friends (${allFriends.length})`;
    if (showReceivedFriendRequests) return `Received Friend Requests (${allReceivedFriendRequests.length})`;
    if (showSentFriendRequests) return `Sent Friend Requests (${allSentFriendRequests.length})`;
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 text-sm p-4">
        <button
          className={`rounded-2xl text-[12.5px] pb-[4px] pt-[4px] pl-[3px] pr-[3px] 
          ${showOtherUsers ? "bg-purpleMain text-white" : "bg-graySoft text-black"} `}
          onClick={() => {
            sectionControlSwitcher("setShowOtherUsers");
            updateOtherUsers();
          }}
        >
          All People
        </button>
        <button
          className={`rounded-2xl text-[12.5px] pb-[4px] pt-[4px] pl-[3px] pr-[3px] ${
            showFriends ? "bg-purpleMain text-white" : "bg-graySoft text-black"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowFriends");
            updateFriends();
          }}
        >
          Friends
        </button>
        <button
          className={`relative rounded-2xl text-[12.5px] leading-4 pb-[6px] pt-[6px] pl-[3px] pr-[3px] ${
            showReceivedFriendRequests ? "bg-purpleMain text-white" : "bg-graySoft text-black"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowReceivedFriendRequests");
            updateReceivedFriendRequests();
          }}
        >
          <div
            className={`absolute top-[-10%] left-[-5%] text-white bg-red-500 rounded-[50%] w-[18px] h-[18px] flex items-center justify-center ${
              numOfReceivedFriendRequests > 0 ? "opacity-1" : "opacity-0"
            }`}
          >
            {numOfReceivedFriendRequests}
          </div>
          Friend Requests
        </button>
        <button
          className={`rounded-2xl text-[12.5px] leading-4 pb-[6px] pt-[6px] pl-[3px] pr-[3px] ${
            showSentFriendRequests ? "bg-purpleMain text-white" : "bg-graySoft text-black"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowSentFriendRequests");
            updateSentFriendRequests();
          }}
        >
          Sent Requests
        </button>
      </div>
      <div className="font-mainFont font-semibold text-medium ml-4 mb-1">{pageTitle()}</div>
      <div className="w-full h-[2px] bg-grayLineThin"></div>
      <div className="bg-gray-100 min-h-[87svh]">{populateUsersOnPage()}</div>
    </div>
  );
};

export default People;
