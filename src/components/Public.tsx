import React, { useEffect, useState, useRef } from 'react'
import AllPosts from './AllPosts'

import { db, storage } from '../config/firebase.config'
import {
  collection,
  doc,
  getDoc,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore'

import { v4 as uuidv4 } from 'uuid'

import imageIcon from './../assets/icons/imageIcon/imageIcon.png'
import globalIconGray from './../assets/icons/globalIcon/globalIconGray.svg'
import globalIconWhite from './../assets/icons/globalIcon/globalIconWhite.svg'
import starIconGray from './../assets/icons/starIcon/starIconGray.svg'
import starIconWhite from './../assets/icons/starIcon/starIconWhite.svg'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserFirstName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserLastName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
import { useDateFunctions } from './custom-hooks/useDateFunctions'
import useInfinityScrollFunctions from './custom-hooks/useInfinityScrollFunctions'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'

interface PublicPostData {
  userId: string
  firstName: string
  lastName: string
  text: string
  image: string
  imageId: string
  date: string
  likes: object
  dislikes: object
  comments: object
  timestamp: object
  id: string
  publicPost: boolean
}

function Public() {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName()
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName()
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  const { dateDayMonthYear } = useDateFunctions()
  const [postInput, setPostInput] = useState('')
  const [postId, setPostId] = useState('')
  const [globalPosts, setGlobalPosts] = useState<PublicPostData[]>([])
  const [friendsPosts, setFriendsPosts] = useState<PublicPostData[]>([])
  const [fullTimestamp, setFullTimestamp] = useState({})
  const [fetchingMorePosts, setFetchingMorePosts] = useState(false)
  const [postsLoaded, setPostsLoaded] = useState(10)
  const [showGlobalPosts, setShowGlobalPosts] = useState(true)
  const [showFriendsPosts, setShowFriendsPosts] = useState(false)
  const [publicPost, setPublicPost] = useState(true)
  const [imageAddedToPostFeed, setImageAddedToPostFeed] = useState<string>('')
  const [imageAddedToPostFeedId, setImageAddedToPostFeedId] = useState<string>('')
  const [textareaActive, setTextareaActive] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  //1 Gets the reference to the publicPosts collection
  const publicPostsCollection = collection(db, 'publicPosts')

  const writePost = async (data: {
    userId: string
    firstName: string
    lastName: string
    text: string
    image: string
    imageId: string
    date: string
    likes: object
    dislikes: object
    comments: object
    timestamp: object
    publicPost: boolean
  }) => {
    try {
      if (publicPostsCollection === undefined)
        return console.log('publicPostsCollection is undefined') //6 Must be improved later
      const newPublicPost = await addDoc(publicPostsCollection, data)
      setPostId(newPublicPost.id) // Set the ID of this post to the state newPost
    } catch (err) {
      console.error('Error writing to publicPosts: ', err)
    }
  }

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getGlobalPosts = async () => {
    try {
      const sortedGlobalPosts = query(
        publicPostsCollection,
        orderBy('timestamp', 'desc'),
        limit(postsLoaded)
      ) // Sorts posts in descending order
      const unsubscribe = onSnapshot(sortedGlobalPosts, (snapshot) => {
        const globalPostsDataArray: PublicPostData[] = [] // Empty array that'll be used for updating state
        // Push each doc (post) into the globalPostsDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData // "as PostData" is type validation
          if (postData.publicPost) globalPostsDataArray.push({ ...postData, id: doc.id }) // (id: doc.id adds the id of the individual doc)
        })
        setGlobalPosts(globalPostsDataArray) // Update state with all the posts
      }) // Gets all docs from postsProfile collection
    } catch (err) {
      console.error('Error trying to get all docs:', err)
    }
  }

  // // - Allows for editing a global property in Firestore if necessary
  // const editGlobalFirestoreProperty = async () => {
  //   try {
  //     const allDocs = await getDocs(publicPostsCollection)
  //     allDocs.forEach(async (doc) => {
  //       const postData = doc.data() as PublicPostData
  //       if (postData.publicPost === undefined) {
  //         await updateDoc(doc.ref, { publicPost: true })
  //       }
  //     })
  //   } catch (err) {
  //     console.error(err)
  //   }
  // }

  const getFriendsPosts = async () => {
    try {
      const loggedInUserDocRef = doc(db, 'users', loggedInUserId)
      const loggedInUserDoc = await getDoc(loggedInUserDocRef)
      const loggedInUserData = loggedInUserDoc.data()

      const sortedFriendsPosts = query(
        publicPostsCollection,
        orderBy('timestamp', 'desc'),
        limit(postsLoaded)
      ) // Sorts posts in descending order

      const unsubscribe = onSnapshot(sortedFriendsPosts, (snapshot) => {
        const friendsPostsDataArray: PublicPostData[] = [] // Empty array that'll be used for updating state
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData

          // Add the post into the array if the user is friends with the poster and the post is not a public post
          if (
            (loggedInUserData?.friends.hasOwnProperty(postData.userId) ||
              postData.userId === loggedInUserId) &&
            !postData.publicPost
          )
            friendsPostsDataArray.push({ ...postData, id: doc.id })
        })
        setFriendsPosts(friendsPostsDataArray) // Update state with all the posts
      })
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    getFriendsPosts()
  }, [])

  const changePostDestination = () => {
    setPublicPost((prevMakePublicPost) => !prevMakePublicPost)
  }

  //6 changePostDestination is redundant atm due to postDestination not using publicPost state, but rather using showGlobalPosts

  const postDestination = () => {
    if (showGlobalPosts) return 'Public post'
    else return 'Friends only'
  }

  useInfinityScrollFunctions({
    fetchingMorePosts,
    setFetchingMorePosts,
    postsLoaded,
    setPostsLoaded,
    getGlobalPosts,
  })

  const displayUploadedImageOrNot = () => {
    if (imageAddedToPostFeed)
      return (
        <div className="">
          <div className="relative">
            <img src={imageAddedToPostFeed} alt="" className="rounded-xl p-[3px] shadow-xl" />
            <div
              className="absolute right-[15px] top-[15px] flex h-[22px] w-[22px] items-center justify-center rounded-[50%] bg-white opacity-90 drop-shadow-xl hover:cursor-pointer"
              onClick={() => {
                deleteImageAddedToPost()
              }}
            >
              X
            </div>
          </div>
        </div>
      )
    if (!imageAddedToPostFeed) return null
  }

  const addImageToPost = async (imageToAddToPost: File | null) => {
    if (imageToAddToPost === null) return // Return if no imagine is uploaded
    const imageId = imageToAddToPost.name + ' ' + uuidv4()
    const storageRef = ref(storage, `postImages/${imageId}`) // Connect to storage
    try {
      const addedImage = await uploadBytes(storageRef, imageToAddToPost) // Upload the image
      const downloadURL = await getDownloadURL(addedImage.ref) // Get the downloadURL for the image
      // Update Firestore Database with image:
      // const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      // const loggedInUserDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      // // const postRef = doc(loggedInUserDocRef, "postsProfile", postId);
      // await updateDoc(postRef, { image: downloadURL }); // Add the image into Firestore
      setImageAddedToPostFeedId(imageId)
      setImageAddedToPostFeed(downloadURL)
      // alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err)
      //6 Need a "Something went wrong, please try again"
    }
  }

  const deleteImageAddedToPost = async () => {
    try {
      if (imageAddedToPostFeed) {
        const postImageRef = ref(storage, `postImages/${imageAddedToPostFeedId}`)
        await deleteObject(postImageRef)
        setImageAddedToPostFeed('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // - Changes the height of the input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 5 // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24) // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows - 1 // Sets new number of rows
  }

  const resetTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 1
  }

  return (
    <div className="lg:w-100svw bg-graySoft lg:grid lg:justify-center">
      {/* Choose posts to see */}
      <div className="lg:w-[clamp(500px,60svw,1500px)]">
        <div className="hidden bg-white p-2 pl-4 font-bold lg:block lg:text-[clamp(16px,1.5svw,20px)]">
          Home Feed
        </div>
        <div className="hidden h-[1.5px] w-full bg-grayLineThin lg:block"></div>
        <section className="grid max-w-[100svw] grid-cols-2 gap-2 whitespace-nowrap bg-white p-4 text-sm lg:flex lg:justify-center lg:gap-40">
          <button
            className={`flex h-[45px] items-center justify-center gap-2 rounded-3xl pb-[8px] pt-[8px] text-white lg:pl-8 lg:pr-8
          ${showGlobalPosts ? 'bg-black' : 'bg-graySoft'} `}
            onClick={() => {
              setShowGlobalPosts(true)
              setShowFriendsPosts(false)
              setPostsLoaded(10)
              setPublicPost(true)
            }}
          >
            <img
              src={showGlobalPosts ? globalIconWhite : globalIconGray}
              alt=""
              className="h-[28px]"
            />
            <div
              className={`font-mainFont mr-2 font-semibold ${
                showGlobalPosts ? 'text-white' : 'text-textMain'
              } `}
            >
              Public Posts
            </div>
          </button>
          <button
            className={`flex max-h-[45px] items-center justify-center gap-2 rounded-3xl pb-[8px] pt-[8px] lg:pl-8 lg:pr-8 ${
              showFriendsPosts ? 'bg-black text-white' : 'bg-graySoft text-textMain'
            } `}
            onClick={() => {
              setShowFriendsPosts(true)
              setShowGlobalPosts(false)
              setPostsLoaded(10)
              setPublicPost(false)
            }}
          >
            <img
              src={showFriendsPosts ? starIconWhite : starIconGray}
              alt=""
              className="h-[28px]"
            />
            <div className="font-mainFont font-semibold">Friends' Posts</div>
          </button>
        </section>
        <div className="h-[7px] w-full bg-grayLineThick lg:bg-graySoft"></div>

        {/* Make a post row */}
        {/* <MakePost /> */}
        <div className="font-mainFont bg-white pb-1 pl-4 pt-3 text-medium font-semibold lg:text-[clamp(16px,1.5svw,20px)]">
          Create a Post
        </div>
        <div className="h-[1.5px] w-full bg-grayLineThin"></div>

        <section className="grid grid-cols-[80px,1fr,80px] items-start justify-items-center gap-2 bg-white pb-2 pt-4 lg:pl-4 lg:pr-4">
          <img
            src={loggedInUserProfilePicture}
            alt=""
            className="ml-2 aspect-square h-[45px] rounded-[50px] object-cover"
          />
          <textarea
            ref={textareaRef}
            placeholder="Make a post"
            className={`transition-height w-full resize-none overflow-y-auto rounded-3xl bg-graySoft p-3 outline-none duration-500 ${
              textareaActive ? 'min-h-[144px]' : 'min-h-[48px]'
            }`}
            maxLength={1000}
            value={postInput}
            onChange={(e) => {
              setPostInput(e.target.value)
              handleTextareaChange()
              setFullTimestamp(new Date())
            }}
            onFocus={() => {
              setTextareaActive(true)
            }}
            onBlur={() => {
              if (postInput.length === 0) {
                setTextareaActive(false)
                resetTextarea()
              }
            }}
            rows={1}
          />
          <input
            type="file"
            id="addImageToPostFeedButton"
            hidden
            onChange={(e) => {
              addImageToPost(e.target.files?.[0] || null)
              e.target.value = ''
            }}
          />
          <label
            htmlFor="addImageToPostFeedButton"
            className="mr-2 flex flex-col hover:cursor-pointer"
          >
            <img src={imageIcon} alt="add and upload file to post" className="max-w-[35px]" />
            <div className="text-center text-verySmall">Photo</div>
          </label>
          <div className={`${imageAddedToPostFeed ? '' : 'absolute'}`}></div>
          <div className={`${imageAddedToPostFeed ? '' : 'absolute'}`}>
            {displayUploadedImageOrNot()}
          </div>
          <div className={`${imageAddedToPostFeed ? '' : 'absolute'}`}></div>
        </section>

        {/* Post section */}
        <section className="grid grid-cols-[80px,1fr,80px] items-center justify-items-center gap-2 bg-white pb-3">
          <div></div>
          <div className="flex w-full items-center justify-around gap-6 lg:justify-between lg:pl-4 lg:pr-4">
            <button
              className="font-mainFont h-[30px] w-[70%] rounded-3xl bg-purpleMain text-medium font-bold text-white lg:h-[40px] lg:w-[clamp(30%,10vw,280px)] lg:text-[clamp(16px,1.5svw,20px)]"
              onClick={(e) => {
                if (postInput.length === 0 && imageAddedToPostFeed === '')
                  return console.log('add text or image before posting')
                setFullTimestamp(new Date())
                writePost({
                  timestamp: fullTimestamp,
                  firstName: loggedInUserFirstName,
                  lastName: loggedInUserLastName,
                  text: postInput,
                  image: imageAddedToPostFeed,
                  imageId: imageAddedToPostFeedId,
                  date: dateDayMonthYear,
                  likes: {},
                  dislikes: {},
                  comments: {},
                  userId: loggedInUserId,
                  publicPost: publicPost,
                })
                getGlobalPosts()
                setPostInput('')
                setImageAddedToPostFeed('')
                resetTextarea()
                setTextareaActive(false)
              }}
            >
              Post
            </button>
            <button className="grid h-[30px] w-[70%] grid-cols-[20px,65px] items-center justify-center rounded-3xl bg-graySoft pl-2 pr-2 text-verySmall text-textMain lg:flex lg:h-[40px] lg:w-[clamp(30%,10vw,280px)] lg:gap-2 lg:text-[clamp(16px,1.5svw,20px)]">
              <img
                src={showGlobalPosts ? globalIconGray : starIconGray}
                alt=""
                className="max-w-[18px]"
              />
              <div className="font-mainFont w-full whitespace-nowrap text-center font-semibold lg:w-min">
                {postDestination()}
              </div>
            </button>
          </div>
          <div></div>
        </section>
        <div className="h-[7px] w-full bg-grayLineThick lg:bg-graySoft"></div>

        <AllPosts
          globalPosts={globalPosts}
          friendsPosts={friendsPosts}
          showGlobalPosts={showGlobalPosts}
          context={'feed'}
        />
      </div>
    </div>
  )
}

export default Public
