import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const CaptainSignup = () => {

    const [email, setemail] = useState('')
    const [password, setpassword] = useState('')
    const [firstName, setfirstName] = useState('')
    const [lastName, setlastName] = useState('')
    const [userData, setuserData] = useState({})


    const submitHandler = (e) => {
        e.preventDefault();
        setuserData({
            email: email,
            password: password,
            fullName:{
                firstName: firstName,
                lastName: lastName
            }
        })

        setemail('')
        setpassword('')
        setfirstName('')
        setlastName('')        
    }


  return (
    <div>
      <div className="py-5 px-5 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-16 mb-10"
          src="https://pngimg.com/d/uber_PNG24.png"
          alt="Uber Logo"
        />
        <form onSubmit={(e) => {
            submitHandler(e)
        }}>

          <h3 className="text-lg font-medium mb-2">What's our Captain's name</h3>
          <div className='flex gap-4 mb-6'>
          <input
            required
            className="bg-[#eeee] w-1/2 rounded px-4 py-2 text-base placeholder:text-sm"
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => 
                setfirstName(e.target.value)
            }
          />
          <input
            required
            className="bg-[#eeee] w-1/2 rounded px-4 py-2 text-base placeholder:text-sm"
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => 
                setlastName(e.target.value)
            }
          />
          </div>

          <h3 className="text-base font-medium mb-2">What's our Captain's email</h3>

          <input
            required
            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-base placeholder:text-sm"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => 
                setemail(e.target.value)
            }
          />

          <h3 className="text-base font-medium mb-2">Enter Password</h3>

          <input
            required
            className="bg-[#eeee] mb-6 rounded px-4 py-2 w-full text-lg placeholder:text-base"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => 
                setpassword(e.target.value)
            }
          />

          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base">
            Login
          </button>

        </form>
          <p className="text-center">Already have a account? <Link to='/captain-login' className='text-blue-600'>Login here</Link></p>
      </div>

      <div>
      <p className='text-[10px] leading-tight'>This site is protected by reCAPTCHA and the <span className='underline'>Google Privacy Policy</span> and <span className='underline'>Terms of Service apply.</span></p>
      </div>
    </div>
    </div>
  )
}

export default CaptainSignup
