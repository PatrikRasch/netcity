import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, googleProvider, db } from "./../config/firebase.config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

import mailIconPurple from "../assets/icons/mailIcon.svg";
import lockIconPurple from "../assets/icons/lockIcon/lockIcon-purple.svg";
import googleIcon from "../assets/icons/googleIcon.svg";

import LoadingBar from "./LoadingBar";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formFilled, setFormFilled] = useState(false); // For checking if all form fields are filled
  const [passwordsMatch, setPasswordsMatch] = useState(false); // For checking if passwords match
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  //1 Runs if the "Register account" button is clicked
  const registerAccountWithEmail = async () => {
    checkIfAllFieldsEntered();
    checkIfPasswordsMatch();
    //2 Need to fetch the data and check if the entered email already exists.
    //2 If it does, make the user fill in a different email or try to login.
    if (formFilled && passwordsMatch) {
      setShowLoadingBar(true);
      try {
        const userCredentials = await createUserWithEmailAndPassword(auth, email, password); // Stores user credentials/details
        const userId = userCredentials.user.uid; // Gets the id of new user from auth
        const usersCollection = collection(db, "users"); // Grabs the collection from Firebase
        // Defines the data to be added into Firestore for the user
        const dataToAdd = {
          firstName: firstName,
          lastName: lastName,
          bio: "",
          profilePicture: "",
          friends: {},
          currentReceivedFriendRequests: {},
          currentSentFriendRequests: {},
          openProfile: true,
        };
        const docToBeAdded = doc(usersCollection, userId); // Document that is to be added into Firestore
        await setDoc(docToBeAdded, dataToAdd); // Set the document and add it into Firestore
        setShowLoadingBar(false); // Mission complete, remove the loading bar
        setAccountCreated(true); // Account created, set state to true to trigger navigation
      } catch (err) {
        console.error(err);
      }
    }
  };

  //1 Runs if the "Sign in with Google" button is clicked
  //2 Must add the same as in the above function into this function
  const registerAccountWithGoogle = async () => {
    checkIfAllFieldsEntered();
    checkIfPasswordsMatch();
    if (formFilled && passwordsMatch) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (err) {
        console.error(err);
      }
    }
  };

  //1 Runs every time a user tries to register
  const checkIfAllFieldsEntered = () => {
    if (firstName.length === 0 || lastName.length === 0 || email.length === 0 || password.length === 0) {
      setFormFilled(false);
      alert("All fields are required (change this to better form validation later)");
    } else setFormFilled(true);
  };

  //1 Runs every time a user tries to register
  const checkIfPasswordsMatch = () => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      alert("Passwords must match (change this to better form validation later)");
    } else setPasswordsMatch(true);
  };

  const redirect = () => {
    if (accountCreated === true) {
      setTimeout(() => {
        navigate("/profile");
      }, 1000);
    }
  };

  //2 Gotta make the "Account created" message look sexier
  const accountCreatedJSX = () => {
    redirect();
    return (
      <div>
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <div className="text-4xl bg-white p-4 rounded-xl">Account created</div>
        </div>
        <div className="absolute bg-black opacity-25 inset-0 z-10"></div>
      </div>
    );
  };

  return (
    <div>
      <div className={`${showLoadingBar ? "opacity-100" : "opacity-0"} pointer-events-none transition`}>
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <LoadingBar />
        </div>
        <div className="absolute bg-black opacity-25 inset-0 z-10"></div>
      </div>
      <div className={`${accountCreated ? "opacity-100" : "opacity-0"} pointer-events-none transition`}>
        {accountCreatedJSX()}
      </div>
      <div className="grid justify-center pt-14 pb-20 h-[100svh]">
        {/* // - Header */}
        <div className="flex flex-col justify-center text-center">
          <div className="text-2xl text-purpleMain opacity-60">Become a citizen of</div>
          <div className="text-6xl font-bold  text-purpleMain">NetCity</div>
        </div>
        {/*// - Account Details */}
        <section className="grid justify-center pt-6 gap-3">
          <div className="grid gap-1">
            <div className="text-center text-[18px]">Account Details</div>
            <div className="w-full h-[1.5px] bg-grayLineThin"></div>
          </div>
          <div className="text-base text-center text-grayMain text-[13px]">You can use your real name or an alias</div>
          <div className="grid gap-4">
            <input
              type="text"
              className="p-2 pl-6 h-[40px] w-[75svw] rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
              placeholder="First name"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
            />
            <input
              type="text"
              className="p-2 pl-6 h-[40px] w-[75svw] rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
              placeholder="Surname"
              onChange={(e) => {
                setLastName(e.target.value);
              }}
            />
          </div>
        </section>
        {/* // - Login Details */}
        <section>
          <div className="flex flex-col items-center justify-around pt-4 pb-4 gap-1">
            <div className="text-[18px]">Login Details</div>
            <div className="w-full h-[1.5px] bg-grayLineThin"></div>
          </div>
          {/*//1 Email and password section */}
          <div className="grid text-xl gap-4">
            <div className="flex items-center bg-graySoft rounded-3xl w-[75svw]">
              <img src={mailIconPurple} alt="" className="h-[33px] absolute pl-4" />
              <input
                type="email"
                className="p-2 pl-16 h-[40px] w-full rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-graySoft rounded-3xl w-[75svw]">
              <img src={lockIconPurple} alt="" className="h-[33px] absolute pl-4" />
              <input
                type="password"
                className="p-2 pl-16 h-[40px] w-full rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center bg-graySoft rounded-3xl w-[75svw]">
              <img src={lockIconPurple} alt="" className="h-[33px] absolute pl-4" />
              <input
                type="password"
                className="p-2 pl-16 h-[45px] w-full rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </section>
        {/*// - Register account button */}
        <div className="text-xl pt-6">
          <button
            className="flex items-center justify-center p-3 rounded-3xl w-[75svw] h-[45px] text-white bg-black outline-purpleMain"
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
        <div className="flex flex-col items-center text-xl pt-4">
          <button
            className="flex p-3 h-[45px] items-center justify-center gap-2 rounded-3xl w-[65svw] text-black text-[14px] bg-graySoft outline-purpleMain"
            onClick={() => {
              // onClick={registerAccountWithGoogle}
              alert("This feature is coming soon");
            }}
          >
            <img src={googleIcon} alt="" className="w-[26px]" />
            <div>Sign-In with Google</div>
          </button>
        </div>
        <div className="flex justify-center items-center p-4">
          <div className="text-medium text-grayMain">Already have an account?</div>
          <button
            className="text-medium pl-1 text-purpleMain underline font-semibold"
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
