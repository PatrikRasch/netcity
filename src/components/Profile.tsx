import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import profileEllipse from "../assets/icons/profileEllipse.svg";
import globalIconWhite from "../assets/icons/globalIcon/globalIconWhite.svg";
import starIconGrayFilled from "../assets/icons/starIcon/starIconGrayFilled.svg";
import checkIcon from "../assets/icons/checkIcon/checkIcon.svg";
import lockIcon from "../assets/icons/lockIcon/lockIcon.png";

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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import MakePost from "./MakePost";
import AllPosts from "./AllPosts";
import About from "./About";

import LoadingBar from "./LoadingBar";
import LoadingScreen from "./LoadingScreen";
import { loadingSkeletonTheme } from "./SkeletonTheme";

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

  const [bioText, setBioText] = useState("");

  const [openProfile, setOpenProfile] = useState(true);
  const [displayProfileContent, setDisplayProfileContent] = useState(false);

  const [friendsWithUser, setFriendsWithUser] = useState(false);
  const [sentFriendRequestToUser, setSentFriendRequestToUser] = useState(false);
  const [receivedFriendRequestFromUser, setReceivedFriendRequestFromUser] = useState(false);

  const [userDocRef, setUserDocRef] = useState<DocumentReference>();
  const [userData, setUserData] = useState<DocumentData>();
  const [loggedInUserData, setLoggedInUserData] = useState<DocumentData>();

  const [isDeleteFriendDropdownMenuOpen, setIsDeleteFriendDropdownMenuOpen] = useState(false);

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
  }, [openProfileId, friendsWithUser]);

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
            context={"profile"}
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

  // - Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  // - Also updates the user in the Firestore database with URL to the photo.
  const uploadProfilePicture = async (newProfilePicture: File | null) => {
    if (newProfilePicture === null) return; // Return if no imagine is uploaded
    const storageRef = ref(storage, `/profilePictures/${loggedInUserId}`); // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, newProfilePicture); // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref); // Get the downloadURL for the image
      setOtherProfilePicture(downloadURL); // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      await updateDoc(userDocRef, { profilePicture: downloadURL }); // Add the image into Firestore
      // alert("Profile picture uploaded"); //6 Should be sexified
    } catch (err) {
      console.error(err);
      //6 Need a "Something went wrong, please try again"
    }
  };

  const displayProfilePicture = () => {
    if (!visitingUser) {
      return (
        <img
          src={loggedInUserProfilePicture === "" ? emptyProfilePicture : loggedInUserProfilePicture}
          alt="profile"
          className="rounded-[50%] object-cover w-[150px] h-[150px] aspect-square border-white border-4"
        />
      );
    }
    if (visitingUser) {
      return (
        <img
          src={otherProfilePicture === "" ? emptyProfilePicture : otherProfilePicture}
          alt="profile"
          className="rounded-[50%] object-cover w-[150px] h-[150px] aspect-square border-white border-4 z-10"
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
      <button
        className={`grid grid-cols-[2fr,4fr] pl-2 pr-2 items-center absolute bottom-[60px] left-[16px] text-verySmall z-10 text-white rounded-3xl w-[90px] h-[40px] text-start gap-1 ${
          openProfile ? "bg-purpleMain" : "bg-redMain"
        } `}
        onClick={() => {
          openOrPrivateProfileSwitcher();
        }}
      >
        <img src={globalIconWhite} alt="" className="w-[25px]" />
        <div>{openProfile ? "Open Profile" : "Private Profile"}</div>
      </button>
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
        <div className="flex flex-col justify-center items-center text-center pt-8 gap-2">
          <img src={lockIcon} alt="" className="max-w-[30svw]" />
          <div className="font-bold text-large">This Account is Private</div>
          <div className="max-w-[50svw] opacity-70">
            You need to be friends to see their posts & make posts on their page
          </div>
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
        // Update state
        const updatedUserData = { ...userData, friends: newCurrentFriendsSender };
        await updateUserData(updatedUserData);

        // Handling the user who received the request → Prepare the new data
        const newCurrentFriendsReceiver = { ...loggedInUserData?.friends, [openProfileId]: {} };
        delete loggedInUserData?.currentReceivedFriendRequests[openProfileId];
        // Update state
        const updatedLoggedInUserData = { ...loggedInUserData, friends: newCurrentFriendsReceiver };
        await updateLoggedInUserData(updatedLoggedInUserData);

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

  const deleteFriendDropdownMenuJSX = () => {
    if (isDeleteFriendDropdownMenuOpen)
      return (
        <div>
          <div className="grid grid-cols-2 w-[190px] h-[40px]">
            <button
              className="bg-purpleSoft text-purpleMain rounded-tl-3xl rounded-bl-3xl"
              onClick={() => {
                setIsDeleteFriendDropdownMenuOpen(
                  (prevIsDeleteFriendDropdownMenuOpen) => !prevIsDeleteFriendDropdownMenuOpen
                );
              }}
            >
              Cancel
            </button>
            <button
              className="bg-redMain text-redSoft rounded-tr-3xl rounded-br-3xl"
              onClick={() => {
                deleteFriend();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      );
    if (!isDeleteFriendDropdownMenuOpen)
      return (
        <div>
          <button
            className="bg-purpleSoft text-purpleMain font-mainFont text-[17px] rounded-3xl w-[190px] h-[40px] flex justify-center items-center gap-1"
            onClick={() => {
              setIsDeleteFriendDropdownMenuOpen(
                (prevIsDeleteFriendDropdownMenuOpen) => !prevIsDeleteFriendDropdownMenuOpen
              );
            }}
          >
            <img src={starIconGrayFilled} alt="" className="w-[30px]" />
            Friends
          </button>
        </div>
      );
  };

  const friendStatusWithUserJSX = () => {
    if (friendsWithUser) {
      return deleteFriendDropdownMenuJSX();
    }

    if (sentFriendRequestToUser)
      return (
        <button
          className="bg-graySoft text-black font-mainFont text-[17px] rounded-3xl w-[190px] h-[40px] flex justify-center items-center gap-1"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              removeFriendRequest();
            }
          }}
        >
          <img src={checkIcon} alt="" className="w-[30px]" />
          Requested
        </button>
      );
    if (receivedFriendRequestFromUser)
      return (
        <div className="flex w-[100svw] justify-evenly">
          <button
            className="bg-purpleMain text-white font-mainFont text-[15px] rounded-3xl w-[220px] h-[40px] flex justify-center items-center gap-1"
            onClick={() => {
              if (userDocRef && userData && loggedInUserData) {
                acceptFriendRequest();
              }
            }}
          >
            <img src={checkIcon} alt="" className="w-[25px]" />
            Accept Friend Request
          </button>
          <button
            className="bg-graySoft text-black rounded-3xl h-[40px] w-[115px] text-[15px]"
            onClick={() => {
              if (userDocRef && userData && loggedInUserData) {
                declineFriendRequest();
              }
            }}
          >
            Deny
          </button>
        </div>
      );
    else
      return (
        <button
          className="bg-purpleMain text-white font-mainFont text-[17px] rounded-3xl w-[190px] h-[40px] flex justify-center items-center gap-1"
          onClick={() => {
            if (userDocRef && userData && loggedInUserData) {
              sendFriendRequest();
            }
          }}
        >
          + Add Friend
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
      {/*//1 Profile picture and name */}
      <div className="flex justify-center">
        <div className="w-[93svw] absolute bg-purpleSoft h-[200px] top-[0%] rounded-3xl z-0">
          {/* // - Open/Private profile button */}
          {openProfileButton()}
        </div>
      </div>
      <div className="grid items-center justify-center gap-2 pl-8 pr-8 pt-4">
        <div className="relative">
          <label htmlFor="fileInput" className="h-max flex justify-center hover:cursor-pointer">
            {displayProfilePicture()}
          </label>
          <input
            type="file"
            id="fileInput"
            className="opacity-0"
            hidden
            onChange={(e) => {
              uploadProfilePicture(e.target.files?.[0] || null);
            }}
            disabled={visitingUser} // Disables fileInput if it's not your profile
          />
        </div>
        <div className="text-3xl font-mainFont font-bold text-center pb-4">{displayUserName()}</div>
      </div>

      {/* // - Friend status */}
      {showFriendStatusWithUser()}

      <div className="w-full h-[1.5px] bg-grayLineThin"></div>

      {/*// - Posts/About selection */}
      <div className="grid grid-cols-2 gap-4 pl-4 pr-4 rounded-lg h-[65px] p-3">
        <button
          className={`${
            showPosts ? "bg-black text-white" : "bg-graySoft text-black"
          }  w-[100%] h-[100%] flex justify-center rounded-3xl items-center font-mainFont font-bold`}
          onClick={() => setShowPosts(true)}
        >
          Posts
        </button>
        <button
          className={`${
            !showPosts ? "bg-black text-white" : "bg-graySoft text-black"
          } w-[100%] flex justify-center rounded-3xl items-center font-mainFont font-bold`}
          onClick={() => setShowPosts(false)}
        >
          About Me
        </button>
      </div>

      <div className="w-full h-[7px] bg-grayLineThick"></div>
      {/*//1 Posts or About */}
      <div>{publicOrPrivateProfile()}</div>
      <div>{showPostsOrAbout()}</div>
    </div>
  );
};

export default Profile;

//6 Could change profilePicture in Firebase to be "pfPicture" or just "picture" in order to keep naming more concise. Currently it's a bit confusing as we are using "profilePicture" to indicate that it's the picture to be used on the profile being viewing, and "userPicture" to point to the picture of the viewer.
