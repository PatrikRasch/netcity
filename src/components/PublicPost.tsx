import React, { useState, useEffect } from "react";
import AllCommentsOnPost from "./AllCommentsOnPost";
import MakeCommentPublic from "./MakeCommentPublic";
import Likes from "./Likes";
import Dislikes from "./Dislikes";

import emptyProfilePicture from "./../assets/icons/emptyProfilePicture.jpg";
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
  onSnapshot,
} from "firebase/firestore";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";
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
  postId: string;
  postIndex: number;
  postUserId: string;
}

const PublicPost = ({
  postFirstName,
  postLastName,
  postText,
  postDate,
  postLikes,
  postDislikes,
  postComments,
  postId,
  postIndex,
  postUserId,
}: Props) => {
  //   const emptyProfilePicture = useEmptyProfilePicture();
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const [liked, setLiked] = useState(false);
  const [postNumOfLikes, setPostNumOfLikes] = useState(0);
  const [disliked, setDisliked] = useState(false);
  const [postNumOfDislikes, setPostNumOfDislikes] = useState(0);
  const [postTotalNumOfComments, setPostTotalNumOfComments] = useState(0);

  const [postData, setPostData] = useState<TargetData | null>(null);
  const [postProfilePicture, setPostProfilePicture] = useState(emptyProfilePicture);
  const [showMakeComment, setShowMakeComment] = useState(false);
  const [numOfCommentsShowing, setNumOfCommentsShowing] = useState(0);
  const [showLoadMoreCommentsButton, setShowLoadMoreCommentsButton] = useState(true);
  const [comments, setComments] = useState<CommentData[]>([]);

  //1 Access this posts document from Firestore. postDocRef used throughout component.
  const publicPostsCollection = collection(db, "publicPosts");
  const postDocRef = doc(publicPostsCollection, postId); // Grab the posts on the user's profile

  const getNumOfComments = async () => {
    const commentsCollection = collection(postDocRef, "comments");
    const commentsDocs = await getDocs(commentsCollection);
    setPostTotalNumOfComments(commentsDocs.size);
  };

  getNumOfComments();

  useEffect(() => {
    // console.log("use effect");
    if (postIndex === 0) setShowMakeComment(true);
    // console.log("Post likes:", postLikes);
    // console.log("Post dislikes:", postDislikes);
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

  const removeLike = async () => {
    setLiked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postLikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfLikes(Object.keys(postLikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.likes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newLikes = { ...postData?.likes }; // Define new object to hold the likes
    await updateDoc(postDocRef, { likes: newLikes }); // Update the backend with the new likes
  };

  const removeDislike = async () => {
    setDisliked(false); // Set liked to false, makes heart empty
    // Frontend updates
    delete (postDislikes as { [key: string]: boolean })[loggedInUserId]; // Remove the userId from postLikes
    setPostNumOfDislikes(-Object.keys(postDislikes).length); // Update state for number of likes to display
    // Backend updates:
    delete (postData?.dislikes as { [key: string]: boolean })[loggedInUserId]; // Delete the userId from the postData object
    const newDislikes = { ...postData?.dislikes }; // Define new object to hold the likes
    await updateDoc(postDocRef, { dislikes: newDislikes }); // Update the backend with the new likes
  };

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllComments = async () => {
    try {
      const commentsCollection = collection(postDocRef, "comments");
      const sortedComments = query(commentsCollection, orderBy("timestamp", "desc")); // Sorts comments in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const unsubscribe = onSnapshot(sortedComments, (snapshot) => {
        const commentsPostDataArray: CommentData[] = []; // Empty array that'll be used for updating state
        // Push each doc (comment) into the commentsPostDataArray array.
        snapshot.forEach((doc) => {
          const commentData = doc.data() as CommentData; // "as CommentData" is type validation
          commentsPostDataArray.push({ ...commentData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
        });
        setComments(commentsPostDataArray); // Update state with all the comments
      });
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
        <MakeCommentPublic
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
            <div className="flex flex-col">
              <div>{postFirstName + " " + postLastName}</div>
              <div className="opacity-50 text-sm">{postDate}</div>
            </div>
          </div>
          {showDeletePostOrNot()}
        </div>
        <div className="pt-2">{postText}</div>
      </div>
      <div className="w-full h-[1px] bg-gray-300"></div>
      <div className="grid grid-cols-[1fr,1fr,2fr] h-[33px] mt-1 mb-1 items-center justify-items-center">
        {/*//1 Like/Dislike */}
        {
          <Likes
            totalLikes={postLikes}
            liked={liked}
            disliked={disliked}
            setLiked={setLiked}
            numOfLikes={postNumOfLikes}
            setNumOfLikes={setPostNumOfLikes}
            removeLike={removeLike}
            removeDislike={removeDislike}
            loggedInUserId={loggedInUserId}
            docRef={postDocRef}
            data={postData}
          />
        }
        <Dislikes
          totalDislikes={postDislikes}
          liked={liked}
          disliked={disliked}
          setDisliked={setDisliked}
          loggedInUserId={loggedInUserId}
          numOfDislikes={postNumOfDislikes}
          setNumOfDislikes={setPostNumOfDislikes}
          removeLike={removeLike}
          removeDislike={removeDislike}
          docRef={postDocRef}
          data={postData}
        />

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
        comments={comments}
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

export default PublicPost;
