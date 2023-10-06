import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Likes from './Likes'
import Dislikes from './Dislikes'
import DeletePost from './DeletePost'
import { useParams } from 'react-router-dom'

import { db } from './../config/firebase.config'
import { collection, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

// import { useCommentLikingFunctions } from "./custom-hooks/useCommentLikingFunctions";
// import { useCommentDislikingFunctions } from "./custom-hooks/useCommentDislikingFunctions";
import { useCommentData } from './custom-hooks/useCommentData'

import { TargetCommentData } from '../interfaces'

interface Props {
  commentFirstName: string
  commentLastName: string
  commentText: string
  commentDate: string
  commentLikes: object
  commentDislikes: object
  commentById: string
  loggedInUserId: string
  commentId: string
  postId: string
  commentIndex: number
}

const Comment = ({
  commentFirstName,
  commentLastName,
  commentText,
  commentDate,
  commentLikes,
  commentDislikes,
  commentById,
  loggedInUserId,
  commentId,
  postId,
  commentIndex,
}: Props) => {
  const { openProfileId } = useParams()

  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [commentNumOfLikes, setCommentNumOfLikes] = useState(0)
  const [commentNumOfDislikes, setCommentNumOfDislikes] = useState(0)
  const [profilePicture, setProfilePicture] = useState('')
  const { commentData, setCommentData } = useCommentData()
  const [showDropdownMenu, setShowDropdownMenu] = useState(false)

  const navigate = useNavigate()

  const navigateToUser = () => {
    navigate(`/profile/${commentById}`)
  }

  // //1 Access this comment document from Firestore
  const getCommentDocRef = () => {
    if (!openProfileId) {
      const publicPostsCollection = collection(db, 'publicPosts')
      const targetPostDocRef = doc(publicPostsCollection, postId) // grab this post
      const targetCommentDocRef = doc(targetPostDocRef, 'comments', commentId)
      return targetCommentDocRef
    } else {
      const targetUserDocRef = doc(db, 'users', openProfileId)
      const targetPostDocRef = doc(targetUserDocRef, 'postsProfile', postId) // grab this post
      const targetCommentDocRef = doc(targetPostDocRef, 'comments', commentId)
      return targetCommentDocRef
    }
  }

  const commentDocRef = getCommentDocRef()

  const emptyProfilePicture = useEmptyProfilePicture()

  const removeLike = async () => {
    setLiked(false) // Set liked to false, makes heart empty
    // Frontend updates
    delete (commentLikes as { [key: string]: boolean })[loggedInUserId] // Remove the userId from postLikes
    setCommentNumOfLikes(Object.keys(commentLikes).length) // Update state for number of likes to display
    // Backend updates:
    delete (commentData?.likes as { [key: string]: boolean })[loggedInUserId] // Delete the userId from the postData object
    const newLikes = { ...commentData?.likes } // Define new object to hold the likes
    await updateDoc(commentDocRef, { likes: newLikes }) // Update the backend with the new likes
  }

  const removeDislike = async () => {
    setDisliked(false) // Set liked to false, makes heart empty
    // Frontend updates
    delete (commentDislikes as { [key: string]: boolean })[loggedInUserId] // Remove the userId from postLikes
    setCommentNumOfDislikes(-Object.keys(commentDislikes).length) // Update state for number of likes to display
    // Backend updates:
    delete (commentData?.dislikes as { [key: string]: boolean })[loggedInUserId] // Delete the userId from the postData object
    const newDislikes = { ...commentData?.dislikes } // Define new object to hold the likes
    await updateDoc(commentDocRef, { dislikes: newDislikes }) // Update the backend with the new likes
  }

  // //1 Get the data from this comment from the backend and store it in the "commentData" state
  const getCommentData = async () => {
    try {
      const targetComment = await getDoc(commentDocRef) // Fetch the data
      const data = targetComment.data()
      setCommentData(data as TargetCommentData | null) // Store the comment data in state
      if (data?.likes?.hasOwnProperty(loggedInUserId)) setLiked(true) // Has the user already liked the comment?
      if (data?.dislikes?.hasOwnProperty(loggedInUserId)) setDisliked(true) // Has the user already disliked the comment?
      getCommentProfilePicture(data?.userId) // Grab the profile picture of the user who made the comment
    } catch (err) {
      console.error(err)
    }
  }

  const getCommentProfilePicture = async (userId: string) => {
    if (!userId) return <h1>Loading...</h1>
    const usersDoc = doc(db, 'users', userId)
    const targetUser = await getDoc(usersDoc)
    const data = targetUser.data()
    const profilePictureRef = data?.profilePicture
    setProfilePicture(profilePictureRef)
  }

  useEffect(() => {
    getCommentData()
    setCommentNumOfLikes(Object.keys(commentLikes).length)
    setCommentNumOfDislikes(-Object.keys(commentDislikes).length)
    getCommentProfilePicture(commentById)
  }, [])

  // const showDeleteCommentOrNot = () => {
  //   if (loggedInUserId === commentById) {
  //     return (
  //       <div>
  //         <img
  //           src={dotsGrayFilled}
  //           alt=""
  //           className="max-h-[18px] cursor-pointer"
  //           onClick={() => deletePostClicked()}
  //         />
  //       </div>
  //     )
  //   } else return <div></div>
  // }

  const deletePostClicked = async () => {
    try {
      await deleteDoc(commentDocRef)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="grid pt-2">
      <div className="grid grid-cols-[50px,1fr] items-center gap-4 lg:grid-cols-[50px,1fr]">
        <img
          src={profilePicture === '' ? emptyProfilePicture : profilePicture}
          alt="User who made comment"
          className="aspect-square max-w-[38px] cursor-pointer self-start justify-self-center rounded-[50%] object-cover"
          onClick={() => {
            navigateToUser()
          }}
        />
        <div className="flex flex-col">
          <div className="rounded-xl bg-graySoft p-2.5">
            <div className="grid grid-cols-[20fr,30px]">
              <div className="flex flex-col">
                <div
                  className="max-w-min cursor-pointer whitespace-nowrap text-[14px] font-bold"
                  onClick={() => {
                    navigateToUser()
                  }}
                >
                  {commentFirstName + ' ' + commentLastName}
                </div>
                <div className="text-[11px] text-grayMain">{commentDate}</div>
                <div className="gap-4 hyphens-auto">{commentText}</div>
              </div>
              <DeletePost
                postUserId={commentById}
                showDropdownMenu={showDropdownMenu}
                setShowDropdownMenu={setShowDropdownMenu}
                deletePostClicked={deletePostClicked}
                isPost={false}
              />
            </div>
          </div>
          <div className="mb-1 mt-1 grid h-max grid-cols-[50px,50px] items-start justify-items-start">
            {/*//1 Like/Dislike */}
            {
              <Likes
                totalLikes={commentLikes}
                liked={liked}
                disliked={disliked}
                setLiked={setLiked}
                numOfLikes={commentNumOfLikes}
                setNumOfLikes={setCommentNumOfLikes}
                removeLike={removeLike}
                removeDislike={removeDislike}
                loggedInUserId={loggedInUserId}
                docRef={commentDocRef}
                data={commentData}
                isPost={false}
              />
            }
            <Dislikes
              totalDislikes={commentDislikes}
              liked={liked}
              disliked={disliked}
              setDisliked={setDisliked}
              numOfDislikes={commentNumOfDislikes}
              setNumOfDislikes={setCommentNumOfDislikes}
              removeLike={removeLike}
              removeDislike={removeDislike}
              loggedInUserId={loggedInUserId}
              docRef={commentDocRef}
              data={commentData}
              isPost={false}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Comment
