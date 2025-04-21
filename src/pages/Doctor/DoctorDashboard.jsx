import React, { useContext, useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, completeAppointment, cancelAppointment } = useContext(DoctorContext)
  const { slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  return dashData && (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="p-3 bg-green-50 rounded-full">
            <img className="w-12 h-12" src={assets.earning_icon} alt="" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">₹{dashData.earnings}</p>
            <p className="text-gray-500 font-medium">Total Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="p-3 bg-blue-50 rounded-full">
            <img className="w-12 h-12" src={assets.appointments_icon} alt="" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">{dashData.appointments}</p>
            <p className="text-gray-500 font-medium">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="p-3 bg-purple-50 rounded-full">
            <img className="w-12 h-12" src={assets.patients_icon} alt="" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-700">{dashData.patients}</p>
            <p className="text-gray-500 font-medium">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b">
          <img src={assets.list_icon} alt="" className="w-5 h-5" />
          <p className="font-semibold text-gray-800 text-lg">Latest Appointments</p>
        </div>

        <div className="divide-y divide-gray-100">
          {dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((item, index) => (
              <div 
                className="flex items-center px-6 py-4 gap-4 hover:bg-gray-50 transition-colors" 
                key={index}
              >
                <div className="flex-shrink-0">
                  <img 
                    className="rounded-full h-12 w-12 object-cover border-2 border-gray-200" 
                    src={item.userData.image} 
                    alt={item.userData.name} 
                  />
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-800 font-medium">{item.userData.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-gray-500 text-sm">{slotDateFormat(item.slotDate)}</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">Fee: <span className="font-medium">₹{item.amount || dashData.fee || 500}</span></p>
                </div>
                
                <div className="flex-shrink-0">
                  {item.cancelled ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
                      Cancelled
                    </span>
                  ) : item.isCompleted ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                      Completed
                    </span>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => completeAppointment(item._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                        title="Mark as completed"
                      >
                        <img className="w-4 h-4" src={assets.tick_icon} alt="Complete" />
                        <span className="text-xs font-medium">Complete</span>
                      </button>
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                        title="Cancel appointment"
                      >
                        <img className="w-4 h-4" src={assets.cancel_icon} alt="Cancel" />
                        <span className="text-xs font-medium">Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p className="text-lg font-medium">No appointments available</p>
              <p className="text-sm mt-2">New appointments will appear here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Upcoming Appointments Quick View */}
      {dashData.todayAppointments && dashData.todayAppointments.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 border-b">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="font-semibold text-gray-800 text-lg">Today's Appointments</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashData.todayAppointments.map((appointment, index) => (
                <div key={index} className="p-4 border rounded-md hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <img 
                      className="rounded-full h-10 w-10 object-cover border border-gray-200" 
                      src={appointment.userData.image} 
                      alt={appointment.userData.name} 
                    />
                    <p className="font-medium text-gray-800">{appointment.userData.name}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Time:</span> {appointment.slotTime}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard