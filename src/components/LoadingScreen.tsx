import React from 'react'

import './loadingBar.css'

function LoadingScreen() {
  return (
    <div className="absolute z-50 h-[100svh] w-[100svw] bg-white">
      <div className="lds-roller left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] opacity-100">
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
  )
}

export default LoadingScreen
