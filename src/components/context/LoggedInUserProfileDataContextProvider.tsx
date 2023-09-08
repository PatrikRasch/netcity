import React, { useState, ReactNode, createContext, useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEmptyProfilePicture } from "./EmptyProfilePictureContextProvider";
import { useImage } from "react-image";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "./../../config/firebase.config";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

//1 Create context
const LoggedInUserId = createContext<{
  loggedInUserId: string;
  setLoggedInUserId: React.Dispatch<string>;
}>({ loggedInUserId: "", setLoggedInUserId: () => {} });

const LoggedInUserFirstName = createContext<{
  loggedInUserFirstName: string;
  setLoggedInUserFirstName: React.Dispatch<string>;
}>({ loggedInUserFirstName: "", setLoggedInUserFirstName: () => {} });

const LoggedInUserLastName = createContext<{
  loggedInUserLastName: string;
  setLoggedInUserLastName: React.Dispatch<string>;
}>({ loggedInUserLastName: "", setLoggedInUserLastName: () => {} });

const LoggedInUserProfilePicture = createContext<string>("");

// const LoggedInUserBio = createContext<{
//   loggedInUserBio: string;
//   setLoggedInUserBio: React.Dispatch<string>;
// }>({ loggedInUserBio: "", setLoggedInUserBio: () => {} });

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
// export function useLoggedInUserBio() {
//   return useContext(LoggedInUserBio);
// }

//1 Interface
interface Props {
  children: ReactNode;
}

//1 Actual function which returns the provider
const LoggedInUserProfileDataProvider = ({ children }: Props) => {
  const { openProfileId } = useParams();
  const emptyProfilePicture = useEmptyProfilePicture();
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");
  const [loggedInUserLastName, setLoggedInUserLastName] = useState("");
  const [loggedInUserProfilePicture, setLoggedInUserProfilePicture] = useState(emptyProfilePicture);
  const [loggedInUserBio, setLoggedInUserBio] = useState("");

  useEffect(() => {
    const getLoggedInUserId = () => {
      onAuthStateChanged(getAuth(), async (user) => {
        if (user) {
          setLoggedInUserId(user.uid);
        }
      });
    };
    const getLoggedInUserProfileData = async () => {
      if (!loggedInUserId) return null;
      try {
        // Step 1: Get data for the open profile
        const profileTargetUser = doc(db, "users", loggedInUserId);
        const profileTargetDoc = await getDoc(profileTargetUser);
        const profileData = profileTargetDoc.data();
        setLoggedInUserFirstName(profileData?.firstName);
        setLoggedInUserLastName(profileData?.lastName);
        setLoggedInUserProfilePicture(profileData?.profilePicture);

        const unsubscribe = onSnapshot(profileTargetUser, (snapshot) => {
          const updatedProfileData = snapshot.data();
          if (updatedProfileData) {
            setLoggedInUserProfilePicture(updatedProfileData.profilePicture);
          }
        });
        return () => unsubscribe();
      } catch (err) {
        console.error(err);
      }
    };
    getLoggedInUserId();
    getLoggedInUserProfileData();
  }, [loggedInUserId, openProfileId]);

  return (
    <LoggedInUserId.Provider value={{ loggedInUserId, setLoggedInUserId }}>
      <LoggedInUserFirstName.Provider value={{ loggedInUserFirstName, setLoggedInUserFirstName }}>
        <LoggedInUserLastName.Provider value={{ loggedInUserLastName, setLoggedInUserLastName }}>
          <LoggedInUserProfilePicture.Provider value={loggedInUserProfilePicture}>
            {/* <LoggedInUserBio.Provider value={{ loggedInUserBio, setLoggedInUserBio }}> */}
            {children}
            {/* </LoggedInUserBio.Provider> */}
          </LoggedInUserProfilePicture.Provider>
        </LoggedInUserLastName.Provider>
      </LoggedInUserFirstName.Provider>
    </LoggedInUserId.Provider>
  );
};

export default LoggedInUserProfileDataProvider;
