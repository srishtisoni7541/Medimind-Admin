import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import axios from 'axios'

const DoctorAppointments = () => {
  const navigate = useNavigate()
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, backendUrl } = useContext(DoctorContext)
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext)
  const [prescriptionStatus, setPrescriptionStatus] = useState({})

  useEffect(() => {
    if (dToken) {
      getAppointments()
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

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex justify-between items-center mb-3'>
        <p className='text-lg font-medium'>All Appointments</p>
        <button 
          onClick={() => navigate('/doctor/prescriptions')}
          className='bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-md text-sm'
        >
          View All Prescriptions
        </button>
      </div>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1.5fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {
          appointments.slice().reverse().map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_2fr_1fr_1.5fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                <img className='w-8 rounded-full' src={item.userData?.image || assets.default_user} alt="" /> 
                <p>{item.userData?.name || 'Unknown'}</p>
              </div>

              <div className='text-xs inline-border border-primary px-2 rounded-full'>
                <p>{item.payment ? 'Online' : 'CASH'}</p>
              </div>

              <p className='max-sm:hidden'>{safeDisplayAge(item.userData?.dob)}</p>
              <p>{item.slotDate ? slotDateFormat(item.slotDate) : 'N/A'}, {item.slotTime || 'N/A'}</p>
              <p>{currency}{isNaN(item.amount) ? '0' : item.amount}</p>

              {
                item.cancelled ? (
                  <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                ) : item.isCompleted ? (
                  <div className='flex gap-2'>
                    <p className='text-green-500 text-xs font-medium'>Completed</p>
                    <button
                      onClick={() => handlePrescription(item._id)}
                      className='text-blue-600 text-xs font-medium bg-blue-50 px-2 py-1 rounded'
                    >
                      {prescriptionStatus[item._id]?.exists ? 'View Rx' : 'Create Rx'}
                    </button>
                  </div>
                ) : (
                  <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
                )
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default DoctorAppointments