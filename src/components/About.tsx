import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import signoutIconWhite from "../assets/icons/signoutIcon/signoutIconWhite.png";
import imageIcon from "../assets/icons/imageIcon/imageIcon.png";

import { db, storage } from "./../config/firebase.config";
import { updateDoc, doc, getDoc, collection } from "firebase/firestore";
//2 If the logged in user matches the current open profile, show "edit" button
//2 When edit button is clicked, the input field(s) become editable.
//2 The edit button also turns into a "save" button
//2 When the save button is clicked, state is updated to reflect the changes

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

import { getAuth, signOut } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface Props {
  openProfileId: string;
  visitingUser: boolean;
  bioText: string;
  setBioText: (value: string) => void;
}

const About = ({ openProfileId, visitingUser, bioText, setBioText }: Props) => {
  const { loggedInUserId } = useLoggedInUserId();
  const [editButtonText, setEditButtonText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [bioRows, setBioRows] = useState(5);
  const [featuredPhoto, setFeaturedPhoto] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUserAbout = async () => {
      if (!loggedInUserId) return;
      const openProfileDoc = doc(db, "users", openProfileId);
      try {
        const openProfileData = await getDoc(openProfileDoc);
        const data = openProfileData.data();
        setBioText(data?.bio);
      } catch (err) {
        console.error(err);
      }
    };
    loadUserAbout();
  }, []);

  useEffect(() => {
    setEditButtonText(editMode ? "Save bio" : "Edit bio");
  }, [editMode]);

  const saveAboutInput = async () => {
    if (!editMode) return;
    // - Write bioText to logged in user profile bio
    const loggedInUserDoc = doc(db, "users", loggedInUserId);
    await updateDoc(loggedInUserDoc, { bio: bioText });
  };

  const showEditButton = () => {
    if (visitingUser) return;
    return (
      <button
        className="text-medium font-mainFont bg-purpleSoft font-semibold text-purpleMain w-[90svw] p-1 text-center rounded-3xl"
        onClick={() => {
          setEditMode(!editMode);
          saveAboutInput();
        }}
      >
        {editButtonText}
      </button>
    );
  };

  // - Changes the height of the input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.rows = 1; // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight; // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24); // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows - 1; // Sets new number of rows
    setBioRows(textarea.rows);
  };

  const aboutInformation = () => {
    if (!editMode) {
      return (
        <div className="grid justify-items-center p-3 gap-3">
          <div className="text-large font-mainFont bg-purpleMain font-semibold text-white w-[90svw] p-1 text-center rounded-3xl">
            Bio
          </div>
          <div className="w-[90svw] min-h-min p-4 break-words resize-none bg-graySoft text-grayMain rounded-3xl text-center">
            {bioText}
          </div>
          {showEditButton()}
        </div>
      );
    }
    if (editMode)
      return (
        <div className="grid justify-items-center p-3 gap-3">
          <div className="text-large font-mainFont bg-purpleMain font-semibold text-white w-[90svw] p-1 text-center rounded-3xl">
            Bio
          </div>
          <textarea
            ref={textareaRef}
            placeholder="Write a bio about yourself"
            className="w-[90svw] min-h-min p-4 break-words resize-none bg-graySoft text-grayMain rounded-3xl text-center"
            onChange={(e) => {
              setBioText(e.target.value);
              handleTextareaChange();
            }}
            value={bioText}
            maxLength={3000}
            rows={bioRows}
          ></textarea>
          {showEditButton()}
        </div>
      );
  };

  // - FEATURED PHOTO LOGIC
  const featuredPhotoSection = () => {
    return (
      <div>
        <div className="grid grid-cols-[1fr,9fr,1fr] pl-6 pr-6">
          <img src={imageIcon} alt="" className="w-[25px]" />
          <div>Featured Photo</div>
          <div>Edit</div>
        </div>
        Featured photo is currently a work in progress
        <div className="w-full h-[1.5px] bg-grayLineThin"></div>
        <label htmlFor="fileInput" className="h-max flex justify-center hover:cursor-pointer">
          {/* {displayFeaturedPhoto()} */}
        </label>
        <input
          type="file"
          id="fileInput"
          className="opacity-0"
          hidden
          onChange={(e) => {
            uploadFeaturedPhoto(e.target.files?.[0] || null);
          }}
          disabled={visitingUser} // Disables fileInput if it's not your profile
        />
        <div></div>
      </div>
    );
  };

  const displayFeaturedPhoto = () => {
    return (
      <img
        src={featuredPhoto === "" ? "emptyProfilePicture" : featuredPhoto}
        alt="profile"
        className="rounded-[50%] object-cover w-[150px] h-[150px] aspect-square border-white border-4"
      />
    );
  };

  // - Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  // - Also updates the user in the Firestore database with URL to the photo.
  const uploadFeaturedPhoto = async (newProfilePicture: File | null) => {
    if (newProfilePicture === null) return; // Return if no imagine is uploaded
    const storageRef = ref(storage, `/featuredPhotos/${loggedInUserId}`); // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, newProfilePicture); // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref); // Get the downloadURL for the image
      setFeaturedPhoto(downloadURL); // Set the downloadURL for the image in state to use across the app.
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

  // - SIGN OUT LOGIC
  const userSignOut = () => {
    const auth = getAuth();
    signOut(auth).then(() => {
      console.log("Signed out");
      navigate("/login");
    });
  };

  const signOutButton = () => {
    return (
      <div className="flex justify-center p-4">
        <button
          className={`${
            openProfileId === loggedInUserId ? "" : "hidden"
          } font-semibold bg-black rounded-3xl text-white pt-2 pb-2 pl-9 pr-9 flex gap-2 items-center`}
          onClick={() => userSignOut()}
        >
          <img src={signoutIconWhite} alt="" className="fill-white w-[20px]" />
          <div>Sign out</div>
        </button>
      </div>
    );
  };

  return (
    <div>
      {aboutInformation()}
      {featuredPhotoSection()}
      {signOutButton()}
    </div>
  );
};

export default About;
