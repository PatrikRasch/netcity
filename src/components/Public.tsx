import React, { useEffect, useState } from "react";
import PublicPosts from "./PublicPosts";

import { db } from "../config/firebase.config";
import { collection, doc, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
//2 Need to split AllPosts into PublicPosts and ProfilePosts ??

//2 Need a MakePost component for public, name it MakePostPublic
//2 Might be able to use AllPosts component to populate the Public page
//2 Use Post component to populate the Public page with posts

//2 We should store loggedInUserProfileData in a context so that Public can access it

interface PublicPostData {
  userId: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: object;
  dislikes: object;
  comments: object;
  timestamp: object;
  id: string;
}

function Public() {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const { dateDayMonthYear } = useDateFunctions();
  const [postInput, setPostInput] = useState("");
  const [postId, setPostId] = useState("");
  const [publicPosts, setPublicPosts] = useState<PublicPostData[]>([]);
  const [fullTimestamp, setFullTimestamp] = useState({});

  //1 Gets the reference to the publicPosts collection
  const publicPostsCollection = collection(db, "publicPosts");

  useEffect(() => {
    getAllPublicPosts();
  }, []);

  const writePost = async (data: {
    userId: string;
    firstName: string;
    lastName: string;
    text: string;
    date: string;
    likes: object;
    dislikes: object;
    comments: object;
    timestamp: object;
  }) => {
    try {
      if (publicPostsCollection === undefined)
        return console.log("publicPostsCollection is undefined"); //6 Must be improved later
      const newPublicPost = await addDoc(publicPostsCollection, data);
      console.log("Post written to Firestore");
      setPostId(newPublicPost.id); // Set the ID of this post to the state newPost
    } catch (err) {
      console.error("Error writing to publicPosts: ", err);
    }
  };

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllPublicPosts = async () => {
    try {
      console.log("getting all posts");
      const sortedPublicPosts = query(publicPostsCollection, orderBy("timestamp", "desc")); // Sorts posts in descending order
      const unsubscribe = onSnapshot(sortedPublicPosts, (snapshot) => {
        const publicPostsDataArray: PublicPostData[] = []; // Empty array that'll be used for updating state
        // Push each doc (post) into the publicPostsDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData; // "as PostData" is type validation
          publicPostsDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
        });
        setPublicPosts(publicPostsDataArray); // Update state with all the posts
      }); // Gets all docs from postsProfile collection
    } catch (err) {
      console.error("Error trying to get all docs:", err);
    }
  };

  return (
    <div>
      <div className="grid justify-items-center gap-4 mt-4">
        <img
          src={loggedInUserProfilePicture}
          alt=""
          className="aspect-square object-cover h-[80px] rounded-[50px]"
        />
        <textarea
          placeholder="Make a post"
          className="min-h-[120px] w-full resize-none text-center text-xl p-2 outline-none"
          maxLength={150}
          value={postInput}
          onChange={(e) => {
            setPostInput(e.target.value);
            setFullTimestamp(new Date());
          }}
        />
      </div>
      <button
        className="min-h-[30px] w-full bg-[#00A7E1] text-white"
        onClick={(e) => {
          if (postInput.length === 0) return console.log("add text to input before posting");
          setFullTimestamp(new Date());
          writePost({
            timestamp: fullTimestamp,
            firstName: loggedInUserFirstName,
            lastName: loggedInUserLastName,
            text: postInput,
            date: dateDayMonthYear,
            likes: {},
            dislikes: {},
            comments: {},
            userId: loggedInUserId,
          });
          getAllPublicPosts();
          setPostInput("");
        }}
      >
        Post
      </button>
      <div className="w-full h-[15px] bg-gray-100"></div>
      <PublicPosts publicPosts={publicPosts} />
    </div>
  );
}

export default Public;
