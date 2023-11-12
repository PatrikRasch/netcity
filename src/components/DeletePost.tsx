import React, { useState, useEffect, useRef } from 'react'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { DocumentReference } from 'firebase/firestore'

interface Props {
  postUserId: string
  // dropdownMenuRef: HTMLDivElement
  showDropdownMenu: boolean
  setShowDropdownMenu: (value: boolean) => void
  deletePostClicked: () => Promise<void>
  isPost: boolean
  context?: string
  feedPostDocRef?: DocumentReference
  profilePostDocRef?: DocumentReference
  getNumOfComments?: (value: DocumentReference) => Promise<void>
  postTotalNumOfComments?: number
  setPostTotalNumOfComments?: (value: number) => void
}

const DeletePost = ({
  postUserId,
  showDropdownMenu,
  setShowDropdownMenu,
  deletePostClicked,
  isPost,
  context,
  feedPostDocRef,
  profilePostDocRef,
  getNumOfComments,
  postTotalNumOfComments,
  setPostTotalNumOfComments,
}: Props) => {
  const { loggedInUserId } = useLoggedInUserId()
  const dropdownMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutsideOfDropdownMenu = (e: Event) => {
      if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target as Node)) {
        setShowDropdownMenu(false)
      }
    }
    if (showDropdownMenu) window.addEventListener('click', handleClickOutsideOfDropdownMenu)
    if (!showDropdownMenu) window.removeEventListener('click', handleClickOutsideOfDropdownMenu)

    return () => window.removeEventListener('click', handleClickOutsideOfDropdownMenu)
  }, [showDropdownMenu])

  const showDeletePostOrNot = () => {
    if (loggedInUserId === postUserId) {
      return (
        <div ref={dropdownMenuRef} className="relative max-w-max">
          <div
            className="max-h-[18px] cursor-pointer"
            onClick={() => {
              setShowDropdownMenu(!showDropdownMenu)
            }}
          >
            •••
          </div>
          <div
            className={`transition-transform duration-300 ${
              showDropdownMenu ? 'scale-100' : 'pointer-events-none scale-0'
            }`}
          >
            {dropdownMenu()}
          </div>
        </div>
      )
    } else return <div></div>
  }

  const dropdownMenu = () => {
    return (
      <div className="absolute right-0 top-0 z-20 grid min-w-max grid-rows-[1fr,1.5px,1fr] rounded-2xl rounded-tr-none bg-graySoft drop-shadow-md">
        <button
          className="rounded-tl-2xl pb-1 pl-4 pr-4 pt-1 lg:hover:bg-grayHover"
          onClick={() => {
            deletePostClicked()
            if (setPostTotalNumOfComments && postTotalNumOfComments) {
              setPostTotalNumOfComments(postTotalNumOfComments - 1)
            }
            if (context === 'feed' && getNumOfComments && feedPostDocRef) getNumOfComments(feedPostDocRef)
            if (context === 'profile' && getNumOfComments && profilePostDocRef) getNumOfComments(profilePostDocRef)
          }}
        >
          {isPost ? 'Delete Post' : 'Delete Comment'}
        </button>
        <div className="h-[1.5px] w-full bg-grayMedium"></div>
        <button
          className="rounded-2xl rounded-tl-none rounded-tr-none pb-1 pl-4 pr-4 pt-1 lg:hover:bg-grayHover"
          onClick={() => {
            setShowDropdownMenu(false)
          }}
        >
          Close
        </button>
      </div>
    )
  }

  return <div>{showDeletePostOrNot()}</div>
}

export default DeletePost
