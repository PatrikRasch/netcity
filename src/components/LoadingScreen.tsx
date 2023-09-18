import React from "react";

import "./loadingBar.css";

function LoadingScreen() {
  return (
    <div className="bg-white absolute w-[100svw] h-[100svh] z-50">
      <div className="lds-roller opacity-100 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default LoadingScreen;
