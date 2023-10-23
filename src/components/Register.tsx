import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { auth, googleProvider, db } from './../config/firebase.config'
import { createUserWithEmailAndPassword, signInWithPopup, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth'
import { collection, doc, setDoc } from 'firebase/firestore'

import mailPurpleFilled from '../assets/icons/mail/mailPurpleFilled.svg'
import lockPurpleFilled from '../assets/icons/lock/lockPurpleFilled.webp'
import logoGoogle from '../assets/icons/google/logoGoogle.svg'

import FormValidationAlertMessage from './FormValidationAlertMessage'
import LoadingBar from './LoadingBar'

interface Props {
  showRegister: boolean
  setShowRegister: (value: boolean) => void
  validateRegisterFirstName: boolean
  setValidateRegisterFirstName: (value: boolean) => void
  validateRegisterLastName: boolean
  setValidateRegisterLastName: (value: boolean) => void
  validateRegisterEmail: boolean
  setValidateRegisterEmail: (value: boolean) => void
  validateRegisterPassword: boolean
  setValidateRegisterPassword: (value: boolean) => void
  validateRegisterConfirmPassword: boolean
  setValidateRegisterConfirmPassword: (value: boolean) => void
  resetRegisterFormValidationState: () => void
}

const Register = ({
  showRegister,
  setShowRegister,
  validateRegisterFirstName,
  setValidateRegisterFirstName,
  validateRegisterLastName,
  setValidateRegisterLastName,
  validateRegisterEmail,
  setValidateRegisterEmail,
  validateRegisterPassword,
  setValidateRegisterPassword,
  validateRegisterConfirmPassword,
  setValidateRegisterConfirmPassword,
  resetRegisterFormValidationState,
}: Props) => {
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
  const [showValidationAlertMessage, setShowValidationAlertMessage] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // - Runs if the "Register account" button is clicked
  const registerAccountWithEmail = async () => {
    //2 Need to fetch the datand check if the entered email already exists.
    //2 If it does, make the user fill in a different email or try to login.
    if (handleFormValidation() === true) return
    if (
      checkIfPasswordsMatch() &&
      !(await checkIfEmailIsAlreadyRegistered(email).then((exists) => {
        if (exists) {
          setShowValidationAlertMessage(true)
          setErrorMessage('Email already exists')
          setTimeout(() => {
            setShowValidationAlertMessage(false)
          }, 3000)
          return true
        } else {
          return false
        }
      }))
    ) {
      setShowLoadingBar(true)
      try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password) // Stores user credentials/details
        const userId = userCredentials.user.uid // Gets the id of new user from auth
        const usersCollection = collection(db, 'users') // Grabs the collection from Firebase
        // Defines the data to be added into Firestore for the user
        const dataToAdd = {
          firstName: capitalizeFirstLetterOfWords(firstName),
          lastName: capitalizeFirstLetterOfWords(lastName),
          bio: '',
          profilePicture: '',
          friends: {},
          currentReceivedFriendRequests: {},
          currentSentFriendRequests: {},
          openProfile: true,
        }
        const docToBeAdded = doc(usersCollection, userId) // Document that is to be added into Firestore
        await setDoc(docToBeAdded, dataToAdd) // Set the document and add it into Firestore

        setTimeout(() => {
          setShowLoadingBar(false) // Mission complete, remove the loading bar
          setAccountCreated(true) // Account created, set state to true to trigger navigation
          setTimeout(() => {
            const user = auth.currentUser
            navigate(`/profile/${user?.uid}`)
          }, 1000)
        }, 750)
      } catch (err) {
        console.error(err)
        setShowLoadingBar(false) // Mission failed, remove the loading bar
      }
    }
  }

  const capitalizeFirstLetterOfWords = (str: string) => {
    return str.replace(/\b\w/g, (match: string) => match.toUpperCase())
  }

  const checkIfEmailIsAlreadyRegistered = (email: string) => {
    return fetchSignInMethodsForEmail(auth, email)
      .then((signInMethods) => {
        return signInMethods.length > 0
      })
      .catch((error) => {
        console.error('Error checking email existence:', error)
        return false
      })
  }

  //1 Runs if the "Sign in with Google" button is clicked
  //2 Must add the same as in the above function into this function
  const registerAccountWithGoogle = async () => {
    // handleFormValidation
    // checkIfPasswordsMatch()
    if (formFilled && passwordsMatch) {
      try {
        await signInWithPopup(auth, googleProvider)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleFormValidation = () => {
    if (firstName.length === 0) setValidateRegisterFirstName(true)
    if (lastName.length === 0) setValidateRegisterLastName(true)
    if (email.length === 0) setValidateRegisterEmail(true)
    if (password.length === 0) setValidateRegisterPassword(true)
    if (confirmPassword.length === 0) setValidateRegisterConfirmPassword(true)
    if (
      firstName.length === 0 ||
      lastName.length === 0 ||
      email.length === 0 ||
      password.length === 0 ||
      confirmPassword.length === 0
    ) {
      setFormFilled(false)
      return true
    }
  }

  //1 Runs every time a user tries to register
  const checkIfPasswordsMatch = () => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false)
      setShowValidationAlertMessage(true)
      setErrorMessage('Passwords do not match')
      setTimeout(() => {
        setShowValidationAlertMessage(false)
      }, 3000)
      return
    } else {
      setPasswordsMatch(true)
      return true
    }
  }

  //2 Gotta make the "Account created" message look sexier
  const accountCreatedJSX = () => {
    return (
      <div>
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-xl bg-white p-4 text-4xl">Account created</div>
        </div>
        <div className="absolute inset-0 z-10 rounded-3xl bg-black opacity-25"></div>
      </div>
    )
  }

  return (
    <>
      <div>
        <FormValidationAlertMessage
          message={errorMessage}
          showValidationAlertMessage={showValidationAlertMessage}
          setShowValidationAlertMessage={setShowValidationAlertMessage}
        />
      </div>
      <div className="min-h-[100svh] bg-purpleSoft lg:min-h-full">
        <div className={`${accountCreated ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}>
          {accountCreatedJSX()}
        </div>

        <div className={`${showLoadingBar ? 'opacity-100' : 'opacity-0'} pointer-events-none transition`}>
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <LoadingBar />
          </div>
          <div className="absolute inset-0 z-10 rounded-3xl bg-black opacity-25"></div>
        </div>

        <div className="grid justify-center pb-20 pt-14 lg:pb-0 lg:pt-0">
          {/* // - Header */}
          <div className="flex flex-col justify-center text-center">
            {/* <div className="text-2xl text-purpleMain opacity-60">Become a citizen of</div> */}
            <div className="text-6xl font-bold  text-black">Register</div>
          </div>
          {/*// - Account Details */}
          <section className="grid justify-center gap-3 pt-6">
            <div className="grid gap-1">
              <div className="text-center text-[18px] font-semibold">Account Details</div>
              <div className="h-[1px] w-full bg-black"></div>
            </div>
            <div className="text-center text-[13px] text-base text-grayMain">
              You can use your real name or an alias
            </div>
            <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
              <input
                type="text"
                className={`transition-colours h-[40px] w-[clamp(100px,75svw,400px)] rounded-3xl border-2 bg-white p-2 pl-6 text-[16px] text-black outline-purpleMain duration-500 lg:w-[100%] ${
                  validateRegisterFirstName ? 'border-redMain' : 'border-transparent'
                }`}
                placeholder={validateRegisterFirstName ? 'First name is required' : 'First name'}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  setValidateRegisterFirstName(false)
                }}
              />
              <input
                type="text"
                className={`transition-colours h-[40px] w-[clamp(100px,75svw,400px)] rounded-3xl border-2 bg-white p-2 pl-6 text-[16px] text-black outline-purpleMain duration-500 lg:w-[100%] ${
                  validateRegisterLastName ? 'border-redMain' : 'border-transparent'
                }`}
                placeholder={validateRegisterLastName ? 'Last name is required' : 'Last name'}
                onChange={(e) => {
                  setLastName(e.target.value)
                  setValidateRegisterLastName(false)
                }}
              />
            </div>
          </section>
          {/* // - Login Details */}
          <section>
            <div className="flex flex-col items-center justify-around gap-1 pb-4 pt-4">
              <div className="text-[18px] font-semibold">Login Details</div>
              <div className="h-[1px] w-full bg-black"></div>
            </div>
            {/*//1 Email and password section */}
            <div className="grid gap-4 text-xl lg:justify-items-center">
              <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-white">
                <img src={mailPurpleFilled} alt="" className="absolute h-[33px] pl-4" />
                <input
                  type="email"
                  className={`transition-colours h-[40px] w-full rounded-3xl border-2 bg-white p-2 pl-16 text-[16px] text-black outline-purpleMain duration-500 ${
                    validateRegisterEmail ? 'border-redMain' : 'border-transparent'
                  }`}
                  placeholder={validateRegisterEmail ? 'Last email is required' : 'Email'}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setValidateRegisterEmail(false)
                  }}
                />
              </div>

              <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-white">
                <img src={lockPurpleFilled} alt="" className="absolute h-[33px] pl-4" />
                <input
                  type="password"
                  className={`transition-colours h-[40px] w-full rounded-3xl border-2 bg-white p-2 pl-16 text-[16px] text-black outline-purpleMain duration-500 ${
                    validateRegisterPassword ? 'border-redMain' : 'border-transparent'
                  }`}
                  placeholder={validateRegisterPassword ? 'Last password is required' : 'Password'}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setValidateRegisterPassword(false)
                  }}
                />
              </div>
              <div className="flex w-[clamp(100px,75svw,400px)] items-center rounded-3xl bg-white">
                <img src={lockPurpleFilled} alt="" className="absolute h-[33px] pl-4" />
                <input
                  type="password"
                  className={`transition-colours h-[45px] w-full rounded-3xl border-2 bg-white p-2 pl-16 text-[16px] text-black outline-purpleMain duration-500 ${
                    validateRegisterConfirmPassword ? 'border-redMain' : 'border-transparent'
                  }`}
                  placeholder={validateRegisterFirstName ? 'You must confirm your password' : 'Confirm password'}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setValidateRegisterConfirmPassword(false)
                  }}
                />
              </div>
            </div>
          </section>
          {/*// - Register account button */}
          <div className="pt-6 text-xl lg:flex lg:justify-center">
            <button
              className="flex h-[45px] w-[clamp(100px,75svw,400px)] items-center justify-center rounded-3xl bg-black p-3 text-white outline-purpleMain"
              onClick={() => {
                registerAccountWithEmail()
              }}
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
              className="flex h-[45px] w-[clamp(100px,65svw,300px)] items-center justify-center gap-2 rounded-3xl bg-white p-3 text-[14px] text-black outline-purpleMain"
              onClick={() => {
                // onClick={registerAccountWithGoogle}
                alert('This feature is coming soon')
              }}
            >
              <img src={logoGoogle} alt="" className="w-[26px]" />
              <div>Sign-In with Google</div>
            </button>
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="text-medium text-grayMain">Already have an account?</div>
            <button
              className="pl-1 text-medium font-semibold text-purpleMain underline"
              onClick={() => {
                setShowRegister(false)
                resetRegisterFormValidationState()
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
