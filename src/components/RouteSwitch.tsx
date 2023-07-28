import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Header from "./Header";

import { LoggedInUserIdProp } from "../interfaces";

const People = lazy(() => import("./People"));
const Public = lazy(() => import("./Public"));
const About = lazy(() => import("./About"));

interface Props {
  loggedInUserId: LoggedInUserIdProp["loggedInUserId"];
  setLoggedInUserId: LoggedInUserIdProp["setLoggedInUserId"];
}

function RouteSwitch({ loggedInUserId, setLoggedInUserId }: Props) {
  const HeaderDisplaying = () => {
    if (!loggedInUserId) return <h1>Loading..</h1>;
    return (
      <Suspense fallback={<h1>Loading...</h1>}>
        <Header loggedInUserId={loggedInUserId} setLoggedInUserId={setLoggedInUserId} />
        <Routes>
          <Route
            path="/profile/:openProfileId"
            element={
              <Profile loggedInUserId={loggedInUserId} setLoggedInUserId={setLoggedInUserId} />
            }
          />
          <Route path="/about" element={<About />} />
          <Route path="/people" element={<People />} />
          <Route path="/public" element={<Public />} />
        </Routes>
      </Suspense>
    );
  };
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<HeaderDisplaying />} />
    </Routes>
  );
}
export default RouteSwitch;

//3 On first load: need something that checks if the user is already signed in.
//3 If so, send to Public/Profile page.
//3 If not, send to login page.
