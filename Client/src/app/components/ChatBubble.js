import React from 'react'

const ChatBubble = (props) => {
  return (
    <div className='flex flex-col items-start'>
    <div className='bg-blue-800 text-white px-4 py-2 rounded-lg max-w-xs'>
      <p className='text-sm font-semibold mb-1'>{props.name}</p>
      <p>{props.message}</p>
    </div>
  </div>
  )
}

export default ChatBubble