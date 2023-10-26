import React, { useState, useEffect } from 'react'

import PeopleUser from './PeopleUser'
import ThinSeparatorLine from './ThinSeparatorLine'

import { db } from './../config/firebase.config'
import { DocumentData, collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import { UserData } from '../interfaces'
import ThickSeparatorLine from './ThickSeparatorLine'

//1 Feature Work Plan:
//3 1. Fetch all registered users from Firebase
//3 2. Make a list of users
//3 3. Display the people in a list
//3 4. Make the users clickable
//3 5. Navigate to the user's profile if clicked
//3 6. Allow liking and disliking on other profiles
//3 7. Ability to add friends

//3 Must go through all components and ensure consistency when updating

const People = () => {
  const { loggedInUserId } = useLoggedInUserId()
  // State for selecting which category of users to show
  const [showOtherUsers, setShowOtherUsers] = useState(true)
  const [showFriends, setShowFriends] = useState(false)
  const [showReceivedFriendRequests, setShowReceivedFriendRequests] = useState(false)
  const [showSentFriendRequests, setShowSentFriendRequests] = useState(false)

  const [numOfReceivedFriendRequests, setNumOfReceivedFriendRequests] = useState(0)

  const [allUsers, setAllUsers] = useState<DocumentData>()
  // Holds all the users in their various categories
  const [allOtherUsers, setAllOtherUsers] = useState<UserData[]>([])
  const [allFriends, setAllFriends] = useState<UserData[]>([])
  const [allReceivedFriendRequests, setAllReceivedFriendRequests] = useState<UserData[]>([])
  const [allSentFriendRequests, setAllSentFriendRequests] = useState<UserData[]>([])

  const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>()

  const loggedInUserDocRef = doc(db, 'users', loggedInUserId)

  useEffect(() => {
    getAndCategoriseUsers()
  }, [])

  useEffect(() => {
    updateNumOfReceivedFriendsRequests()
  }, [])

  const updateNumOfReceivedFriendsRequests = async () => {
    const loggedInUserDoc = await getDoc(loggedInUserDocRef)
    const loggedInUserData = loggedInUserDoc.data()
    const receivedRequests = loggedInUserData?.currentReceivedFriendRequests
    setNumOfReceivedFriendRequests(Object.keys(receivedRequests).length)
  }

  const usersCollection = collection(db, 'users')

  // - Allows for editing a global property in Firestore if necessary
  const editGlobalFirestoreProperty = async () => {
    try {
      const allUsersRef = await getDocs(usersCollection)
      allUsersRef.forEach(async (doc) => {
        await updateDoc(doc.ref, { openProfile: true })
      })
    } catch (err) {
      console.error(err)
    }
  }

  // -  Gets and categorises all users
  const getAndCategoriseUsers = async () => {
    try {
      const allUsers = await getDocs(usersCollection)
      setAllUsers(allUsers)
      const loggedInUserDoc = await getDoc(loggedInUserDocRef)
      const loggedInUserData = loggedInUserDoc.data()
      setLoggedInUserData(loggedInUserData)
      const otherUsersArray: UserData[] = []
      const usersFriendsArray: UserData[] = []
      const usersSentFriendRequestsArray: UserData[] = []
      const usersReceivedFriendRequestsArray: UserData[] = []

      allUsers?.forEach((doc: DocumentData) => {
        const userData = doc.data() as UserData
        if (doc.id === loggedInUserId) return // Remove logged in user from the list of users
        if (loggedInUserData?.friends.hasOwnProperty(doc.id)) return usersFriendsArray.push({ ...userData, id: doc.id }) // Are they already friends?
        if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(doc.id))
          return usersReceivedFriendRequestsArray.push({ ...userData, id: doc.id }) // Have they requested to be friends with loggedInUser?
        if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(doc.id))
          // if (usersSentFriendRequestsIds.hasOwnProperty(doc.id))
          return usersSentFriendRequestsArray.push({ ...userData, id: doc.id })
        // Has logged in user already sent them a friend request?
        else return otherUsersArray.push({ ...userData, id: doc.id })
      })
      setAllFriends(usersFriendsArray)
      setAllReceivedFriendRequests(usersReceivedFriendRequestsArray)
      setAllSentFriendRequests(usersSentFriendRequestsArray)
      setAllOtherUsers(otherUsersArray)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the list of friends of the logged in user
  const updateFriends = async () => {
    try {
      const usersFriendsArray: UserData[] = []
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData
        if (loggedInUserData?.friends.hasOwnProperty(user.id))
          return usersFriendsArray.push({ ...userData, id: user.id })
        else return
      })
      setAllFriends(usersFriendsArray)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the list of received friend requests of the logged in user
  const updateReceivedFriendRequests = async () => {
    try {
      const usersReceivedFriendRequestsArray: UserData[] = []
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData
        // if (user.id === loggedInUserId) return; // Remove logged in user from the list of users
        if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(user.id))
          return usersReceivedFriendRequestsArray.push({ ...userData, id: user.id })
        else return
      })
      setAllReceivedFriendRequests(usersReceivedFriendRequestsArray)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the list of sent friend requests of the logged in user
  const updateSentFriendRequests = async () => {
    try {
      const usersSentFriendRequestsArray: UserData[] = []
      allUsers?.forEach((user: DocumentData) => {
        const userData = user.data() as UserData
        if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(user.id)) {
          return usersSentFriendRequestsArray.push({ ...userData, id: user.id })
        } else return
      })
      setAllSentFriendRequests(usersSentFriendRequestsArray)
    } catch (err) {
      console.error(err)
    }
  }

  // - Updates the list of users the logged in user has no connections with
  const updateOtherUsers = async () => {
    const otherUsersArray: UserData[] = []
    const usersFriendsArray: UserData[] = []
    const usersSentFriendRequestsArray: UserData[] = []
    const usersReceivedFriendRequestsArray: UserData[] = []

    allUsers?.forEach((doc: DocumentData) => {
      const userData = doc.data() as UserData
      if (doc.id === loggedInUserId) return // Remove logged in user from the list of users
      if (loggedInUserData?.friends.hasOwnProperty(doc.id)) return usersFriendsArray.push({ ...userData, id: doc.id }) // Are they already friends?
      if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(doc.id))
        return usersReceivedFriendRequestsArray.push({ ...userData, id: doc.id }) // Have they requested to be friends with loggedInUser?
      if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(doc.id))
        // if (usersSentFriendRequestsIds.hasOwnProperty(doc.id))
        return usersSentFriendRequestsArray.push({ ...userData, id: doc.id })
      // Has logged in user already sent them a friend request?
      else return otherUsersArray.push({ ...userData, id: doc.id })
    })
    setAllFriends(usersFriendsArray)
    setAllReceivedFriendRequests(usersReceivedFriendRequestsArray)
    setAllSentFriendRequests(usersSentFriendRequestsArray)
    setAllOtherUsers(otherUsersArray)
  }

  // - Allows for switching of the categories when called with the correct string
  const sectionControlSwitcher = (sectionToShow: string) => {
    setShowOtherUsers(false)
    setShowFriends(false)
    setShowReceivedFriendRequests(false)
    setShowSentFriendRequests(false)

    const sectionMap: Record<string, (value: boolean) => void> = {
      setShowOtherUsers,
      setShowFriends,
      setShowReceivedFriendRequests,
      setShowSentFriendRequests,
    }
    const section = sectionMap[sectionToShow]
    if (section) section(true)
  }

  // - Returns the category that is to be rendered
  const getUsersToRender = () => {
    if (showOtherUsers) return [...allOtherUsers, ...allReceivedFriendRequests, ...allSentFriendRequests, ...allFriends]
    if (showFriends) return allFriends
    if (showReceivedFriendRequests) return allReceivedFriendRequests
    if (showSentFriendRequests) return allSentFriendRequests
  }

  // - Displays all the users within the open category
  const populateUsersOnPage = () => {
    return getUsersToRender()?.map((user: UserData) => (
      <div key={user.id}>
        <PeopleUser
          userId={user.id}
          userFirstName={user.firstName}
          userLastName={user.lastName}
          userProfilePicture={user.profilePicture}
          getAndCategoriseUsers={getAndCategoriseUsers}
          loggedInUserData={loggedInUserData}
          setLoggedInUserData={setLoggedInUserData}
          numOfReceivedFriendRequests={numOfReceivedFriendRequests}
          setNumOfReceivedFriendRequests={setNumOfReceivedFriendRequests}
        />
      </div>
    ))
  }

  const pageTitle = () => {
    if (showOtherUsers) return 'All People'
    if (showFriends) return `My Friends (${allFriends.length})`
    if (showReceivedFriendRequests) return `Received Friend Requests (${allReceivedFriendRequests.length})`
    if (showSentFriendRequests) return `Sent Friend Requests (${allSentFriendRequests.length})`
  }

  const categoryMessage = () => {
    if (showFriends) {
      return (
        <>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allFriends.length === 0 ? '' : 'hidden'
            }`}
          >
            No current friends
          </div>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allFriends.length === 0 ? 'hidden' : ''
            }`}
          >
            No more to show
          </div>
        </>
      )
    }
    if (showReceivedFriendRequests) {
      return (
        <>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allReceivedFriendRequests.length === 0 ? '' : 'hidden'
            }`}
          >
            No received friend requests
          </div>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allReceivedFriendRequests.length === 0 ? 'hidden' : ''
            }`}
          >
            No more to show
          </div>
        </>
      )
    }
    if (showOtherUsers) {
      return (
        <>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allOtherUsers.length === 0 ? '' : 'hidden'
            }`}
          >
            No other people
          </div>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allOtherUsers.length === 0 ? 'hidden' : ''
            }`}
          >
            No more to show
          </div>
        </>
      )
    }
    if (showSentFriendRequests) {
      return (
        <>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allSentFriendRequests.length === 0 ? '' : 'hidden'
            }`}
          >
            No sent friend requests
          </div>
          <div
            className={`p-8 pb-16 text-center text-medium font-semibold opacity-30 ${
              allSentFriendRequests.length === 0 ? 'hidden' : ''
            }`}
          >
            No more to show
          </div>
        </>
      )
    }
  }

  return (
    <div>
      <div className="fixed z-[-1] h-screen w-screen lg:bg-graySoft"></div>
      <div className="items-start lg:grid lg:justify-center lg:bg-graySoft">
        <div className="min-h-[calc(100svh-80px)] bg-white">
          <div className="items-start bg-white lg:grid lg:w-[clamp(600px,55svw,1500px)]">
            <div className="grid grid-cols-4 gap-2 bg-white p-4 lg:gap-5">
              <button
                className={`rounded-2xl pb-[4px] pl-[3px] pr-[3px] pt-[4px] text-[12.5px] font-semibold lg:rounded-3xl lg:p-2 lg:text-medium 
          ${showOtherUsers ? 'bg-black text-white' : 'bg-graySoft text-black lg:hover:bg-grayHover'} `}
                onClick={() => {
                  sectionControlSwitcher('setShowOtherUsers')
                  updateOtherUsers()
                }}
              >
                All People
              </button>
              <button
                className={`rounded-2xl pb-[4px] pl-[3px] pr-[3px] pt-[4px] text-[12.5px] font-semibold lg:rounded-3xl lg:p-2 lg:text-medium ${
                  showFriends ? 'bg-black text-white' : 'bg-graySoft text-black lg:hover:bg-grayHover'
                } `}
                onClick={() => {
                  sectionControlSwitcher('setShowFriends')
                  updateFriends()
                }}
              >
                Friends
              </button>
              <button
                className={`relative rounded-2xl pb-[6px] pl-[3px] pr-[3px] pt-[6px] text-[12.5px] font-semibold leading-4 lg:rounded-3xl lg:p-2 lg:text-medium ${
                  showReceivedFriendRequests ? 'bg-black text-white' : 'bg-graySoft text-black lg:hover:bg-grayHover'
                } `}
                onClick={() => {
                  sectionControlSwitcher('setShowReceivedFriendRequests')
                  updateReceivedFriendRequests()
                }}
              >
                <div
                  className={`absolute left-[85%] top-[-10%] flex h-[18px] w-[18px] items-center justify-center rounded-[50%] bg-red-500 text-white lg:rounded-3xl lg:p-2 ${
                    numOfReceivedFriendRequests > 0 ? 'opacity-1' : 'opacity-0'
                  }`}
                >
                  {numOfReceivedFriendRequests}
                </div>
                Friend Requests
              </button>
              <button
                className={`rounded-2xl pb-[6px] pl-[3px] pr-[3px] pt-[6px] text-[12.5px] font-semibold leading-4 lg:rounded-3xl lg:p-2 lg:text-medium ${
                  showSentFriendRequests ? 'bg-black text-white' : 'bg-graySoft text-black lg:hover:bg-grayHover'
                } `}
                onClick={() => {
                  sectionControlSwitcher('setShowSentFriendRequests')
                  updateSentFriendRequests()
                }}
              >
                Sent Requests
              </button>
            </div>
            <ThickSeparatorLine />
            <div className="font-mainFont pb-1 pl-4 pt-2 text-medium font-semibold">{pageTitle()}</div>
            <ThinSeparatorLine />
            <div className="lg grid justify-evenly justify-items-center lg:grid lg:grid-cols-[repeat(auto-fit,370px)] lg:pl-4 lg:pr-4">
              {populateUsersOnPage()}
            </div>
            {categoryMessage()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default People
