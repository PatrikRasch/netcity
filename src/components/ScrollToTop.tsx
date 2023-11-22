import React, { useEffect, useState } from 'react'

import arrowUpCircle from '../assets/icons/arrowUp/arrowUpCircle.png'

function ScrollToTop() {
  const [yScrollOver1000, setYScrollOver1000] = useState(false)
  const [scrollToTopClicked, setScrollToTopClicked] = useState(false)
  const [lastScrollValue, setLastScrollValue] = useState(0)

  window.onscroll = (e) => {
    if (window.scrollY > 1500) setYScrollOver1000(true)
    if (window.scrollY < 1500) setYScrollOver1000(false)
    if (window.scrollY < lastScrollValue) setYScrollOver1000(false)
    setLastScrollValue(window.scrollY)
  }

  return (
    <div
      className={`fixed left-1/2 top-[100px] z-10 translate-x-[-50%] cursor-pointer opacity-70 transition-transform duration-1000 ease-in-out hover:opacity-100 ${
        yScrollOver1000 ? '' : 'pointer-events-none translate-y-[-90px] opacity-0'
      }`}
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setScrollToTopClicked(true)
        setTimeout(() => {
          setScrollToTopClicked(false)
        }, 1000)
      }}
    >
      <img src={arrowUpCircle} alt="" className={`w-[30px] ${scrollToTopClicked ? 'animate-scroll-up-clicked' : ''}`} />
    </div>
  )
}

export default ScrollToTop
