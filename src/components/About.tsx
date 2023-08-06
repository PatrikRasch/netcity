import React, { useState, useEffect } from "react";

import { db } from "./../config/firebase.config";
import { updateDoc, doc, getDoc } from "firebase/firestore";
//2 If the logged in user matches the current open profile, show "edit" button
//2 When edit button is clicked, the input field(s) become editable.
//2 The edit button also turns into a "save" button
//2 When the save button is clicked, state is updated to reflect the changes

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

interface Props {
  openProfileId: string;
  visitingUser: boolean;
  bioText: string;
  setBioText: (value: string) => void;
}

//2 Have to update bio in the backend and fetch it from there when loading the component
//2 Need to fetch bio from profile that is currently open (can use the URL for that)

const About = ({ openProfileId, visitingUser, bioText, setBioText }: Props) => {
  const { loggedInUserId } = useLoggedInUserId();
  const [editButtonText, setEditButtonText] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const loadUserAbout = async () => {
      if (!loggedInUserId) return;
      const openProfileDoc = doc(db, "users", openProfileId);
      try {
        const openProfileData = await getDoc(openProfileDoc);
        const data = openProfileData.data();
        setBioText(data?.bio);
      } catch (err) {
        console.error(err);
      }
    };
    loadUserAbout();
  }, []);

  useEffect(() => {
    setEditButtonText(editMode ? "Save" : "Edit");
  }, [editMode]);

  const saveAboutInput = async () => {
    if (!editMode) return;
    console.log("true now!");
    //2 Write bioText to logged in user profile bio
    const loggedInUserDoc = doc(db, "users", loggedInUserId);
    await updateDoc(loggedInUserDoc, { bio: bioText });
  };

  const showEditButton = () => {
    if (visitingUser) return;
    return (
      <div className="grid justify-start absolute w-[100svw] pl-4 pt-4">
        <button
          className="bg-blue-200 border-black border-2 rounded-lg w-[50px]"
          onClick={() => {
            setEditMode(!editMode);
            saveAboutInput();
          }}
        >
          {editButtonText}
        </button>
      </div>
    );
  };

  const aboutInformation = () => {
    if (!editMode) {
      return (
        <div className="grid justify-items-center">
          <div className="text-3xl mb-3 mt-3">Bio</div>
          <div className="w-[90%] min-h-max border-2 border-black rounded-lg p-4">{bioText}</div>
        </div>
      );
    }
    if (editMode)
      return (
        <div className="grid justify-items-center">
          <div className="text-3xl mb-3 mt-3">Bio</div>
          <textarea
            className="w-[90%] min-h-max border-2 border-black rounded-lg p-4"
            onChange={(e) => {
              setBioText(e.target.value);
            }}
            value={bioText}
          ></textarea>
        </div>
      );
  };

  return (
    <div>
      {showEditButton()}
      {aboutInformation()}
    </div>
  );
};

export default About;
