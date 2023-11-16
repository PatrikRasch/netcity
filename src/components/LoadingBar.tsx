import React from 'react'
import './loadingBar.css'

interface Props {
  scale?: number
  height?: number
  width?: number
  circle?: string
}

function LoadingBar({ scale, height, width, circle }: Props) {
  return (
    <div
      className={`relative flex ${scale ? `scale-[${scale}]` : 'scale-100'} ${
        height ? `h-[${height}px]` : 'h-[150px]'
      } ${width ? `w-[${width}px]` : 'w-[150px]'}`}
    >
      <div
        className={`lds-ring default flex h-full w-full items-center justify-center
        ${circle ? '' : 'default'}
        ${circle === 'smallAndBlack' ? 'small-and-black' : ''}
        `}
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

{
  /* <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] translate-x-[-48.8%] translate-y-[-50%] rounded-[50%] bg-white"></div> */
}
{
  /* <img src={logoIcon} alt="" className="absolute left-1/2 top-1/2 w-[70px] translate-x-[-50%] translate-y-[-50%]" /> */
}
