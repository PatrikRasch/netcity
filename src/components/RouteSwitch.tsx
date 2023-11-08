import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Login'
import DisplayRegister from './DisplayRegister'
import Profile from './Profile'
import Header from './Header'
import LoadingBar from './LoadingBar'

import closeGrayFilled from './../assets/icons/close/closeGrayFilled.svg'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'
import { useEmptyProfilePicture } from './context/EmptyProfilePictureContextProvider'

const People = lazy(() => import('./People'))
const Public = lazy(() => import('./Public'))

function RouteSwitch() {
  const { loggedInUserId } = useLoggedInUserId()

  const HeaderDisplaying = () => {
    const [feedOpen, setFeedOpen] = useState(false)
    const [peopleOpen, setPeopleOpen] = useState(false)
    const [viewProfilePicture, setViewProfilePicture] = useState(false)
    const emptyProfilePicture = useEmptyProfilePicture()
    const [otherProfilePicture, setOtherProfilePicture] = useState(emptyProfilePicture)

    const location = useLocation()
    const currentPath = location.pathname

    useEffect(() => {
      if (currentPath === '/public') {
        setFeedOpen(true)
        setPeopleOpen(false)
      }
      if (currentPath === '/people') {
        setFeedOpen(false)
        setPeopleOpen(true)
      }
    }, [])

    if (!loggedInUserId) return <LoadingBar />
    return (
      <Suspense fallback={<LoadingBar />}>
        <div>
          {/* // - Show profile picture when clicking on it */}
          <div
            className={`transition-transform-opacity fixed left-1/2 top-1/2 z-50 translate-x-[-50%] translate-y-[-50%] duration-500 ${
              viewProfilePicture
                ? 'pointer-events-auto scale-100 opacity-100'
                : 'pointer-events-none scale-95 opacity-0'
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
        </div>

        <div className="fixed z-10">
          <Header feedOpen={feedOpen} setFeedOpen={setFeedOpen} peopleOpen={peopleOpen} setPeopleOpen={setPeopleOpen} />
        </div>
        <div className="h-[80px]"></div>
        <Routes>
          <Route
            path="/profile/:openProfileId"
            element={
              <Profile
                viewProfilePicture={viewProfilePicture}
                setViewProfilePicture={setViewProfilePicture}
                otherProfilePicture={otherProfilePicture}
                setOtherProfilePicture={setOtherProfilePicture}
              />
            }
          />
          <Route path="/people" element={<People />} />
          <Route path="/public" element={<Public />} />
        </Routes>
      </Suspense>
    )
  }
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<DisplayRegister />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<HeaderDisplaying />} />
    </Routes>
  )
}
export default RouteSwitch
