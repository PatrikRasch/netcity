import React, { useEffect, useState, useRef } from "react";
import AllPosts from "./AllPosts";
import MakePost from "./MakePost";

import { db, storage } from "../config/firebase.config";
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

import { v4 as uuidv4 } from "uuid";

import imageIcon from "./../assets/icons/imageIcon/imageIcon.png";
import globalIconGray from "./../assets/icons/globalIcon/globalIconGray.svg";
import globalIconGrayFilled from "./../assets/icons/globalIcon/globalIconGrayFilled.svg";
import globalIconWhite from "./../assets/icons/globalIcon/globalIconWhite.svg";
import starIconGray from "./../assets/icons/starIcon/starIconGray.svg";
import starIconGrayFilled from "./../assets/icons/starIcon/starIconGrayFilled.svg";
import starIconWhite from "./../assets/icons/starIcon/starIconWhite.svg";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
import useInfinityScrollFunctions from "./custom-hooks/useInfinityScrollFunctions";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface PublicPostData {
  userId: string;
  firstName: string;
  lastName: string;
  text: string;
  image: string;
  imageId: string;
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
  const [imageAddedToPostFeed, setImageAddedToPostFeed] = useState<string>("");
  const [imageAddedToPostFeedId, setImageAddedToPostFeedId] = useState<string>("");
  const [textareaActive, setTextareaActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  //1 Gets the reference to the publicPosts collection
  const publicPostsCollection = collection(db, "publicPosts");

  const writePost = async (data: {
    userId: string;
    firstName: string;
    lastName: string;
    text: string;
    image: string;
    imageId: string;
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
      // console.log("Post written to Firestore");
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

  //6 changePostDestination is redundant atm due to postDestination not using publicPost state, but rather using showGlobalPosts

  const postDestination = () => {
    if (showGlobalPosts) return "Public post";
    else return "Friends only";
  };

  useInfinityScrollFunctions({
    fetchingMorePosts,
    setFetchingMorePosts,
    postsLoaded,
    setPostsLoaded,
    getGlobalPosts,
  });

  const displayUploadedImageOrNot = () => {
    if (imageAddedToPostFeed)
      return (
        <div className="">
          <div className="relative">
            <img src={imageAddedToPostFeed} alt="" className="rounded-xl shadow-xl p-[3px]" />
            <div
              className="absolute top-[15px] right-[15px] bg-white drop-shadow-xl rounded-[50%] w-[22px] h-[22px] opacity-90 flex justify-center items-center hover:cursor-pointer"
              onClick={() => {
                deleteImageAddedToPost();
              }}
            >
              X
            </div>
          </div>
        </div>
      );
    if (!imageAddedToPostFeed) return null;
  };

  const addImageToPost = async (imageToAddToPost: File | null) => {
    if (imageToAddToPost === null) return; // Return if no imagine is uploaded
    const imageId = imageToAddToPost.name + " " + uuidv4();
    const storageRef = ref(storage, `postImages/${imageId}`); // Connect to storage
    try {
      const addedImage = await uploadBytes(storageRef, imageToAddToPost); // Upload the image
      const downloadURL = await getDownloadURL(addedImage.ref); // Get the downloadURL for the image
      // Update Firestore Database with image:
      // const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      // const loggedInUserDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      // // const postRef = doc(loggedInUserDocRef, "postsProfile", postId);
      // await updateDoc(postRef, { image: downloadURL }); // Add the image into Firestore
      setImageAddedToPostFeedId(imageId);
      setImageAddedToPostFeed(downloadURL);
      // alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err);
      //6 Need a "Something went wrong, please try again"
    }
  };

  const deleteImageAddedToPost = async () => {
    try {
      if (imageAddedToPostFeed) {
        const postImageRef = ref(storage, `postImages/${imageAddedToPostFeedId}`);
        await deleteObject(postImageRef);
        setImageAddedToPostFeed("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // - Changes the height of the input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 5; // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight; // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24); // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows - 1; // Sets new number of rows
  };

  const resetTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 1;
  };

  return (
    <div>
      {/* Choose posts to see */}
      <section className="grid grid-cols-2 gap-2 text-sm p-4 max-w-[100svw] whitespace-nowrap">
        <button
          className={`text-white rounded-3xl flex items-center gap-2 justify-center pb-[8px] pt-[8px] h-[45px]
          ${showGlobalPosts ? "bg-grayMain" : "bg-graySoft"} `}
          onClick={() => {
            setShowGlobalPosts(true);
            setShowFriendsPosts(false);
            setPostsLoaded(10);
            setPublicPost(true);
          }}
        >
          <img src={showGlobalPosts ? globalIconWhite : globalIconGray} alt="" className="h-[28px]" />
          <div className={`font-mainFont font-semibold mr-2 ${showGlobalPosts ? "text-white" : "text-textMain"} `}>
            Public Posts
          </div>
        </button>
        <button
          className={`rounded-3xl flex items-center gap-2 justify-center pb-[8px] pt-[8px] max-h-[45px] ${
            showFriendsPosts ? "bg-grayMain text-white" : "bg-graySoft text-textMain"
          } `}
          onClick={() => {
            setShowFriendsPosts(true);
            setShowGlobalPosts(false);
            setPostsLoaded(10);
            setPublicPost(false);
          }}
        >
          <img src={showFriendsPosts ? starIconWhite : starIconGray} alt="" className="h-[28px]" />
          <div className="font-mainFont font-semibold">Friends' Posts</div>
        </button>
      </section>
      <div className="w-full h-[7px] bg-grayLineThick"></div>

      {/* Make a post row */}
      {/* <MakePost /> */}
      <div className="font-mainFont font-semibold text-medium ml-4 mt-3 mb-1">Create a Post</div>
      <div className="w-full h-[1.5px] bg-grayLineThin"></div>

      <section className="grid grid-cols-[55px,1fr,55px] justify-items-center gap-2 pt-4 pb-2 items-start">
        <img
          src={loggedInUserProfilePicture}
          alt=""
          className="aspect-square object-cover h-[45px] ml-2 rounded-[50px]"
        />
        <textarea
          ref={textareaRef}
          placeholder="Make a post"
          className={`w-full resize-none overflow-y-auto rounded-3xl p-3 transition-height duration-500 outline-none bg-graySoft ${
            textareaActive ? "min-h-[144px]" : "min-h-[48px]"
          }`}
          maxLength={1000}
          value={postInput}
          onChange={(e) => {
            setPostInput(e.target.value);
            handleTextareaChange();
            setFullTimestamp(new Date());
          }}
          onFocus={() => {
            setTextareaActive(true);
          }}
          rows={1}
        />
        <input
          type="file"
          id="addImageToPostFeedButton"
          hidden
          onChange={(e) => {
            addImageToPost(e.target.files?.[0] || null);
            e.target.value = "";
          }}
        />
        <label htmlFor="addImageToPostFeedButton" className="hover:cursor-pointer mr-2 flex flex-col">
          <img src={imageIcon} alt="add and upload file to post" className="max-w-[35px]" />
          <div className="text-verySmall text-center">Photo</div>
        </label>
        <div className={`${imageAddedToPostFeed ? "" : "absolute"}`}></div>
        <div className={`${imageAddedToPostFeed ? "" : "absolute"}`}>{displayUploadedImageOrNot()}</div>
        <div className={`${imageAddedToPostFeed ? "" : "absolute"}`}></div>
      </section>

      {/* Post section */}
      <section className="grid grid-cols-[55px,1fr,55px] justify-items-center items-center gap-2 pb-3">
        <div></div>
        <div className="w-full flex justify-around items-center gap-6">
          <button
            className="w-[70%] bg-purpleMain text-white rounded-3xl text-medium font-mainFont font-bold h-[30px]"
            onClick={(e) => {
              if (postInput.length === 0 && imageAddedToPostFeed === "")
                return console.log("add text or image before posting");
              setFullTimestamp(new Date());
              writePost({
                timestamp: fullTimestamp,
                firstName: loggedInUserFirstName,
                lastName: loggedInUserLastName,
                text: postInput,
                image: imageAddedToPostFeed,
                imageId: imageAddedToPostFeedId,
                date: dateDayMonthYear,
                likes: {},
                dislikes: {},
                comments: {},
                userId: loggedInUserId,
                publicPost: publicPost,
              });
              getGlobalPosts();
              setPostInput("");
              setImageAddedToPostFeed("");
              resetTextarea();
              setTextareaActive(false);
            }}
          >
            Post
          </button>
          <button className="bg-graySoft w-[70%] text-textMain rounded-3xl text-verySmall grid grid-cols-[20px,65px] justify-center items-center pl-2 pr-2 h-[30px]">
            <img src={showGlobalPosts ? globalIconGray : starIconGray} alt="" className="max-w-[18px]" />
            <div className="w-full text-center font-mainFont font-semibold whitespace-nowrap">{postDestination()}</div>
          </button>
        </div>
        <div></div>
      </section>
      <div className="w-full h-[7px] bg-grayLineThick"></div>

      <AllPosts
        globalPosts={globalPosts}
        friendsPosts={friendsPosts}
        showGlobalPosts={showGlobalPosts}
        context={"feed"}
      />
    </div>
  );
}

export default Public;
