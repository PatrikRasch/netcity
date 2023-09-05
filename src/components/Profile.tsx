import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { db, storage } from "./../config/firebase.config";
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
} from "firebase/firestore";
import { getAuth, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";

import { useEmptyProfilePicture } from "./context/EmptyProfilePictureContextProvider";
import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserFirstName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserLastName } from "./context/LoggedInUserProfileDataContextProvider";
import { useLoggedInUserProfilePicture } from "./context/LoggedInUserProfileDataContextProvider";
// import { useLoggedInUserBio } from "./context/LoggedInUserProfileDataContextProvider";

// import { useLoadingScreen } from "./context/LoadingContextProvider";

import { PostData } from "../interfaces";

//6 Bug occurs when a private profile is visited (not friends with) and then the loggedInUser is instantly navigated to by clicking the profile picture.
//6 Problem is likely an async state update problem (regarding updating openProfileId)

const Profile = () => {
  //- Context declarations:
  const emptyProfilePicture = useEmptyProfilePicture();

  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName();
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName();

  const loggedInUserProfilePicture = useLoggedInUserProfilePicture();
  //- State declarations:
  const [visitingUser, setVisitingUser] = useState(false);
  const [showPosts, setShowPosts] = useState(true);
  const [otherFirstName, setOtherFirstName] = useState("");
  const [otherLastName, setOtherLastName] = useState("");
  const [otherProfilePicture, setOtherProfilePicture] = useState(emptyProfilePicture);

  const [dataLoaded, setDataLoaded] = useState(false);

  const [profilePictureUpload, setProfilePictureUpload] = useState<File | null>(null);
  const [bioText, setBioText] = useState("");

  const [openProfile, setOpenProfile] = useState(true);
  const [displayProfileContent, setDisplayProfileContent] = useState(false);

  const [friendsWithUser, setFriendsWithUser] = useState(false);
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);

  const [userDocRef, setUserDocRef] = useState<DocumentReference>();
  const [userData, setUserData] = useState<DocumentData>();
  const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>();

  //- Navigation declarations:
  const navigate = useNavigate();
  //- useParams:
  const { openProfileId } = useParams();

  const [posts, setPosts] = useState<PostData[]>([]);

  useEffect(() => {
    getLoggedInUserData();
    getUserData();
    friendStatusWithUser();
  }, []);

  useEffect(() => {
    publicOrPrivateProfile();
    showProfileContentOrNot();
  }, [openProfileId, userData, loggedInUserData]);

  useEffect(() => {
    showProfileContentOrNot();
  }, [openProfileId]);

  const loggedInUserDocRef = doc(db, "users", loggedInUserId);

  useEffect(() => {
    const getUserProfileStatus = async () => {
      const loggedInUserDocRef = doc(db, "users", loggedInUserId);
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      setOpenProfile(loggedInUserData?.openProfile);
    };
    getUserProfileStatus();
  }, []);

  useEffect(() => {
    if (loggedInUserId === openProfileId) setVisitingUser(false); // Viewing own profile
    if (loggedInUserId !== openProfileId) setVisitingUser(true); // Viewing someone else's profile
    // - Profile data includes all profile data apart from the posts
    const getOtherProfileData = async () => {
      if (!openProfileId) return null;
      if (openProfileId !== loggedInUserId) {
        try {
          // Get data for otherProfile (profile who's not logged in)
          const profileTargetUser = doc(db, "users", openProfileId);
          setUserDocRef(profileTargetUser);
          const profileTargetDoc = await getDoc(profileTargetUser);
          const profileData = profileTargetDoc.data();
          setOtherFirstName(profileData?.firstName);
          setOtherLastName(profileData?.lastName);
          setOtherProfilePicture(profileData?.profilePicture);
          setDataLoaded(true);
        } catch (err) {
          console.error(err);
        }
      }
    };
    getOtherProfileData();
  }, [openProfileId]);

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllPosts = async () => {
    try {
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, openProfileId); // Grabs the doc where the user is
      const postsProfileCollection = collection(userDocRef, "postsProfile"); // Grabs the postsProfile collection
      const sortedPostsProfile = query(postsProfileCollection, orderBy("timestamp", "desc")); // Sorts posts in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const unsubscribe = onSnapshot(sortedPostsProfile, (snapshot) => {
        const postsProfileDataArray: PostData[] = []; // Empty array that'll be used for updating state
        // Push each doc (post) into the postsProfileDataArray array.
        snapshot.forEach((doc) => {
          const postData = doc.data() as PostData; // "as PostData" is type validation
          postsProfileDataArray.push({ ...postData, id: doc.id }); // (id: doc.id adds the id of the individual doc)
        });
        setPosts(postsProfileDataArray); // Update state with all the posts
      }); // Gets all docs from postsProfile collection
    } catch (err) {
      console.error("Error trying to get all docs:", err);
    }
  };

  if (openProfileId === undefined) return null; //6. must make this better later

  const showPostsOrAbout = () => {
    if (!displayProfileContent) return;
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
          />
        </>
      );
    } else
      return (
        <>
          <About
            openProfileId={openProfileId} // Id of profile being viewed
            visitingUser={visitingUser}
            bioText={bioText}
            setBioText={setBioText}
          />
        </>
      );
  };

  //1 Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  //1 Also updates the user in the Firestore database with URL to the photo.
  const profilePictureClicked = async () => {
    if (profilePictureUpload === null) return; // Return if no imagine is uploaded
    const storageRef = ref(storage, `/profilePictures/${loggedInUserId}`); // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, profilePictureUpload); // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref); // Get the downloadURL for the image
      setOtherProfilePicture(downloadURL); // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      await updateDoc(userDocRef, { profilePicture: downloadURL }); // Add the image into Firestore
      alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err);
      //6 Need a "Something went wrong, please try again"
    }
  };

  const userSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("Signed out");
      navigate("/login");
    });
  };

  const displayProfilePicture = () => {
    if (!visitingUser) {
      return (
        <img
          src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
          alt="profile"
          className="rounded-[50%] aspect-square object-cover"
          onClick={() => profilePictureClicked()}
        />
      );
    }
    if (visitingUser) {
      return (
        <img
          src={otherProfilePicture === "" ? emptyProfilePicture : otherProfilePicture}
          alt="profile"
          className="rounded-[50%] aspect-square object-cover"
        />
      );
    }
  };

  const displayUserName = () => {
    if (!visitingUser) return loggedInUserFirstName + " " + loggedInUserLastName;
    if (visitingUser) return otherFirstName + " " + otherLastName;
  };

  // - Switches and updates openProfile in state and the backend
  const openOrPrivateProfileSwitcher = async () => {
    const loggedInUserDocRef = doc(db, "users", loggedInUserId);
    const loggedInUserDoc = await getDoc(loggedInUserDocRef);
    const loggedInUserData = loggedInUserDoc.data();

    if (loggedInUserData !== undefined) {
      const updatedValue = !loggedInUserData.openProfile;
      setOpenProfile(updatedValue);
      loggedInUserData.openProfile = updatedValue;
      await updateDoc(loggedInUserDocRef, { openProfile: updatedValue });
    }
  };

  // - The button for open/private profile
  const openProfileButton = () => {
    if (openProfileId !== loggedInUserId) return;
    return (
      <section className="pr-4 pt-2 grid absolute right-0 text-sm">
        <button
          className={`text-white rounded-md pb-[4px] pt-[4px] pl-[3px] pr-[3px] w-[100px] 
          ${openProfile ? "bg-[#00A7E1]" : "bg-red-500"} `}
          onClick={() => {
            openOrPrivateProfileSwitcher();
          }}
        >
          {openProfile ? "Open Profile" : "Private Profile"}
        </button>
      </section>
    );
  };

  // - Updates the state of the non-logged in user, used within the friend interaction functions below
  const updateUserData = async (newData: DocumentData) => {
    try {
      setUserData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  // - Updates the state of the logged in user, used within the friend interaction functions below
  const updateLoggedInUserData = async (newData: DocumentData) => {
    try {
      setLoggedInUserData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  const getUserData = async () => {
    try {
      const userDocRef = doc(db, "users", openProfileId);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      setUserData(userData);
    } catch (err) {
      console.error(err);
    }
  };

  const getLoggedInUserData = async () => {
    try {
      const loggedInUserDocRef = doc(db, "users", loggedInUserId);
      const loggedInUserDoc = await getDoc(loggedInUserDocRef);
      const loggedInUserData = loggedInUserDoc.data();
      setLoggedInUserData(loggedInUserData);
    } catch (err) {
      console.error(err);
    }
  };

  // - Checks if the content on a profile should be displayed or not
  const showProfileContentOrNot = async () => {
    if (openProfileId === loggedInUserId) setDisplayProfileContent(true);
    // Checks three things:
    // Is the profile not your own?
    // Is the profile you are visiting private?
    // Are you not friends with the user you are visiting?
    if (
      openProfileId !== loggedInUserId &&
      !userData?.openProfile &&
      !loggedInUserData?.friends.hasOwnProperty(openProfileId)
    ) {
      setDisplayProfileContent(false);
    } else {
      setDisplayProfileContent(true);
      getAllPosts();
    }
  };

  const publicOrPrivateProfile = () => {
    if (displayProfileContent) return;
    if (!displayProfileContent)
      return (
        <div>
          This profile is private. You need to be friends with this user to see their posts and to make posts on their
          page.
        </div>
      );
  };

  // - Friend interaction function → Send a friend request
  const sendFriendRequest = async () => {
    try {
      setSentFriendRequestToUser(true);
      await runTransaction(db, async (transaction) => {
        // Handle the user receiving the request → Prepare the new data
        const newCurrentReceivedFriendRequests = {
          ...userData?.currentReceivedFriendRequests,
          [loggedInUserId]: {},
        };
        // Update state
        const updatedUserData = { ...userData, currentReceivedFriendRequests: newCurrentReceivedFriendRequests };
        await updateUserData(updatedUserData);
        // Handle the user sending the request → Prepare the new data
        const newCurrentSentFriendRequests = {
          ...loggedInUserData?.currentSentFriendRequests,
          [openProfileId]: {},
        };
        // Update state
        const updatedLoggedInUserData = {
          ...loggedInUserData,
          currentSentFriendRequests: newCurrentSentFriendRequests,
        };
        await updateLoggedInUserData(updatedLoggedInUserData);
        // Run the transactions to update the backend
        if (userDocRef !== undefined) {
          transaction.update(userDocRef, {
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          });
          transaction.update(loggedInUserDocRef, {
            currentSentFriendRequests: newCurrentSentFriendRequests,
          });
        }
      });
    } catch (err) {
      setSentFriendRequestToUser(false);
      console.error(err);
    }
  };

  // - Friend interaction function → Remove a sent friend request
  const removeFriendRequest = async () => {
    // Update the user receiving the request
    try {
      setSentFriendRequestToUser(false);
      await runTransaction(db, async (transaction) => {
        // Delete friend request for both users (receiver & sender)
        if (
          userData?.currentReceivedFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentSentFriendRequests.hasOwnProperty(openProfileId)
        ) {
          delete userData?.currentReceivedFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentSentFriendRequests[openProfileId];

          // Handle the user receiving the request → Prepare the new data
          const newCurrentReceivedFriendRequests = { ...userData?.currentReceivedFriendRequests };
          // Update state
          const updatedUserData = {
            ...userData,
            currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
          };
          await updateUserData(updatedUserData);

          // Handle the user sending the request → Prepare the new data
          const newCurrentSentFriendRequests = { ...loggedInUserData?.currentSentFriendRequests };
          // Update state
          const updatedLoggedInUserData = {
            ...loggedInUserData,
            currentSentFriendRequests: newCurrentSentFriendRequests,
          };
          await updateLoggedInUserData(updatedLoggedInUserData);

          // Run the transactions to update the backend
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, {
              currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
            });
            transaction.update(loggedInUserDocRef, {
              currentSentFriendRequests: newCurrentSentFriendRequests,
            });
          }
        }
      });
    } catch (err) {
      setSentFriendRequestToUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Accept a received friend request
  const acceptFriendRequest = async () => {
    try {
      // Update the user accepting the request
      setReceivedFriendRequestFromUser(false);
      setFriendsWithUser(true);
      await runTransaction(db, async (transaction) => {
        // Handling the user who sent the request first → Prepare the new data
        const newCurrentFriendsSender = { ...userData?.friends, [loggedInUserId]: {} };
        delete userData?.currentSentFriendRequests[loggedInUserId]; // Delete sent request
        // Handling the user who received the request → Prepare the new data
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [openProfileId]: {} };
        delete loggedInUserData?.currentReceivedFriendRequests[openProfileId];
        // Run the transactions to update the backend
        if (userDocRef !== undefined) {
          transaction.update(userDocRef, {
            friends: newCurrentFriendsSender,
            currentSentFriendRequests: { ...userData?.currentSentFriendRequests },
          });
          transaction.update(loggedInUserDocRef, {
            friends: newCurrentFriendsReceiver,
            currentReceivedFriendRequests: {
              ...loggedInUserData?.currentReceivedFriendRequests,
            },
          });
        }
      });
    } catch (err) {
      setReceivedFriendRequestFromUser(true);
      setFriendsWithUser(false);
      console.error(err);
    }
  };

  // - Friend interaction function → Decline a received friend request
  const declineFriendRequest = async () => {
    try {
      setReceivedFriendRequestFromUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.currentSentFriendRequests.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.currentSentFriendRequests[loggedInUserId];
          delete loggedInUserData?.currentReceivedFriendRequests[openProfileId];

          // Handle the user receiving the request
          const newCurrentSentFriendRequests = { ...userData?.currentSentFriendRequests }; // Prepare the new data

          // Handle the user sending the request
          const newCurrentReceivedFriendRequests = { ...loggedInUserData?.currentReceivedFriendRequests }; // Prepare the new data

          // Run the transactions for the backend
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, {
              currentSentFriendRequests: newCurrentSentFriendRequests,
            });
            transaction.update(loggedInUserDocRef, {
              currentReceivedFriendRequests: newCurrentReceivedFriendRequests,
            });
          }
        }
      });
    } catch (err) {
      setReceivedFriendRequestFromUser(true);
      console.error(err);
    }
  };

  // - Friend interaction function → Delete a current friend
  const deleteFriend = async () => {
    try {
      setFriendsWithUser(false);
      await runTransaction(db, async (transaction) => {
        // Checks that the two people are already friends before proceeding
        if (
          userData?.friends.hasOwnProperty(loggedInUserId) &&
          loggedInUserData?.friends.hasOwnProperty(openProfileId)
        ) {
          // Deletes the users from each other's state
          delete userData?.friends[loggedInUserId];
          delete loggedInUserData?.friends[openProfileId];
          // Prepares new data to be sent to Firebase
          const newUserFriends = { ...userData?.friends };
          const newLoggedInUserFriends = { ...loggedInUserData?.friends };
          // Updates Firebase with the new data
          if (userDocRef !== undefined) {
            transaction.update(userDocRef, { friends: newUserFriends });
            transaction.update(loggedInUserDocRef, { friends: newLoggedInUserFriends });
          }
        }
      });
    } catch (err) {
      setFriendsWithUser(true);
      console.error(err);
    }
  };

  // - Checks the current friend status the loggedInUser has with the user
  const friendStatusWithUser = async () => {
    const loggedInUserDocRef = doc(db, "users", loggedInUserId);
    const loggedInUserDoc = await getDoc(loggedInUserDocRef);
    const loggedInUserData = loggedInUserDoc.data();
    if (loggedInUserData?.friends.hasOwnProperty(openProfileId)) {
      setFriendsWithUser(true);
    } else {
      setFriendsWithUser(false);
    }
    if (loggedInUserData?.currentSentFriendRequests.hasOwnProperty(openProfileId)) {
      setSentFriendRequestToUser(true);
    } else {
      setSentFriendRequestToUser(false);
    }
    if (loggedInUserData?.currentReceivedFriendRequests.hasOwnProperty(openProfileId)) {
      setReceivedFriendRequestFromUser(true);
    } else {
      setReceivedFriendRequestFromUser(false);
    }
  };

  const friendStatusWithUserJSX = () => {
    if (friendsWithUser)
      return <button className="bg-green-400 text-white rounded-lg w-[190px] h-[40px]">Friends</button>;
    if (sentFriendRequestToUser)
      return (
        <button
          className="bg-gray-400 text-white rounded-lg w-[190px] h-[40px]"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              removeFriendRequest();
            }
          }}
        >
          Friend Request Sent
        </button>
      );
    if (receivedFriendRequestFromUser)
      return (
        <div className="grid grid-rows-[20px,50px] items-center justify-items-center">
          <div className="text-center">Sent you a friend request</div>
          <div className="grid grid-cols-2 gap-4 w-[190px]">
            <button
              className="bg-[#00A7E1] text-white rounded-lg h-[40px]"
              onClick={() => {
                if (userDocRef && userData && loggedInUserData) {
                  acceptFriendRequest();
                }
              }}
            >
              Accept
            </button>
            <button
              className="bg-red-400 text-white rounded-lg h-[40px]"
              onClick={() => {
                if (userDocRef && userData && loggedInUserData) {
                  declineFriendRequest();
                }
              }}
            >
              Decline
            </button>
          </div>
        </div>
      );
    else
      return (
        <button
          className="bg-[#00A7E1] text-white rounded-lg w-[190px] h-[40px]"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              sendFriendRequest();
            }
          }}
        >
          Add Friend
        </button>
      );
  };

  const showFriendStatusWithUser = () => {
    if (loggedInUserId === openProfileId) return;
    else
      return (
        <div className="grid justify-center">
          <div className="flex justify-center items-center p-2">{friendStatusWithUserJSX()}</div>
        </div>
      );
  };

  return (
    <div>
      {/* // - Open/Private profile button */}
      {openProfileButton()}
      {/*//1 Profile picture and name */}
      <div className="grid grid-cols-[120px,1fr] items-center justify-center gap-4 pl-8 pr-8 pt-4 pb-4">
        <div>
          <label htmlFor="fileInput">{displayProfilePicture()}</label>
          <input
            type="file"
            id="fileInput"
            className="opacity-0 hidden"
            onChange={(e) => setProfilePictureUpload(e.target.files?.[0] || null)}
            disabled={visitingUser} // Disables fileInput if it's not your profile
          />
        </div>
        <div className="text-3xl">{displayUserName()}</div>
      </div>

      {/* // - Friend status */}
      {showFriendStatusWithUser()}

      {/*// - Posts/About selection */}
      <div className="grid w-[100svw] justify-center p-2">
        <div className="flex w-[65svw] rounded-lg h-12 border-2 border-black">
          <button
            className={`${
              showPosts ? "bg-[#00A7E1] text-white" : ""
            }  w-[100%] h-[100%] flex justify-center rounded-tl-md rounded-bl-md items-center`}
            onClick={() => setShowPosts(true)}
          >
            Posts
          </button>
          <button
            className={`${
              !showPosts ? "bg-[#00A7E1] text-white" : ""
            } w-[100%] flex justify-center rounded-tr-md rounded-br-md items-center`}
            onClick={() => setShowPosts(false)}
          >
            About
          </button>
        </div>
      </div>

      <div className="w-full h-[12px] bg-gray-100"></div>
      {/*//1 Posts or About */}
      <div>{publicOrPrivateProfile()}</div>
      <div>{showPostsOrAbout()}</div>
      <div className="w-full h-[15px] bg-gray-100"></div>
      <button onClick={() => userSignOut()}>{openProfileId === loggedInUserId ? "Sign out" : ""}</button>
    </div>
  );
};

