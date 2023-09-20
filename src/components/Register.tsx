import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { auth, googleProvider, db } from './../config/firebase.config'
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { collection, doc, setDoc } from 'firebase/firestore'

import mailIconPurple from '../assets/icons/mailIcon.svg'
import lockIconPurple from '../assets/icons/lockIcon/lockIcon-purple.svg'
import googleIcon from '../assets/icons/googleIcon.svg'

import LoadingBar from './LoadingBar'

const Register = () => {
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formFilled, setFormFilled] = useState(false) // For checking if all form fields are filled
  const [passwordsMatch, setPasswordsMatch] = useState(false) // For checking if passwords match
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)

  //1 Runs if the "Register account" button is clicked
  const registerAccountWithEmail = async () => {
    checkIfAllFieldsEntered()
    checkIfPasswordsMatch()
    //2 Need to fetch the datand check if the entered email already exists.
    //2 If it does, make the user fill in a different email or try to login.
    if (formFilled && passwordsMatch) {
      setShowLoadingBar(true)
      try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password) // Stores user credentials/details
        const userId = userCredentials.user.uid // Gets the id of new user from auth
        const usersCollection = collection(db, 'users') // Grabs the collection from Firebase
        // Defines the data to be added into Firestore for the user
        const dataToAdd = {
          firstName: firstName,
          lastName: lastName,
          bio: '',
          profilePicture: '',
          friends: {},
          currentReceivedFriendRequests: {},
          currentSentFriendRequests: {},
          openProfile: true,
        }
        const docToBeAdded = doc(usersCollection, userId) // Document that is to be added into Firestore
        await setDoc(docToBeAdded, dataToAdd) // Set the document and add it into Firestore
        setShowLoadingBar(false) // Mission complete, remove the loading bar
        setAccountCreated(true) // Account created, set state to true to trigger navigation
      } catch (err) {
        console.error(err)
      }
    }
  }

  //1 Runs if the "Sign in with Google" button is clicked
  //2 Must add the same as in the above function into this function
  const registerAccountWithGoogle = async () => {
    checkIfAllFieldsEntered()
    checkIfPasswordsMatch()
    if (formFilled && passwordsMatch) {
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (err) {
        console.error(err)
      }
    }
  }

  //1 Runs every time a user tries to register
  const checkIfAllFieldsEntered = () => {
    if (
      firstName.length === 0 ||
      lastName.length === 0 ||
      email.length === 0 ||
      password.length === 0
    ) {
      setFormFilled(false)
      alert('All fields are required (change this to better form validation later)')
    } else setFormFilled(true)
  }

  //1 Runs every time a user tries to register
  const checkIfPasswordsMatch = () => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false)
      alert('Passwords must match (change this to better form validation later)')
    } else setPasswordsMatch(true)
  }

  const redirect = () => {
    if (accountCreated === true) {
      setTimeout(() => {
        navigate('/profile')
      }, 1000)
    }
  }

  //2 Gotta make the "Account created" message look sexier
  const accountCreatedJSX = () => {
    redirect()
    return (
      <div>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-xl bg-white p-4 text-4xl">Account created</div>
        </div>
        <div className="absolute inset-0 z-10 bg-black opacity-25"></div>
      </div>
    )
  }

  return (
    <div>
      <div
        className={`${showLoadingBar ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}
      >
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <LoadingBar />
        </div>
        <div className="absolute inset-0 z-10 bg-black opacity-25"></div>
      </div>
      <div
        className={`${accountCreated ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}
      >
        {accountCreatedJSX()}
      </div>
      <div className="grid h-[100svh] justify-center pb-20 pt-14 lg:h-[100%] lg:pb-0 lg:pt-0">
        {/* // - Header */}
        <div className="flex flex-col justify-center text-center">
          <div className="text-2xl text-purpleMain opacity-60">Become a citizen of</div>
          <div className="text-6xl font-bold  text-purpleMain">NetCity</div>
        </div>
        {/*// - Account Details */}
        <section className="grid justify-center gap-3 pt-6">
          <div className="grid gap-1">
            <div className="text-center text-[18px] font-semibold">Account Details</div>
            <div className="h-[1.5px] w-full bg-grayLineThin"></div>
          </div>
          <div className="text-center text-[13px] text-base text-grayMain">
            You can use your real name or an alias
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
            <input
              type="text"
              className="h-[40px] w-[clamp(100px,75svw,400px)] rounded-3xl bg-graySoft p-2 pl-6 text-[16px] text-black outline-purpleMain lg:w-[100%]"
              placeholder="First name"
              onChange={(e) => {
                setFirstName(e.target.value)
              }}
            />
            <input
              type="text"
              className="h-[40px] w-[clamp(100px,75svw,400px)] rounded-3xl bg-graySoft p-2 pl-6 text-[16px] text-black outline-purpleMain lg:w-[100%]"
              placeholder="Surname"
              onChange={(e) => {
                setLastName(e.target.value)
              }}
            />
          </div>
        </section>
        {/* // - Login Details */}
        <section>
          <div className="flex flex-col items-center justify-around gap-1 pb-4 pt-4">
            <div className="text-[18px] font-semibold">Login Details</div>
            <div className="h-[1.5px] w-full bg-grayLineThin"></div>
          </div>
          {/*//1 Email and password section */}
          <div className="grid gap-4 text-xl lg:justify-items-center">
            <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
              <img src={mailIconPurple} alt="" className="absolute h-[33px] pl-4" />
              <input
                type="email"
                className="h-[40px] w-full rounded-3xl bg-graySoft p-2 pl-16 text-[16px] text-black outline-purpleMain"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
              <img src={lockIconPurple} alt="" className="absolute h-[33px] pl-4" />
              <input
                type="password"
                className="h-[40px] w-full rounded-3xl bg-graySoft p-2 pl-16 text-[16px] text-black outline-purpleMain"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-graySoft">
              <img src={lockIconPurple} alt="" className="absolute h-[33px] pl-4" />
              <input
                type="password"
                className="h-[45px] w-full rounded-3xl bg-graySoft p-2 pl-16 text-[16px] text-black outline-purpleMain"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </section>
        {/*// - Register account button */}
        <div className="pt-6 text-xl lg:flex lg:justify-center">
          <button
            className="flex h-[45px] w-[clamp(100px,75svw,400px)] items-center justify-center rounded-3xl bg-black p-3 text-white outline-purpleMain"
            onClick={registerAccountWithEmail}
          >
            Register account
          </button>
        </div>
        {/*// - "or" dividor */}
        <div className="flex items-center justify-around pt-4">
          <div className="text-medium text-grayMain">OR</div>
        </div>
        {/*// - Sign up with Google button */}
        <div className="flex flex-col items-center pt-4 text-xl">
          <button
            className="flex h-[45px] w-[clamp(100px,65svw,300px)] items-center justify-center gap-2 rounded-3xl bg-graySoft p-3 text-[14px] text-black outline-purpleMain"
            onClick={() => {
              // onClick={registerAccountWithGoogle}
              alert('This feature is coming soon')
            }}
          >
            <img src={googleIcon} alt="" className="w-[26px]" />
            <div>Sign-In with Google</div>
          </button>
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="text-medium text-grayMain">Already have an account?</div>
          <button
            className="pl-1 text-medium font-semibold text-purpleMain underline"
            onClick={() => {
              navigate('/login')
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Register
