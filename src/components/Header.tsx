import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useLoggedInUserProfilePicture } from './context/LoggedInUserProfileDataContextProvider'

import homeGrayEmpty from './../assets/icons/home/homeGrayEmpty.svg'
import homePurpleFilled from './../assets/icons/home/homePurpleFilled.svg'
import peopleGrayEmpty from './../assets/icons/people/peopleGrayEmpty.webp'
import peoplePurpleFilled from './../assets/icons/people/peoplePurpleFilled.webp'
import logoBlackFilled from './../assets/icons/logo/logoBlackFilled.webp'
import logoPurpleFilled from './../assets/icons/logo/logoPurpleFilled.webp'

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
  const navigate = useNavigate()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    setProfileOpen(location.pathname.includes('profile'))
    setFeedOpen(location.pathname.includes('public'))
    setPeopleOpen(location.pathname.includes('people'))
  }, [location.pathname])

  return (
    <div className="lg:w-100svw bg-white lg:grid lg:justify-items-center">
      <div className="grid h-[80px] grid-cols-3 items-center bg-white text-center text-3xl lg:w-[clamp(500px,60svw,1700px)]">
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate('/public')
          }}
        >
          <img src={logoPurpleFilled} alt="" className="absolute left-10 hidden w-[50px] lg:block" />
          <img src={feedOpen ? homePurpleFilled : homeGrayEmpty} alt="" className="w-[50px]" />
          <div className={`absolute bottom-0 h-1 w-[50px] rounded-3xl bg-purpleMain ${feedOpen ? '' : 'hidden'}`}></div>
        </div>
        <div
          className="cursor-pointer justify-self-center"
          onClick={() => {
            navigate('/people')
          }}
        >
          <img src={peopleOpen ? peoplePurpleFilled : peopleGrayEmpty} alt="" className="w-[50px]" />
          <div
            className={`absolute bottom-0 h-1 w-[50px] rounded-3xl bg-purpleMain ${peopleOpen ? '' : 'hidden'}`}
          ></div>
        </div>
        <div className="justify-self-center">
          <img
            src={loggedInUserProfilePicture === '' ? emptyProfilePicture : loggedInUserProfilePicture}
            alt=""
            className="aspect-square max-h-[55px] cursor-pointer justify-self-center rounded-[50px] object-cover"
            onClick={() => {
              navigate(`/profile/${loggedInUserId}`)
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
