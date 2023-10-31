import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { loadingSkeletonTheme } from './SkeletonTheme'

import signoutWhiteEmpty from '../assets/icons/signout/signoutWhiteEmpty.webp'
import imageBlackEmpty from '../assets/icons/image/imageBlackEmpty.webp'
import imageGrayEmpty from '../assets/icons/image/imageGrayEmpty.webp'
import editPurpleFilled from '../assets/icons/edit/editPurpleFilled.svg'

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
    if (editMode) {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(textareaRef.current?.value.length, textareaRef.current?.value.length)
    }
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
        className="font-mainFont lg:w-min-[400px] lg:w-max-[1400px] flex w-full items-center justify-center gap-1 rounded-3xl bg-purpleSoft p-1 text-center text-medium font-semibold text-purpleMain lg:pl-8 lg:pr-8 lg:hover:bg-purpleHoverSoft"
        onClick={() => {
          setEditMode(!editMode)
          saveAboutInput()
        }}
      >
        <img src={editPurpleFilled} alt="" className="w-[20px]" />
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
        <div className="grid w-full justify-items-center gap-3 p-3 pl-4 pr-4 lg:w-[clamp(600px,55svw,1500px)] lg:pl-8 lg:pr-8">
          <div
            className="font-mainFont lg:w-min-[400px] lg:w-max-[1400px] w-full rounded-3xl bg-purpleMain p-1 text-center text-large 
          font-semibold text-white"
          >
            Bio
          </div>
          <div className="lg:w-min-[400px] lg:w-max-[1400px] min-h-min w-full resize-none break-words rounded-3xl bg-graySoft p-4 text-center text-grayMain">
            {bioText}
          </div>
          {showEditButton()}
        </div>
      )
    }
    if (editMode)
      return (
        <div className="lg:w-min-[600px] lg:w-max-[1500px] grid w-full justify-items-center gap-3 p-3 lg:pl-8 lg:pr-8">
          <div className="font-mainFont lg:w-min-[400px] lg:w-max-[1400px] w-full rounded-3xl bg-purpleMain p-1 text-center text-large font-semibold text-white">
            Bio
          </div>
          <textarea
            ref={textareaRef}
            placeholder="Write a bio about yourself"
            className="lg:w-min-[400px] lg:w-max-[1400px] min-h-min w-full resize-none break-words rounded-3xl bg-graySoft p-4 text-center text-grayMain"
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
          <img src={imageGrayEmpty} alt="" className="w-[25px]" />
          <div className="text-medium">Featured Photo</div>
          {visitingUser ? (
            ''
          ) : (
            <>
              <label
                htmlFor="featuredPhotoInput"
                className="flex justify-center gap-1 rounded-3xl bg-purpleSoft pl-5 pr-5 text-medium text-purpleMain hover:cursor-pointer lg:hover:bg-purpleHoverSoft"
              >
                <img src={editPurpleFilled} alt="" className="h-[17px] w-[17px] self-center" />
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
          className={`rounded-3xl object-cover p-4 ${componentLoading ? 'hidden' : ''}`}
          onLoad={() => {
            setComponentLoading(false)
          }}
        />
        {componentLoading && <div className="h-[500px] p-3 pl-6 pr-6">{loadingSkeletonTheme(20)}</div>}
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
          } flex items-center gap-2 rounded-3xl bg-black pb-2 pl-9 pr-9 pt-2 font-semibold text-white lg:hover:bg-grayMain`}
          onClick={() => userSignOut()}
        >
          <img src={signoutWhiteEmpty} alt="" className="w-[20px] fill-white" />
          <div>Sign out</div>
        </button>
      </div>
    )
  }

  return (
    <div className="lg:w-[clamp(600px,55svw,1500px)] lg:bg-white">
      {aboutInformation()}
      <div className="h-[7px] w-full bg-graySoft"></div>
      {featuredPhotoSection()}
      <div className="h-[7px] w-full bg-graySoft"></div>
      {signOutButton()}
    </div>
  )
}

export default About
