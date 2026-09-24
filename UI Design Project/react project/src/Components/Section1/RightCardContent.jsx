import React from 'react'

const RightCardContent = (props) => {
  return (
                 <div className='absolute top-0 left-0 h-full w-full p-8 flex flex-col justify-between'>

            <h2 className='bg-white text-xl font-semibold rounded-full h-12 w-12 flex justify-center items-center'>{props.id +1}</h2>
            <div>
                <p className='  text-white mb-10 text-lg leading-relaxed '>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Dolorum labore dolore minima nulla sapiente pariatur consequat.</p>
                <div className='flex justify-between'>
                    <button className='bg-blue-200 text-white font-medium px-8 py-2 rounded-full '>{props.tag}</button>
                    <button><i className="bg-blue-200 text-white font-medium px-3 py-2 rounded-full ri-arrow-right-line"></i></button>
                </div>
            </div>
        </div>
  )
}

export default RightCardContent