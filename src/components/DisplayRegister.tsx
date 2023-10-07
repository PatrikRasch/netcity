import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import Login from './Login'
import Register from './Register'

import closeGrayFilled from './../assets/icons/close/closeGrayFilled.svg'

function DisplayRegister() {
  const navigate = useNavigate()
  const mainDivRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (mainDivRef.current) mainDivRef.current.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      navigate('/login')
    }
  }

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1} ref={mainDivRef}>
      <div className="bg-purpleSoft">
        <div className="hidden lg:flex lg:items-center lg:justify-center">
          {/* //6 animate in "register" if clicked on desktop */}
          <div className="absolute z-20 h-[clamp(300px,90svh,750px)] w-[600px] items-center overflow-scroll rounded-3xl bg-purpleSoft lg:grid">
            <button
              className="absolute right-0 top-0 cursor-pointer p-6"
              onClick={() => {
                navigate('/login')
              }}
            >
              <img src={closeGrayFilled} alt="exit register" className="w-[50px]" />
            </button>
            <div className="">
              <Register />
            </div>
          </div>

          <div
            className="absolute z-10 hidden h-[100svh] w-[100svw] bg-black opacity-30 lg:block"
            onClick={() => {
              navigate('/login')
            }}
            aria-hidden="true"
          ></div>
          <Login />
        </div>
      </div>

      <div className="block lg:hidden">
        <Register />
      </div>
    </div>
  )
}

export default DisplayRegister
