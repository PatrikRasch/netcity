import React, { useState } from "react";
import profilePicture from "./../assets/images/profile-picture.jpg";

import { userIdProp } from "../interfaces";
import { FirstNameProp } from "../interfaces";
import { LastNameProp } from "../interfaces";
import { GetAllDocs } from "../interfaces";

import { db } from "./../config/firebase.config";
import { doc, addDoc, collection } from "firebase/firestore";

interface Props {
  userId: userIdProp["userId"];
  setUserId: userIdProp["setUserId"];
  firstName: FirstNameProp["firstName"];
  lastName: LastNameProp["lastName"];
  getAllDocs: GetAllDocs["getAllDocs"];
}

function MakePost(props: Props) {
  const [postInput, setPostInput] = useState("");
  const [postId, setPostId] = useState("");
  const { userId, setUserId } = props;
  const { firstName } = props;
  const { lastName } = props;
  const { getAllDocs } = props;

  //1 Gets the reference to the postsProfile collection for the user
  const getPostsProfileRef = () => {
    const targetUser = doc(db, "users", userId);
    return collection(targetUser, "postsProfile");
  };

  //1 Current problems:
  //2 Posts don't load in order, need to add a post timestamp to sort posts.
  //2 All posts load together no matter how many when a profile is visited. Need to add some form of lazyloading.

  //1 Write the post to Firestore
  const writePost = async (data: {
    timestamp: object;
    firstName: string;
    lastName: string;
    text: string;
    date: string;
    likes: number;
    dislikes: number;
    comments: number;
  }) => {
    try {
      const postsProfileRef = getPostsProfileRef();
      const newPost = await addDoc(postsProfileRef, data);
      console.log("Post written to Firestore");
      setPostId(newPost.id); // Set the ID of this post to the state newPost
    } catch (err) {
      console.error("Error writing to postsProfile: ", err);
    }
  };

  //1 Set up new date
  const date = new Date();

  //1 Turn month number into text
  const getMonthName = (monthNumber: number) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString("en-US", { month: "long" });
  };

  //1 Turn all dates into readable text
  const fullDate = (monthNumber: number) => {
    const day = date.getDate().toString();
    const month = getMonthName(monthNumber).toString();
    const year = date.getFullYear().toString();
    return day + " " + month + " " + year;
  };

  return (
    <div>
      <div className="w-full min-h-[150px] bg-white shadow-xl">
        <div className="min-h-[120px] flex p-4 gap-2">
          <div className="min-w-[50px] max-w-min">
            <img
              src={profilePicture}
              alt="profile"
              className="rounded-[50%] aspect-square object-cover"
            />
          </div>
          <textarea
            placeholder="Make a post"
            className="w-full bg-transparent resize-none"
            maxLength={150}
            onChange={(e) => setPostInput(e.target.value)}
          />
        </div>
        {/* <div className="w-full h-[2px] bg-gray-300"></div> */}
        <button
          className="min-h-[30px] w-full bg-[#00A7E1] text-white"
          onClick={() => {
            if (postInput.length === 0) return console.log("add text to input before posting");
            writePost({
              timestamp: date,
              firstName: firstName,
              lastName: lastName,
              text: postInput,
              date: fullDate(date.getMonth() + 1),
              likes: 0,
              dislikes: 0,
              comments: 0,
            });
            getAllDocs();
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
