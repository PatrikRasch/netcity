import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { db, storage } from "./../config/firebase.config";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
// import { useLoadingScreen } from "./context/LoadingContextProvider";

import { PostData } from "../interfaces";

//2 Ideally posts are lazyloaded with 5-10 at a time instead of all at the same time

interface Props {
  loggedInUserId: string;
  setLoggedInUserId: (value: string) => void;
}

const Profile = ({ loggedInUserId, setLoggedInUserId }: Props) => {
  //- Context declarations:
  const emptyProfilePicture = useEmptyProfilePicture();
  //- State declarations:
  const [visitingUser, setVisitingUser] = useState(false);
  const [showPosts, setShowPosts] = useState(true);
  const [profileFirstName, setProfileFirstName] = useState("");
  const [profileLastName, setProfileLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState(emptyProfilePicture);
  const [userFirstName, setUserFirstName] = useState("");
  const [userLastName, setUserLastName] = useState("");
  const [userPicture, setUserPicture] = useState(emptyProfilePicture);
  const [profilePictureUpload, setProfilePictureUpload] = useState<File | null>(null);
  const [bioText, setBioText] = useState("");
  //- Navigation declarations:
  const navigate = useNavigate();
  //- useParams:
  const { openProfileId } = useParams();
  //- localStorage state:
  const [initialProfileLoadCompleted, setInitialProfileLoadCompleted] = useState(false);
  const postsProfileLocalStorage = window.localStorage.getItem(
    `NETCITY_postsProfile_${loggedInUserId}`
  );
  const [posts, setPosts] = useState<PostData[]>(
    postsProfileLocalStorage && loggedInUserId === openProfileId
      ? JSON.parse(postsProfileLocalStorage)
      : []
  );

  useEffect(() => {
    if (loggedInUserId === openProfileId) setVisitingUser(false); // Viewing own profile
    if (loggedInUserId !== openProfileId) setVisitingUser(true); // Viewing someone else's profile

    const getLoggedInUserProfilePosts = () => {
      const isFirstLoadCompleted = localStorage.getItem("NETCITY_initialProfileLoadCompleted");
      if (isFirstLoadCompleted === "true" && !visitingUser) return;
      console.log("Running getAllPosts in Profile");
      getAllPosts();
      window.localStorage.setItem(
        "NETCITY_initialProfileLoadCompleted",
        JSON.stringify(initialProfileLoadCompleted)
      );
    };
    getLoggedInUserProfilePosts();

    //1 Profile data includes all profile data but the posts
    const getProfileData = async () => {
      // console.log("use effect");
      if (!openProfileId) return null;
      try {
        // Step 1: Get data for the open profile
        const profileTargetUser = doc(db, "users", openProfileId);
        const profileTargetDoc = await getDoc(profileTargetUser);
        const profileData = profileTargetDoc.data();
        setProfileFirstName(profileData?.firstName);
        setProfileLastName(profileData?.lastName);
        setProfilePicture(profileData?.profilePicture);
        // Step 2: Get data of the viewer
        if (!loggedInUserId) return null;
        // If the viewer owns the profile, use the same data
        if (!visitingUser) {
          setUserFirstName(profileData?.firstName);
          setUserLastName(profileData?.lastName);
          setUserPicture(profileData?.profilePicture);
          setBioText(profileData?.bio);
          setInitialProfileLoadCompleted(true); // Update localStorage boolean if the user is viewing their own profile
          return;
        }
        const userTargetUser = doc(db, "users", loggedInUserId);
        const userTargetDoc = await getDoc(userTargetUser);
        const userData = userTargetDoc.data();
        setUserFirstName(userData?.firstName);
        setUserLastName(userData?.lastName);
        setUserPicture(userData?.profilePicture);
        setBioText(userData?.bio);
      } catch (err) {
        console.error(err);
      }
    };
    getProfileData();
  }, [initialProfileLoadCompleted, openProfileId, loggedInUserId]); // Get docs when userId state changes

  // const unsub = onSnapshot(doc(db, "cities", "SF"), (doc) => {
  //     console.log("Current data: ", doc.data());
  // });

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllPosts = async () => {
    try {
      console.log("getting all posts");
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, openProfileId); // Grabs the doc where the user is
      const postsProfileCollection = collection(userDocRef, "postsProfile"); // Grabs the postsProfile collection
      const sortedPostsProfile = query(postsProfileCollection, orderBy("timestamp", "desc")); // Sorts posts in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const unsubscribe = onSnapshot(sortedPostsProfile, (snapshot) => {
        console.log("here");
        const postsProfileDataArray: PostData[] = []; // Empty array that'll be used for updating state
        // Push each doc (post) into the postsProfileDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PostData; // "as PostData" is type validation
          postsProfileDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
        });
        setPosts(postsProfileDataArray); // Update state with all the posts
        // Updates localStorage with the posts on the logged in user's profile
        if (loggedInUserId === openProfileId) {
          window.localStorage.setItem(
            `NETCITY_postsProfile_${loggedInUserId}`,
            JSON.stringify(postsProfileDataArray)
          );
        }
      }); // Gets all docs from postsProfile collection
    } catch (err) {
      console.error("Error trying to get all docs:", err);
    }
  };

  if (openProfileId === undefined) return null; //6. must make this better later

  const showPostsOrAbout = () => {
    if (showPosts) {
      return (
        <>
          {/* //2 We should pass the user information of the currently logged in user, not the one that's being visited, as this info is used to create posts. */}
          <MakePost
            loggedInUserId={loggedInUserId}
            setLoggedInUserId={setLoggedInUserId}
            userFirstName={userFirstName} // Name of logged in user
            userLastName={userLastName} // Name of logged in user
            userPicture={userPicture} // pf Picture og logged in user
            getAllPosts={getAllPosts}
            visitingUser={visitingUser}
          />
          <AllPosts
            openProfileId={openProfileId} // Id of profile being viewed
            firstName={userFirstName}
            lastName={userLastName}
            posts={posts}
            loggedInUserId={loggedInUserId} // Id of logged in profile
          />
        </>
      );
    } else
      return (
        <>
          <About
            loggedInUserId={loggedInUserId}
            openProfileId={openProfileId} // Id of profile being viewed
            visitingUser={visitingUser}
            bioText={bioText}
            setBioText={setBioText}
          />
        </>
      );
  };

  //1 Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  //1 Also updates the user in the Firestore database with URL to the photo.
  const profilePictureClicked = async () => {
    if (profilePictureUpload === null) return; // Return if no imagine is uploaded
    const storageRef = ref(storage, `/profilePictures/${loggedInUserId}`); // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, profilePictureUpload); // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref); // Get the downloadURL for the image
      setProfilePicture(downloadURL); // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      await updateDoc(userDocRef, { profilePicture: downloadURL }); // Add the image into Firestore
      alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err);
      //6 Need a "Something went wrong, please try again"
    }
  };

  const userSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("Signed out");
    });
    navigate("/login");
  };

  const displayProfilePicture = () => {
    return (
      <img
        src={profilePicture === "" ? emptyProfilePicture : profilePicture}
        alt="profile"
        className="rounded-[50%] aspect-square object-cover"
        onClick={() => profilePictureClicked()}
      />
    );
  };

  return (
    <div>
      {/*//1 Profile picture and name */}
      <div className="grid grid-cols-[120px,1fr] items-center justify-center gap-4 p-8">
        <div>
          <label htmlFor="fileInput">{displayProfilePicture()}</label>
          <input
            type="file"
            id="fileInput"
            className="opacity-0 hidden"
            onChange={(e) => setProfilePictureUpload(e.target.files?.[0] || null)}
            disabled={visitingUser} // Disables fileInput if it's not your profile
          />
        </div>
        <div className="text-3xl">
          {profileFirstName} {profileLastName}
        </div>
      </div>
      {/*//1 Posts/About selection */}
      <div className="grid w-[100svw] justify-center">
        <div className="flex w-[65svw] rounded-lg h-12 border-2 border-black">
          <button
            className={`${
              showPosts ? "bg-[#00A7E1] text-white" : ""
            }  w-[100%] h-[100%] flex justify-center items-center`}
            onClick={() => setShowPosts(true)}
          >
            Posts
          </button>
          <button
            className={`${
              !showPosts ? "bg-[#00A7E1] text-white" : ""
            } w-[100%] flex justify-center items-center`}
            onClick={() => setShowPosts(false)}
          >
            About
          </button>
        </div>
      </div>
      <div className="w-full h-[12px] bg-gray-100"></div>
      {/*//1 Posts or About */}
      <div>{showPostsOrAbout()}</div>
      <div className="w-full h-[15px] bg-gray-100"></div>
      <button onClick={() => userSignOut()}>LOG OUT</button>
    </div>
  );
};

