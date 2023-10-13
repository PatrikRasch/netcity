import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Unsubscribe, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { Firestore } from 'firebase/firestore'
import { auth } from '../config/firebase.config'

//6 Login user alert error must be sexified later on.

import Register from './Register'
import LoadingBar from './LoadingBar'

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import logoPurpleFilled from '../assets/icons/logo/logoPurpleFilled.webp'
import logoBlackFilled from '../assets/icons/logo/logoBlackFilled.webp'
import mailPurpleFilled from '../assets/icons/mail/mailPurpleFilled.svg'
import lockPurpleFilled from '../assets/icons/lock/lockPurpleFilled.webp'
import logoGoogle from '../assets/icons/google/logoGoogle.svg'
import closeGrayFilled from './../assets/icons/close/closeGrayFilled.svg'

const Login = () => {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [languageToDisplay, setLanguageToDisplay] = useState<string>('')
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [unsubscribeFunction, setUnsubscribeFunction] = useState<Unsubscribe | null>(null)
  const [showRegister, setShowRegister] = useState(false)
  const navigate = useNavigate()

  // - Check if user is signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), async (user) => {
      if (user) navigate(`/profile/${user.uid}`)
    })
    setUnsubscribeFunction(unsubscribe)
    return () => {
      unsubscribe()
    }
  }, [])

  const stopAuthListener = () => {
    if (unsubscribeFunction) unsubscribeFunction()
  }

  const handleLogin = async () => {
    setShowLoadingBar(true)
    const auth = getAuth()
    try {
      await signInWithEmailAndPassword(auth, email, password).then((userCredentials) => {
        navigate(`/profile/${userCredentials.user.uid}`)
      })
      setShowLoadingBar(false)
    } catch (err) {
      setShowLoadingBar(false)
      console.error(err)
      alert('Username and/or password does not match')
    }
  }

  const projectInformation = () => {
    return (
      <div className="grid gap-0 pt-2 text-[16px] lg:gap-1">
        <div className="animate-project-information1 italic opacity-0">A social media project by</div>
        <a
          href="https://www.GitHub.com/PatrikRasch"
          className="animate-project-information2 w-min justify-self-center font-semibold text-purpleMain opacity-0"
        >
          GitHub.com/PatrikRasch
        </a>
        <div className="just grid justify-center gap-0 lg:gap-1">
          <div className="animate-project-information3 w-[60svw] italic opacity-0 lg:w-[clamp(100px,40svw,400px)]">
            Built from scratch with
          </div>
          <div className="animate-project-information4 relative flex h-[24px] justify-center overflow-hidden font-semibold opacity-0">
            <div className="absolute animate-slide-in-and-out1 opacity-0">React</div>
            <div className="absolute animate-slide-in-and-out2 opacity-0">TypeScript</div>
            <div className="absolute animate-slide-in-and-out3 opacity-0">Tailwind</div>
            <div className="absolute animate-slide-in-and-out4 opacity-0">Firebase</div>
          </div>
        </div>
      </div>
    )
  }

  const displayRegister = () => {
    return (
      <>
        {/* Register for large screens */}
        <div>
          <div
            className={`${
              showRegister
                ? 'opacity-1 hidden translate-y-[-50%] lg:block'
                : 'pointer-events-none translate-y-[-60%] opacity-0'
            } transition-transform-opacity absolute left-1/2 top-1/2 z-20 grid h-[clamp(300px,90svh,750px)] w-[600px] translate-x-[-50%] items-center overflow-scroll rounded-3xl bg-purpleSoft duration-700 ease-in-out lg:grid`}
          >
            <button
              className="absolute right-0 top-0 cursor-pointer p-6"
              onClick={() => {
                setShowRegister(false)
              }}
            >
              <img src={closeGrayFilled} alt="exit register" className="w-[50px]" />
            </button>
            <div className="">
              <Register showRegister={showRegister} setShowRegister={setShowRegister} />
            </div>
          </div>

          <div
            className={`${
              showRegister ? 'pointer-events-auto hidden opacity-30 lg:block' : 'pointer-events-none opacity-0'
            } absolute z-10 h-[100svh] w-[100svw] bg-black transition-opacity duration-700`}
            onClick={() => {
              setShowRegister(false)
            }}
            aria-hidden="true"
          ></div>
        </div>

        {/* Register for small screens */}
        <div className={`block lg:hidden ${showRegister ? '' : 'pointer-events-none hidden'}`}>
          <Register showRegister={showRegister} setShowRegister={setShowRegister} />
        </div>
      </>
    )
  }

  return (
    <>
      {displayRegister()}
      <div
        className={`grid h-[100vh] grid-rows-[9fr,11fr] justify-items-center gap-4 bg-purpleSoft lg:flex lg:items-center lg:justify-center lg:p-10 ${
          showRegister ? 'pointer-events-none hidden lg:block' : ''
        }`}
      >
        <div className={`${showLoadingBar ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}>
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <LoadingBar />
          </div>
          <div className="absolute inset-0 z-10 h-full w-full bg-black opacity-25"></div>
        </div>

        {/*// - Logo & Title */}
        <div className="grid justify-items-center text-center lg:mr-[10svw]">
          <img src={logoBlackFilled} alt="" className="animate-logo w-[125px] lg:w-[clamp(100px,20svw,300px)]" />
          <div className="text-[35px] lg:text-[clamp(40px,5svw,70px)]">
            <div className="ml-[4px]">
              <div className="font-mainFont nowrap animate-title-reveal h-full w-full text-[35px] font-bold text-black opacity-0 lg:text-[clamp(40px,5svw,70px)]">
                NetCity
              </div>
            </div>
          </div>
          {/* // - Patrik Rasch info */}
          {projectInformation()}
        </div>

        {/*// - The rest */}

        <div className="grid justify-items-center gap-6 text-xl">
          <div className="hidden w-full gap-4 lg:grid">
            <div className="relative text-center text-[30px] font-bold">
              Login
              <button
                className={`animate-button-pop-in-desktop absolute right-0 h-[30px] w-[120px] scale-0 rounded-xl bg-black text-small font-semibold leading-[17px] text-white outline-purpleMain transition duration-300 hover:scale-[96%] ${
                  (email === 'test@gmail.com' && password === '123123') || email !== '' || password !== ''
                    ? 'pointer-events-none opacity-0'
                    : 'opacity-100'
                } `}
                onClick={() => {
                  setEmail('test@gmail.com')
                  setPassword('123123')
                }}
                aria-label="add test user information into input fields"
              >
                Use test user
              </button>
            </div>
            <div className=" h-[1px] w-full bg-black"></div>
          </div>
          <div className="relative flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
            <button
              className={`animate-button-pop-in-mobile absolute right-2 h-[30px] w-[100px] scale-0 rounded-xl bg-black text-smaller font-semibold leading-[10px] text-white outline-purpleMain transition duration-300 hover:scale-[96%] lg:hidden ${
                (email === 'test@gmail.com' && password === '123123') || email !== ''
                  ? 'pointer-events-none opacity-0'
                  : 'opacity-100'
              }`}
              onClick={() => {
                setEmail('test@gmail.com')
                setPassword('123123')
              }}
            >
              Use test user
            </button>

            <img src={mailPurpleFilled} alt="" className="absolute h-[33px] pl-4" />
            <input
              type="email"
              className="h-[45px] w-full rounded-3xl bg-white pl-16 text-[16px] text-black outline-purpleMain"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
            <img src={lockPurpleFilled} alt="" className="absolute h-[33px] pl-4" />
            <input
              type="password"
              className="h-[45px] w-full rounded-3xl bg-white pl-16 text-[16px] text-black outline-purpleMain"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
          </div>

          {/*// - Login and Sign up with Google section */}
          <div className="grid justify-items-center gap-3 text-xl lg:gap-4">
            <button
              className="h-[45px] w-[clamp(100px,75svw,400px)] rounded-3xl bg-black text-white outline-purpleMain"
              onClick={() => {
                handleLogin()
              }}
            >
              Login with e-mail
            </button>
            {/*// - "or" divider */}
            <div className="flex items-center justify-around">
              <div className="text-medium text-grayMain">OR</div>
            </div>

            <div className="grid justify-center gap-2 lg:gap-6">
              <button
                className="flex h-[45px] w-[clamp(100px,65svw,350px)] items-center justify-center gap-2 rounded-3xl bg-white p-3 text-[14px] text-black outline-purpleMain"
                onClick={() => {
                  alert('This feature is coming soon')
                }}
              >
                <img src={logoGoogle} alt="" className="w-[26px]" />
                <div>Sign-In with Google</div>
              </button>

              {/*// - Create new account button */}
              <div className="flex justify-center">
                <div className="text-medium text-grayMain">Don't have an account?</div>
                <button
                  className="pl-1 text-medium font-semibold text-purpleMain underline"
                  onClick={() => {
                    setShowRegister(true)
                    stopAuthListener()
                  }}
                >
                  Signup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
