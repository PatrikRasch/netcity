import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'

//6 Login user alert error must be sexified later on.

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import logoIcon from '../assets/icons/logoIcon.png'
import mailIconPurple from '../assets/icons/mailIcon.svg'
import lockIconPurple from '../assets/icons/lockIcon/lockIcon-purple.svg'
import googleIcon from '../assets/icons/googleIcon.svg'

const Login = () => {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [languageToDisplay, setLanguageToDisplay] = useState<string>('')
  const navigate = useNavigate()

  //1 Check if user is signed in
  useEffect(() => {
    onAuthStateChanged(getAuth(), async (user) => {
      if (user) navigate(`/profile/${user.uid}`)
    })
  }, [])

  const handleLogin = async () => {
    const auth = getAuth()
    try {
      await signInWithEmailAndPassword(auth, email, password).then((userCredentials) => {
        navigate(`/profile/${userCredentials.user.uid}`)
      })
    } catch (err) {
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
    <div className="grid h-[100vh] grid-rows-[9fr,11fr] justify-items-center gap-4 lg:flex lg:items-center lg:justify-evenly lg:p-10">
      {/*// - Logo & Title */}
      <div className="grid justify-items-center self-end text-center lg:self-center">
        <img src={logoIcon} alt="" className="w-[125px] lg:w-[clamp(100px,20svw,300px)]" />
        <div className="font-mainFont text-[35px] font-bold text-purpleMain lg:text-[clamp(40px,5svw,70px)]">
          NetCity
        </div>

        {/* // - Patrik Rasch info */}
        {projectInformation()}
      </div>

      {/*// - The rest */}
      <div className="grid content-start justify-items-center gap-6 text-xl">
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
            >
              Use test user
            </button>
          </div>
          <div className=" h-[2px] w-full bg-grayLineThin"></div>
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

          <img src={mailIconPurple} alt="" className="absolute h-[33px] pl-4" />
          <input
            type="email"
            className="h-[45px] w-full rounded-3xl bg-graySoft pl-16 text-[16px] text-black outline-purpleMain"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>
        <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
          <img src={lockIconPurple} alt="" className="absolute h-[33px] pl-4" />
          <input
            type="password"
            className="h-[45px] w-full rounded-3xl bg-graySoft pl-16 text-[16px] text-black outline-purpleMain"
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
              className="flex h-[45px] w-[clamp(100px,65svw,350px)] items-center justify-center gap-2 rounded-3xl bg-graySoft p-3 text-[14px] text-black outline-purpleMain"
              onClick={() => {
                alert('This feature is coming soon')
              }}
            >
              <img src={googleIcon} alt="" className="w-[26px]" />
              <div>Sign-In with Google</div>
            </button>

            {/*// - Create new account button */}
            <div className="flex justify-center">
              <div className="text-medium text-grayMain">Don't have an account?</div>
              <button
                className="pl-1 text-medium font-semibold text-purpleMain underline"
                onClick={() => {
                  navigate('/register')
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
