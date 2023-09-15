import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";

import { v4 as uuidv4 } from "uuid";

import { GetAllPosts, VisitingUser } from "../interfaces";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";

import { db, storage } from "./../config/firebase.config";
import { doc, addDoc, collection, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

import imageIcon from "./../assets/icons/imageIcon/imageIcon.png";

interface Props {
  getAllPosts: GetAllPosts["getAllPosts"];
  visitingUser: VisitingUser["visitingUser"];
  userPicture: string;
}

function MakePost({ getAllPosts, userPicture, visitingUser }: Props) {
  const [postInput, setPostInput] = useState("");
  const [postId, setPostId] = useState("");
  const { openProfileId } = useParams();
  const { dateDayMonthYear } = useDateFunctions();
  const [fullTimestamp, setFullTimestamp] = useState({});
  const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const [imageAddedToPost, setImageAddedToPost] = useState<string>("");
  const [imageAddedToPostId, setImageAddedToPostId] = useState<string>("");
  const [textareaActive, setTextareaActive] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  //1 Gets the reference to the postsProfile collection for the user
  const getPostsProfileRef = () => {
    if (!openProfileId) return console.log("No userProfileId"); //6 Need to make this error better later
    const targetUser = doc(db, "users", openProfileId);
    return collection(targetUser, "postsProfile");
  };

  //1 Current problems:
  //3 Posts don't load in order, need to add a post timestamp to sort posts.
  //2 All posts load together no matter how many when a profile is visited. Need to add some form of lazyloading.

  //1 Write the post to Firestore
  const writePost = async (data: {
    timestamp: object;
    firstName: string;
    lastName: string;
    text: string;
    image: string;
    imageId: string;
    date: string;
    likes: object;
    dislikes: object;
    comments: object;
    userId: string;
  }) => {
    try {
      const postsProfileRef = getPostsProfileRef();
      if (postsProfileRef === undefined) return console.log("postsProfileRef is undefined");
      const newPost = await addDoc(postsProfileRef, data);
      console.log("Post written to Firestore");
      setPostId(newPost.id); // Set the ID of this post to the state newPost
    } catch (err) {
      console.error("Error writing to postsProfile: ", err);
    }
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
      setImageAddedToPostId(imageId);
      setImageAddedToPost(downloadURL);
      // alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err);
      //6 Need a "Something went wrong, please try again"
    }
  };

  const displayUploadedImageOrNot = () => {
    if (imageAddedToPost)
      return (
        <div className="">
          <div className="relative">
            <img src={imageAddedToPost} alt="" className="rounded-xl shadow-xl p-[3px]" />
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
    if (!imageAddedToPost) return null;
  };

  const deleteImageAddedToPost = async () => {
    try {
      if (imageAddedToPost) {
        const postImageRef = ref(storage, `postImages/${imageAddedToPostId}`);
        await deleteObject(postImageRef);
        setImageAddedToPost("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  //1 Changes the height of the comment input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 5; // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight; // Sets computedHeight to match scrollheight
    console.log(computedHeight);
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
      <div className="font-mainFont font-semibold pl-4 pt-3 pb-1">Create a Post</div>
      <div className="w-full h-[1.5px] bg-grayLineThin"></div>

      <section className="grid grid-cols-[55px,1fr,55px] justify-items-center items-center gap-2 pt-3 pb-3 pl-2 pr-2">
        <img
          src={loggedInUserProfilePicture}
          alt=""
          className="aspect-square object-cover h-[48px] self-start ml-2 rounded-[50px] font-mainFont"
        />
        <textarea
          ref={textareaRef}
          placeholder="Make a post"
          className={`w-full resize-none overflow-y-auto self-start rounded-3xl p-3 transition-height duration-500 outline-none bg-graySoft ${
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
        <div className={`${imageAddedToPost ? "" : "absolute"}`}></div>
        <div className={`${imageAddedToPost ? "" : "absolute"}`}>{displayUploadedImageOrNot()}</div>
        <div className={`${imageAddedToPost ? "" : "absolute"}`}></div>
      </section>

      {/* Post section */}
      <section className="grid grid-cols-[55px,1fr,55px] justify-items-center items-center gap-2 pb-3">
        <div></div>
        <div className="w-full">
          <button
            className="w-[100%] bg-purpleMain text-white rounded-3xl text-medium font-mainFont font-bold h-[33px]"
            onClick={(e) => {
              if (postInput.length === 0 && imageAddedToPost === "")
                return console.log("add text or image before posting");
              setFullTimestamp(new Date());
              writePost({
                timestamp: fullTimestamp,
                firstName: loggedInUserFirstName,
                lastName: loggedInUserLastName,
                text: postInput,
                image: imageAddedToPost,
                imageId: imageAddedToPostId,
                date: dateDayMonthYear,
                likes: {},
                dislikes: {},
                comments: {},
                userId: loggedInUserId,
              });
              getAllPosts();
              setPostInput("");
              setImageAddedToPost("");
              resetTextarea();
              setTextareaActive(false);
            }}
          >
            Post
          </button>
        </div>
      </section>
      <div className="w-full h-[7px] bg-grayLineThick"></div>
    </div>
  );
}

export default MakePost;
