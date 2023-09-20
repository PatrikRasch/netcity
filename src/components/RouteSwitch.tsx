import React, { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Login'
import DisplayRegister from './DisplayRegister'
import Profile from './Profile'
import Header from './Header'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

const People = lazy(() => import('./People'))
const Public = lazy(() => import('./Public'))

function RouteSwitch() {
  const { loggedInUserId } = useLoggedInUserId()

  const HeaderDisplaying = () => {
    const [feedOpen, setFeedOpen] = useState(false)
    const [peopleOpen, setPeopleOpen] = useState(false)

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

    if (!loggedInUserId) return <h1>Loading..</h1>
    return (
      <Suspense fallback={<h1>Loading...</h1>}>
        <div className="fixed z-50">
          <Header
            feedOpen={feedOpen}
            setFeedOpen={setFeedOpen}
            peopleOpen={peopleOpen}
            setPeopleOpen={setPeopleOpen}
          />
        </div>
        <div className="h-[80px]"></div>
        <Routes>
          <Route path="/profile/:openProfileId" element={<Profile />} />
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

//3 On first load: need something that checks if the user is already signed in.
//3 If so, send to Public/Profile page.
//3 If not, send to login page.
