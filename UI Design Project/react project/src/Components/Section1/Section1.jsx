import React from 'react'
import Nav from './Nav'
import Page1Content from './Page1Content'

const Section1 = (props) => {
  console.log(props);
  
  return (
    <div className='h-screen w-full'>
         <Nav />
         <Page1Content users={props.users} />
    
      
      </div>
  )
}

export default Section1