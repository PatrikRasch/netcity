import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AllCommentsOnPost from './AllCommentsOnPost'
import MakeComment from './MakeComment'
import Likes from './Likes'
import Dislikes from './Dislikes'
import DeletePost from './DeletePost'

import commentGrayEmpty from './../assets/icons/comment/commentGrayEmpty.svg'
import commentWhiteFilled from './../assets/icons/comment/commentWhiteFilled.svg'
import starGrayFilled from './../assets/icons/star/starGrayFilled.svg'
import triangleBlackFilled from './../assets/icons/triangle/triangleBlackFilled.svg'

import { db, storage } from './../config/firebase.config'
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  orderBy,
  query,
  onSnapshot,
  getDocs,
  DocumentReference,
} from 'firebase/firestore'
import { ref, deleteObject } from 'firebase/storage'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'
import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { TargetData, CommentData } from '../interfaces'

interface Props {
  postFirstName: string
  postLastName: string
  postText: string
  postImage: string
  postImageId: string
  postDate: string
  postLikes: object
  postDislikes: object
  postComments: object
  postId: string
  postIndex: number
  postUserId: string
  openProfileId?: string
  loggedInUserProfilePicture: string
  setLoggedInUserProfilePicture: (value: string) => void
  context: string
  friendsOnlyPost?: boolean
  openProfileFirstName?: string
  openProfileLastName?: string
  visitingUser?: boolean
}

//6 Clicking comments (to see comments not working), potentially multiple other issues regarding interacting with a post. Must confirm.

