import React from 'react'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div>
      <div className="bg-cover bg-center bg-[url(https://images.unsplash.com/photo-1617479582427-e67ee0e3c0cc?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)] h-screen pt-8 flex justify-between flex-col w-full">
        <img
          className="w-16 ml-8"
          src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
          alt="Uber Logo"
        />
        <div className="bg-white pb-7 py-4 px-4">
          <h2 className="text-3xl font-bold">Get Started with Uber</h2>
          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5"
          >
            Continue
          </Link>
          <div className="mt-4 text-center text-sm text-gray-600">
            <span className="flex items-center justify-center gap-1 mb-2">
              <span className="w-px h-4 bg-gray-300" />
              <span className="w-px h-4 bg-gray-300" />
            </span>
            <span>Want to drive with Uber instead?</span>
          </div>
          <Link
            to="/captain-login"
            className="flex items-center justify-center w-full border border-black text-black font-medium py-3 rounded mt-2"
          >
            Sign in as a Captain
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
