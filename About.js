import React from 'react'
import User from './User'
import UserClass from './UserClass'

const About=() =>{
  return (
    <div className='about-us'>
      <h1>About us</h1>
      <h2>Our vision</h2>
     
      <UserClass name={'Prabhjot (from class component )'} location={'Delhi '}/>
    </div>
  )
}

export default About

