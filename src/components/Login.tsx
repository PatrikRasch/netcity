import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
//6 Login user alert error must be sexified later on.

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

import logoIcon from "../assets/icons/logoIcon.png";
import googleIcon from "../assets/icons/googleIcon.svg";

const Login = () => {
  const { loggedInUserId, setLoggedInUserId } = useLoggedInUserId();

  const [createNewAccount, setCreateNewAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  //1 Check if user is signed in
  useEffect(() => {
    onAuthStateChanged(getAuth(), async (user) => {
      if (user) navigate(`/profile/${user.uid}`);
    });
  }, []);

  const redirect = () => {
    if (createNewAccount === true) navigate("/register");
  };

  redirect();

  const handleLogin = async () => {
    const auth = getAuth();
    try {
      await signInWithEmailAndPassword(auth, email, password).then((userCredentials) => {
        // console.log("User logged in: ", userCredentials);
        navigate(`/profile/${userCredentials.user.uid}`);
      });
    } catch (err) {
      console.error(err);
      alert("Username and/or password does not match");
    }
  };

  return (
    <div className="grid grid-rows-[1fr,1fr] justify-center">
      {/*// - Header */}
      <div className="flex flex-col items-center pt-4 justify-center text-center">
        <img src={logoIcon} alt="" className="w-[150px]" />
        <div className="text-purpleMain font-mainFont font-bold text-[40px]">NetCity</div>
      </div>

      {/*// - The rest */}
      <div className="">
        <div className="grid text-xl gap-6 p-3">
          <input
            type="email"
            className="p-3 pl-6 min-h-[40px] w-[75svw] rounded-3xl bg-graySoft text-black outline-purpleMain"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="p-3 pl-6 min-h-[40px] w-[75svw] rounded-3xl bg-graySoft text-black outline-purpleMain"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/*// - Login and Sign up with Google section */}
        <div className="flex flex-col items-center text-xl p-2 gap-3">
          <button
            className="p-3 rounded-3xl w-[75svw] min-h-[40px] text-white bg-black outline-purpleMain"
            onClick={() => {
              handleLogin();
            }}
          >
            Login with e-mail
          </button>
          {/*// - "or" divider */}
          <div className="flex items-center justify-around">
            <div className="text-medium text-grayMain">OR</div>
          </div>

          <button className="flex p-3 min-h-[40px] justify-center gap-2 rounded-3xl min-w-[65svw] text-black text-[14px] bg-graySoft outline-purpleMain">
            <img src={googleIcon} alt="" className="w-[26px]" />
            <div>Sign-In with Google</div>
          </button>
        </div>

        {/*// - Create new account button */}
        <div className="p-3 flex justify-center">
          <div className="text-medium text-grayMain">Don't have an account?</div>
          <button
            className="text-medium pl-1 text-purpleMain underline font-semibold"
            onClick={() => {
              setCreateNewAccount(true);
            }}
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
