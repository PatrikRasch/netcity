import React, { useState } from "react";

import Login from "./Login";
import Register from "./Register";
import Profile from "./Profile";
import Header from "./Header";
import Public from "./Public";

function App() {
  return (
    <div className="h-[100svh] bg-gray-100">
      {/* <Header /> */}
      {/* <Profile /> */}
      <Login />
      {/* <Register /> */}
      {/* <Public /> */}
    </div>
  );
}

export default App;
