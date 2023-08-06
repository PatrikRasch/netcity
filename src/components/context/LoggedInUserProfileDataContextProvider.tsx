import React, { useState, ReactNode, createContext, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEmptyProfilePicture } from "./EmptyProfilePictureContextProvider";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./../../config/firebase.config";
import { doc, getDoc } from "firebase/firestore";

//1 Create context
const LoggedInUserId = createContext<{
  loggedInUserId: string;
  setLoggedInUserId: React.Dispatch<string>;
}>({ loggedInUserId: "", setLoggedInUserId: () => {} });
const LoggedInUserFirstName = createContext("");
const LoggedInUserLastName = createContext("");
const LoggedInUserProfilePicture = createContext("");
const LoggedInUserBio = createContext("");

//1 Custom Hook to abstract away "useContext"
export function useLoggedInUserId() {
  return useContext(LoggedInUserId);
}
export function useLoggedInUserFirstName() {
  return useContext(LoggedInUserFirstName);
}
export function useLoggedInUserLastName() {
  return useContext(LoggedInUserLastName);
}
export function useLoggedInUserProfilePicture() {
  return useContext(LoggedInUserProfilePicture);
}
export function useLoggedInUserBio() {
  return useContext(LoggedInUserBio);
}

//1 Interface
interface Props {
  children: ReactNode;
}

//1 Actual function which returns the provider
const LoggedInUserProfileDataProvider = ({ children }: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture();
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");
  const [loggedInUserLastName, setLoggedInUserLastName] = useState("");
  const [loggedInUserProfilePicture, setLoggedInUserProfilePicture] = useState(emptyProfilePicture);
  const [loggedInUserBioText, setLoggedInUserBioText] = useState("");
  const { openProfileId } = useParams();

  useEffect(() => {
    const getLoggedInUserId = () => {
      onAuthStateChanged(getAuth(), async (user) => {
        if (user) {
          setLoggedInUserId(user.uid);
        }
      });
    };

    const getLoggedInUserProfileData = async () => {
      if (!openProfileId) return null;
      try {
        // Step 1: Get data for the open profile
        const profileTargetUser = doc(db, "users", openProfileId);
        const profileTargetDoc = await getDoc(profileTargetUser);
        const profileData = profileTargetDoc.data();
        setLoggedInUserFirstName(profileData?.firstName);
        setLoggedInUserLastName(profileData?.lastName);
        setLoggedInUserProfilePicture(profileData?.profilePicture);
        setLoggedInUserBioText(profileData?.bio);
      } catch (err) {
        console.error(err);
      }
    };
    getLoggedInUserProfileData();
    getLoggedInUserId();
  }, [openProfileId]);

  useEffect(() => {
    console.log("In the custom hook!", "font-size:26px");
    console.log(loggedInUserId);
  }, [loggedInUserId]);

  return (
    <LoggedInUserId.Provider value={{ loggedInUserId, setLoggedInUserId }}>
      <LoggedInUserFirstName.Provider value={loggedInUserFirstName}>
        <LoggedInUserLastName.Provider value={loggedInUserLastName}>
          <LoggedInUserProfilePicture.Provider value={loggedInUserProfilePicture}>
            <LoggedInUserBio.Provider value={loggedInUserBioText}>
              {children}
            </LoggedInUserBio.Provider>
          </LoggedInUserProfilePicture.Provider>
        </LoggedInUserLastName.Provider>
      </LoggedInUserFirstName.Provider>
    </LoggedInUserId.Provider>
  );
};

export default LoggedInUserProfileDataProvider;
