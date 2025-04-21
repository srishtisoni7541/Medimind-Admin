import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import { DoctorContext } from '../context/DoctorContext'

const Navbar = () => {
  const navigate = useNavigate()
  const { atoken, setatoken } = useContext(AdminContext)
  const { dToken, setDToken } = useContext(DoctorContext)

  const isAdmin = Boolean(atoken)
  const isDoctor = Boolean(dToken)
  const userType = isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Guest'

  const logout = () => {
    if (isAdmin) {
      setatoken('')
      localStorage.removeItem('atoken')
    }
    if (isDoctor) {
      setDToken('')
      localStorage.removeItem('dToken')
    }
    navigate('/')
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2'>
        {/* MediMind Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM18 14H14V18H10V14H6V10H10V6H14V10H18V14Z" />
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-800">MediMind</span>
        </div>
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 text-xs'>{userType}</p>
      </div>
      
      <button 
        onClick={logout} 
        className='bg-primary text-white text-sm px-10 py-2 rounded-full'
      >
        Logout
      </button>
    </div>
  )
}

export default Navbar