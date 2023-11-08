import React, { useState } from 'react'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

import closeGrayFilled from './../assets/icons/close/closeGrayFilled.svg'

interface Props {
  viewProfilePicture: boolean
  setViewProfilePicture: (value: boolean) => void
  otherProfilePicture: string
}

function ProfilePictureOverlay({ viewProfilePicture, setViewProfilePicture, otherProfilePicture }: Props) {
  const emptyProfilePicture = useEmptyProfilePicture()

  const viewProfilePictureJSX = () => {
    return (
      <>
        <div
          className={`transition-transform-opacity fixed left-1/2 top-1/2 z-50 translate-x-[-50%] translate-y-[-50%] duration-500 ${
            viewProfilePicture ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
          }`}
        >
          <img
            src={closeGrayFilled}
            alt="exit register"
            className="absolute right-[15px] top-[15px] w-[50px] cursor-pointer"
            onClick={() => setViewProfilePicture(false)}
          />
          <img
            src={otherProfilePicture === '' ? emptyProfilePicture : otherProfilePicture}
            alt="profile"
            className="w-[80svw] min-w-[100px] max-w-[1000px] rounded-3xl border-[10px] border-white object-contain shadow-lg lg:w-[40svw]"
          />
        </div>
        <div
          className={`fixed z-20 h-screen w-screen bg-black transition-opacity duration-500 ${
            viewProfilePicture ? 'pointer-events-auto opacity-30' : 'pointer-events-none opacity-0'
          }`}
          onClick={() => setViewProfilePicture(false)}
        ></div>
      </>
    )
  }

  return viewProfilePictureJSX()
}

export default ProfilePictureOverlay
