import React from 'react'
import './loadingBar.css'

import logoIcon from '../assets/icons/logoIcon.png'

function LoadingBar() {
  return (
    <div className="relative h-[150px] w-[150px]">
      <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] translate-x-[-48.8%] translate-y-[-50%] rounded-[50%] bg-white"></div>
      <img src={logoIcon} alt="" className="absolute left-1/2 top-1/2 w-[70px] translate-x-[-50%] translate-y-[-50%]" />
      <div className="lds-ring h-full w-full">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default LoadingBar

{
  /* <div className="lds-roller">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div> */
}
