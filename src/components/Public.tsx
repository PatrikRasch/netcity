import React, { useEffect, useState, useRef } from 'react'
import BackgroundOuter from './BackgroundOuter'
import AllPosts from './AllPosts'
import ThinSeparatorLine from './ThinSeparatorLine'
import FormValidationAlertMessage from './FormValidationAlertMessage'
import MakePost from './MakePost'

import { db, storage } from '../config/firebase.config'
import { collection, doc, getDoc, addDoc, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore'

import { v4 as uuidv4 } from 'uuid'

import imageGrayEmpty from './../assets/icons/image/imageGrayEmpty.webp'
import globalBlackEmpty from './../assets/icons/global/globalBlackEmpty.svg'
import globalWhiteEmpty from './../assets/icons/global/globalWhiteEmpty.svg'
import starBlackFilled from './../assets/icons/star/starBlackFilled.svg'
import starWhiteEmpty from './../assets/icons/star/starWhiteEmpty.svg'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserFirstName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserLastName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import { useDateFunctions } from './custom-hooks/useDateFunctions'
import useInfinityScrollFunctions from './custom-hooks/useInfinityScrollFunctions'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'

import { imageSizeExceeded } from './utils/imageSizeUtils'

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
  timestamp: Timestamp
  id: string
  publicPost: boolean
}

function Public() {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName()
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName()
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  const emptyProfilePicture = useEmptyProfilePicture()
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
  const [isPublicPost, setIsPublicPost] = useState(true)
  const [imageAddedToPostFeed, setImageAddedToPostFeed] = useState<string>('')
  const [imageAddedToPostFeedId, setImageAddedToPostFeedId] = useState<string>('')
  const [textareaActive, setTextareaActive] = useState(false)
  const [validateMakePost, setValidateMakePost] = useState(false)
  const [commandOrControlKeyDown, setCommandOrControlKeyDown] = useState(false)
  const [showValidationAlertMessage, setShowValidationAlertMessage] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  //1 Gets the reference to the publicPosts collection
  const publicPostsCollection = collection(db, 'publicPosts')

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getGlobalPosts = async () => {
    try {
      const sortedGlobalPosts = query(publicPostsCollection, orderBy('timestamp', 'desc'), limit(postsLoaded)) // Sorts posts in descending order
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

      const sortedFriendsPosts = query(publicPostsCollection, orderBy('timestamp', 'desc'), limit(postsLoaded)) // Sorts posts in descending order

      const unsubscribe = onSnapshot(sortedFriendsPosts, (snapshot) => {
        const friendsPostsDataArray: PublicPostData[] = [] // Empty array that'll be used for updating state
        snapshot.forEach((doc) => {
          const postData = doc.data() as PublicPostData

          // Add the post into the array if the user is friends with the poster and the post is not a public post
          if (
            (loggedInUserData?.friends.hasOwnProperty(postData.userId) || postData.userId === loggedInUserId) &&
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
    setIsPublicPost((prevMakePublicPost) => !prevMakePublicPost)
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

  return (
    <div>
      <BackgroundOuter />
      <FormValidationAlertMessage
        message={'Image size must be smaller than 2MB'}
        showValidationAlertMessage={showValidationAlertMessage}
        setShowValidationAlertMessage={setShowValidationAlertMessage}
      />
      <div className="lg:w-100svw bg-graySoft lg:grid lg:justify-center">
        {/* Choose posts to see */}
        <div className="lg:w-[clamp(500px,55svw,1500px)]">
          <div className="hidden bg-white p-2 pl-4 font-bold lg:block lg:pl-8 lg:text-[clamp(16px,1.5svw,18px)]">
            Home Feed
          </div>
          <ThinSeparatorLine />
          <section className="grid max-w-[100svw] grid-cols-2 gap-2 whitespace-nowrap bg-white p-4 lg:flex lg:justify-center lg:gap-4 lg:pl-8 lg:pr-8">
            <button
              className={`flex h-[45px] w-full items-center justify-center gap-2 rounded-3xl pb-[8px] pt-[8px] text-white lg:pl-8 lg:pr-8
          ${showGlobalPosts ? 'bg-black' : 'bg-graySoft lg:hover:bg-grayHover'} `}
              onClick={() => {
                setShowGlobalPosts(true)
                setShowFriendsPosts(false)
                setPostsLoaded(10)
                setIsPublicPost(true)
              }}
            >
              <img src={showGlobalPosts ? globalWhiteEmpty : globalBlackEmpty} alt="" className="h-[28px]" />
              <div className={`font-mainFont mr-2 font-semibold ${showGlobalPosts ? 'text-white' : 'text-textMain'} `}>
                Public Posts
              </div>
            </button>
            <button
              className={`flex max-h-[45px] w-full items-center justify-center gap-2 rounded-3xl pb-[8px] pt-[8px] lg:pl-8 lg:pr-8 ${
                showFriendsPosts ? 'bg-black text-white' : 'bg-graySoft text-textMain lg:hover:bg-grayHover'
              } `}
              onClick={() => {
                setShowFriendsPosts(true)
                setShowGlobalPosts(false)
                setPostsLoaded(10)
                setIsPublicPost(false)
              }}
            >
              <img src={showFriendsPosts ? starWhiteEmpty : starBlackFilled} alt="" className="h-[28px]" />
              <div className="font-mainFont font-semibold">Friends' Posts</div>
            </button>
          </section>
          <div className="h-[7px] w-full bg-graySoft lg:bg-graySoft"></div>

          {/* Make a post row */}
          <ThinSeparatorLine />
          <MakePost
            postLocation={showGlobalPosts ? 'global' : 'friends'}
            getPosts={showGlobalPosts ? getGlobalPosts : getFriendsPosts}
            isPublicPost={showGlobalPosts ? true : false}
            userPicture={loggedInUserProfilePicture}
            visitingUser={false}
          />
          {/* All posts row */}
          <AllPosts
            globalPosts={globalPosts}
            friendsPosts={friendsPosts}
            showGlobalPosts={showGlobalPosts}
            context={'feed'}
          />
        </div>
      </div>
    </div>
  )
}

export default Public
