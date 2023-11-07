import React, { useState } from 'react'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

interface Props {
  viewProfilePicture: boolean
  setViewProfilePicture: (value: boolean) => void
  otherProfilePicture: string
}

function ProfilePictureOverlay({ viewProfilePicture, setViewProfilePicture, otherProfilePicture }: Props) {
  const emptyProfilePicture = useEmptyProfilePicture()

  const viewProfilePictureJSX = () => {
    return (
      <div
        className={`z-60 transition-all delay-75 duration-500 ${
          viewProfilePicture ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        } transition-opacity`}
      >
        <div className="absolute left-[50%] top-[50%] z-20 translate-x-[-50%] translate-y-[-50%]">
          <img
            src={otherProfilePicture === '' ? emptyProfilePicture : otherProfilePicture}
            alt="profile"
            className={`transition-transform-opacity w-[80svw] min-w-[100px] max-w-[1000px] rounded-3xl border-4 border-white object-contain duration-500 lg:w-[50svw] ${
              viewProfilePicture ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          />
          <div
            className={`absolute left-[50%] top-[50%] z-[-1] h-screen w-screen translate-x-[-50%] translate-y-[-50%] bg-black transition-opacity delay-75 duration-500 ${
              viewProfilePicture ? 'opacity-30' : 'opacity-0'
            }`}
            onClick={() => {
              setViewProfilePicture(false)
            }}
          ></div>
        </div>
      </div>
    )
  }

  return viewProfilePictureJSX()
}

export default ProfilePictureOverlay
