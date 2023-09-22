import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import arrowDropdown from '../assets/icons/dropdownIcon/arrow-dropdown.png'
import starIconPurple from '../assets/icons/starIcon/starIconPurple.svg'
import checkIconGray from '../assets/icons/checkIcon/checkIconGray.svg'
import checkIconWhite from '../assets/icons/checkIcon/checkIconWhite.svg'

import { db } from '../config/firebase.config'
import { doc, getDoc, runTransaction, DocumentData } from 'firebase/firestore'

import { FirstNameProp, LastNameProp, ProfilePicture, UserData } from '../interfaces'

import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { loadingSkeletonTheme } from './SkeletonTheme'
import { SkeletonTheme } from 'react-loading-skeleton'

interface Props {
  userFirstName: FirstNameProp['firstName']
  userLastName: LastNameProp['lastName']
  userProfilePicture: ProfilePicture['profilePicture']
  userId: UserData['id']
  getAndCategoriseUsers: () => Promise<void>
  loggedInUserData: DocumentData | undefined
  setLoggedInUserData: (value: object) => void
  numOfReceivedFriendRequests: number
  setNumOfReceivedFriendRequests: (value: number) => void
}

function PeopleUser({
  userFirstName,
  userLastName,
  userProfilePicture,
  userId,
  loggedInUserData,
  setLoggedInUserData,
  numOfReceivedFriendRequests,
  setNumOfReceivedFriendRequests,
}: Props) {
  const navigate = useNavigate()
  const emptyProfilePicture = useEmptyProfilePicture()
  const { loggedInUserId } = useLoggedInUserId()
  const [friendsWithUser, setFriendsWithUser] = useState(false)
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false)
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false)
  const [isFriendsDropdownMenuOpen, setIsFriendsDropdownMenuOpen] = useState(false)
  const [userData, setUserData] = useState<DocumentData>()
  const [profilePictureLoading, setProfilePictureLoading] = useState(true)
  const [componentLoading, setComponentLoading] = useState(true)

  useEffect(() => {
    getUserData()
    if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(userId)) setReceivedFriendRequestFromUser(true)
    if (loggedInUserData?.friends.hasOwnProperty(userId)) setFriendsWithUser(true)
    if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)) setSentFriendRequestToUser(true)
  }, [])

  useEffect(() => {
    friendStatusButton()
  }, [friendsWithUser, receivedFriendRequestFromUser, sentFriendRequestToUser])

  const navigateToUser = () => {
    navigate(`/profile/${userId}`)
  }

  // - Document references. Used throughout component
  const userDocRef = doc(db, 'users', userId)
  const loggedInUserDocRef = doc(db, 'users', loggedInUserId)

  // - Gets and sets the data in state for the user. Only used when the component mounts
  const getUserData = async () => {
    const userDoc = await getDoc(userDocRef)
    setUserData(userDoc.data())
  }

  // - Updates the state of the logged in user, used within the friend interaction functions below
  const updateLoggedInUserData = async (newData: DocumentData) => {
    try {
      setLoggedInUserData(newData)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the state of the non-logged in user, used within thte friend interaction functions below
  const updateUserData = async (newData: DocumentData) => {
    try {
      setUserData(newData)
    } catch (err) {
      console.error(err)
    }
  }

  // - Friend interaction function → Send a friend request
  const sendFriendRequest = async () => {
    try {
      setSentFriendRequestToUser(true)
      await runTransaction(db, async (transaction) => {
        // Handle the user receiving the request
        // Prepare the new data
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

        // Handle the user sending the request
        // Prepare the new data
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [userId]: {},
        }
        // Update state
        const updatedLoggedInUserData = {
          ...loggedInUserData,
          currentSentFriendRequests: newCurrentSentFriendRequests,
        }
        await updateLoggedInUserData(updatedLoggedInUserData)

        // Run the transactions to update the backend
        transaction.update(userDocRef, {
          currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
        })
        transaction.update(loggedInUserDocRef, {
          currentSentFriendRequests: newCurrentSentFriendRequests,
        })
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
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(userId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId]
          delete loggedInUserData?.currentSentFriendRequests[userId]

          // Handle the user receiving the request
          // Prepare the new data
          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests }
          // Update state
          const updatedUserData = {
            ...userData,
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          }
          await updateUserData(updatedUserData)

          // Handle the user sending the request
          // Prepare the new data
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests }
          // Update state
          const updatedLoggedInUserData = {
            ...loggedInUserData,
            currentSentFriendRequests: newCurrentSentFriendRequests,
          }
          await updateLoggedInUserData(updatedLoggedInUserData)

          // Run the transactions to update the backend
          transaction.update(userDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          })
          transaction.update(loggedInUserDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          })
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
      setNumOfReceivedFriendRequests(numOfReceivedFriendRequests - 1)
      await runTransaction(db, async (transaction) => {
        // Handling the user who sent the request first
        // Prepare the new data
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} }
        delete userData?.currentSentFriendRequests[loggedInUserId] // Delete sent request
        // Update state
        const updatedUserData = { ...userData, friends: newCurrentFriendsSender }
        await updateUserData(updatedUserData)

        // Handling the user who received the request
        // Prepare the new data
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [userId]: {} }
        delete loggedInUserData?.currentReceivedFriendRequests[userId]
        // Update state
        const updatedLoggedInUserData = { ...loggedInUserData, friends: newCurrentFriendsReceiver }
        await updateLoggedInUserData(updatedLoggedInUserData)

        // Run the transactions to update the backend
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
      })
    } catch (err) {
      setReceivedFriendRequestFromUser(true)
      setFriendsWithUser(false)
      setNumOfReceivedFriendRequests(numOfReceivedFriendRequests + 1)
      console.error(err)
    }
  }

  // - Friend interaction function → Decline a received friend request
  const declineFriendRequest = async () => {
    try {
      setReceivedFriendRequestFromUser(false)
      setNumOfReceivedFriendRequests(numOfReceivedFriendRequests - 1)
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.currentSentFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(userId)
        ) {
          // Deletes the users from each other's state
          delete userData?.currentSentFriendRequests[loggedInUserId]
          delete loggedInUserData?.currentReceivedFriendRequests[userId]

          // Handle the user receiving the request
          const newCurrentSentFriendRequests = { ...userData?.currentSentFriendRequests } // Prepare the new data

          // Handle the user sending the request
          const newCurrentReceivedFriendRequests = {
            ...loggedInUserData?.currentReceivedFriendRequests,
          } // Prepare the new data

          // Run the transactions for the backend
          transaction.update(userDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          })
          transaction.update(loggedInUserDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          })
        }
      })
    } catch (err) {
      setReceivedFriendRequestFromUser(true)
      setNumOfReceivedFriendRequests(numOfReceivedFriendRequests + 1)
      console.error(err)
    }
  }

  // - Friend interaction function → Delete a current friend
  const deleteFriend = async () => {
    try {
      setFriendsWithUser(false)
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (userData?.friends.hasOwnProperty(loggedInUserId) && loggedInUserData?.friends.hasOwnProperty(userId)) {
          // Deletes the users from each other's state
          delete userData?.friends[loggedInUserId]
          delete loggedInUserData?.friends[userId]
          // Prepares new data to be sent to Firebase
          const newUserFriends = { ...userData?.friends }
          const newLoggedInUserFriends = { ...loggedInUserData?.friends }
          // Updates Firebase with the new data
          transaction.update(userDocRef, { friends: newUserFriends })
          transaction.update(loggedInUserDocRef, { friends: newLoggedInUserFriends })
        }
      })
    } catch (err) {
      setFriendsWithUser(true)
      console.error(err)
    }
  }

  const friendsDropdownMenu = () => {
    if (isFriendsDropdownMenuOpen) {
      return (
        <div className="relative flex">
          <button
            className="cursor-pointer"
            onClick={() => {
              setIsFriendsDropdownMenuOpen(!isFriendsDropdownMenuOpen)
            }}
          >
            <div className="flex w-[120px] items-center justify-center gap-[5px] rounded-t-2xl bg-purpleSoft p-2 text-medium font-semibold text-purpleMain ">
              <img src={starIconPurple} alt="" className="h-[18px]" />
              <div>Friends</div>
              {/* <img src={arrowDropdown} alt="" className="max-w-[30px] rotate-180" /> */}
            </div>
          </button>
          <button
            className="absolute top-[100%] w-[120px] gap-1 rounded-b-2xl bg-redMain p-2 text-center text-medium font-semibold text-graySoft"
            onClick={() => {
              deleteFriend()
            }}
          >
            <div>Delete friend</div>
          </button>
        </div>
      )
    }
    if (!isFriendsDropdownMenuOpen) {
      return (
        <div>
          <button
            className="cursor-pointer"
            onClick={() => {
              setIsFriendsDropdownMenuOpen(!isFriendsDropdownMenuOpen)
            }}
          >
            <div className="flex w-[120px] items-center justify-center gap-[5px] rounded-3xl bg-purpleSoft p-2 text-medium font-semibold text-purpleMain">
              <img src={starIconPurple} alt="" className="h-[18px]" />
              <div>Friends</div>
              {/* <img src={arrowDropdown} alt="" className="max-w-[30px]" /> */}
            </div>
          </button>
        </div>
      )
    }
  }

  const friendStatusButton = () => {
    if (friendsWithUser) return friendsDropdownMenu()
    if (sentFriendRequestToUser)
      return (
        <button
          className="cursor-pointer"
          onClick={() => {
            removeFriendRequest()
          }}
        >
          <div className="flex w-[120px] gap-[1px] rounded-3xl bg-graySoft p-2 text-[14px] font-semibold text-grayMain">
            <img src={checkIconGray} alt="" className="w-[20px]" />
            <div>Requested</div>
          </div>
        </button>
      )
    else
      return (
        <button
          className="cursor-pointer"
          onClick={() => {
            sendFriendRequest()
          }}
        >
          <div className="w-[120px] rounded-3xl bg-purpleMain p-2 text-[14px] font-semibold text-white">
            <div>+ Add Friend</div>
          </div>
        </button>
      )
  }

  const receivedFriendRequestFromUserOrNot = () => {
    if (!receivedFriendRequestFromUser)
      return (
        <>
          {friendStatusButton()}
          <button
            onClick={() => {
              navigateToUser()
            }}
            className="w-[120px] rounded-3xl bg-graySoftest p-2 text-[14px] text-grayMain"
          >
            View Profile
          </button>
        </>
      )
    if (receivedFriendRequestFromUser)
      return (
        <>
          <button
            className="w-[120px] cursor-pointer rounded-3xl  bg-purpleMain p-2 text-medium font-semibold text-white"
            onClick={() => {
              acceptFriendRequest()
            }}
          >
            <div className="mr-3 flex justify-center gap-1">
              <img src={checkIconWhite} alt="" className="w-[20px]" />
              Accept
            </div>
          </button>
          <button
            className="w-[120px] cursor-pointer rounded-3xl bg-graySoftest p-2 text-[14px] font-semibold text-grayMain"
            onClick={() => {
              declineFriendRequest()
            }}
          >
            Deny Request
          </button>
        </>
      )
  }

  return (
    <div className="flex h-[100%] w-[clamp(300px,100svw,1000px)] grid-cols-[9fr,22fr] items-center justify-center gap-[12px] bg-white p-3 lg:w-[100%]">
      <img
        src={userProfilePicture === '' ? emptyProfilePicture : userProfilePicture}
        alt=""
        onLoad={() => {
          setComponentLoading(false)
        }}
        className={`aspect-square min-h-[100px] w-[100px] cursor-pointer rounded-[50%] object-cover ${
          componentLoading ? 'hidden' : ''
        }`}
        onClick={() => {
          navigateToUser()
        }}
      />
      {/* Ensure loading skeleton works */}
      {componentLoading && <div className="h-[100px] w-[100px]">{loadingSkeletonTheme(4)}</div>}
      <div className="grid grid-rows-2">
        <div
          className="font-mainFont flex cursor-pointer text-large font-semibold"
          onClick={() => {
            navigateToUser()
          }}
        >
          {userFirstName} {userLastName}
        </div>
        <div className="flex gap-2">{receivedFriendRequestFromUserOrNot()}</div>
      </div>
    </div>
  )
}

export default PeopleUser
