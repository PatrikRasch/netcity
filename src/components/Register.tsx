import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { auth, googleProvider, db } from "./../config/firebase.config";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";

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
    if (
      firstName.length === 0 ||
      lastName.length === 0 ||
      email.length === 0 ||
      password.length === 0
    ) {
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
    <div className="min-h-[100svh]">
      <div
        className={`${showLoadingBar ? "opacity-100" : "opacity-0"} pointer-events-none transition`}
      >
        <div className="absolute inset-0 flex justify-center items-center z-20">
          <LoadingBar />
        </div>
        <div className="absolute bg-black opacity-25 inset-0 z-10"></div>
      </div>
      <div
        className={`${accountCreated ? "opacity-100" : "opacity-0"} pointer-events-none transition`}
      >
        {accountCreatedJSX()}
      </div>
      <div className="min-h-[90svh] grid justify-center">
        <div className="flex flex-col pt-4 justify-center text-center">
          <div className="text-2xl">Become a citizen of</div>
          <div className="text-6xl font-Hertical">NetCity</div>
        </div>
        {/*//1 Name section */}
        <div className="grid text-xl gap-4 m-4">
          <div className="text-base text-center">You can use your real name or an alias</div>
          <input
            type="text"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="First name"
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
          />
          <input
            type="text"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Surname"
            onChange={(e) => {
              setLastName(e.target.value);
            }}
          />
        </div>
        <div className="flex items-center justify-around">
          <div className="w-[20svw] h-[2px] bg-black"></div>
          <div className="text-xl">Login details</div>
          <div className="w-[20svw] h-[2px] bg-black"></div>
        </div>
        {/*//1 Email and password section */}
        <div className="grid text-xl gap-4 m-4">
          <input
            type="email"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            className="p-2 pl-4 border-2 min-h-[40px] min-w-[75svw] rounded-md border-black shadow-lg"
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {/*//1 Register account button */}
        <div className="flex flex-col items-center text-xl">
          <button
            className="p-4 rounded-md border-2 border-black min-w-[60svw] shadow-lg min-h-[50px] m-2 text-white bg-[#00A7E1]"
            onClick={registerAccountWithEmail}
          >
            Register account
          </button>
        </div>
        {/*//1 "or" dividor */}
        <div className="flex items-center justify-around">
          <div className="w-[28svw] h-[2px] bg-black"></div>
          <div className="text-xl">or</div>
          <div className="w-[28svw] h-[2px] bg-black"></div>
        </div>
        {/*//1 Sign up with Google button */}
        <div className="flex flex-col items-center text-xl">
          <button
            className="p-4 min-h-[50px] border-2 border-black rounded-md min-w-[60svw] shadow-lg m-2 text-white bg-[#00AF54]"
            onClick={registerAccountWithGoogle}
          >
            Sign in with Google
          </button>
        </div>
        <button
          className="text-center underline text-blue-400 cursor-pointer justify-self-center self-center"
          onClick={() => {
            navigate("/login");
          }}
        >
          Already have an account?
        </button>
      </div>
      {/*//1 Footer */}
      <div className="flex justify-center items-end text-3xl min-h-[10svh] pb-8 font-Hertical">
        NetCity
      </div>
    </div>
  );
};

export default Register;
