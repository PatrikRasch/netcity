import React from 'react'
import './loadingBar.css'

import logoIcon from '../assets/icons/logoIcon.png'

interface Props {
  scale?: number
  height?: number
  width?: number
  color?: string
}

function LoadingBar({ scale, height, width, color }: Props) {
  if (scale === undefined) scale = 100
  if (height === undefined) height = 150
  if (width === undefined) width = 150
  if (color === undefined) color = 'default'
  return (
    <div className={`relative flex h-[${height}px] w-[${width}px] scale-[${scale}]`}>
      {/* <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] translate-x-[-48.8%] translate-y-[-50%] rounded-[50%] bg-white"></div> */}
      {/* <img src={logoIcon} alt="" className="absolute left-1/2 top-1/2 w-[70px] translate-x-[-50%] translate-y-[-50%]" /> */}
      <div
        className={`lds-ring flex h-full w-full items-center justify-center ${
          color !== 'default' ? 'lds-ring-black' : 'lds-ring-default-color'
        }`}
      >
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
