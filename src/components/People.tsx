import React, { useState, useEffect } from "react";

import PeopleUser from "./PeopleUser";

import { db } from "./../config/firebase.config";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

import { UserData } from "../interfaces";

//1 Feature Work Plan:
//3 1. Fetch all registered users from Firebase
//3 2. Make a list of users
//3 3. Display the people in a list
//3 4. Make the users clickable
//3 5. Navigate to the user's profile if clicked
//3 6. Allow liking and disliking on other profiles
//2 7. Ability to add friends

const People = () => {
  // Holds all the users in their various categories
  const [allOtherUsers, setAllOtherUsers] = useState<UserData[]>([]);
  const [allFriends, setAllFriends] = useState<UserData[]>([]);
  const [allReceivedFriendRequests, setAllReceivedFriendRequests] = useState<UserData[]>([]);
  const [allSentFriendRequests, setAllSentFriendRequests] = useState<UserData[]>([]);

  // Holds all the ID's of the friend interactions from the logged in user
  const [usersFriendsIds, setUsersFriendsIds] = useState<UserData[]>([]);
  const [usersSentFriendRequestsIds, setUsersSentFriendRequestsIds] = useState<UserData[]>([]);
  const [usersReceivedFriendRequestsIds, setUsersReceivedFriendRequestsIds] = useState<UserData[]>(
    []
  );

  // State for selecting which category of users to show
  const [showOtherUsers, setShowOtherUsers] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [showReceivedFriendRequests, setShowReceivedFriendRequests] = useState(false);
  const [showSentFriendRequests, setShowSentFriendRequests] = useState(false);

  const { loggedInUserId } = useLoggedInUserId();

  //1 Get the friend information from the logged in user
  useEffect(() => {
    const handleFriends = async () => {
      const loggedInUserDocRef = doc(db, "users", loggedInUserId);
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      setUsersSentFriendRequestsIds(loggedInUserData?.currentSentFriendRequests);
      setUsersReceivedFriendRequestsIds(loggedInUserData?.currentReceivedFriendRequests);
      setUsersFriendsIds(loggedInUserData?.friends);
    };
    handleFriends();
  }, [loggedInUserId]);

  //1 Get the user ID, first name and last name, and set it all in state.
  useEffect(() => {
    //6 How about we only get 10 users at first, then infinity scroll load 10 more at a time
    const getAllUsers = async () => {
      const usersCollection = collection(db, "users");
      const allUsers = await getDocs(usersCollection);
      const otherUsersArray: UserData[] = [];
      const usersFriendsArray: UserData[] = [];
      const usersSentFriendRequestsArray: UserData[] = [];
      const usersReceivedFriendRequestsArray: UserData[] = [];
      allUsers.forEach((doc) => {
        const userData = doc.data() as UserData;
        if (doc.id === loggedInUserId) return; // Remove logged in user from the list of users
        if (usersFriendsIds.hasOwnProperty(doc.id))
          return usersFriendsArray.push({ ...userData, id: doc.id }); // Are they already friends?
        if (usersReceivedFriendRequestsIds.hasOwnProperty(doc.id))
          return usersReceivedFriendRequestsArray.push({ ...userData, id: doc.id }); // Have they requested to be friends with loggedInUser?
        if (usersSentFriendRequestsIds.hasOwnProperty(doc.id))
          return usersSentFriendRequestsArray.push({
            ...userData,
            id: doc.id,
          });
        // Has logged in user already sent them a friend request?
        else return otherUsersArray.push({ ...userData, id: doc.id });
      });
      setAllFriends(usersFriendsArray);
      setAllReceivedFriendRequests(usersReceivedFriendRequestsArray);
      setAllSentFriendRequests(usersSentFriendRequestsArray);
      setAllOtherUsers(otherUsersArray);
    };
    getAllUsers();
  }, [loggedInUserId, usersFriendsIds, usersReceivedFriendRequestsIds, usersSentFriendRequestsIds]);

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

  const getUsersToRender = () => {
    if (showOtherUsers) return allOtherUsers;
    if (showFriends) return allFriends;
    if (showReceivedFriendRequests) return allReceivedFriendRequests;
    if (showSentFriendRequests) return allSentFriendRequests;
  };

  const populateUsersOnPage = () => {
    return getUsersToRender()?.map((user: UserData) => (
      <div key={user.id}>
        <PeopleUser
          userId={user.id}
          userFirstName={user.firstName}
          userLastName={user.lastName}
          userProfilePicture={user.profilePicture}
          alreadyFriends={usersFriendsIds.hasOwnProperty(user.id)}
          sentFriendRequest={usersSentFriendRequestsIds.hasOwnProperty(user.id)}
          receivedFriendRequest={usersReceivedFriendRequestsIds.hasOwnProperty(user.id)}
        />
      </div>
    ));
  };

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 text-sm p-4">
        <button
          className={`text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] 
          ${showOtherUsers ? "bg-[#00A7E1]" : "bg-gray-400"} `}
          onClick={() => {
            sectionControlSwitcher("setShowOtherUsers");
          }}
        >
          Find People
        </button>
        <button
          className={` text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] ${
            showFriends ? "bg-[#00A7E1]" : "bg-gray-400"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowFriends");
          }}
        >
          Friends
        </button>
        <button
          className={`text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] ${
            showReceivedFriendRequests ? "bg-[#00A7E1]" : "bg-gray-400"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowReceivedFriendRequests");
          }}
        >
          Friend Requests
        </button>
        <button
          className={`text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] ${
            showSentFriendRequests ? "bg-[#00A7E1]" : "bg-gray-400"
          } `}
          onClick={() => {
            sectionControlSwitcher("setShowSentFriendRequests");
          }}
        >
          Sent Requests
        </button>
      </div>

      <div className="bg-gray-100 min-h-[87svh]">{populateUsersOnPage()}</div>
    </div>
  );
};

export default People;
