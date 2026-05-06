import React from 'react'
import { FaEvernote } from 'react-icons/fa'
const AppBar = () => {
  return (
    <div className='p-3 flex justify-between'>
      {/* icon & brand */}
      <div className='flex items-center gap-2'>
        <FaEvernote size={40} />
        <span>Organization</span>
      </div>
      <ul className='flex'>
        <li>A</li>
        <li>B</li>
        <li>C</li>
        <li>D</li>
        <li>E</li>
      </ul>
    </div>
  )
}

export default AppBar
