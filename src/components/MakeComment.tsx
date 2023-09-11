import React, { useState, useRef } from "react";

import { collection, doc, addDoc, DocumentReference } from "firebase/firestore";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";

import postIcon from "./../assets/icons/postIcon/post.png";
import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";

interface Props {
  loggedInUserFirstName: string;
  loggedInUserLastName: string;
  loggedInUserProfilePicture: string;
  loggedInUserId: string;
  openProfileId?: string;
  postId: string;
  getAllComments: (value: DocumentReference) => Promise<void>;
  postDocRef: DocumentReference;
  numOfCommentsShowing: number;
  setNumOfCommentsShowing: (value: number) => void;
}

function MakeComment({
  loggedInUserFirstName,
  loggedInUserLastName,
  loggedInUserProfilePicture,
  loggedInUserId,
  openProfileId,
  postId,
  getAllComments,
  postDocRef,
  numOfCommentsShowing,
  setNumOfCommentsShowing,
}: Props) {
  const emptyProfilePicture = useEmptyProfilePicture();
  const [postCommentInput, setPostCommentInput] = useState("");
  const [fullTimestamp, setFullTimestamp] = useState({});
  const { dateDayMonthYear } = useDateFunctions();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      const commentCollection = collection(postDocRef, "comments");
      await addDoc(commentCollection, commentData);
      console.log("Comment added to Firebase");
      setNumOfCommentsShowing(numOfCommentsShowing + 1);
      getAllComments(postDocRef);
    } catch (err) {
      console.error(err);
    }
  };

  // //1 Gets the reference to the postsProfile collection for the user
  // const getPostsProfileRef = () => {
  //   if (!openProfileId) return console.log("No userProfileId"); //6 Need to make this error better later
  //   const targetUser = doc(db, "users", openProfileId);
  //   return collection(targetUser, "postsProfile");
  // };

  //1 Changes the height of the comment input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 1; // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight; // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24); // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows; // Sets new number of rows
  };

  const resetTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 1;
  };

  return (
    <div className="grid grid-cols-[1fr,8fr] gap-4 pt-2 pb-2 pl-4 pr-4 items-center">
      <img
        src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
        alt="logged in user"
        className="rounded-[50%] max-w-[38px] justify-self-center aspect-square object-cover"
      />
      <div className="bg-gray-200 rounded-3xl pl-1 grid grid-cols-[4fr,1fr] gap-4 font-mainFont">
        <textarea
          ref={textareaRef}
          // style={{ height: textareaHeight }}
          placeholder="Write a comment"
          className="w-full bg-transparent m-2 flex-grow resize-none overflow-y-auto outline-none"
          maxLength={1000}
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
            resetTextarea();
          }}
        >
          <img src={postIcon} alt="" className="max-w-[25px]" />
        </button>
      </div>
    </div>
  );
}

export default MakeComment;
