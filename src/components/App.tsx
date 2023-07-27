import React, { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import RouteSwitch from "./RouteSwitch";

function App() {
  const [loggedInUserId, setLoggedInUserId] = useState("");
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
