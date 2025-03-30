import React, { useState } from "react";
import { Link } from "react-router-dom";

const UserLogin = () => {
    // two way binding kar rahe hai because need the data of this page
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    // two way binding nahi karenge toh react ko pta nhi lagega that why we do this using useState
    const [userData, setUserData] = useState({})

    const submitHandler = (e) => {
        e.preventDefault(); // to prevent website from reload(which is default behaviour of form)
        setUserData({
            email:email,
            password:password
        })
        setEmail('');
        setPassword(''); // to clear the input field after submit in page
    }

  return (
    <div className="p-7 h-screen flex flex-col justify-between">
      <div>
        <img
          className="w-16 mb-10"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />
        <form onSubmit={(e) => {
            submitHandler(e)
        }}>
          <h3 className="text-lg font-medium mb-2">What's your email</h3>
          <input
            required
            value={email}
            onChange={(e) =>
                setEmail(e.target.value)}
            className="bg-[#eeee] mb-7 rounded px-4 py-2 w-full text-lg placeholder:text-base"
            type="email"
            placeholder="email@example.com"
          />

          <h3 className="text-lg font-medium mb-2">Enter Password</h3>

          <input
            required
            value={password}
            onChange={(e) =>
                setPassword(e.target.value)}
            className="bg-[#eeee] mb-7 rounded px-4 py-2 w-full text-lg placeholder:text-base"
            type="password"
            placeholder="Password"
          />

          <button className="bg-[#111] text-white font-semibold mb-3 rounded px-4 py-2 w-full text-lg placeholder:text-base">
            Login
          </button>

        </form>
          <p className="text-center">New Here? <Link to='/signup' className='text-blue-600'>Create new Account</Link></p>
      </div>

      <div>
        <Link 
        to='/captain-login'
            className="bg-[#10b461] flex items-center justify-center text-white font-semibold mb-5 rounded px-4 py-2 w-full text-lg placeholder:text-base">
        Sign in as Captain </Link>
      </div>
    </div>
  );
};

export default UserLogin;
