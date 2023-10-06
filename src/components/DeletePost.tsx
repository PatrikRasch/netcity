import React, { useState, useEffect, useRef } from 'react'

import dotsGrayFilled from './../assets/icons/dots/dotsGrayFilled.webp'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

interface Props {
  postUserId: string
  // dropdownMenuRef: HTMLDivElement
  showDropdownMenu: boolean
  setShowDropdownMenu: (value: boolean) => void
  deletePostClicked: () => Promise<void>
  isPost: boolean
}

const DeletePost = ({ postUserId, showDropdownMenu, setShowDropdownMenu, deletePostClicked, isPost }: Props) => {
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
          <img
            src={dotsGrayFilled}
            alt=""
            className="max-h-[18px] cursor-pointer"
            onClick={() => {
              setShowDropdownMenu(!showDropdownMenu)
            }}
          />
          <div>{dropdownMenu()}</div>
        </div>
      )
    } else return <div></div>
  }

  const dropdownMenu = () => {
    if (showDropdownMenu) {
      return (
        <div className="absolute right-0 top-4 grid min-w-max grid-rows-[1fr,1.5px,1fr] rounded-2xl rounded-tr-none bg-graySoft">
          <button
            className="rounded-tl-2xl pb-1 pl-4 pr-4 pt-1 hover:bg-grayMedium"
            onClick={() => {
              deletePostClicked()
            }}
          >
            {isPost ? 'Delete Post' : 'Delete Comment'}
          </button>
          <div className="h-[1.5px] w-full bg-grayMedium"></div>
          <button
            className="rounded-2xl rounded-tl-none rounded-tr-none pb-1 pl-4 pr-4 pt-1 hover:bg-grayMedium"
            onClick={() => {
              setShowDropdownMenu(false)
            }}
          >
            Close
          </button>
        </div>
      )
    }
  }

  return <>{showDeletePostOrNot()}</>
}

export default DeletePost