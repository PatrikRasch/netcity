import React, { useState, useEffect, useRef } from "react";
import AllCommentsOnPost from "./AllCommentsOnPost";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";
import commentIcon from "./../assets/icons/comment.png";
import postIcon from "./../assets/icons/post.png";
import postIcon2 from "./../assets/icons/post2.png";
import postIcon3 from "./../assets/icons/post3.png";

import { db } from "./../config/firebase.config";
import {
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";

import { TargetData } from "../interfaces";

interface CommentData {
  posterId: string;
  firstName: string;
  lastName: string;
  text: string;
  date: string;
  likes: object;
  dislikes: object;
  comments: object;
  id: string;
  userId: string;
  postId: string;
}

//6 Have to implement comments into each post

interface Props {
  postFirstName: string;
  postLastName: string;
  postText: string;
  postDate: string;
  postLikes: object;
  postDislikes: object;
  postComments: object;
  openProfileId: string;
  loggedInUserId: string;
  postId: string;
}

const Post = ({
  postFirstName,
  postLastName,
  postText,
  postDate,
  postLikes,
  postDislikes,
  postComments,
  openProfileId,
  loggedInUserId,
  postId,
}: Props) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [postNumOfLikes, setPostNumOfLikes] = useState(0);
  const [postNumOfDislikes, setPostNumOfDislikes] = useState(0);
  const [postNumOfComments, setPostNumOfComments] = useState(0);
  const [postCommentInput, setPostCommentInput] = useState("");
  const [postData, setPostData] = useState<TargetData | null>(null);
  const [postProfilePicture, setPostProfilePicture] = useState(emptyProfilePicture);
  const [loggedInUserProfilePicture, setLoggedInUserProfilePicture] = useState(emptyProfilePicture);
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");
  const [loggedInUserLastName, setLoggedInUserLastName] = useState("");
  const [comments, setComments] = useState<CommentData[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { fullTimestamp, dateDayMonthYear } = useDateFunctions();

  const getLoggedInUserInformation = async (loggedInUserId: string) => {
    if (!loggedInUserId) return <h1>Loading...</h1>;
    const usersDoc = doc(db, "users", loggedInUserId);
    const targetUser = await getDoc(usersDoc);
    const data = targetUser.data();
    setLoggedInUserFirstName(data?.firstName);
    setLoggedInUserLastName(data?.lastName);
    const profilePictureRef = data?.profilePicture;
    setLoggedInUserProfilePicture(profilePictureRef);
  };

  getLoggedInUserInformation(loggedInUserId);

  useEffect(() => {
    setPostNumOfLikes(Object.keys(postLikes).length); // Number of likes on post
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Number of dislikes on post
    setPostNumOfComments(Object.keys(postComments).length); // Number of comments on post
    getPostData(); // Get all the data for this post
  }, []);

  //1 Access this posts document from Firestore
  const usersDoc = doc(db, "users", openProfileId); // Grab the user
  const postsProfileCollection = collection(usersDoc, "postsProfile"); // Grab the posts on the user's profile
  const postDoc = doc(postsProfileCollection, postId); // grab this post

  //1 Get the data from this post from the backend and store it in the "postData" state
  const getPostData = async () => {
    try {
      const targetDoc = await getDoc(postDoc); // Fetch the data
      const data = targetDoc.data();
      setPostData(data as TargetData | null); // Store the post data in state
      if (data?.likes?.hasOwnProperty(loggedInUserId)) setLiked(true); // Has the user already liked the post?
      if (data?.dislikes?.hasOwnProperty(loggedInUserId)) setDisliked(true); // Has the user already disliked the post?
      getPostProfilePicture(data?.userId); // Grab the profile picture of the user who made the post
    } catch (err) {
      console.error(err);
    }
  };

  //1 Gets the profile picture of the user who made the post
  const getPostProfilePicture = async (userId: string) => {
    const usersDoc = doc(db, "users", userId);
    const targetUser = await getDoc(usersDoc);
    const data = targetUser.data();
    const profilePictureRef = data?.profilePicture;
    setPostProfilePicture(profilePictureRef);
  };

  const addLike = async () => {
    setLiked(true); // Set liked to true, makes heart red
    // Frontend updates:
    (postLikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postLikes as true
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    const newLikes = { ...postData?.likes, [loggedInUserId]: true }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const removeLike = async () => {
    setLiked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postLikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.likes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newLikes = { ...postData?.likes }; // Define new object to hold the likes
    await updateDoc(postDoc, { likes: newLikes }); // Update the backend with the new likes
  };

  const addDislike = async () => {
    setDisliked(true); // Set disliked to true, makes heart black
    // Frontend updates:
    (postDislikes as { [key: string]: boolean })[loggedInUserId] = true; // Add the userId into postDislikes as true
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of dislikes to display
    // Backend updates:
    const newDislikes = { ...postData?.dislikes, [loggedInUserId]: true }; // Define new object to hold the dislikes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new dislikes
  };

  const removeDislike = async () => {
    setDisliked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postDislikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.dislikes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newDislikes = { ...postData?.dislikes }; // Define new object to hold the likes
    await updateDoc(postDoc, { dislikes: newDislikes }); // Update the backend with the new likes
  };

  //2 Could potentially add in a revert of the frontend update if the backend update
  //2 was to fail for whatever reason, and then alert the user of the issue. Optimistic UI, that is.

  const handleClickLike = async () => {
    // If post not liked
    if (!liked) {
      if (disliked) {
        removeDislike();
      }
      addLike();
    }
    // If post already liked
    if (liked) {
      removeLike();
    }
  };

  const handleClickDislike = async () => {
    // If post not disliked
    if (!disliked) {
      if (liked) {
        removeLike();
      }
      addDislike();
    }
    // If post already liked
    if (disliked) {
      removeDislike();
    }
  };

  //1 The like icon on each post. Shows if the user has liked a post.
  const showLikedOrNot = () => {
    if (!liked) {
      return <img src={likeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartLiked} alt="" className="max-h-6" />;
    }
  };
  //1 The dislike icon on each post. Shows if the user has disliked a post.
  const showDislikedOrNot = () => {
    if (!disliked) {
      return <img src={dislikeIcon} alt="" className="max-h-6" />;
    } else {
      return <img src={heartDisliked} alt="" className="max-h-6" />;
    }
  };

  //1 Changes the height of the comment input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 1; // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight; // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24); // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows; // Sets new number of rows
  };

  // const usersDoc = doc(db, "users", openProfileId); // Grab the user
  // const postsProfileCollection = collection(usersDoc, "postsProfile"); // Grab the posts on the user's profile
  // const postDoc = doc(postsProfileCollection, postId); // grab this post

  const postComment = async (commentData: {
    timestamp: object;
    firstName: string;
    lastName: string;
    text: string;
    date: string;
    likes: object;
    dislikes: object;
    userId: string;
    postId: string;
  }) => {
    //2 Start by adding document to the backend
    try {
      const newCollection = collection(postDoc, "comments");
      const newComment = await addDoc(newCollection, commentData);
      console.log(newComment);
      console.log("Comment added to Firebase");
      // const data = targetDoc.data();
      // const newPost = await addDoc(postsProfileRef, data);
      // const commentsCollection = await addDoc(collection(targetDoc, "comments"));
    } catch (err) {
      console.error(err);
    }
    //2 Update frontend
    const newComments = { ...postData?.comments, [loggedInUserId]: postCommentInput };
    await updateDoc(postDoc, { comments: newComments });
  };

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllComments = async () => {
    try {
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, openProfileId); // Grabs the doc where the user is
      const postsProfileCollection = collection(userDocRef, "postsProfile"); // Grabs the postsProfile collection
      const postDocRef = doc(postsProfileCollection, postId);
      const commentsCollection = collection(postDocRef, "comments");
      const sortedComments = query(commentsCollection, orderBy("timestamp", "desc")); // Sorts comments in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const commentsPostDocs = await getDocs(sortedComments); // Gets all docs from postsProfile collection
      const commentsPostDataArray: CommentData[] = []; // Empty array that'll be used for updating state
      // Push each doc (post) into the postsProfileDataArray array.
      commentsPostDocs.forEach((doc) => {
        const postData = doc.data() as CommentData; // "as PostData" is type validation
        commentsPostDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
      });
      setComments(commentsPostDataArray); // Update state with all the posts
    } catch (err) {
      console.error("Error trying to get all comments:", err);
    }
  };

  //1 Fetches and sets in state all posts from Firebase.
  useEffect(() => {
    getAllComments();
    console.log("use effect");
  }, []);

  return (
    <div className="w-full min-h-[150px] bg-white shadow-xl">
      <div className="min-h-[120px] p-4 gap-2">
        <div className="flex gap-4 items-center">
          <div className="min-w-[40px] max-w-min">
            <img
              src={postProfilePicture === "" ? emptyProfilePicture : postProfilePicture}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <div>{postFirstName + " " + postLastName}</div>
          <div className="opacity-50 text-sm">{postDate}</div>
        </div>
        <div>{postText}</div>
      </div>
      <div className="w-full h-[1px] bg-gray-300"></div>
      <div className="grid grid-cols-[1fr,1fr,2fr] h-[33px] mt-1 mb-1 items-center justify-items-center">
        {/*//1 Like/Dislike */}
        {/*//1 Like */}
        <div className="flex gap-2">
          <button onClick={() => handleClickLike()}>{showLikedOrNot()}</button>
          <div>{postNumOfLikes}</div>
        </div>
        {/*//1 Dislike */}
        <div className="flex gap-2">
          <button onClick={() => handleClickDislike()}>{showDislikedOrNot()}</button>
          <div>{postNumOfDislikes}</div>
        </div>
        {/* //1 Comment */}
        <div className="flex gap-2">
          <img src={commentIcon} alt="" className="max-h-6" />
          <div>{postNumOfComments}</div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-gray-300"></div>
      {/* //1 Add comment  */}
      <div className="grid grid-cols-[1fr,8fr] gap-4 pt-2 pb-2 pl-4 pr-4 items-center">
        <img
          src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
          alt="logged in user"
          className="rounded-[50%] max-w-[38px] justify-self-center aspect-square object-cover"
        />
        <div className="bg-gray-200 rounded-xl grid grid-cols-[4fr,1fr] gap-4">
          <textarea
            ref={textareaRef}
            // style={{ height: textareaHeight }}
            placeholder="What do you think?"
            className="w-full bg-transparent m-2 flex-grow resize-none overflow-y-auto outline-none"
            maxLength={150}
            value={postCommentInput}
            onChange={(e) => {
              setPostCommentInput(e.target.value);
              handleTextareaChange();
            }}
            rows={1}
          ></textarea>
          <button
            className="justify-self-center"
            onClick={(e) => {
              postComment({
                timestamp: fullTimestamp,
                firstName: loggedInUserFirstName,
                lastName: loggedInUserLastName,
                text: postCommentInput,
                date: dateDayMonthYear,
                likes: {},
                dislikes: {},
                userId: loggedInUserId,
                postId: postId,
              });
            }}
          >
            <img src={postIcon} alt="" className="max-w-[25px]" />
          </button>
        </div>
      </div>
      {/* //1 Posted comments */}
      <AllCommentsOnPost
        openProfileId={openProfileId}
        comments={comments}
        loggedInUserId={loggedInUserId}
        postId={postId}
      />
    </div>
  );
};

export default Post;

//3 If user clicks on like/dislike, add the userId into the object as true
//3   Update the backend with the like

//3 For tomorrow: What is the difference on postLikes and postData?
//3   1. postLikes is the prop for the "likes" key-value pair  for the post, coming from AllPosts
//3   2. postData is state declared in this component, which gets populated by the getPostData() function

//3 Next goal is to ensure that when a like is removed, it is reflected on the screen.
//3 Work with the useEffect below and handleClick. Gotta do something with state
//3 That updates every time the like button is clicked.

//3 Only allow a userId to have either liked or disliked a post.
//3 - If a user dislikes a post after having liked it, remove the like
//3 - If a user likes post after having disliked it, remove the dislike

//3 Must take in props with postUser, postDate, postText, postNumOfLikes, postNumOfDislikes, postNumOfComments
//3    When a new post is made, the numbers should be 0 (or "no comments").
//3    The date should be set to today's date

//3 Posts needs to be populated with data that comes from Firebase.
//3   When a user makes a post, all of its data should populate a Post component

//3 Need to get profile picture based on userId that made the post.
//3 Can go into the "users" collection, pick the ID that matches the userId value of the post,
//3 then take the profilePicture string from the user and display it here.

//3 Every post needs a subcollection that holds all the comments.
//3 Every post needs a way to track which users has liked the post,
//3 so that a user can only like a post once.
//3 Comments will demand this, but with even more complexity.
