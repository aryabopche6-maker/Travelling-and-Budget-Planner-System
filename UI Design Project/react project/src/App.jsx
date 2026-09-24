import React from 'react'
import"./index.css"
import Section1 from './Components/Section1/Section1'
import Section2 from './Components/Section2/Section2'


const App = () => {

  const users=[
    {
      img:'https://plus.unsplash.com/premium_photo-1661769159995-f3af0089875f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29ya2luZyUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D',
     intro:'',
     tag:'Satisfeid'},
    {
      img:'https://plus.unsplash.com/premium_photo-1663134310533-fc3b59225810?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTYwfHx3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDB8fDB8fHww',
     intro:'',
     tag:'Underserved'
    },
    {
      img:'https://plus.unsplash.com/premium_photo-1661688537412-656aeff525ed?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjUyfHx3b3JraW5nJTIwcHJvZmVzc2lvbmFsfGVufDB8fDB8fHww',
     intro:'',
     tag:'Underbanked'
    },{
      img:'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2ZmZXNpb25hbCUyMGluJTIwdGVjaCUyMHdvcmtpbmd8ZW58MHx8MHx8fDA%3D',
     intro:'',
     tag:'Underbraved'
    }
  ]
  return (
    <div>
              <Section1 users={users} />
              <Section2 />
    </div>
  )
}

export default App