import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db, storage } from "./../config/firebase.config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, getDocs, updateDoc, collection, query, orderBy } from "firebase/firestore";

import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";
import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

import { PostData } from "../interfaces";

//2 It's going to be a problem down the line to separate a visiting user from the profile the
//2 user is viewing. As of now I think it all goes under the same umbrella. We'll see.

//2 Currently, whenever this (Profile) component is navigated to, the getAllDocs(); effect is ran.
//2   This is not necessary.

//2 When a user visits another user:
//2   Perhaps having a UUID id for each user which would be
//2   the route for a users profile would be a good idea.
//2   So that when a user visits another user, the URL holds their UUID id.
//2     Might also be able to use the userId for this, but that might cause security issues.
//2 When a user visits another user, check if the userId matches the currently signed in user?...

const Profile = () => {
  const [showPosts, setShowPosts] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [profilePicture, setProfilePicture] = useState(emptyProfilePicture);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [profilePictureUpload, setProfilePictureUpload] = useState<File | null>(null);
  const navigate = useNavigate();

  //1 Gets all the profilePosts from the user's subcollection.
  const getAllDocs = async () => {
    try {
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, userId); // Grabs the doc where the user is
      const postsProfileCollection = collection(userDocRef, "postsProfile"); // Grabs the postsProfile collection
      const sortedPostsProfile = query(postsProfileCollection, orderBy("timestamp", "desc")); // Sorts posts in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const postsProfileDocs = await getDocs(sortedPostsProfile); // Gets all docs from postsProfile collection
      const postsProfileDataArray: PostData[] = []; // Empty array that'll be used for updating state
      // Push each doc (post) into the postsProfileDataArray array.
      postsProfileDocs.forEach((doc) => {
        const postData = doc.data() as PostData; // "as PostData" is type validation
        postsProfileDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
      });
      setPosts(postsProfileDataArray); // Update state with all the posts
    } catch (err) {
      console.error("Error trying to get all docs:", err);
    }
  };

  //1 Fetches and sets in state all posts from Firebase.
  useEffect(() => {
    getAllDocs();
    console.log("AllPosts: useEffect re-render");
  }, [userId]); // Get docs when userId state changes

  const showPostsOrAbout = () => {
    if (showPosts) {
      return (
        <>
          <MakePost
            userId={userId}
            setUserId={setUserId}
            firstName={firstName}
            lastName={lastName}
            profilePicture={profilePicture}
            getAllDocs={getAllDocs}
          />
          <AllPosts
            userId={userId}
            setUserId={setUserId}
            firstName={firstName}
            lastName={lastName}
            posts={posts}
            profilePicture={profilePicture}
          />
        </>
      );
    } else
      return (
        <>
          <About />
        </>
      );
  };

  //1 Get the user ID, first name and last name, and set it all in state.
  useEffect(() => {
    onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setUserId(user.uid);
        const targetUser = doc(db, "users", user.uid);
        const targetDoc = await getDoc(targetUser);
        const data = targetDoc.data();
        setFirstName(data?.firstName);
        setLastName(data?.lastName);
        setProfilePicture(data?.profilePicture);
      }
    });
  }, []);

  //1 Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  //1 Also updates the user in the Firestore database with URL to the photo.
  const profilePictureClicked = async () => {
    if (profilePictureUpload === null) return; // Return if no imagine is uploaded
    const storageRef = ref(storage, `/profilePictures/${userId}`); // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, profilePictureUpload); // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref); // Get the downloadURL for the image
      setProfilePicture(downloadURL); // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, userId); // Grabs the doc where the user is
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
          />
        </div>
        <div className="text-3xl">
          {firstName} {lastName}
        </div>
      </div>
      {/*//1 Posts/About selection */}
      <div className="grid w-[100svw] justify-center">
        <div className="flex w-[65svw] rounded-lg h-12 border-2 border-black">
          <button
            className="bg-[#00A7E1] text-white w-[100%] h-[100%] flex justify-center items-center"
            onClick={() => setShowPosts(true)}
          >
            Posts
          </button>
          <button
            className="w-[100%] flex justify-center items-center"
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

//1 Feature work plan:
//3 1. Fetch the data from firestore and display firstname + lastname
//3       Gotta match the user from auth to users and then fetch the data
//3 2. Allow user to make post. When text input and post clicked, add post to firebase user's post
//3 3. Set up routing to about when about it clicked
//3 4. Set up routing to and from public
