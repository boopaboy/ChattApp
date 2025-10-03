import React from 'react'

const CurrentUserChatBubble = (props) => {
  return (

    <div className='flex flex-col items-end'>
    <div className='bg-amber-500 text-black px-4 py-2 rounded-lg max-w-xs'>
      <p className='text-sm font-semibold mb-1'>Du</p>
      <p>{props.message}</p>
    </div>
  </div>  )
}

export default CurrentUserChatBubble