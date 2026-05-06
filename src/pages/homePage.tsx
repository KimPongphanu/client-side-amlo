import React from 'react'
import AppBar from '../components/appBar'
import ContactForm from '../components/ContactForm'
import CommentForm from '../components/CommentForm'
const homePage = () => {
  return (
    <>
      {/* <AppBar /> */}
      {/* <div className='bg-blue-500 w-full h-40 text-5xl'>homePage</div> */}
      <ContactForm />
      <CommentForm />
    </>
  )
}

export default homePage
