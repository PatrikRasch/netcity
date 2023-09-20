import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'

import feedIconUnselected from './../assets/icons/feedIcon/feedIconUnselected.svg'
import feedIconSelected from './../assets/icons/feedIcon/feedIconSelected.svg'
import peopleIconUnselected from './../assets/icons/peopleIcon/peopleIconUnselected.svg'
import peopleIconSelected from './../assets/icons/peopleIcon/peopleIconSelected.svg'
import logoIcon from './../assets/icons/logoIcon.png'

interface Props {
  feedOpen: boolean
  setFeedOpen(value: boolean): void
  peopleOpen: boolean
  setPeopleOpen(value: boolean): void
}

const Header = ({ feedOpen, setFeedOpen, peopleOpen, setPeopleOpen }: Props) => {
  const emptyProfilePicture = useEmptyProfilePicture()
  const loggedInUserProfilePicture = useLoggedInUserProfilePicture()
  const { loggedInUserId } = useLoggedInUserId()
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="lg:w-100svw bg-white lg:grid lg:justify-items-center">
      <div className="grid h-[80px] grid-cols-3 items-center bg-white text-center text-3xl lg:w-[clamp(500px,70svw,1700px)]">
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate('/public')
            setFeedOpen(true)
            setPeopleOpen(false)
            setProfileOpen(false)
          }}
        >
          <img src={logoIcon} alt="" className="absolute left-10 hidden w-[50px] lg:block" />
          <img src={feedOpen ? feedIconSelected : feedIconUnselected} alt="" className="w-[50px]" />
          <div
            className={`absolute bottom-0 h-1 w-[50px] rounded-3xl bg-purpleMain ${
              feedOpen ? '' : 'hidden'
            }`}
          ></div>
        </div>
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate('/people')
            setFeedOpen(false)
            setPeopleOpen(true)
            setProfileOpen(false)
          }}
        >
          <img
            src={peopleOpen ? peopleIconSelected : peopleIconUnselected}
            alt=""
            className="w-[50px]"
          />
          <div
            className={`absolute bottom-0 h-1 w-[50px] rounded-3xl bg-purpleMain ${
              peopleOpen ? '' : 'hidden'
            }`}
          ></div>
        </div>
        <div className="justify-self-center">
          <img
            src={
              loggedInUserProfilePicture === '' ? emptyProfilePicture : loggedInUserProfilePicture
            }
            alt=""
            className="aspect-square max-h-[55px] cursor-pointer justify-self-center rounded-[50px] object-cover"
            onClick={() => {
              navigate(`/profile/${loggedInUserId}`)
              setFeedOpen(false)
              setPeopleOpen(false)
              setProfileOpen(true)
            }}
          />
          <div
            className={`ite absolute bottom-0 ml-[2px] h-1 w-[50px] rounded-3xl bg-purpleMain ${
              profileOpen ? '' : 'hidden'
            }`}
          ></div>
        </div>
      </div>
      <div className="h-[2px] w-[100vw] bg-grayLineThin"></div>
    </div>
  )
}

export default Header
