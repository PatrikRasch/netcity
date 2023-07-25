import React, { useState, useEffect } from "react";

import { db } from "./../config/firebase.config";
import { collection, getDocs } from "firebase/firestore";

import PeopleUser from "./PeopleUser";
import { UserData, FirstNameProp, LastNameProp } from "../interfaces";

//1 Feature Work Plan:
//3 1. Fetch all registered users from Firebase
//3 2. Make a list of users
//3 3. Display the people in a list
//2 4. Make the users clickable
//2 5. Navigate to the user's profile if clicked
//6. Leave the "Add friend" functionality for later

interface Props {
  firstName: FirstNameProp["firstName"];
  lastName: LastNameProp["lastName"];
}

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
        <PeopleUser userFirstName={user.firstName} userLastName={user.lastName} />
      </div>
    ));
  };

  return (
    <div>
      <div>{populateUsersOnPage()}</div>
    </div>
  );
};

export default People;
