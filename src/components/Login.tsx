import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth'

import DisplayRegister from './DisplayRegister'
//6 Login user alert error must be sexified later on.

import { useLoggedInUserId } from './context/LoggedInUserProfileDataContextProvider'

import logoIcon from '../assets/icons/logoIcon.png'
import mailIconPurple from '../assets/icons/mailIcon.svg'
import lockIconPurple from '../assets/icons/lockIcon/lockIcon-purple.svg'
import googleIcon from '../assets/icons/googleIcon.svg'

const Login = () => {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId()

  const [createNewAccount, setCreateNewAccount] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  //1 Check if user is signed in
  useEffect(() => {
    onAuthStateChanged(getAuth(), async (user) => {
      if (user) navigate(`/profile/${user.uid}`)
    })
  }, [])

  const redirect = () => {
    if (createNewAccount === true) navigate('/register')
  }

  redirect()

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

  return (
    <div className="grid h-[100vh] grid-rows-[9fr,11fr] justify-items-center gap-4 lg:flex lg:items-center lg:justify-evenly lg:p-10">
      {/*// - Logo & Title */}
      <div className="grid justify-items-center self-end text-center lg:self-center">
        <img src={logoIcon} alt="" className="w-[150px] lg:w-[clamp(100px,20svw,300px)]" />
        <div className="font-mainFont text-[40px] font-bold text-purpleMain lg:text-[clamp(40px,5svw,70px)]">
          NetCity
        </div>

        {/* // - Patrik Rasch info */}
        <div className="grid pt-2">
          <div className="text-small italic">A social media project by Patrik Rasch</div>
          <a
            href="https://www.GitHub.com/PatrikRasch"
            className="text-small font-semibold text-purpleMain"
          >
            GitHub.com/PatrikRasch
          </a>
          <div className="w-[60svw] text-small italic lg:w-[clamp(100px,40svw,400px)]">
            Developed with React, TypeScript, Tailwind and Firebase
          </div>
        </div>
      </div>

      {/*// - The rest */}
      <div className="grid content-start justify-items-center gap-6 text-xl">
        <div className="hidden w-full gap-4 lg:grid">
          <div className="text-center text-[30px] font-bold">Login</div>
          <div className=" h-[2px] w-full bg-grayLineThin"></div>
        </div>
        <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
          <img src={mailIconPurple} alt="" className="absolute h-[33px] pl-4" />
          <input
            type="email"
            className="h-[45px] w-full rounded-3xl bg-graySoft pl-16 text-[16px] text-black outline-purpleMain"
            placeholder="test@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
          <img src={lockIconPurple} alt="" className="absolute h-[33px] pl-4" />
          <input
            type="password"
            className="h-[45px] w-full rounded-3xl bg-graySoft pl-16 text-[16px] text-black outline-purpleMain"
            placeholder="123123"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/*// - Login and Sign up with Google section */}
        <div className="grid justify-items-center gap-4 text-xl">
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
                  setCreateNewAccount(true)
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
