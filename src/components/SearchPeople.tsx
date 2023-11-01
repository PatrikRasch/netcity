import React, { useState } from 'react'
import { DocumentData } from 'firebase/firestore'

interface Props {
  usersToShow: DocumentData | undefined
  setUsersToShow: DocumentData | undefined
  displayUsersToShow: (searchInput: string) => void
}

function SearchPeople({ usersToShow, setUsersToShow, displayUsersToShow }: Props) {
  const [textareaActive, setTextareaActive] = useState(false)
  const [validateMakePost, setValidateMakePost] = useState(false)

  return (
    <div>
      <input
        placeholder={validateMakePost ? 'Write something before posting' : 'Search users'}
        className={`transition-height w-full resize-none self-start overflow-y-auto rounded-3xl border-2 bg-graySoft p-3 placeholder-grayMediumPlus outline-none duration-500 ${
          textareaActive ? 'min-h-[144px]' : 'min-h-[48px]'
        } ${validateMakePost ? 'border-purpleMain' : 'border-transparent'}
        `}
        maxLength={1000}
        // value={searchInput}
        onChange={(e) => {
          //   setSearchInput(e.target.value)
          displayUsersToShow(e.target.value)
          //   if (validateMakePost) setValidateMakePost(false)
          //   handleChangeSearch()
          //   handleTextareaChange()
          //   setFullTimestamp(new Date())
        }}
        onFocus={() => {
          //   setTextareaActive(true)
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
