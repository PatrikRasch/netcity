import React, { useEffect, useState } from 'react'

import arrowUpCircle from '../assets/icons/arrowUp/arrowUpCircle.svg'

function ScrollToTop() {
  const [yScrollOver1000, setYScrollOver1000] = useState(false)

  window.onscroll = () => {
    if (window.scrollY > 1500) setYScrollOver1000(true)
    if (window.scrollY < 1500) setYScrollOver1000(false)
  }

  return (
    <div
      className={`fixed left-1/2 top-[120px] z-10 translate-x-[-50%] ${
        yScrollOver1000 ? '' : 'pointer-events-none opacity-0'
      } transition-opacity duration-500`}
    >
      <img
        src={arrowUpCircle}
        alt=""
        className="w-[40px] cursor-pointer"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
      {/* <img src={arrowUpCircle} alt="" className="absolute w-[45px]" /> */}
    </div>
  )
}

export default ScrollToTop
