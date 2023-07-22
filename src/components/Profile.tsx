import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "./../config/firebase.config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getDocs, collection, query, orderBy } from "firebase/firestore";

import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";
import profilePicture from "./../assets/images/profile-picture.jpg";

import { PostData } from "../interfaces";

//1 Feature work plan:
//3 1. Fetch the data from firestore and display firstname + lastname
//3       Gotta match the user from auth to users and then fetch the data
//3 2. Allow user to make post. When text input and post clicked, add post to firebase user's post
//3    Only display the posts added to the user's page
//3 3. Set up routing to about when about it clicked
//2 4. Set up routing to and from public

//2 It's going to be a problem down the line to separate a visiting user from the profile the
//2 user is viewing. As of now I think it all goes under the same umbrella. We'll see.

const Profile = () => {
  const [showPosts, setShowPosts] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState<PostData[]>([]);
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
            getAllDocs={getAllDocs}
          />
          <AllPosts
            userId={userId}
            setUserId={setUserId}
            firstName={firstName}
            lastName={lastName}
            posts={posts}
          />
        </>
      );
    } else
      return (
        <>
          <About />;
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
      }
    });
  }, []);

  return (
    <div>
      {/*//1 Profile picture and name */}
      <div className="grid grid-cols-[120px,1fr] items-center justify-center gap-4 p-8">
        <img
          src={profilePicture}
          alt="profile"
          className="rounded-[50%] aspect-square object-cover"
        />
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
    </div>
  );
};

export default Profile;