export default Profile;

//6 Could change profilePicture in Firebase to be "pfPicture" or just "picture" in order to keep naming more concise. Currently it's a bit confusing as we are using "profilePicture" to indicate that it's the picture to be used on the profile being viewing, and "userPicture" to point to the picture of the viewer.

//1 Feature work plan:
//3 1. Fetch the data from firestore and display firstname + lastname
//3       Gotta match the user from auth to users and then fetch the data
//3 2. Allow user to make post. When text input and post clicked, add post to firebase user's post
//3 3. Set up routing to about when about it clicked
//3 4. Set up routing to and from public

//3 It's going to be a problem down the line to separate a visiting user from the profile the
//3 user is viewing. As of now I think it all goes under the same umbrella. We'll see.

//3 When a user visits another user:
//3   Perhaps having a UUID id for each user which would be
//3   the route for a users profile would be a good idea.
//3   So that when a user visits another user, the URL holds their UUID id.
//3     Might also be able to use the userId for this, but that might cause security issues.
//3 When a user visits another user, check if the userId matches the currently signed in user?...

//3 Have to run a check to see if userProfileId matches logged in userId
//3 If it does, display home profile and pass userId to profile
//3 If it doesn't, pass userProfileId to the top (profile header), userId to MakePost, and let posts fetch their own

//3 Currently, whenever this (Profile) component is navigated to, the getAllPosts(); effect is ran.
//3 This is not necessary.

//3 Only want getAllPosts() to run on initial load and when "posts" state changes
//3 Store an "initialLoadCompleted: true" in localStorage after posts have been fetched
//3 If there isn't any "initialLoadCompleted: true" in localStorage, run getAllPosts()
//3 Run getAllPosts() whenever a post is altered or a new post is added.
//3   Have a useEffect that only runs if there is no initialLoadCompleted on mount
