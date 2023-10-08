import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Unsubscribe, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'
import { Firestore } from 'firebase/firestore'
import { auth } from '../config/firebase.config'

//6 Login user alert error must be sexified later on.

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import LoadingBar from './LoadingBar'

import logoPurpleFilled from '../assets/icons/logo/logoPurpleFilled.webp'
import logoBlackFilled from '../assets/icons/logo/logoBlackFilled.webp'
import mailPurpleFilled from '../assets/icons/mail/mailPurpleFilled.svg'
import lockPurpleFilled from '../assets/icons/lock/lockPurpleFilled.webp'
import logoGoogle from '../assets/icons/google/logoGoogle.svg'

const Login = () => {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [languageToDisplay, setLanguageToDisplay] = useState<string>('')
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [unsubscribeFunction, setUnsubscribeFunction] = useState<Unsubscribe | null>(null)
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
        <div className="italic">A social media project by</div>
        <a
          href="https://www.GitHub.com/PatrikRasch"
          className="w-min justify-self-center font-semibold text-purpleMain"
        >
          GitHub.com/PatrikRasch
        </a>
        <div className="just grid justify-center gap-0 lg:gap-1">
          <div className="w-[60svw] italic lg:w-[clamp(100px,40svw,400px)]">Built from scratch with</div>
          <div className="relative flex h-[24px] justify-center overflow-hidden font-semibold">
            <div className="absolute animate-slide-in-and-out1 opacity-0">React</div>
            <div className="absolute animate-slide-in-and-out2 opacity-0">TypeScript</div>
            <div className="absolute animate-slide-in-and-out3 opacity-0">Tailwind</div>
            <div className="absolute animate-slide-in-and-out4 opacity-0">Firebase</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid h-[100vh] grid-rows-[9fr,11fr] justify-items-center gap-4 bg-purpleSoft lg:flex lg:items-center lg:justify-center lg:p-10">
      <div className={`${showLoadingBar ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <LoadingBar />
        </div>
        <div className="absolute inset-0 z-10 h-full w-full bg-black opacity-25"></div>
      </div>

      {/*// - Logo & Title */}
      <div className="grid justify-items-center text-center lg:mr-[10svw]">
        <img src={logoBlackFilled} alt="" className="w-[125px] lg:w-[clamp(100px,20svw,300px)]" />
        <div className="font-mainFont text-[35px] font-bold text-black lg:text-[clamp(40px,5svw,70px)]">NetCity</div>
        {/* // - Patrik Rasch info */}
        {projectInformation()}
      </div>

      {/*// - The rest */}

      <div className="grid justify-items-center gap-6 text-xl">
        <div className="hidden w-full gap-4 lg:grid">
          <div className="relative text-center text-[30px] font-bold">
            Login
            <button
              className={`absolute right-0 h-[30px] w-[120px] rounded-xl bg-black text-small font-semibold leading-[17px] text-white outline-purpleMain transition duration-300 hover:scale-[96%] ${
                (email === 'test@gmail.com' && password === '123123') || email !== ''
                  ? 'pointer-events-none opacity-0'
                  : ''
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
            className={`absolute right-2 h-[30px] w-[100px] rounded-xl bg-black text-smaller font-semibold leading-[10px] text-white outline-purpleMain transition duration-300 hover:scale-[96%] lg:hidden ${
              (email === 'test@gmail.com' && password === '123123') || email !== ''
                ? 'pointer-events-none opacity-0'
                : ''
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
                  navigate('/register')
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
  )
}

export default Login
