import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import axios from 'axios'

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, backendUrl } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat } = useContext(AppContext)
  const [prescriptionStatus, setPrescriptionStatus] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (dToken) {
      getAppointments().finally(() => setIsLoading(false))
    }
  }, [dToken])

  useEffect(() => {
    if (appointments.length > 0) {
      checkPrescriptionStatus()
    }
  }, [appointments])

  const checkPrescriptionStatus = async () => {
    try {
      const completedAppointments = appointments.filter(app => app.isCompleted)
      const statuses = {}
      
      for (const appointment of completedAppointments) {
        try {
          const { data } = await axios.get(
            `${backendUrl}/api/doctor/prescriptions/appointment/${appointment._id}`,
            { headers: { token: dToken } }
          )
          
          if (data.success) {
            statuses[appointment._id] = { exists: true, id: data.data._id }
          }
        } catch (error) {
          if (error.response?.status === 404) {
            statuses[appointment._id] = { exists: false }
          }
        }
      }
      
      setPrescriptionStatus(statuses)
    } catch (error) {
      console.error("Error checking prescription status:", error)
    }
  }

  const handlePrescription = (appointmentId) => {
    if (prescriptionStatus[appointmentId]?.exists) {
      navigate(`/doctor/update-prescription/${prescriptionStatus[appointmentId].id}`)
    } else {
      navigate(`/doctor/create-prescription/${appointmentId}`)
    }
  }

  // Function to safely display age or fallback to N/A
  const safeDisplayAge = (dob) => {
    try {
      const age = calculateAge(dob);
      return isNaN(age) ? 'N/A' : age;
    } catch (error) {
      return 'N/A';
    }
  }

  // Get status badge with appropriate styling
  const getStatusBadge = (appointment) => {
    if (appointment.cancelled) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-full">Cancelled</span>
    } else if (appointment.isCompleted) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">Completed</span>
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-full">Scheduled</span>
    }
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Appointments</h1>
        <button 
          onClick={() => navigate('/doctor/prescriptions')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          View All Prescriptions
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1.5fr] py-4 px-6 bg-gray-50 border-b font-medium text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Table Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg font-medium">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.slice().reverse().map((item, index) => (
              <div 
                className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1.5fr] border-b hover:bg-gray-50 transition-colors" 
                key={index}
              >
                {/* Mobile View Card */}
                <div className="w-full p-4 flex flex-col gap-3 sm:hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                        src={item.userData?.image || assets.default_user} 
                        alt={item.userData?.name || 'Unknown'} 
                      />
                      <div>
                        <p className="font-medium text-gray-800">{item.userData?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">Age: {safeDisplayAge(item.userData?.dob)}</p>
                      </div>
                    </div>
                    {getStatusBadge(item)}
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-gray-700">{item.slotDate ? slotDateFormat(item.slotDate) : 'N/A'}, {item.slotTime || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Fee</p>
                      <div className="flex items-center gap-1">
                        <p className="text-gray-700 font-medium">₹{isNaN(item.amount) ? '0' : item.amount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${item.payment ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                          {item.payment ? 'Online' : 'CASH'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end items-center gap-2 py-1 border-t border-gray-100">
                    {item.cancelled ? (
                      <p className="text-red-500 text-sm">This appointment was cancelled</p>
                    ) : item.isCompleted ? (
                      <button
                        onClick={() => handlePrescription(item._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        {prescriptionStatus[item._id]?.exists ? 'View Prescription' : 'Create Prescription'}
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => completeAppointment(item._id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
                        >
                          <img className="w-4 h-4" src={assets.tick_icon} alt="Complete" />
                          Complete
                        </button>
                        <button
                          onClick={() => cancelAppointment(item._id)}
                          className="flex items-center gap-1 px-3 py-1 rounded bg-red-50 text-red-600 text-sm hover:bg-red-100 transition-colors"
                        >
                          <img className="w-4 h-4" src={assets.cancel_icon} alt="Cancel" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop View Row */}
                <p className="hidden sm:flex items-center py-4 pl-6">{index + 1}</p>
                
                <div className="hidden sm:flex items-center gap-3 py-4">
                  <img 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                    src={item.userData?.image || assets.default_user} 
                    alt={item.userData?.name || 'Unknown'} 
                  /> 
                  <p className="font-medium text-gray-700">{item.userData?.name || 'Unknown'}</p>
                </div>
                
                <div className="hidden sm:flex items-center py-4">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${item.payment ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>
                    {item.payment ? 'Online' : 'CASH'}
                  </span>
                </div>
                
                <p className="hidden sm:flex items-center py-4 text-gray-600">{safeDisplayAge(item.userData?.dob)}</p>
                
                <div className="hidden sm:flex items-center py-4 text-gray-600">
                  <div>
                    <p>{item.slotDate ? slotDateFormat(item.slotDate) : 'N/A'}</p>
                    <p className="text-sm text-gray-500">{item.slotTime || 'N/A'}</p>
                  </div>
                </div>
                
                <p className="hidden sm:flex items-center py-4 font-medium text-gray-700">₹{isNaN(item.amount) ? '0' : item.amount}</p>
                
                <div className="hidden sm:flex items-center gap-2 py-4 pr-6">
                  {item.cancelled ? (
                    getStatusBadge(item)
                  ) : item.isCompleted ? (
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item)}
                      <button
                        onClick={() => handlePrescription(item._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded bg-blue-600 text-white text-xs hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        {prescriptionStatus[item._id]?.exists ? 'View Rx' : 'Create Rx'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className="p-1 rounded hover:bg-green-50 transition-colors"
                        title="Mark as completed"
                      >
                        <img className="w-10 h-10" src={assets.tick_icon} alt="Complete" />
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        title="Cancel appointment"
                      >
                        <img className="w-10 h-10" src={assets.cancel_icon} alt="Cancel" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg font-medium">No appointments found</p>
              <p className="text-sm mt-2">New appointments will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointments