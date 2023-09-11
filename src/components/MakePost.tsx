import React, { useState } from "react";
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
        <div className="pb-4 pr-8">
          <div className="relative">
            <img src={imageAddedToPost} alt="" className="rounded-xl shadow-xl border-black border-2 p-[3px]" />
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

  return (
    <div>
      <div className="w-full min-h-[150px] bg-white shadow-xl">
        <div className="min-h-[120px] flex p-4 gap-2">
          <div className="min-w-[50px] max-w-min">
            <img
              src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <textarea
            placeholder="Make a post"
            className="w-full bg-transparent resize-none outline-none"
            maxLength={1000}
            value={postInput}
            onChange={(e) => {
              setPostInput(e.target.value);
              setFullTimestamp(new Date());
            }}
          />
        </div>
        <div className="grid grid-cols-[80px,1fr]">
          <input
            type="file"
            id="imageInput"
            hidden
            onChange={(e) => {
              console.log("Change!");
              addImageToPost(e.target.files?.[0] || null);
              e.target.value = "";
            }}
          />
          <label htmlFor="imageInput" className="hover:cursor-pointer block w-max">
            <img src={imageIcon} alt="add and upload file to post" className="max-w-[50px]" />
          </label>
          {displayUploadedImageOrNot()}
        </div>
        <button
          className="min-h-[30px] w-full bg-[#00A7E1] text-white"
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
          }}
        >
          Post
        </button>
      </div>
      <div className="w-full h-[15px] bg-gray-100"></div>
    </div>
  );
}

export default MakePost;

//1 Excess comments
//2 When a post is made, the onClick of the post button returns a function that
//2 makes another post, passing the props of the new post to it.
//2 Then, this new post is also sent to firebase.
//2 In this way, the new post can instantly render on the page, while also going into the backend.

//2 What if a user tries to write another post right after? That would replace our first new post 🤔
//2 Perhaps once the post has been written to the backend, it can be replaced by the backend post?
//2 Or, instead of having the post show up immediately (optimistic UI), we wait until the post
//2 has been written and fetched before displaying it.
//2 We would only need to fetch the most recent post once its written, which sounds straight-fowards.
//2 This would add some minor wait time, but would reduce complexity.

//5 Don't need this as all posts are currently fetched together from Firestore.
// await fetchPost(); // Callback for fetchPost that gets the recent post
// //1 Fetch the newest post from Firestore using the postId state
// const fetchPost = async () => {
//   try {
//     const docRef = doc(db, "users", userId, "postsProfile", postId);
//     const fetchedDocument = await getDoc(docRef);
//     console.log("Post fetched from Firestore");
//     if (fetchedDocument) {
//       const fetchedDocumentData = fetchedDocument.data();
//     }
//   } catch (err) {
//     console.error("Error fetching post from postsProfile: ", err);
//   }
// };

//5 Don't need this one as we pass the user ID from profile as a prop
//1 // Get the current user's ID and set it to the userId state on "componentWillMount"
// useEffect(() => {
//   onAuthStateChanged(getAuth(), async (user) => {
//     if (user) setUserId(user.uid);
//   });
// }, []);
