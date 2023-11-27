import React, { useState, useEffect } from 'react'

import postsWhiteEmpty from '../assets/icons/posts/postsWhiteEmpty.svg'
import postsBlackEmpty from '../assets/icons/posts/postsBlackEmpty.svg'

function MakePostActivator() {
  const [yScrollOver500, setYScrollOver500] = useState(false)
  const [scrollToTopClicked, setScrollToTopClicked] = useState(false)
  const [lastScrollValue, setLastScrollValue] = useState(0)

  const handleScroll = () => {
    if (window.scrollY > 800) setYScrollOver500(true)
    if (window.scrollY < 800) setYScrollOver500(false)
    if (window.scrollY < lastScrollValue) setYScrollOver500(false)
    setLastScrollValue(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`fixed bottom-[5%] right-[5%] z-10 cursor-pointer rounded-[50%] bg-purpleMain p-4 transition-opacity duration-300 ease-in-out hover:opacity-100 lg:bottom-[7%] lg:right-[7%] ${
        yScrollOver500 ? 'opacity-100 lg:opacity-80' : 'pointer-events-none opacity-0'
      }`}
    >
      <img
        src={postsWhiteEmpty}
        alt=""
        className="w-[40px] lg:w-[50px]"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      />
    </div>
  )
}

export default MakePostActivator
