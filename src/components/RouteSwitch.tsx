import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Header from "./Header";
import Public from "./Public";
import About from "./About";
import People from "./People";

import { LoggedInUserIdProp } from "../interfaces";

interface Props {
  loggedInUserId: LoggedInUserIdProp["loggedInUserId"];
  setLoggedInUserId: LoggedInUserIdProp["setLoggedInUserId"];
}

function RouteSwitch({ loggedInUserId, setLoggedInUserId }: Props) {
  const HeaderComponent = () => {
    return <Header loggedInUserId={loggedInUserId} setLoggedInUserId={setLoggedInUserId} />;
  };

  const ProfileLayout = () => {
    return (
      <>
        <HeaderComponent />
        <Profile loggedInUserId={loggedInUserId} setLoggedInUserId={setLoggedInUserId} />
      </>
    );
  };
  const AboutLayout = () => {
    return (
      <>
        <HeaderComponent />
        <About />
      </>
    );
  };
  const PeopleLayout = () => {
    return (
      <>
        <HeaderComponent />
        <People />
      </>
    );
  };
  const PublicLayout = () => {
    return (
      <>
        <HeaderComponent />
        <Public />
      </>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile/:openProfileId" element={<ProfileLayout />} />

      <Route path="/profile-about" element={<AboutLayout />} />
      <Route path="/public" element={<PublicLayout />} />
      <Route path="/people" element={<PeopleLayout />} />
    </Routes>
  );
}
export default RouteSwitch;

//3 On first load: need something that checks if the user is already signed in.
//3 If so, send to Public/Profile page.
//3 If not, send to login page.
