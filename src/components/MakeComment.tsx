import React, { useState, useRef } from "react";

import { db } from "./../config/firebase.config";
import { collection, doc, addDoc, updateDoc } from "firebase/firestore";
import { useDateFunctions } from "./custom-hooks/useDateFunctions";

import postIcon from "./../assets/icons/post.png";

interface Props {
  loggedInUserFirstName: string;
  loggedInUserLastName: string;
  loggedInUserProfilePicture: string;
  emptyProfilePicture: string;
  loggedInUserId: string;
  getAllComments: () => Promise<void>;
  openProfileId: string;
  postId: string;
}

function MakeComment({
  loggedInUserFirstName,
  loggedInUserLastName,
  loggedInUserProfilePicture,
  emptyProfilePicture,
  loggedInUserId,
  getAllComments,
  openProfileId,
  postId,
}: Props) {
  const [postCommentInput, setPostCommentInput] = useState("");
  const { fullTimestamp, dateDayMonthYear } = useDateFunctions();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const usersDoc = doc(db, "users", openProfileId); // Grab the user

  const postsProfileCollection = collection(usersDoc, "postsProfile"); // Grab the posts on the user's profile
  const postDoc = doc(postsProfileCollection, postId); // grab this post

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
      const newComment = await addDoc(commentCollection, commentData);
      console.log("Comment added to Firebase");
      // const data = targetDoc.data();
      // const newPost = await addDoc(postsProfileRef, data);
      // const commentsCollection = await addDoc(collection(targetDoc, "comments"));
    } catch (err) {
      console.error(err);
    }
    //2 Update frontend
    console.log(commentData);
    const newComments = { ...commentData, [loggedInUserId]: postCommentInput };
    await updateDoc(postDoc, { comments: newComments });
  };

  //1 Gets the reference to the postsProfile collection for the user
  const getPostsProfileRef = () => {
    if (!openProfileId) return console.log("No userProfileId"); //6 Need to make this error better later
    const targetUser = doc(db, "users", openProfileId);
    return collection(targetUser, "postsProfile");
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
            if (postCommentInput.length === 0)
              return console.log("add text to input before posting");
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
            getAllComments();
            setPostCommentInput("");
          }}
        >
          <img src={postIcon} alt="" className="max-w-[25px]" />
        </button>
      </div>
    </div>
  );
}

export default MakeComment;