export default Profile;

//6 Could change profilePicture in Firebase to be "pfPicture" or just "picture" in order to keep naming more concise. Currently it's a bit confusing as we are using "profilePicture" to indicate that it's the picture to be used on the profile being viewing, and "userPicture" to point to the picture of the viewer.

//1 Feature work plan:
//3 1. Fetch the data from firestore and display firstname + lastname
//3       Gotta match the user from auth to users and then fetch the data
//3 2. Allow user to make post. When text input and post clicked, add post to firebase user's post
//3 3. Set up routing to about when about it clicked
//3 4. Set up routing to and from public

//3 It's going to be a problem down the line to separate a visiting user from the profile the
//3 user is viewing. As of now I think it all goes under the same umbrella. We'll see.

//3 When a user visits another user:
//3   Perhaps having a UUID id for each user which would be
//3   the route for a users profile would be a good idea.
//3   So that when a user visits another user, the URL holds their UUID id.
//3     Might also be able to use the userId for this, but that might cause security issues.
//3 When a user visits another user, check if the userId matches the currently signed in user?...

//3 Have to run a check to see if userProfileId matches logged in userId
//3 If it does, display home profile and pass userId to profile
//3 If it doesn't, pass userProfileId to the top (profile header), userId to MakePost, and let posts fetch their own

//3 Currently, whenever this (Profile) component is navigated to, the getAllPosts(); effect is ran.
//3 This is not necessary.

//3 Only want getAllPosts() to run on initial load and when "posts" state changes
//3 Store an "initialLoadCompleted: true" in localStorage after posts have been fetched
//3 If there isn't any "initialLoadCompleted: true" in localStorage, run getAllPosts()
//3 Run getAllPosts() whenever a post is altered or a new post is added.
//3   Have a useEffect that only runs if there is no initialLoadCompleted on mount
