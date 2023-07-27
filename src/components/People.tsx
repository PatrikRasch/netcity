import React, { useState, useEffect } from "react";

import { db } from "./../config/firebase.config";
import { collection, getDocs } from "firebase/firestore";

import PeopleUser from "./PeopleUser";
import { UserData } from "../interfaces";

//1 Feature Work Plan:
//3 1. Fetch all registered users from Firebase
//3 2. Make a list of users
//3 3. Display the people in a list
//3 4. Make the users clickable
//3 5. Navigate to the user's profile if clicked
//6. Leave the "Add friend" functionality for later

interface Props {}

const People = (props: Props) => {
  const [users, setUsers] = useState<UserData[]>([]);

  //1 Get the user ID, first name and last name, and set it all in state.
  useEffect(() => {
    const getAllUsers = async () => {
      const usersCollection = collection(db, "users");
      const allUsers = await getDocs(usersCollection);
      const userDataArray: UserData[] = [];
      allUsers.forEach((doc) => {
        const userData = doc.data() as UserData;
        userDataArray.push({ ...userData, id: doc.id });
      });
      setUsers(userDataArray);
    };
    getAllUsers();
  }, []);

  const populateUsersOnPage = () => {
    return users.map((user) => (
      <div key={user.id}>
        <PeopleUser
          userId={user.id}
          userFirstName={user.firstName}
          userLastName={user.lastName}
          userProfilePicture={user.profilePicture}
        />
      </div>
    ));
  };

  return (
    <div>
      <div className="bg-gray-100 min-h-[87svh]">{populateUsersOnPage()}</div>
    </div>
  );
};

export default People;
