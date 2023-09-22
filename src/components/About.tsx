import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { loadingSkeletonTheme } from './SkeletonTheme'

import signoutIconWhite from '../assets/icons/signoutIcon/signoutIconWhite.png'
import imageIcon from '../assets/icons/imageIcon/imageIcon.png'
import editIcon from '../assets/icons/editIcon/editIcon.svg'

import { db, storage } from './../config/firebase.config'
import { updateDoc, doc, getDoc, collection } from 'firebase/firestore'
//2 If the logged in user matches the current open profile, show "edit" button
//2 When edit button is clicked, the input field(s) become editable.
//2 The edit button also turns into a "save" button
//2 When the save button is clicked, state is updated to reflect the changes

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import { getAuth, signOut } from 'firebase/auth'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'

interface Props {
  openProfileId: string
  visitingUser: boolean
  bioText: string
  setBioText: (value: string) => void
  featuredPhoto: string
  setFeaturedPhoto: (value: string) => void
  displayUserName: () => string | undefined
}

const About = ({
  openProfileId,
  visitingUser,
  bioText,
  setBioText,
  featuredPhoto,
  setFeaturedPhoto,
  displayUserName,
}: Props) => {
  const { loggedInUserId } = useLoggedInUserId()
  const [editButtonText, setEditButtonText] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [bioRows, setBioRows] = useState(5)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [componentLoading, setComponentLoading] = useState(true)

  const featuredPhotoRef = useRef<HTMLImageElement>(null)

  const navigate = useNavigate()

  useEffect(() => {
    setEditButtonText(editMode ? 'Save bio' : 'Edit bio')
  }, [editMode])

  useEffect(() => {
    if (featuredPhoto === undefined) setComponentLoading(false)
  }, [])

  const saveAboutInput = async () => {
    if (!editMode) return
    // - Write bioText to logged in user profile bio
    const loggedInUserDoc = doc(db, 'users', loggedInUserId)
    await updateDoc(loggedInUserDoc, { bio: bioText })
  }

  const showEditButton = () => {
    if (visitingUser) return
    return (
      <button
        className="font-mainFont flex w-[90svw] items-center justify-center gap-1 rounded-3xl bg-purpleSoft p-1 text-center text-medium font-semibold text-purpleMain lg:w-[clamp(400px,55svw,1400px)]"
        onClick={() => {
          setEditMode(!editMode)
          saveAboutInput()
        }}
      >
        <img src={editIcon} alt="" className="w-[15px]" />
        <div>{editButtonText}</div>
      </button>
    )
  }

  // - Changes the height of the input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 1 // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24) // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows - 1 // Sets new number of rows
    setBioRows(textarea.rows)
  }

  const aboutInformation = () => {
    if (!editMode) {
      return (
        <div className="grid justify-center justify-items-center gap-3 p-3 lg:w-[clamp(600px,60svw,1500px)]">
          <div
            className="font-mainFont w-[90svw] rounded-3xl bg-purpleMain p-1 text-center text-large font-semibold text-white 
          lg:w-[clamp(400px,55svw,1400px)]"
          >
            Bio
          </div>
          <div className="min-h-min w-[90svw] resize-none break-words rounded-3xl bg-graySoft p-4 text-center text-grayMain lg:w-[clamp(400px,55svw,1400px)]">
            {bioText}
          </div>
          {showEditButton()}
        </div>
      )
    }
    if (editMode)
      return (
        <div className="grid justify-center justify-items-center gap-3 p-3 lg:w-[clamp(600px,60svw,1500px)]">
          <div className="font-mainFont w-[90svw] rounded-3xl bg-purpleMain p-1 text-center text-large font-semibold text-white lg:w-[clamp(400px,55svw,1400px)]">
            Bio
          </div>
          <textarea
            ref={textareaRef}
            placeholder="Write a bio about yourself"
            className="min-h-min w-[90svw] resize-none break-words rounded-3xl bg-graySoft p-4 text-center text-grayMain lg:w-[clamp(400px,55svw,1400px)]"
            onChange={(e) => {
              setBioText(e.target.value)
              handleTextareaChange()
            }}
            value={bioText}
            maxLength={3000}
            rows={bioRows}
          ></textarea>
          {showEditButton()}
        </div>
      )
  }

  // - FEATURED PHOTO LOGIC
  const featuredPhotoSection = () => {
    return (
      <div>
        <div className="flex items-center gap-3 p-3 pl-6 pr-6 font-semibold">
          <img src={imageIcon} alt="" className="w-[25px]" />
          <div className="text-medium">Featured Photo</div>
          {visitingUser ? (
            ''
          ) : (
            <>
              <label
                htmlFor="featuredPhotoInput"
                className="flex justify-center gap-1 rounded-3xl bg-purpleSoft pl-5 pr-5 text-medium text-purpleMain hover:cursor-pointer"
              >
                <img src={editIcon} alt="" className="w-[12px]" />
                <div>Edit</div>
              </label>
              <input
                type="file"
                id="featuredPhotoInput"
                className="opacity-0"
                hidden
                onChange={(e) => {
                  uploadFeaturedPhoto(e.target.files?.[0] || null)
                }}
                disabled={visitingUser} // Disables fileInput if it's not your profile
              />
            </>
          )}
        </div>
        <div className="h-[1.5px] w-full bg-grayLineThin"></div>
        {displayFeaturedPhoto()}
        {componentLoading && <div className="h-[500px] p-3 pl-6 pr-6">{loadingSkeletonTheme(15)}</div>}
      </div>
    )
  }

  const displayFeaturedPhoto = () => {
    if (featuredPhoto === undefined && loggedInUserId !== openProfileId)
      return (
        <div className="grid items-center justify-items-center  p-2">
          <div className="text-grayMain">The user hasn't chosen a featured photo yet</div>
        </div>
      )
    if (featuredPhoto === undefined)
      return (
        <div className="grid items-center justify-items-center p-2">
          <div className="p-2">Upload a featured photo, click "Edit"</div>
        </div>
      )
    return (
      <div className="grid justify-center">
        <img
          src={featuredPhoto}
          ref={featuredPhotoRef}
          alt="featured on profile"
          className="rounded-3xl object-cover p-4"
          onLoad={() => {
            setComponentLoading(false)
          }}
        />
      </div>
    )
  }

  // - Allows user to select profile picture. Writes and stores the profile picture in Firebase Storage.
  // - Also updates the user in the Firestore database with URL to the photo.
  const uploadFeaturedPhoto = async (newFeaturedPhoto: File | null) => {
    if (newFeaturedPhoto === null) return // Return if no imagine is uploaded
    const storageRef = ref(storage, `/featuredPhotos/${loggedInUserId}`) // Connect to storage
    try {
      const uploadedPicture = await uploadBytes(storageRef, newFeaturedPhoto) // Upload the image
      const downloadURL = await getDownloadURL(uploadedPicture.ref) // Get the downloadURL for the image
      setFeaturedPhoto(downloadURL) // Set the downloadURL for the image in state to use across the app.
      // Update Firestore Database with image:
      const usersCollectionRef = collection(db, 'users') // Grabs the users collection
      const userDocRef = doc(usersCollectionRef, loggedInUserId) // Grabs the doc where the user is
      await updateDoc(userDocRef, { featuredPhoto: downloadURL }) // Add the image into Firestore
    } catch (err) {
      console.error(err)
      //6 Need a "Something went wrong, please try again"
    }
  }

  // - SIGN OUT LOGIC
  const userSignOut = () => {
    const auth = getAuth()
    signOut(auth).then(() => {
      navigate('/login')
    })
  }

  const signOutButton = () => {
    return (
      <div className="flex justify-center p-4">
        <button
          className={`${
            openProfileId === loggedInUserId ? '' : 'hidden'
          } flex items-center gap-2 rounded-3xl bg-black pb-2 pl-9 pr-9 pt-2 font-semibold text-white`}
          onClick={() => userSignOut()}
        >
          <img src={signoutIconWhite} alt="" className="w-[20px] fill-white" />
          <div>Sign out</div>
        </button>
      </div>
    )
  }

  return (
    <div className="lg:w-[clamp(600px,60svw,1500px)] lg:bg-white">
      {aboutInformation()}
      <div className="h-[7px] w-full bg-grayLineThick"></div>
      {featuredPhotoSection()}
      <div className="h-[7px] w-full bg-grayLineThick"></div>
      {signOutButton()}
    </div>
  )
}

export default About
