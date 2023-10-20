import React, { useState } from 'react'

import closeGrayFilled from './../assets/icons/close/closeGrayFilled.svg'
import error from './../assets/icons/error/error.svg'

interface Props {
  message: string
  showValidationAlertMessage: boolean
  setShowValidationAlertMessage: (value: boolean) => void
}

const FormValidationAlertMessage = ({ message, showValidationAlertMessage, setShowValidationAlertMessage }: Props) => {
  return (
    <>
      <div
        className={`transition-opacity-transform absolute left-1/2 top-1/2 grid min-h-[8svh] w-fit translate-x-[-50%] translate-y-[-50%] items-center rounded-xl 
              bg-white
              p-4 pr-8 drop-shadow-lg lg:whitespace-nowrap lg:p-12 ${
                showValidationAlertMessage
                  ? 'pointer-events-auto scale-110 opacity-100'
                  : 'pointer-events-none opacity-0 '
              } z-40 duration-300`}
      >
        <button
          className="absolute right-0 top-0 cursor-pointer p-2"
          onClick={() => {
            setShowValidationAlertMessage(false)
          }}
        >
          <img src={closeGrayFilled} alt="exit register" className="w-[30px] lg:w-[50px]" />
        </button>
        <div className="flex min-w-max gap-2">
          <img src={error} alt="" className="w-[18px] lg:w-[25px]" />
          <div className="text-[15px] text-black lg:text-[23px]">{message}</div>
        </div>
      </div>
      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 z-10 h-screen w-screen translate-x-[-50%] translate-y-[-50%] bg-black transition-opacity duration-300 ${
          showValidationAlertMessage ? 'pointer-events-auto opacity-25' : 'opacity-0'
        }`}
        onClick={() => {
          setShowValidationAlertMessage(false)
        }}
      ></div>
    </>
  )
}

export default FormValidationAlertMessage