const Post = ({
  postFirstName,
  postLastName,
  postText,
  postImage,
  postImageId,
  postDate,
  postLikes,
  postDislikes,
  postComments,
  openProfileId,
  loggedInUserProfilePicture,
  setLoggedInUserProfilePicture,
  postId,
  postIndex,
  postUserId,
  context,
  friendsOnlyPost,
  openProfileFirstName,
  openProfileLastName,
  visitingUser,
}: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture()
  const { loggedInUserId } = useLoggedInUserId()
  const [liked, setLiked] = useState(false)
  const [postNumOfLikes, setPostNumOfLikes] = useState(0)
  const [disliked, setDisliked] = useState(false)
  const [postNumOfDislikes, setPostNumOfDislikes] = useState(0)
  const [postTotalNumOfComments, setPostTotalNumOfComments] = useState(0)

  const [postData, setPostData] = useState<TargetData | null>(null)
  const [postProfilePicture, setPostProfilePicture] = useState(emptyProfilePicture)
  const [loggedInUserFirstName, setLoggedInUserFirstName] = useState('')
  const [loggedInUserLastName, setLoggedInUserLastName] = useState('')
  const [showMakeComment, setShowMakeComment] = useState(false)
  const [numOfCommentsShowing, setNumOfCommentsShowing] = useState(0)
  const [showLoadMoreCommentsButton, setShowLoadMoreCommentsButton] = useState(false)
  const [comments, setComments] = useState<CommentData[]>([])

  const [showFullImage, setShowFullImage] = useState(false)
  const [imageTooLargeToShowFull, setImageTooLargeToShowFull] = useState(false)
  const [hoverImage, setHoverImage] = useState(false)
  const [imageHeight, setImageHeight] = useState<Number | undefined>()

  const imageHeightRef = useRef<HTMLImageElement>(null)

  const [displayFullPostText, setDisplayFullPostText] = useState(false)

  const [postDocRef, setPostDocRef] = useState<DocumentReference>(null!)
  const [viewportWidth, setViewportWidth] = useState<Number>(Number)
  const [viewportHeight, setViewportheight] = useState<Number>(Number)

  const [showDropdownMenu, setShowDropdownMenu] = useState(false)

  const navigate = useNavigate()

  let profilePostDocRef: any // I know this is frowned upon

  // - Get reference for posts from profile
  if (openProfileId) {
    const openProfileDocRef = doc(db, 'users', openProfileId) // Grab the user
    const profilePostsCollection = collection(openProfileDocRef, 'postsProfile') // Grab the posts on the user's profile
    profilePostDocRef = doc(profilePostsCollection, postId) // grab this post
  }

  useEffect(() => {
    if (context === 'feed') {
      getNumOfComments(feedPostDocRef)
      setPostDocRef(feedPostDocRef)
      getPostData(feedPostDocRef)
      getAllComments(feedPostDocRef)
    }
    if (context === 'profile') {
      getNumOfComments(profilePostDocRef)
      setPostDocRef(profilePostDocRef)
      getPostData(profilePostDocRef)
      getAllComments(profilePostDocRef)
    }

    if (postText.length < 300) setDisplayFullPostText(true)

    if (postIndex === 0) setShowMakeComment(true)
    setPostNumOfLikes(Object.keys(postLikes).length) // Number of likes on post
    setPostNumOfDislikes(-Object.keys(postDislikes).length) // Number of dislikes on post
  }, [])

  // - Get reference for posts from feed
  const feedPostsCollection = collection(db, 'publicPosts')
  const feedPostDocRef = doc(feedPostsCollection, postId) // Grab the posts on the user's profile

  const navigateToUser = () => {
    navigate(`/profile/${postUserId}`)
  }

  const getNumOfComments = async (postDocRef: DocumentReference) => {
    const commentsCollection = collection(postDocRef, 'comments')
    try {
      const commentsDocs = await getDocs(commentsCollection)
      setPostTotalNumOfComments(commentsDocs.size)
    } catch (err) {
      console.error(err)
    }
  }

  const getLoggedInUserInformation = async (loggedInUserId: string) => {
    if (!loggedInUserId) return <h1>Loading...</h1>
    const usersDoc = doc(db, 'users', loggedInUserId)
    const targetUser = await getDoc(usersDoc)
    const data = targetUser.data()
    setLoggedInUserFirstName(data?.firstName)
    setLoggedInUserLastName(data?.lastName)
    const profilePictureRef = data?.profilePicture
    if (setLoggedInUserProfilePicture) setLoggedInUserProfilePicture(profilePictureRef)
  }

  getLoggedInUserInformation(loggedInUserId)

  // - Get the data from this post from the backend and store it in the "postData" state
  const getPostData = async (postDocRef: DocumentReference) => {
    try {
      const targetDoc = await getDoc(postDocRef) // Fetch the data
      const data: TargetData | undefined = targetDoc.data() as TargetData | undefined
      if (data) {
        setPostData(data)
        if (data?.likes?.hasOwnProperty(loggedInUserId)) setLiked(true) // Has the user already liked the post?
        if (data?.dislikes?.hasOwnProperty(loggedInUserId)) setDisliked(true) // Has the user already disliked the post?
        getPostProfilePicture(data?.userId) // Grab the profile picture of the user who made the post
      }
    } catch (err) {
      console.error(err)
    }
  }

  //1 Gets the profile picture of the user who made the post
  const getPostProfilePicture = async (userId: string) => {
    const usersDoc = doc(db, 'users', userId)
    const targetUser = await getDoc(usersDoc)
    const data = targetUser.data()
    const profilePictureRef = data?.profilePicture
    setPostProfilePicture(profilePictureRef)
  }

  const removeLike = async (postDocRef: DocumentReference) => {
    setLiked(false) // Set liked to false, makes heart empty
    // Frontend updates
    delete (postLikes as { [key: string]: boolean })[loggedInUserId] // Remove the userId from postLikes
    setPostNumOfLikes(Object.keys(postLikes).length) // Update state for number of likes to display
    // Backend updates:
    delete (postData?.likes as { [key: string]: boolean })[loggedInUserId] // Delete the userId from the postData object
    const newLikes = { ...postData?.likes } // Define new object to hold the likes
    await updateDoc(postDocRef, { likes: newLikes }) // Update the backend with the new likes
  }

  const removeDislike = async (postDocRef: DocumentReference) => {
    setDisliked(false) // Set liked to false, makes heart empty
    // Frontend updates
    delete (postDislikes as { [key: string]: boolean })[loggedInUserId] // Remove the userId from postLikes
    setPostNumOfDislikes(-Object.keys(postDislikes).length) // Update state for number of likes to display
    // Backend updates:
    delete (postData?.dislikes as { [key: string]: boolean })[loggedInUserId] // Delete the userId from the postData object
    const newDislikes = { ...postData?.dislikes } // Define new object to hold the likes
    await updateDoc(postDocRef, { dislikes: newDislikes }) // Update the backend with the new likes
  }

  //1 GET POSTS FOR PROFILE CURRENTLY BEING VIEWED
  //  - Gets all the posts (profilePosts in Firestore) from the current profile subcollection.
  const getAllComments = async (postDocRef: DocumentReference) => {
    try {
      const commentsCollection = collection(postDocRef, 'comments')
      const sortedComments = query(commentsCollection, orderBy('timestamp', 'desc')) // Sorts comments in descending order. "query" and "orderBy" are Firebase/Firestore methods
      const unsubscribe = onSnapshot(sortedComments, (snapshot) => {
        const commentsPostDataArray: CommentData[] = [] // Empty array that'll be used for updating state
        // Push each doc (comment) into the commentsPostDataArray array.
        snapshot.forEach((doc) => {
          const commentData = doc.data() as CommentData // "as CommentData" is type validation
          commentsPostDataArray.push({ ...commentData, id: doc.id }) // (id: doc.id adds the id of the individual doc)
        })
        setComments(commentsPostDataArray) // Update state with all the comments
      })
    } catch (err) {
      console.error('Error trying to get all comments:', err)
    }
  }

  useEffect(() => {
    const img = new Image()
    img.src = postImage
    img.onload = () => {
      setImageHeight(imageHeightRef.current?.getBoundingClientRect().height)
      if (imageHeightRef && imageHeightRef.current) {
        const divHeight = imageHeightRef.current.clientHeight
        if (divHeight > window.innerHeight * 0.7) {
          setImageTooLargeToShowFull(true)
        } else setShowFullImage(true)
      }
    }
  }, [])

  useEffect(() => {
    if (imageHeightRef && imageHeightRef.current) {
      const divHeight = imageHeightRef.current.clientHeight
      if (divHeight > window.innerHeight * 0.7) {
        setImageTooLargeToShowFull(true)
        setShowFullImage(false)
      } else {
        setShowFullImage(true)
        setImageTooLargeToShowFull(false)
      }
    }
  }, [viewportWidth, viewportHeight])

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
      setViewportheight(window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [window.innerHeight, window.innerWidth])

  // - Determines if the comment input field is to be displayed on the post
  const displayMakeCommentOrNot = () => {
    if (showMakeComment === true)
      return (
        <MakeComment
          loggedInUserFirstName={loggedInUserFirstName}
          loggedInUserLastName={loggedInUserLastName}
          loggedInUserProfilePicture={loggedInUserProfilePicture}
          loggedInUserId={loggedInUserId}
          openProfileId={openProfileId}
          postId={postId}
          getAllComments={getAllComments}
          postDocRef={postDocRef}
          numOfCommentsShowing={numOfCommentsShowing}
          setNumOfCommentsShowing={setNumOfCommentsShowing}
        />
      )
  }

  const handleCommentButtonClicked = () => {
    if (showMakeComment && numOfCommentsShowing === 0 && postTotalNumOfComments !== 0) {
      setNumOfCommentsShowing(numOfCommentsShowing + 3)
      setShowLoadMoreCommentsButton(true)
      return
    }

    if (showMakeComment && numOfCommentsShowing === 0) {
      setShowMakeComment(false)
      setNumOfCommentsShowing(0)

      return
    }
    if (!showMakeComment) {
      setShowMakeComment(true)
      setNumOfCommentsShowing(numOfCommentsShowing + 3)
      setShowLoadMoreCommentsButton(true)
    } else {
      setShowMakeComment(false)
      setNumOfCommentsShowing(0)
    }
  }

  const deletePostClicked = async () => {
    try {
      await deleteDoc(postDocRef)
      if (postImage) {
        const postImageRef = ref(storage, `postImages/${postImageId}`)
        await deleteObject(postImageRef)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const displayPostImageOrNot = () => {
    if (postImage)
      return (
        <div
          className={`relative overflow-hidden duration-500 ease-in-out ${showFullImage ? '' : `max-h-[70vh]`}`}
          style={{ maxHeight: showFullImage || hoverImage ? `${imageHeight}px` : '70vh' }}
        >
          <img
            src={postImage}
            alt="attached to post"
            ref={imageHeightRef}
            className="w-full rounded-2xl"
            onClick={() => {
              if (imageTooLargeToShowFull) {
                setShowFullImage((prevShowFullImage) => !prevShowFullImage)
              }
            }}
            onMouseEnter={() => {
              setHoverImage(true)
            }}
            onMouseLeave={() => setHoverImage(false)}
          />
          <div
            className={`absolute bottom-0 ${
              showFullImage
                ? ''
                : 'h-[50px] w-[100%] bg-gradient-to-b from-transparent via-white to-white p-2 duration-500 ease-in-out'
            }
            ${hoverImage ? 'h-0 opacity-0' : ''}`}
          ></div>
        </div>
      )
  }

  const displayFullPostOrNot = () => {
    if (displayFullPostText && postText.length > 300)
      return (
        <div>
          <div className="font-mainFont">{postText + ' '}</div>
          <span className="text-purpleMain">
            <button
              onClick={() => {
                setDisplayFullPostText(false)
              }}
            >
              see less
            </button>
          </span>
        </div>
      )
    if (displayFullPostText) return postText
    return (
      <div className="font-mainFont">
        {postText.slice(0, 300) + ' '}
        <span className="text-purpleMain">
          <button
            onClick={() => {
              setDisplayFullPostText(true)
            }}
          >
            ... see more
          </button>
        </span>
      </div>
    )
  }

  const renderAllCommentsOnPost = () => {
    return (
      <AllCommentsOnPost
        comments={comments}
        postId={postId}
        postTotalNumOfComments={postTotalNumOfComments}
        numOfCommentsShowing={numOfCommentsShowing}
        setNumOfCommentsShowing={setNumOfCommentsShowing}
        showMakeComment={showMakeComment}
        showLoadMoreCommentsButton={showLoadMoreCommentsButton}
        setShowLoadMoreCommentsButton={setShowLoadMoreCommentsButton}
        setShowMakeComment={setShowMakeComment}
      />
    )
  }

  const renderFriendsPostIconOrNot = () => {
    if (friendsOnlyPost)
      return (
        <div className="flex items-center gap-2">
          <div className="font-mainFont text-smaller text-grayMain lg:text-[clamp(12px,1.5svw,13px)]">{postDate}</div>
          <div className="text-smaller text-grayMain">•</div>
          <img src={starGrayFilled} alt="" className="w-[12px]" />
        </div>
      )
    else
      return (
        <div className="font-mainFont text-smaller text-grayMain lg:text-[clamp(12px,1.5svw,13px)]">{postDate}</div>
      )
  }

  const displayPostNames = () => {
    if (context !== 'profile' || openProfileId === postUserId)
      return (
        <div>
          {postFirstName} {postLastName}
        </div>
      )
    if (!visitingUser && openProfileId !== postUserId)
      return (
        <div className="flex gap-1 ">
          <button
            onClick={() => {
              navigateToUser()
            }}
            className="cursor-pointer"
          >
            {postFirstName + ' ' + postLastName}
          </button>
          <img src={triangleBlackFilled} alt="" className="w-[12px] pt-[2px]" />
          <div>
            {loggedInUserFirstName} {loggedInUserLastName}
          </div>
        </div>
      )
    else
      return (
        <div className="flex gap-1">
          <button
            onClick={() => {
              navigateToUser()
            }}
            className="cursor-pointer"
          >
            {postFirstName + ' ' + postLastName}
          </button>
          <img src={triangleBlackFilled} alt="" className="w-[12px] pt-[2px]" />
          <div>
            {openProfileFirstName} {openProfileLastName}
          </div>
        </div>
      )
  }

  return (
    <>
      <div className="min-h-[100px] w-full bg-white pl-4 pr-4 lg:pl-8 lg:pr-8">
        <div className="gap-2 pt-3">
          <div className="grid grid-cols-[20fr,1fr] items-center">
            <div className="flex items-center gap-3">
              <div className="min-w-[40px]">
                <img
                  src={postProfilePicture === '' ? emptyProfilePicture : postProfilePicture}
                  alt="profile"
                  className="h-[40px] w-[40px] rounded-[50%] object-cover hover:cursor-pointer lg:h-[55px] lg:w-[55px]"
                  onClick={() => {
                    navigateToUser()
                  }}
                />
              </div>
              <div className="flex items-center gap-[15px]">
                <div className="font-mainFont font-bold tracking-wide lg:text-[clamp(16px,1.5svw,19px)]">
                  {displayPostNames()}
                </div>
                {renderFriendsPostIconOrNot()}
              </div>
            </div>
            <DeletePost
              postUserId={postUserId}
              showDropdownMenu={showDropdownMenu}
              setShowDropdownMenu={setShowDropdownMenu}
              deletePostClicked={deletePostClicked}
              isPost={true}
            />
          </div>
          <div className="grid gap-2 pb-3 pt-3">
            <div className="">{displayFullPostOrNot()}</div>
            <div className={`${postImage ? '' : 'hidden'}`}>{displayPostImageOrNot()}</div>
          </div>
        </div>
      </div>
      <div className="h-[1.5px] w-full bg-graySoft"></div>
      <div className="grid min-h-[50px] w-full items-center bg-white pb-2 pl-4 pr-4 pt-2 lg:pl-8 lg:pr-8">
        <div className="grid h-[33px] grid-cols-[1fr,1fr,1fr] items-center justify-items-center gap-5 lg:min-h-[40px]">
          {/*//1 Like/Dislike */}
          {
            <Likes
              totalLikes={postLikes}
              liked={liked}
              disliked={disliked}
              setLiked={setLiked}
              numOfLikes={postNumOfLikes}
              setNumOfLikes={setPostNumOfLikes}
              removeLike={removeLike}
              removeDislike={removeDislike}
              loggedInUserId={loggedInUserId}
              docRef={postDocRef}
              data={postData}
              isPost={true}
            />
          }
          <Dislikes
            totalDislikes={postDislikes}
            liked={liked}
            disliked={disliked}
            setDisliked={setDisliked}
            loggedInUserId={loggedInUserId}
            numOfDislikes={postNumOfDislikes}
            setNumOfDislikes={setPostNumOfDislikes}
            removeLike={removeLike}
            removeDislike={removeDislike}
            docRef={postDocRef}
            data={postData}
            isPost={true}
          />
          {/* //1 Comment */}
          <div
            className={`font-mainFont grid w-full cursor-pointer items-center justify-center rounded-3xl p-1 font-semibold tracking-wide text-grayMain lg:h-[35px] ${
              showMakeComment ? 'bg-black text-white' : 'bg-graySoft'
            }`}
            onClick={() => handleCommentButtonClicked()}
          >
            <div className="flex gap-2">
              <img src={`${showMakeComment ? commentWhiteFilled : commentGrayEmpty}`} alt="" className="max-h-6" />
              <div>{postTotalNumOfComments}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[1.5px] w-full bg-graySoft"></div>

      <div className="w-full bg-white pl-4 pr-4 lg:pl-8 lg:pr-8">
        {/* // - Add comment  */}
        {displayMakeCommentOrNot()}
        {/* // - Posted comments */}
        {numOfCommentsShowing === 0 ? '' : renderAllCommentsOnPost()}
      </div>
    </>
  )
}

export default Post
