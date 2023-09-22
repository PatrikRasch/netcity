import React, { useState, useRef } from "react";

import { db } from "./../config/firebase.config";
import { collection, doc, addDoc } from "firebase/firestore";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";

import postIcon from "./../assets/icons/post.png";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";

interface Props {
  postId: string;
  getAllComments: () => Promise<void>;
  numOfCommentsShowing: number;
  setNumOfCommentsShowing: (value: number) => void;
}

function MakeCommentPublic({ postId, numOfCommentsShowing, setNumOfCommentsShowing, getAllComments }: Props) {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  const emptyProfilePicture = useEmptyProfilePicture();
  const [postCommentInput, setPostCommentInput] = useState("");
  const [fullTimestamp, setFullTimestamp] = useState({});
  const { dateDayMonthYear } = useDateFunctions();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const usersDoc = doc(db, "users", loggedInUserId); // Grab the user
  const publicPostsCollection = collection(db, "publicPosts"); // Grab the posts on the user's profile
  const postDoc = doc(publicPostsCollection, postId); // grab this post

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
      const commentCollection = collection(postDoc, "comments");
      await addDoc(commentCollection, commentData);
      setNumOfCommentsShowing(numOfCommentsShowing + 1);
      getAllComments();
    } catch (err) {
      console.error(err);
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

  return (
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
          placeholder="Write a comment"
          className="w-full bg-transparent m-2 flex-grow resize-none overflow-y-auto outline-none"
          maxLength={150}
          value={postCommentInput}
          onChange={(e) => {
            setPostCommentInput(e.target.value);
            handleTextareaChange();
            setFullTimestamp(new Date());
          }}
          rows={1}
        ></textarea>
        <button
          className="justify-self-center self-center rounded-[50%]"
          onClick={(e) => {
            if (postCommentInput.length === 0) return console.log("add text to input before posting");
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
            setPostCommentInput("");
          }}
        >
          <img src={postIcon} alt="" className="max-w-[25px]" />
        </button>
      </div>
    </div>
  );
}

export default MakeCommentPublic;
