import React from 'react'
import Left from './Left'
import Right from './Right'

const Page1Content = (props) => {
  return (
    <div className='pb-16 pt-6 flex items-center justify-between h-[90vh] px-18 gap-10'>
      <Left />
      <Right users={props.users} />
    </div>
  )
}

export default Page1Content