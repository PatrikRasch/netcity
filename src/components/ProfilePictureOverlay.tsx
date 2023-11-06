import React, { useState } from 'react'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

interface Props {
  viewProfilePicture: boolean
  setViewProfilePicture: (value: boolean) => void
  otherProfilePicture: string
  darkenBackground: boolean
  setDarkenBackground: (value: boolean) => void
}

function ProfilePictureOverlay({
  viewProfilePicture,
  setViewProfilePicture,
  otherProfilePicture,
  darkenBackground,
  setDarkenBackground,
}: Props) {
  const emptyProfilePicture = useEmptyProfilePicture()

  const viewProfilePictureJSX = () => {
    return (
      <div>
        <div className="absolute left-[50%] top-[50%] z-20 translate-x-[-50%] translate-y-[-50%]">
          <img
            src={otherProfilePicture === '' ? emptyProfilePicture : otherProfilePicture}
            alt="profile"
            className="w-fit rounded-3xl border-4 border-white object-contain"
          />
          <div
            className="absolute left-[50%] top-[50%] z-[-1] h-screen w-screen translate-x-[-50%] translate-y-[-50%] bg-black opacity-30"
            onClick={() => {
              setViewProfilePicture(false)
              setDarkenBackground(false)
            }}
          ></div>
        </div>
      </div>
    )
  }

  return <div className={`${viewProfilePicture ? '' : 'hidden'}`}>{viewProfilePictureJSX()}</div>
}

export default ProfilePictureOverlay
