import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
//6 Login user alert error must be sexified later on.

import { useLoggedInUserId } from "./context/LoggedInUserProfileDataContextProvider";

import logoIcon from "../assets/icons/logoIcon.png";
import mailIconPurple from "../assets/icons/mailIcon.svg";
import lockIconPurple from "../assets/icons/lockIcon/lockIcon-purple.svg";
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
    <div className="grid grid-rows-[9fr,11fr] gap-10 justify-center h-[100vh]">
      {/*// - Header */}
      <div className="justify-self-center self-end text-center">
        <img src={logoIcon} alt="" className="w-[150px]" />
        <div className="text-purpleMain font-mainFont font-bold text-[40px]">NetCity</div>
      </div>

      {/*// - The rest */}
      <div className="grid content-start text-xl gap-4">
        <div className="flex items-center bg-graySoft rounded-3xl w-[75svw]">
          <img src={mailIconPurple} alt="" className="h-[33px] absolute pl-4" />
          <input
            type="email"
            className="h-[45px] w-full pl-16 rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
            placeholder="John@gmail.com"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-graySoft rounded-3xl w-[75svw]">
          <img src={lockIconPurple} alt="" className="h-[33px] absolute pl-4" />
          <input
            type="password"
            className="pl-16 h-[45px] w-full rounded-3xl bg-graySoft text-black outline-purpleMain text-[16px]"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/*// - Login and Sign up with Google section */}
        <div className="grid text-xl gap-4">
          <button
            className="rounded-3xl w-[75svw] h-[45px] text-white bg-black outline-purpleMain"
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

          <div className="grid gap-2 justify-center">
            <button
              className="flex p-3 h-[45px] justify-center items-center gap-2 rounded-3xl w-[65svw] text-black text-[14px] bg-graySoft outline-purpleMain"
              onClick={() => {
                alert("This feature is coming soon");
              }}
            >
              <img src={googleIcon} alt="" className="w-[26px]" />
              <div>Sign-In with Google</div>
            </button>

            {/*// - Create new account button */}
            <div className="flex justify-center">
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
      </div>
    </div>
  );
};

export default Login;
