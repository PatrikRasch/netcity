import React, { useState, useEffect } from "react";
import AllCommentsOnPost from "./AllCommentsOnPost";
import MakeComment from "./MakeComment";

import likeIcon from "./../assets/icons/heartPlus.png";
import heartLiked from "./../assets/icons/heartLiked.png";
import dislikeIcon from "./../assets/icons/heartMinus.png";
import heartDisliked from "./../assets/icons/heartDisliked.png";
import commentIcon from "./../assets/icons/comment.png";
import deleteIcon from "./../assets/icons/delete.png";
import deleteRedIcon from "./../assets/icons/delete-red.png";

import { db } from "./../config/firebase.config";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
} from "firebase/firestore";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
import { useLikingFunctions } from "./custom-hooks/usePostLikingFunctions";
import { useDislikingFunctions } from "./custom-hooks/usePostDislikingFunctions";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { TargetData, CommentData } from "../interfaces";

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
  loggedInUserProfilePicture: string;
  setLoggedInUserProfilePicture: (value: string) => void;
  postId: string;
  postIndex: number;
  postUserId: string;
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
  loggedInUserProfilePicture,
  setLoggedInUserProfilePicture,
  postId,
  postIndex,
  postUserId,
}: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture();
  const [postNumOfLikes, setPostNumOfLikes] = useState(0);
  const [postNumOfDislikes, setPostNumOfDislikes] = useState(0);
  const [postTotalNumOfComments, setPostTotalNumOfComments] = useState(0);

  const [postData, setPostData] = useState<TargetData | null>(null);
  const [postProfilePicture, setPostProfilePicture] = useState(emptyProfilePicture);
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState("");
  const [loggedInUserLastName, setLoggedInUserLastName] = useState("");
  const [showMakeComment, setShowMakeComment] = useState(false);
  const [numOfCommentsShowing, setNumOfCommentsShowing] = useState(0);
  const [showLoadMoreCommentsButton, setShowLoadMoreCommentsButton] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);
  const { fullTimestamp, dateDayMonthYear } = useDateFunctions();

  //1 Access this posts document from Firestore. postDocRef used throughout component.
  const usersDocRef = doc(db, "users", openProfileId); // Grab the user
  const postsProfileCollection = collection(usersDocRef, "postsProfile"); // Grab the posts on the user's profile
  const postDocRef = doc(postsProfileCollection, postId); // grab this post

  const getNumOfComments = async () => {
    const commentsCollection = collection(postDocRef, "comments");
    const commentsDocs = await getDocs(commentsCollection);
    setPostTotalNumOfComments(commentsDocs.size);
  };

  getNumOfComments();

  const { addLike, removeLike, liked, setLiked } = useLikingFunctions(
    loggedInUserId,
    postDocRef,
    postData,
    setPostNumOfLikes
  );
  const { addDislike, removeDislike, disliked, setDisliked } = useDislikingFunctions(
    loggedInUserId,
    postDocRef,
    postData,
    setPostNumOfDislikes
  );

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
    if (postIndex === 0) setShowMakeComment(true);
    setPostNumOfLikes(Object.keys(postLikes).length); // Number of likes on post
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Number of dislikes on post
    getPostData(); // Get all the data for this post
  }, []);

  //1 Get the data from this post from the backend and store it in the "postData" state
  const getPostData = async () => {
    try {
      const targetDoc = await getDoc(postDocRef); // Fetch the data
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

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllComments = async () => {
    try {
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
    // console.log("use effect");
  }, []);

  //1 Determines if the comment input field is to be displayed on the post
  const displayMakeComment = () => {
    if (showMakeComment === true)
      return (
        <MakeComment
          loggedInUserFirstName={postFirstName}
          loggedInUserLastName={postLastName}
          loggedInUserProfilePicture={loggedInUserProfilePicture}
          loggedInUserId={loggedInUserId}
          openProfileId={openProfileId}
          postId={postId}
          getAllComments={getAllComments}
          numOfCommentsShowing={numOfCommentsShowing}
          setNumOfCommentsShowing={setNumOfCommentsShowing}
        />
      );
  };

  const handleCommentButtonClicked = () => {
    if (showMakeComment && numOfCommentsShowing === 0) {
      setNumOfCommentsShowing(numOfCommentsShowing + 3);
      setShowLoadMoreCommentsButton(true);
      return;
    }
    if (!showMakeComment) {
      setShowMakeComment(true);
      setNumOfCommentsShowing(numOfCommentsShowing + 3);
      setShowLoadMoreCommentsButton(true);
    } else {
      setShowMakeComment(false);
      setNumOfCommentsShowing(0);
    }
  };

  const showDeletePostOrNot = () => {
    if (loggedInUserId === postUserId) {
      return (
        <div>
          <img
            src={deleteIcon}
            alt=""
            className="max-h-[18px] cursor-pointer"
            onClick={() => deletePostClicked()}
          />
        </div>
      );
    } else return <div></div>;
  };

  const deletePostClicked = async () => {
    try {
      await deleteDoc(postDocRef);
      console.log("Doc deleted");
    } catch (err) {
      console.error(err);
    }
  };

  //2 Get id of post
  //2 Get reference to post in Firestore
  //2 Remove post from Firestore
  //2 Update the posts on the page by fetching and setting in state

  return (
    <div className="w-full min-h-[150px] bg-white shadow-xl">
      <div className="min-h-[120px] p-4 gap-2">
        <div className="grid grid-cols-[20fr,1fr] items-center">
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
          {showDeletePostOrNot()}
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
          <img
            src={commentIcon}
            alt=""
            className="max-h-6"
            onClick={(e) => handleCommentButtonClicked()}
          />
          <div>{postTotalNumOfComments}</div>
        </div>
      </div>
      <div className="w-full h-[1px] bg-gray-300"></div>
      {/* //1 Add comment  */}
      {displayMakeComment()}
      {/* //1 Posted comments */}
      <AllCommentsOnPost
        openProfileId={openProfileId}
        comments={comments}
        loggedInUserId={loggedInUserId}
        postId={postId}
        postTotalNumOfComments={postTotalNumOfComments}
        numOfCommentsShowing={numOfCommentsShowing}
        setNumOfCommentsShowing={setNumOfCommentsShowing}
        showMakeComment={showMakeComment}
        showLoadMoreCommentsButton={showLoadMoreCommentsButton}
        setShowLoadMoreCommentsButton={setShowLoadMoreCommentsButton}
        setShowMakeComment={setShowMakeComment}
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
