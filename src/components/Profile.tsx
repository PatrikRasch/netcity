import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import globalWhiteEmpty from '../assets/icons/global/globalWhiteEmpty.svg'
import lockWithCirclePurple from '../assets/icons/lockCircle/lockWithCirclePurple.webp'
import postsWhiteEmpty from '../assets/icons/posts/postsWhiteEmpty.svg'
import postsBlackEmpty from '../assets/icons/posts/postsBlackEmpty.svg'
import aboutWhiteEmpty from '../assets/icons/about/aboutWhiteEmpty.webp'
import aboutBlackEmpty from '../assets/icons/about/aboutBlackEmpty.webp'
import starPurpleFilled from '../assets/icons/star/starPurpleFilled.svg'
import checkWhite from '../assets/icons/check/checkWhite.svg'
import clockGrayEmpty from '../assets/icons/clock/clockGrayEmpty.webp'
import lockWhiteFilled from '../assets/icons/lock/lockWhiteFilled.webp'

import { db, storage } from './../config/firebase.config'
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentReference,
  DocumentData,
  runTransaction,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import MakePost from './MakePost'
import AllPosts from './AllPosts'
import About from './About'
import ThinSeparatorLine from './ThinSeparatorLine'

import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserFirstName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserLastName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
// import { useLoggedInUserBio } from "./context/LoggedInUserProfileDataContextProvider";

// import { useLoadingScreen } from "./context/LoadingContextProvider";

import { PostData } from '../interfaces'
import ThickSeparatorLine from './ThickSeparatorLine'

//6 Bug occurs when a private profile is visited (not friends with) and then the loggedInUser is instantly navigated to by clicking the profile picture.
//6 Problem is likely an async state update problem (regarding updating openProfileId)

