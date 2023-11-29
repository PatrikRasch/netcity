import React, { useEffect, useRef, useState } from 'react'
import { db } from '../config/firebase.config'
import { collection, doc, getDoc, query, orderBy, onSnapshot, limit, Timestamp } from 'firebase/firestore'

// - Component imports
import BackgroundOuter from './BackgroundOuter'
import AllPosts from './AllPosts'
import ThinSeparatorLine from './ThinSeparatorLine'
import FormValidationAlertMessage from './FormValidationAlertMessage'
import MakePost from './MakePost'
import ScrollToTop from './ScrollToTop'
import MakePostActivator from './MakePostActivator'
// - Image imports
import globalBlackEmpty from './../assets/icons/global/globalBlackEmpty.svg'
import globalWhiteEmpty from './../assets/icons/global/globalWhiteEmpty.svg'
import starBlackFilled from './../assets/icons/star/starBlackFilled.svg'
import starWhiteEmpty from './../assets/icons/star/starWhiteEmpty.svg'
// - Context imports
import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
// - Custom hook imports
import useInfinityScrollFunctions from './custom-hooks/useInfinityScrollFunctions'

// - Interfaces
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
interface MakePostTextAreaRef {
  focusInput: () => void
}

function Public() {
  // Contexts
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  // States
  const [globalPosts, setGlobalPosts] = useState<PublicPostData[]>([])
  const [friendsPosts, setFriendsPosts] = useState<PublicPostData[]>([])
  const [fetchingMorePosts, setFetchingMorePosts] = useState(false)
  const [postsLoaded, setPostsLoaded] = useState(10)
  const [showGlobalPosts, setShowGlobalPosts] = useState(true)
  const [showFriendsPosts, setShowFriendsPosts] = useState(false)
  const [isPublicPost, setIsPublicPost] = useState(true)
  const [showValidationAlertMessage, setShowValidationAlertMessage] = useState(false)
  // Refs
  const makePostTextareaRef = useRef<MakePostTextAreaRef>(null)

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

  useInfinityScrollFunctions({
    fetchingMorePosts,
    setFetchingMorePosts,
    postsLoaded,
    setPostsLoaded,
    getGlobalPosts,
  })

  const focusMakePostTextarea = () => {
    if (makePostTextareaRef.current) makePostTextareaRef.current.focusInput()
  }

  return (
    <div>
      <ScrollToTop />
      <MakePostActivator focusMakePostTextarea={focusMakePostTextarea} />
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
            showGlobalPosts={showGlobalPosts}
            ref={makePostTextareaRef}
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
