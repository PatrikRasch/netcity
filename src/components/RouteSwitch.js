import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Header from "./Header";
import Public from "./Public";
import About from "./About";
import People from "./People";

function RouteSwitch() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<ProfileLayout />} />
        <Route path="/profile-about" element={<AboutLayout />} />
        <Route path="/public" element={<Public />} />
        <Route path="/people" element={<PeopleLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

const ProfileLayout = () => {
  return (
    <>
      <Header />
      <Profile />
    </>
  );
};
const AboutLayout = () => {
  return (
    <>
      <Header />
      <About />
    </>
  );
};
const PeopleLayout = () => {
  return (
    <>
      <Header />
      <People />
    </>
  );
};

export default RouteSwitch;
