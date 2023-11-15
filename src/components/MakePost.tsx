import React, { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useDateFunctions } from './custom-hooks/useDateFunctions'

import { v4 as uuidv4 } from 'uuid'

import ThinSeparatorLine from './ThinSeparatorLine'
import FormValidationAlertMessage from './FormValidationAlertMessage'
import LoadingBar from './LoadingBar'

import { GetAllPosts, VisitingUser } from '../interfaces'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserFirstName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserLastName } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'

import { db, storage } from './../config/firebase.config'
import { doc, addDoc, collection } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

import imageGrayEmpty from './../assets/icons/image/imageGrayEmpty.webp'
import imageBlackEmpty from './../assets/icons/image/imageBlackEmpty.webp'
import userGrayFilled from './../assets/icons/user/userGrayFilled.svg'

import { imageSizeExceeded } from './utils/imageSizeUtils'

interface Props {
  getAllPosts: GetAllPosts['getAllPosts']
  visitingUser: VisitingUser['visitingUser']
  userPicture: string
}

function MakePost({ getAllPosts, userPicture, visitingUser }: Props) {
  const [postInput, setPostInput] = useState('')
  const [postId, setPostId] = useState('')
  const { openProfileId } = useParams()
  const { dateDayMonthYear } = useDateFunctions()
  const [fullTimestamp, setFullTimestamp] = useState({})
  const emptyProfilePicture = useEmptyProfilePicture()
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()
  const { loggedInUserFirstName, setLoggedInUserFirstName } = useLoggedInUserFirstName()
  const { loggedInUserLastName, setLoggedInUserLastName } = useLoggedInUserLastName()
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  const [imageAddedToPost, setImageAddedToPost] = useState<string>('')
  const [imageAddedToPostId, setImageAddedToPostId] = useState<string>('')
  const [textareaActive, setTextareaActive] = useState(false)
  const [validateMakePost, setValidateMakePost] = useState(false)
  const [commandOrControlKeyDown, setCommandOrControlKeyDown] = useState(false)
  const [showValidationAlertMessage, setShowValidationAlertMessage] = useState(false)
  const [showLoadingBar, setShowLoadingBar] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  //1 Gets the reference to the postsProfile collection for the user
  const getPostsProfileRef = () => {
    if (!openProfileId) return console.log('No userProfileId') //6 Need to make this error better later
    const targetUser = doc(db, 'users', openProfileId)
    return collection(targetUser, 'postsProfile')
  }

  const handlePhotoOrLoadingBar = () => {
    return (
      <>
        <div
          className={`pointer-events-none absolute z-30 h-[35px] w-[35px] overflow-hidden transition-all duration-300 ${
            showLoadingBar ? '' : 'hidden'
          }`}
        >
          <LoadingBar scale={0.8} height={35} width={35} color={'black'} />
        </div>
        <img
          src={imageGrayEmpty}
          alt="add and upload file to post"
          className={`max-w-[35px] transition-opacity duration-300 ${showLoadingBar ? 'hidden' : ''}`}
        />
      </>
    )
  }

  //1 Write the post to Firestore
  const writePost = async (data: {
    timestamp: object
    firstName: string
    lastName: string
    text: string
    image: string
    imageId: string
    date: string
    likes: object
    dislikes: object
    comments: object
    userId: string
  }) => {
    try {
      const postsProfileRef = getPostsProfileRef()
      if (postsProfileRef === undefined) return console.log('postsProfileRef is undefined')
      const newPost = await addDoc(postsProfileRef, data)
      console.log('Post written to Firestore')
      setPostId(newPost.id) // Set the ID of this post to the state newPost
    } catch (err) {
      console.error('Error writing to postsProfile: ', err)
    }
  }

  const addImageToPost = async (imageToAddToPost: File | null) => {
    if (imageToAddToPost === null) return // Return if no imagine is uploaded
    if (imageSizeExceeded(imageToAddToPost) === true) return setShowValidationAlertMessage(true) // Check if image is too large before proceeding
    const imageId = imageToAddToPost.name + ' ' + uuidv4()
    const storageRef = ref(storage, `postImages/${imageId}`) // Connect to storage
    try {
      setShowLoadingBar(true)
      const addedImage = await uploadBytes(storageRef, imageToAddToPost) // Upload the image
      const downloadURL = await getDownloadURL(addedImage.ref) // Get the downloadURL for the image
      // Update Firestore Database with image:
      // const usersCollectionRef = collection(db, "users"); // Grabs the users collection
      // const loggedInUserDocRef = doc(usersCollectionRef, loggedInUserId); // Grabs the doc where the user is
      // // const postRef = doc(loggedInUserDocRef, "postsProfile", postId);
      // await updateDoc(postRef, { image: downloadURL }); // Add the image into Firestore
      setImageAddedToPostId(imageId)
      setImageAddedToPost(downloadURL)
      // alert("Profile picture uploaded"); //6 Should be sexified
      setShowLoadingBar(false)
    } catch (err) {
      setShowLoadingBar(false)
      console.error(err)
      //6 Need a "Something went wrong, please try again"
    }
  }

  const displayUploadedImageOrNot = () => {
    if (imageAddedToPost)
      return (
        <div className="">
          <div className="relative">
            <img src={imageAddedToPost} alt="" className="rounded-xl p-[3px] shadow-xl" />
            <div
              className="absolute right-[15px] top-[15px] flex h-[22px] w-[22px] items-center justify-center rounded-[50%] bg-white opacity-90 drop-shadow-xl hover:cursor-pointer"
              onClick={() => {
                deleteImageAddedToPost()
              }}
            >
              X
            </div>
          </div>
        </div>
      )
    if (!imageAddedToPost) return null
  }

  const deleteImageAddedToPost = async () => {
    try {
      if (imageAddedToPost) {
        const postImageRef = ref(storage, `postImages/${imageAddedToPostId}`)
        await deleteObject(postImageRef)
        setImageAddedToPost('')
      }
    } catch (err) {
      console.error(err)
    }
  }

  // - Changes the height of the input field dynamically
  const handleTextareaChange = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 5 // Ensures textarea shrinks by trying to set the rows to 1
    const computedHeight = textarea.scrollHeight // Sets computedHeight to match scrollheight
    const rows = Math.ceil(computedHeight / 24) // Find new number of rows to be set. Line height id 24.
    textarea.rows = rows - 1 // Sets new number of rows
  }

  const resetTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.rows = 1
  }

  const handleKeyDown = (e: any) => {
    if (e.key === 'Meta' || e.key === 'Control') setCommandOrControlKeyDown(true)
  }
  const handleKeyUp = (e: any) => {
    if (e.key === 'Meta' || e.key === 'Control') setCommandOrControlKeyDown(false)
  }

  const handlePost = () => {
    if (postInput.length === 0 && imageAddedToPost === '') {
      setValidateMakePost(true)
      return
    }
    setFullTimestamp(new Date())
    writePost({
      timestamp: fullTimestamp,
      firstName: loggedInUserFirstName,
      lastName: loggedInUserLastName,
      text: postInput,
      image: imageAddedToPost,
      imageId: imageAddedToPostId,
      date: dateDayMonthYear,
      likes: {},
      dislikes: {},
      comments: {},
      userId: loggedInUserId,
    })
    getAllPosts()
    setPostInput('')
    setImageAddedToPost('')
    resetTextarea()
    setTextareaActive(false)
  }

  return (
    <div>
      <div className="font-mainFont pb-1 pl-4 pt-3 font-semibold lg:pl-8">Create a Post</div>
      <ThinSeparatorLine />
      <FormValidationAlertMessage
        message={'Image size must be smaller than 2MB'}
        showValidationAlertMessage={showValidationAlertMessage}
        setShowValidationAlertMessage={setShowValidationAlertMessage}
      />
      <section className="pl-3 pr-3 lg:pl-8 lg:pr-4">
        <div className="grid grid-cols-[50px,1fr,50px] items-center justify-items-center gap-3 pb-2 pt-3">
          <img
            src={loggedInUserProfilePicture === '' ? emptyProfilePicture : loggedInUserProfilePicture}
            alt=""
            className="aspect-square h-[40px] w-[40px] rounded-[50px] object-cover lg:h-[55px] lg:w-[55px]"
          />
          <textarea
            ref={textareaRef}
            placeholder={validateMakePost ? 'Write something before posting' : 'Make a post'}
            className={`transition-height w-full resize-none self-start overflow-y-auto whitespace-pre rounded-3xl border-2 bg-graySoft p-3 placeholder-grayMediumPlus outline-none duration-500 ${
              textareaActive ? 'min-h-[144px]' : 'min-h-[48px]'
            } ${validateMakePost ? 'border-purpleMain' : 'border-transparent'}`}
            maxLength={1000}
            value={postInput}
            onChange={(e) => {
              if (validateMakePost) setValidateMakePost(false)
              setPostInput(e.target.value)
              handleTextareaChange()
              setFullTimestamp(new Date())
            }}
            onKeyDown={(e) => {
              handleKeyDown(e)
              if (e.key === 'Enter' && commandOrControlKeyDown) handlePost()
            }}
            onKeyUp={(e) => {
              handleKeyUp(e)
            }}
            onFocus={() => {
              setTextareaActive(true)
            }}
            onBlur={() => {
              if (postInput.length === 0) {
                setTextareaActive(false)
                resetTextarea()
              }
            }}
            rows={1}
          />
          <input
            type="file"
            id="addImageToPostFeedButton"
            hidden
            onChange={(e) => {
              addImageToPost(e.target.files?.[0] || null)
              e.target.value = ''
              if (validateMakePost) setValidateMakePost(false)
            }}
          />
          <label htmlFor="addImageToPostFeedButton" className="mr-2 flex flex-col hover:cursor-pointer">
            <div className="h-[35px] w-[35px]">{handlePhotoOrLoadingBar()}</div>
            <div className="text-center text-verySmall">Photo</div>
          </label>
          <div className={`${imageAddedToPost ? '' : 'absolute'}`}></div>
          <div className={`${imageAddedToPost ? '' : 'absolute'}`}>{displayUploadedImageOrNot()}</div>
          <div className={`${imageAddedToPost ? '' : 'absolute'}`}></div>
        </div>

        {/* Post section */}
        <div className="grid grid-cols-[50px,1fr,50px] items-center justify-items-center gap-3 pb-3">
          <div></div>
          <div className="flex w-full items-center justify-around gap-4 lg:justify-between lg:gap-6">
            <button
              className="font-mainFont h-[30px] w-full rounded-3xl bg-purpleMain text-[clamp(16px,1svw,20px)] font-bold text-white transition-colors duration-100 hover:bg-purpleHover lg:h-[38px] lg:w-[clamp(30%,20vw,300px)]"
              onClick={() => {
                handlePost()
              }}
            >
              Post
            </button>
            <button className="grid h-[30px] w-[50%] cursor-default grid-cols-[20px,77px] items-center justify-center rounded-3xl bg-graySoft pl-2 pr-2 text-[clamp(12px,1svw,20px)] text-textMain lg:flex lg:h-[38px] lg:w-[clamp(30%,15vw,280px)] lg:grid-cols-[20px,65px] lg:gap-2">
              <img src={userGrayFilled} alt="" className="w-[20px] lg:w-[30px]" />
              <div className="font-mainFont mt-[1px] w-full whitespace-nowrap text-center font-semibold lg:mt-0 lg:w-min">
                Profile Post
              </div>
            </button>
          </div>
        </div>
      </section>

      <div className="h-[7px] w-full bg-graySoft"></div>
    </div>
  )
}

export default MakePost
