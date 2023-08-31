import React, { useEffect, useState } from "react";
import PublicPosts from "./PublicPosts";

import { db } from "../config/firebase.config";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
import useInfinityScrollFunctions from "./custom-hooks/useInfinityScrollFunctions";
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
  publicPost: boolean;
}

function Public() {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const { dateDayMonthYear } = useDateFunctions();
  const [postInput, setPostInput] = useState("");
  const [postId, setPostId] = useState("");
  const [globalPosts, setGlobalPosts] = useState<PublicPostData[]>([]);
  const [friendsPosts, setFriendsPosts] = useState<PublicPostData[]>([]);
  const [fullTimestamp, setFullTimestamp] = useState({});
  const [fetchingMorePosts, setFetchingMorePosts] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(10);
  const [showGlobalPosts, setShowGlobalPosts] = useState(true);
  const [showFriendsPosts, setShowFriendsPosts] = useState(false);
  const [publicPost, setPublicPost] = useState(true);

  //1 Gets the reference to the publicPosts collection
  const publicPostsCollection = collection(db, "publicPosts");

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
    publicPost: boolean;
  }) => {
    try {
      if (publicPostsCollection === undefined) return console.log("publicPostsCollection is undefined"); //6 Must be improved later
      const newPublicPost = await addDoc(publicPostsCollection, data);
      console.log("Post written to Firestore");
      setPostId(newPublicPost.id); // Set the ID of this post to the state newPost
    } catch (err) {
      console.error("Error writing to publicPosts: ", err);
    }
  };

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getGlobalPosts = async () => {
    try {
      const sortedGlobalPosts = query(publicPostsCollection, orderBy("timestamp", "desc"), limit(postsLoaded)); // Sorts posts in descending order
      const unsubscribe = onSnapshot(sortedGlobalPosts, (snapshot) => {
        const globalPostsDataArray: PublicPostData[] = []; // Empty array that'll be used for updating state
        // Push each doc (post) into the globalPostsDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData; // "as PostData" is type validation
          if (postData.publicPost) globalPostsDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
        });
        setGlobalPosts(globalPostsDataArray); // Update state with all the posts
      }); // Gets all docs from postsProfile collection
    } catch (err) {
      console.error("Error trying to get all docs:", err);
    }
  };

  // - Allows for editing a global property in Firestore if necessary
  const editGlobalFirestoreProperty = async () => {
    try {
      const allDocs = await getDocs(publicPostsCollection);
      allDocs.forEach(async (doc) => {
        const postData = doc.data() as PublicPostData;
        if (postData.publicPost === undefined) {
          await updateDoc(doc.ref, { publicPost: true });
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  //2 When deleting a single friends only post, all of them are currently deleted lol (maybe)
  //2 They're not deleted, they just stop displaying until refresh
  //2 Need to ensure this function filters out posts not made by current friends
  const getFriendsPosts = async () => {
    try {
      const loggedInUserDocRef = doc(db, "users", loggedInUserId);
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();

      const sortedFriendsPosts = query(publicPostsCollection, orderBy("timestamp", "desc"), limit(postsLoaded)); // Sorts posts in descending order

      const unsubscribe = onSnapshot(sortedFriendsPosts, (snapshot) => {
        const friendsPostsDataArray: PublicPostData[] = []; // Empty array that'll be used for updating state
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData;

          // Add the post into the array if the user is friends with the poster and the post is not a public post
          if (
            (loggedInUserData?.friends.hasOwnProperty(postData.userId) || postData.userId === loggedInUserId) &&
            !postData.publicPost
          )
            friendsPostsDataArray.push({ ...postData, id: doc.id });
        });
        setFriendsPosts(friendsPostsDataArray); // Update state with all the posts
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getFriendsPosts();
  }, []);

  const changePostDestination = () => {
    setPublicPost((prevMakePublicPost) => !prevMakePublicPost);
  };

  const postDestination = () => {
    if (publicPost) return "Public Post";
    else return "Friends Only Post";
  };

  useInfinityScrollFunctions({
    fetchingMorePosts,
    setFetchingMorePosts,
    postsLoaded,
    setPostsLoaded,
    getGlobalPosts,
  });

  return (
    <div>
      <div className="grid justify-items-center gap-4 mt-4">
        <img src={loggedInUserProfilePicture} alt="" className="aspect-square object-cover h-[80px] rounded-[50px]" />
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
      <div className="grid grid-rows-2 pl-4 pr-4">
        <button
          onClick={() => {
            changePostDestination();
          }}
        >
          {postDestination()}
        </button>
        <button
          className="min-h-[30px] w-full bg-[#00A7E1] text-white rounded-md"
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
              publicPost: publicPost,
            });
            getGlobalPosts();
            setPostInput("");
          }}
        >
          Post
        </button>
      </div>
      <div className="w-full h-[15px] bg-gray-100"></div>
      {/* Choose posts to see section */}
      <section className="grid grid-cols-2 gap-2 text-sm p-4">
        <button
          className={`text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] 
          ${showGlobalPosts ? "bg-[#00A7E1]" : "bg-gray-400"} `}
          onClick={() => {
            setShowGlobalPosts(true);
            setShowFriendsPosts(false);
            setPostsLoaded(10);
          }}
        >
          Public Posts
        </button>
        <button
          className={` text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] ${
            showFriendsPosts ? "bg-[#00A7E1]" : "bg-gray-400"
          } `}
          onClick={() => {
            setShowFriendsPosts(true);
            setShowGlobalPosts(false);
            setPostsLoaded(10);
          }}
        >
          Friends' Posts
        </button>
      </section>
      <div className="w-full h-[15px] bg-gray-100"></div>
      <PublicPosts globalPosts={globalPosts} friendsPosts={friendsPosts} showGlobalPosts={showGlobalPosts} />
    </div>
  );
}

export default Public;
