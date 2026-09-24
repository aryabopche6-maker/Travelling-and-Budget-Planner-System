import React from 'react'
import 'remixicon/fonts/remixicon.css'
import Rightcard from './Rightcard'

const Right = (props) => {
  console.log(props);
  
  return (
    <div id='right' className='  h-full  flex  overflow-x-auto  flex-nowrap gap-10 w-2/3 p-6 '>
       {props.users.map(function(ele,idx){
        return <Rightcard key={idx} id={idx} img={ele.img} tag={ele.tag}/>
       })}
    </div>
  )
}

export default Right