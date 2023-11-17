import React, { useState } from 'react'
import profilePicture from './../assets/images/profile-picture.jpg'

import { FirstNameProp } from '../interfaces'
import { LastNameProp } from '../interfaces'
import { GetPosts } from '../interfaces'

import { db } from '../config/firebase.config'
import { doc, addDoc, collection } from 'firebase/firestore'

interface Props {
  loggedInUserId: string
  setLoggedInUserId: (value: string) => void
  firstName: FirstNameProp['firstName']
  lastName: LastNameProp['lastName']
  getAllPosts: GetPosts['getPosts']
}

function MakePost(props: Props) {
  const [postInput, setPostInput] = useState('')
  const [postId, setPostId] = useState('')
  const { loggedInUserId, setLoggedInUserId } = props
  const { firstName } = props
  const { lastName } = props
  const { getAllPosts } = props

  //1 Gets the reference to the postsProfile collection for the user
  const getPostsProfileRef = () => {
    const targetUser = doc(db, 'users', loggedInUserId)
    return collection(targetUser, 'postsProfile')
  }

  //1 Write the post to Firestore
  const writePost = async (data: {
    timestamp: object
    firstName: string
    lastName: string
    text: string
    date: string
    likes: object
    dislikes: object
    comments: number
  }) => {
    try {
      const postsProfileRef = getPostsProfileRef()
      const newPost = await addDoc(postsProfileRef, data)
      setPostId(newPost.id) // Set the ID of this post to the state newPost
    } catch (err) {
      console.error('Error writing to postsProfile: ', err)
    }
  }

  //1 Set up new date
  const date = new Date()

  //1 Turn month number into text
  const getMonthName = (monthNumber: number) => {
    const date = new Date()
    date.setMonth(monthNumber - 1)
    return date.toLocaleString('en-US', { month: 'long' })
  }

  //1 Turn all dates into readable text
  const fullDate = (monthNumber: number) => {
    const day = date.getDate().toString()
    const month = getMonthName(monthNumber).toString()
    const year = date.getFullYear().toString()
    return day + ' ' + month + ' ' + year
  }

  return (
    <div>
      <div className="min-h-[150px] w-full bg-white shadow-xl">
        <div className="flex min-h-[120px] gap-2 p-4">
          <div className="min-w-[50px] max-w-min">
            <img src={profilePicture} alt="profile" className="aspect-square rounded-[50%] object-cover" />
          </div>
          <textarea
            placeholder="Make a post"
            className="w-full resize-none bg-transparent"
            maxLength={150}
            value={postInput}
            onChange={(e) => setPostInput(e.target.value)}
          />
        </div>
        <button
          className="min-h-[30px] w-full bg-[#00A7E1] text-white"
          onClick={(e) => {
            if (postInput.length === 0) return console.log('add text to input before posting')
            writePost({
              timestamp: date,
              firstName: firstName,
              lastName: lastName,
              text: postInput,
              date: fullDate(date.getMonth() + 1),
              likes: {},
              dislikes: {},
              comments: 0,
            })
            getAllPosts()
            setPostInput('')
          }}
        >
          Post
        </button>
      </div>
      <div className="h-[15px] w-full bg-gray-100"></div>
    </div>
  )
}

export default MakePost

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
