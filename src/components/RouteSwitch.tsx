import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Login'
import DisplayRegister from './DisplayRegister'
import Profile from './Profile'
import Header from './Header'
import LoadingBar from './LoadingBar'
import ProfilePictureOverlay from './ProfilePictureOverlay'

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
          <ProfilePictureOverlay
            viewProfilePicture={viewProfilePicture}
            setViewProfilePicture={setViewProfilePicture}
            otherProfilePicture={otherProfilePicture}
          />
        </div>

        <div className="fixed z-20">
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
