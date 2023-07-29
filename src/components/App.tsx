import React, { useState, useEffect } from "react";
import { BrowserRouter, useParams } from "react-router-dom";
import RouteSwitch from "./RouteSwitch";
import { getAuth, onAuthStateChanged } from "firebase/auth";

function App() {
  const [loggedInUserId, setLoggedInUserId] = useState("");
  const { openProfileId } = useParams();

  useEffect(() => {
    console.log("use effect");
    onAuthStateChanged(getAuth(), async (user) => {
      if (user) {
        setLoggedInUserId(user.uid);
      }
    });
  }, [openProfileId]);

  return (
    <div className="">
      <BrowserRouter>
        <RouteSwitch loggedInUserId={loggedInUserId} setLoggedInUserId={setLoggedInUserId} />
      </BrowserRouter>
    </div>
  );
}

export default App;

//1 Variables naming
//2 Profile being visited: openProfileId
//2 Logged in user: loggedInUserId

//1 Features to build:
//3 Header must not reload every time a navigation is made where header still stays on-screen. (Lazyloading React ✓)
//2 Comments on all posts (should comment input field be visible by default?)
//2 - Ability to like and dislike comments
//2 An editable about page on Profile
//2 The Public page in general must be implemented
//2 The ability to add friends
//2 Option to have closed or open profile

//2 Regarding comments being visible:
//2 The comment input field could be visible by default, but to read comments, the comment button must be clicked
//2 Once a user has posted a comment, it'll instantly be visible.
//2 ? The next time the user loads the page where the comment is, it can either stay visible or disappear 🤔
//2 Comments should be sorted in order of when they were posted.
//2 Comments need a timestamp / datestamp
//2 ? Should your comments always show up on top for you? YouTube does that