const Profile = () => {
  //- Context declarations:
  const emptyProfilePicture = useEmptyProfilePicture()

  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName()
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName()

  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  //- State declarations:
  const [visitingUser, setVisitingUser] = useState(false)
  const [showPosts, setShowPosts] = useState(true)
  const [otherFirstName, setOtherFirstName] = useState('')
  const [otherLastName, setOtherLastName] = useState('')
  const [otherProfilePicture, setOtherProfilePicture] = useState(emptyProfilePicture)

  const [dataLoaded, setDataLoaded] = useState(false)

  const [bioText, setBioText] = useState('')

  const [openProfile, setOpenProfile] = useState(true)
  const [displayProfileContent, setDisplayProfileContent] = useState(false)

  const [friendsWithUser, setFriendsWithUser] = useState(false)
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false)
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false)

  const [userDocRef, setUserDocRef] = useState<DocumentReference>()
  const [userData, setUserData] = useState<DocumentData>()
  const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>()

  const [isDeleteFriendDropdownMenuOpen, setIsDeleteFriendDropdownMenuOpen] = useState(false)

  const [featuredPhoto, setFeaturedPhoto] = useState('')

  const profilePictureRef = useRef<HTMLInputElement | null>(null)

  //- Navigation declarations:
  const navigate = useNavigate()
  //- useParams:
  const { openProfileId } = useParams()

  const [posts, setPosts] = useState<PostData[]>([])

  useEffect(() => {
    getLoggedInUserData()
    getUserData()
    friendStatusWithUser()
  }, [])

  useEffect(() => {
    publicOrPrivateProfile()
    showProfileContentOrNot()
    if (loggedInUserId === openProfileId) {
      setFeaturedPhoto(loggedInUserData?.featuredPhoto)
      if (loggedInUserData?.bio === '') setBioText('Write a bio about yourself')
      else setBioText(loggedInUserData?.bio)
    }
  }, [openProfileId, userData, loggedInUserData])

  useEffect(() => {
    showProfileContentOrNot()
  }, [openProfileId, friendsWithUser])

  const loggedInUserDocRef = doc(db, 'users', loggedInUserId)

  useEffect(() => {
    const getUserProfileStatus = async () => {
      const loggedInUserDocRef = doc(db, 'users', loggedInUserId)
      const loggedInUserDoc = await getDoc(loggedInUserDocRef)
      const loggedInUserData = loggedInUserDoc.data()
      setOpenProfile(loggedInUserData?.openProfile)
    }
    getUserProfileStatus()
  }, [])

  useEffect(() => {
    if (loggedInUserId === openProfileId) setVisitingUser(false) // Viewing own profile
    if (loggedInUserId !== openProfileId) setVisitingUser(true) // Viewing someone else's profile
    // - Profile data includes all profile data apart from the posts
    const getOtherProfileData = async () => {
      if (!openProfileId) return null
      if (openProfileId !== loggedInUserId) {
        try {
          // Get data for otherProfile (profile who's not logged in)
          const profileTargetUser = doc(db, 'users', openProfileId)
          setUserDocRef(profileTargetUser)
          const profileTargetDoc = await getDoc(profileTargetUser)
          const profileData = profileTargetDoc.data()
          setOtherFirstName(profileData?.firstName)
          setOtherLastName(profileData?.lastName)
          setOtherProfilePicture(profileData?.profilePicture)
          setFeaturedPhoto(profileData?.featuredPhoto)
          setOtherProfileBio(profileData)
          setDataLoaded(true)
        } catch (err) {
          console.error(err)
        }
      }
    }
    getOtherProfileData()
    setShowPosts(true)
  }, [openProfileId])

  const setOtherProfileBio = (profileData: DocumentData | undefined) => {
    if (profileData?.bio === '') setBioText("The user hasn't written a bio yet")
    else setBioText(profileData?.bio)
  }

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllPosts = async () => {
    try {
      const usersCollectionRef = collection(db, 'users') // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, openProfileId) // Grabs the doc where the user is
      const postsProfileCollection = collection(userDocRef, 'postsProfile') // Grabs the postsProfile collection
      const sortedPostsProfile = query(postsProfileCollection, orderBy('timestamp', 'desc')) // Sorts posts in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const unsubscribe = onSnapshot(sortedPostsProfile, (snapshot) => {
        const postsProfileDataArray: PostData[] = [] // Empty array that'll be used for updating state
        // Push each doc (post) into the postsProfileDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PostData // "as PostData" is type validation
          postsProfileDataArray.push({ ...postData, id: doc.id }) // (id: doc.id adds the id of the individual doc)
        })
        setPosts(postsProfileDataArray) // Update state with all the posts
      }) // Gets all docs from postsProfile collection
    } catch (err) {
      console.error('Error trying to get all docs:', err)
    }
  }

  if (openProfileId === undefined) return null //6. must make this better later

  const showPostsOrAbout = () => {
    if (!displayProfileContent) return
    if (showPosts) {
      return (
        <>
          <MakePost
            userPicture={otherProfilePicture} // pf Picture og logged in user
            getAllPosts={getAllPosts}
            visitingUser={visitingUser}
          />
          <AllPosts
            openProfileId={openProfileId} // Id of profile being viewed
            posts={posts}
            context={'profile'}
            openProfileFirstName={otherFirstName}
            openProfileLastName={otherLastName}
            visitingUser={visitingUser}
          />
        </>
      )
    } else
      return (
        <>
          <About
            openProfileId={openProfileId} // Id of profile being viewed
            visitingUser={visitingUser}
            bioText={bioText}
            setBioText={setBioText}
            featuredPhoto={featuredPhoto}
            setFeaturedPhoto={setFeaturedPhoto}
            displayUserName={displayUserName}
          />
        </>
      )
  }

  // - Stops the uploaded image if it's above 2MB
  const isUploadedProfilePictureTooLarge = (newProfilePicture: File | null) => {
    if (!newProfilePicture) return
    if (newProfilePicture.size > 2097152) {
      alert('Profile picture must be smaller than 2MB')
      return false
    }
  }

  // - Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  // - Also updates the user in the Firestore database with URL to the photo.
  const uploadProfilePicture = async (newProfilePicture: File | null) => {
    if (newProfilePicture === null) return // Return if no imagine is uploaded
    if (isUploadedProfilePictureTooLarge(newProfilePicture) === false) return // Check if image is too large before proceeding

    const storageRef = ref(storage, `/profilePictures/${loggedInUserId}`) // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, newProfilePicture) // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref) // Get the downloadURL for the image
      setOtherProfilePicture(downloadURL) // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, 'users') // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, loggedInUserId) // Grabs the doc where the user is
      await updateDoc(userDocRef, { profilePicture: downloadURL }) // Add the image into Firestore
      // alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err)
      //6 Need a "Something went wrong, please try again"
    }
  }

  const displayProfilePicture = () => {
    if (!visitingUser) {
      return (
        <img
          src={loggedInUserProfilePicture === '' ? emptyProfilePicture : loggedInUserProfilePicture}
          alt="profile"
          className="aspect-square h-[160px] w-[160px] rounded-[50%] border-4 border-white object-cover"
        />
      )
    }
    if (visitingUser) {
      return (
        <img
          src={otherProfilePicture === '' ? emptyProfilePicture : otherProfilePicture}
          alt="profile"
          className="z-10 aspect-square h-[160px] w-[160px] rounded-[50%] border-4 border-white object-cover"
        />
      )
    }
  }

  const displayUserName = () => {
    if (!visitingUser) return loggedInUserFirstName + ' ' + loggedInUserLastName
    if (visitingUser) return otherFirstName + ' ' + otherLastName
  }

  // - Switches and updates openProfile in state and the backend
  const openOrPrivateProfileSwitcher = async () => {
    const loggedInUserDocRef = doc(db, 'users', loggedInUserId)
    const loggedInUserDoc = await getDoc(loggedInUserDocRef)
    const loggedInUserData = loggedInUserDoc.data()

    if (loggedInUserData !== undefined) {
      const updatedValue = !loggedInUserData.openProfile
      setOpenProfile(updatedValue)
      loggedInUserData.openProfile = updatedValue
      await updateDoc(loggedInUserDocRef, { openProfile: updatedValue })
    }
  }

  // - The button for open/private profile
  const openProfileButton = () => {
    if (openProfileId !== loggedInUserId) return
    return (
      <button
        className={`absolute bottom-[60px] left-[20px] z-10 grid h-[35px] w-[80px] grid-cols-[1fr,3fr] items-center gap-1 rounded-3xl pl-1 pr-1 text-start text-verySmall text-white lg:w-[125px] lg:pl-2 lg:pr-2 ${
          openProfile ? 'bg-purpleMain' : 'bg-redMain'
        } `}
        onClick={() => {
          openOrPrivateProfileSwitcher()
        }}
      >
        <img src={`${openProfile ? globalWhiteEmpty : lockWhiteFilled}`} alt="" className="w-[20px] lg:w-[25px]" />
        <div>{openProfile ? 'Public Profile' : 'Private Profile'}</div>
      </button>
    )
  }

  // - Updates the state of the non-logged in user, used within the friend interaction functions below
  const updateUserData = async (newData: DocumentData) => {
    try {
      setUserData(newData)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the state of the logged in user, used within the friend interaction functions below
  const updateLoggedInUserData = async (newData: DocumentData) => {
    try {
      setLoggedInUserData(newData)
    } catch (err) {
      console.error(err)
    }
  }

  const getUserData = async () => {
    try {
      const userDocRef = doc(db, 'users', openProfileId)
      const userDoc = await getDoc(userDocRef)
      const userData = userDoc.data()
      setUserData(userData)
    } catch (err) {
      console.error(err)
    }
  }

  const getLoggedInUserData = async () => {
    try {
      const loggedInUserDocRef = doc(db, 'users', loggedInUserId)
      const loggedInUserDoc = await getDoc(loggedInUserDocRef)
      const loggedInUserData = loggedInUserDoc.data()
      setLoggedInUserData(loggedInUserData)
    } catch (err) {
      console.error(err)
    }
  }

  // - Checks if the content on a profile should be displayed or not
  const showProfileContentOrNot = async () => {
    if (openProfileId === loggedInUserId) setDisplayProfileContent(true)
    // Checks three things:
    // Is the profile not your own?
    // Is the profile you are visiting private?
    // Are you not friends with the user you are visiting?
    if (
      openProfileId !== loggedInUserId &&
      !userData?.openProfile &&
      !loggedInUserData?.friends.hasOwnProperty(openProfileId)
    ) {
      setDisplayProfileContent(false)
    } else {
      setDisplayProfileContent(true)
      getAllPosts()
    }
  }

  const publicOrPrivateProfile = () => {
    if (displayProfileContent) return
    if (!displayProfileContent)
      return (
        <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
          <img src={lockWithCirclePurple} alt="" className="w-[clamp(50px,30svw,150px)]" />
          <div className="text-large font-bold">This Account is Private</div>
          <div className="max-w-[50svw] opacity-70">
            You need to be friends to see their posts & make posts on their page
          </div>
        </div>
      )
  }

  // - Friend interaction function → Send a friend request
  const sendFriendRequest = async () => {
    try {
      setSentFriendRequestToUser(true)
      await runTransaction(db, async (transaction) => {
        // Handle the user receiving the request → Prepare the new data
        const newCurrentReceivedFriendRequests = {
          ...userData?.currentReceivedFriendRequests,
          [loggedInUserId]: {},
        }
        // Update state
        const updatedUserData = {
          ...userData,
          currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
        }
        await updateUserData(updatedUserData)
        // Handle the user sending the request → Prepare the new data
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [openProfileId]: {},
        }
        // Update state
        const updatedLoggedInUserData = {
          ...loggedInUserData,
          currentSentFriendRequests: newCurrentSentFriendRequests,
        }
        await updateLoggedInUserData(updatedLoggedInUserData)
        // Run the transactions to update the backend
        if (userDocRef !== undefined) {
          transaction.update(userDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          })
          transaction.update(loggedInUserDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          })
        }
      })
    } catch (err) {
      setSentFriendRequestToUser(false)
      console.error(err)
    }
  }

  // - Friend interaction function → Remove a sent friend request
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(false)
      await runTransaction(db, async (transaction) => {
        // Delete friend request for both users (receiver & sender)
        if (
          userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(openProfileId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId]
          delete loggedInUserData?.currentSentFriendRequests[openProfileId]

          // Handle the user receiving the request → Prepare the new data
          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests }
          // Update state
          const updatedUserData = {
            ...userData,
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          }
          await updateUserData(updatedUserData)

          // Handle the user sending the request → Prepare the new data
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests }
          // Update state
          const updatedLoggedInUserData = {
            ...loggedInUserData,
            currentSentFriendRequests: newCurrentSentFriendRequests,
          }
          await updateLoggedInUserData(updatedLoggedInUserData)

          // Run the transactions to update the backend
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, {
              currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
            })
            transaction.update(loggedInUserDocRef, {
              currentSentFriendRequests: newCurrentSentFriendRequests,
            })
          }
        }
      })
    } catch (err) {
      setSentFriendRequestToUser(true)
      console.error(err)
    }
  }

  // - Friend interaction function → Accept a received friend request
  const acceptFriendRequest = async () => {
    try {
      // Update the user accepting the request
      setReceivedFriendRequestFromUser(false)
      setFriendsWithUser(true)
      await runTransaction(db, async (transaction) => {
        // Handling the user who sent the request first → Prepare the new data
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} }
        delete userData?.currentSentFriendRequests[loggedInUserId] // Delete sent request
        // Update state
        const updatedUserData = { ...userData, friends: newCurrentFriendsSender }
        await updateUserData(updatedUserData)

        // Handling the user who received the request → Prepare the new data
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [openProfileId]: {} }
        delete loggedInUserData?.currentReceivedFriendRequests[openProfileId]
        // Update state
        const updatedLoggedInUserData = { ...loggedInUserData, friends: newCurrentFriendsReceiver }
        await updateLoggedInUserData(updatedLoggedInUserData)

        // Run the transactions to update the backend
        if (userDocRef !== undefined) {
          transaction.update(userDocRef, {
            friends: newCurrentFriendsSender,
            currentSentFriendRequests: { ...userData?.currentSentFriendRequests },
          })
          transaction.update(loggedInUserDocRef, {
            friends: newCurrentFriendsReceiver,
            currentReceivedFriendRequests: {
              ...loggedInUserData?.currentReceivedFriendRequests,
            },
          })
        }
      })
    } catch (err) {
      setReceivedFriendRequestFromUser(true)
      setFriendsWithUser(false)
      console.error(err)
    }
  }

  // - Friend interaction function → Decline a received friend request
  const declineFriendRequest = async () => {
    try {
      setReceivedFriendRequestFromUser(false)
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.currentSentFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.currentSentFriendRequests[loggedInUserId]
          delete loggedInUserData?.currentReceivedFriendRequests[openProfileId]

          // Handle the user receiving the request
          const newCurrentSentFriendRequests = { ...userData?.currentSentFriendRequests } // Prepare the new data

          // Handle the user sending the request
          const newCurrentReceivedFriendRequests = {
            ...loggedInUserData?.currentReceivedFriendRequests,
          } // Prepare the new data

          // Run the transactions for the backend
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, {
              currentSentFriendRequests: newCurrentSentFriendRequests,
            })
            transaction.update(loggedInUserDocRef, {
              currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
            })
          }
        }
      })
    } catch (err) {
      setReceivedFriendRequestFromUser(true)
      console.error(err)
    }
  }

  // - Friend interaction function → Delete a current friend
  const deleteFriend = async () => {
    try {
      setFriendsWithUser(false)
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.friends.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.friends.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.friends[loggedInUserId]
          delete loggedInUserData?.friends[openProfileId]
          // Prepares new data to be sent to Firebase
          const newUserFriends = { ...userData?.friends }
          const newLoggedInUserFriends = { ...loggedInUserData?.friends }
          // Updates Firebase with the new data
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, { friends: newUserFriends })
            transaction.update(loggedInUserDocRef, { friends: newLoggedInUserFriends })
          }
        }
      })
    } catch (err) {
      setFriendsWithUser(true)
      console.error(err)
    }
  }

  // - Checks the current friend status the loggedInUser has with the user
  const friendStatusWithUser = async () => {
    const loggedInUserDocRef = doc(db, 'users', loggedInUserId)
    const loggedInUserDoc = await getDoc(loggedInUserDocRef)
    const loggedInUserData = loggedInUserDoc.data()
    if (loggedInUserData?.friends.hasOwnProperty(openProfileId)) {
      setFriendsWithUser(true)
    } else {
      setFriendsWithUser(false)
    }
    if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(openProfileId)) {
      setSentFriendRequestToUser(true)
    } else {
      setSentFriendRequestToUser(false)
    }
    if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(openProfileId)) {
      setReceivedFriendRequestFromUser(true)
    } else {
      setReceivedFriendRequestFromUser(false)
    }
  }

  const deleteFriendDropdownMenuJSX = () => {
    if (isDeleteFriendDropdownMenuOpen)
      return (
        <div>
          <div className="grid h-[33px] w-[190px] grid-cols-2">
            <button
              className="rounded-bl-3xl rounded-tl-3xl bg-purpleSoft text-purpleMain"
              onClick={() => {
                setIsDeleteFriendDropdownMenuOpen(
                  (prevIsDeleteFriendDropdownMenuOpen) => !prevIsDeleteFriendDropdownMenuOpen
                )
              }}
            >
              Cancel
            </button>
            <button
              className="rounded-br-3xl rounded-tr-3xl bg-redMain text-redSoft"
              onClick={() => {
                deleteFriend()
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )
    if (!isDeleteFriendDropdownMenuOpen)
      return (
        <div>
          <button
            className="font-mainFont flex h-[33px] w-[190px] items-center justify-center gap-[5px] rounded-3xl bg-purpleSoft text-[17px] text-purpleMain"
            onClick={() => {
              setIsDeleteFriendDropdownMenuOpen(
                (prevIsDeleteFriendDropdownMenuOpen) => !prevIsDeleteFriendDropdownMenuOpen
              )
            }}
          >
            <img src={starPurpleFilled} alt="" className="w-[20px] pb-[3px]" />
            Friends
          </button>
        </div>
      )
  }

  const friendStatusWithUserJSX = () => {
    if (friendsWithUser) {
      return deleteFriendDropdownMenuJSX()
    }

    if (sentFriendRequestToUser)
      return (
        <button
          className="font-mainFont flex h-[33px] w-[190px] items-center justify-center gap-1 rounded-3xl bg-graySoft text-[17px] text-black"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              removeFriendRequest()
            }
          }}
        >
          <img src={clockGrayEmpty} alt="" className="w-[25px] pb-[2px]" />
          Requested
        </button>
      )
    if (receivedFriendRequestFromUser)
      return (
        <div className="flex max-w-[390px] justify-evenly gap-4">
          <button
            className="font-mainFont flex h-[33px] w-[220px] items-center justify-center gap-1 rounded-3xl bg-purpleMain text-[15px] text-white"
            onClick={() => {
              if (userDocRef && userData && loggedInUserData) {
                acceptFriendRequest()
              }
            }}
          >
            <img src={checkWhite} alt="" className="w-[22px]" />
            Accept Friend Request
          </button>
          <button
            className="h-[33px] w-[115px] rounded-3xl bg-graySoft text-[15px] text-black"
            onClick={() => {
              if (userDocRef && userData && loggedInUserData) {
                declineFriendRequest()
              }
            }}
          >
            Deny
          </button>
        </div>
      )
    else
      return (
        <button
          className="font-mainFont flex h-[33px] w-[190px] items-center justify-center gap-1 rounded-3xl bg-purpleMain text-[17px] text-white"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              sendFriendRequest()
            }
          }}
        >
          + Add Friend
        </button>
      )
  }

  const showFriendStatusWithUser = () => {
    if (loggedInUserId === openProfileId) return
    else
      return (
        <div className="grid justify-center">
          <div className="flex items-center justify-center p-2">{friendStatusWithUserJSX()}</div>
        </div>
      )
  }

  return (
    <div className="grid min-h-[calc(100svh-80px)] w-screen items-start justify-center bg-graySoft">
      {/*//1 Profile picture and name */}
      <div className="w-[100svw] bg-white lg:grid lg:w-[clamp(600px,55svw,1500px)]">
        <div className="flex justify-center">
          <div className="absolute top-[0%] z-0 h-[200px] w-[93svw] rounded-3xl bg-purpleSoft lg:w-[clamp(200px,46svw,1300px)]">
            {/* // - Open/Private profile button */}
            {openProfileButton()}
          </div>
        </div>
        <div className="grid items-center justify-center gap-2 pl-8 pr-8 pt-4">
          <div className="relative">
            <label htmlFor="fileInput" className="flex h-max justify-center hover:cursor-pointer">
              {displayProfilePicture()}
            </label>
            <input
              ref={profilePictureRef}
              type="file"
              id="fileInput"
              className="opacity-0"
              hidden
              onChange={(e) => {
                uploadProfilePicture(e.target.files?.[0] || null)
              }}
              disabled={visitingUser} // Disables fileInput if it's not your profile
            />
          </div>
          <div
            className={`${openProfileId === loggedInUserId ? 'pb-2' : ''} font-mainFont text-center text-3xl font-bold`}
          >
            {displayUserName()}
          </div>
        </div>

        {/* // - Friend status */}
        {showFriendStatusWithUser()}
        <ThinSeparatorLine />

        {/*// - Posts/About selection */}
        <div className="grid h-[65px] grid-cols-2 gap-4 rounded-lg p-3 pl-4 pr-4 text-[clamp(16px,1svw,20px)] lg:flex lg:justify-center lg:gap-[clamp(10px,5svw,150px)]">
          <button
            className={`${
              showPosts ? 'bg-black text-white' : 'bg-graySoft text-black'
            }  font-mainFont flex h-[38px] w-full items-center justify-center gap-2 rounded-3xl font-bold lg:w-48 `}
            onClick={() => setShowPosts(true)}
          >
            <img src={showPosts ? postsWhiteEmpty : postsBlackEmpty} alt="" className="w-[24px]" />
            <div>Posts</div>
          </button>
          <button
            className={`${
              !showPosts ? 'bg-black text-white' : 'bg-graySoft text-black'
            } font-mainFont flex h-[38px] w-full items-center justify-center gap-1 rounded-3xl font-bold lg:w-48`}
            onClick={() => setShowPosts(false)}
          >
            <img src={showPosts ? aboutBlackEmpty : aboutWhiteEmpty} alt="" className="w-[27px]" />
            <div>About Me</div>
          </button>
        </div>

        <ThickSeparatorLine />
        {/*//1 Posts or About */}
        <div>{publicOrPrivateProfile()}</div>
        <div>{showPostsOrAbout()}</div>
        <div
          className={`grid h-[128px] items-center justify-center text-medium font-semibold opacity-30 ${
            posts.length === 0 && showPosts && displayProfileContent ? '' : 'hidden'
          }`}
        >
          This profile has no posts. Be the first!
        </div>
        <div
          className={`grid h-[128px] items-center justify-center text-medium font-semibold opacity-30 ${
            posts.length !== 0 && showPosts && displayProfileContent ? '' : 'hidden'
          }`}
        >
          No more posts on profile
        </div>
      </div>
    </div>
  )
}

export default Profile

//6 Could change profilePicture in Firebase to be "pfPicture" or just "picture" in order to keep naming more concise. Currently it's a bit confusing as we are using "profilePicture" to indicate that it's the picture to be used on the profile being viewing, and "userPicture" to point to the picture of the viewer.
