import React, { useState, useRef } from 'react'
import { DocumentData } from 'firebase/firestore'

interface Props {
  usersToShow: DocumentData | undefined
  setUsersToShow: DocumentData | undefined
  displayUsersToShow: (searchInput: string) => void
  searchValue: string
  setSearchValue: (value: string) => void
}

function SearchPeople({ usersToShow, setUsersToShow, displayUsersToShow, searchValue, setSearchValue }: Props) {
  const [textareaActive, setTextareaActive] = useState(false)
  const [validateMakePost, setValidateMakePost] = useState(false)
  const searchRef = useRef<HTMLInputElement | null>(null)

  return (
    <div className="pb-3 pl-4 pr-4 pt-3">
      <input
        placeholder={validateMakePost ? 'Write something before posting' : 'Search for people'}
        className={`transition-height w-full resize-none self-start overflow-y-auto rounded-3xl border-2 bg-graySoft p-2 pl-3 placeholder-grayMediumPlus outline-none duration-500 placeholder:font-semibold ${
          textareaActive ? 'min-h-[144px]' : 'min-h-[48px]'
        } ${validateMakePost ? 'border-purpleMain' : 'border-transparent'}
        `}
        maxLength={1000}
        ref={searchRef}
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value)
          displayUsersToShow(e.target.value)
          //   if (validateMakePost) setValidateMakePost(false)
          //   handleChangeSearch()
          //   handleTextareaChange()
          //   setFullTimestamp(new Date())
        }}
        onFocus={() => {
          //   setTextareaActive(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') searchRef.current?.blur()
        }}
        onBlur={() => {
          //   if (postInput.length === 0) {
          //     setTextareaActive(false)
          //     resetTextarea()
          //   }
        }}
      />
    </div>
  )
}

export default SearchPeople
