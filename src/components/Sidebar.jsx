import React, { useContext } from 'react'
import { AdminContext } from '../context/AdminContext.jsx'
import { DoctorContext } from '../context/DoctorContext.jsx'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const { atoken } = useContext(AdminContext)
  const { dToken } = useContext(DoctorContext)

  return (
    <div className='min-h-screen bg-white border-r shadow-sm'>
      {atoken && (
        <ul className='text-gray-600 pt-6'>
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/admin-dashboard'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/all-appointments'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/add-doctor'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
            <p className='hidden md:block'>Add Doctor</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/add-hospital'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
            </svg>
            <p className='hidden md:block'>Add Hospital</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/doctor-list'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p className='hidden md:block'>Doctor List</p>
          </NavLink>
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/hospital-list'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            <p className='hidden md:block'>hospital List</p>
          </NavLink>
        </ul>
      )}
      
      {dToken && (
        <ul className='text-gray-600 pt-6'>
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/doctor-dashboard'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            <p className='hidden md:block'>Dashboard</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/doctor-appointments'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <p className='hidden md:block'>Appointments</p>
          </NavLink>
          
          <NavLink 
            className={({ isActive }) => 
              `flex items-center gap-3 py-3 px-4 md:px-6 cursor-pointer transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary border-r-4 border-primary font-medium' 
                  : 'hover:bg-gray-50'
              }`
            } 
            to='/doctor-profile'
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <p className='hidden md:block'>Profile</p>
          </NavLink>
        </ul>
      )}
    </div>
  )
}

export default Sidebar