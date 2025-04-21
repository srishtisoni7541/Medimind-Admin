import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const AllAppointments = () => {
  const { atoken, appointments, getAllAppointments, cancelAppointment } = useContext(AdminContext)
  const { calculateAge, slotDateFormat } = useContext(AppContext)

  useEffect(() => {
    if (atoken) {
      getAllAppointments()
    }
  }, [atoken])

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
        <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>
        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
          Total: {appointments.length}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_2fr_2fr_1fr_1.5fr] py-4 px-6 bg-gray-50 border-b font-medium text-gray-700">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Status</p>
        </div>

        {/* Table Body */}
        <div className="max-h-[70vh] overflow-y-auto">
          {appointments.length > 0 ? (
            appointments.map((item, index) => (
              <div 
                className="flex flex-col sm:grid sm:grid-cols-[0.5fr_2fr_1fr_2fr_2fr_1fr_1.5fr] items-center border-b hover:bg-gray-50 transition-colors" 
                key={index}
              >
                {/* Mobile View Card */}
                <div className="w-full p-4 flex flex-col gap-3 sm:hidden">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img 
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200" 
                        src={item.userData.image} 
                        alt={item.userData.name} 
                      />
                      <div>
                        <p className="font-medium text-gray-800">{item.userData.name}</p>
                        <p className="text-sm text-gray-500">Age:N/A</p>
                      </div>
                    </div>
                    {getStatusBadge(item)}
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium">Doctor</p>
                      <div className="flex items-center gap-2 mt-1">
                        <img 
                          className="w-8 h-8 rounded-full object-cover" 
                          src={item.docData.image} 
                          alt={item.docData.name} 
                        />
                        <p className="text-gray-700">{item.docData.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Fee</p>
                      <p className="text-gray-700 font-medium">₹{item.amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-t border-gray-100">
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-gray-700">{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
                    </div>
                    {!item.cancelled && !item.isCompleted && (
                      <button
                        onClick={() => cancelAppointment(item._id)}
                        className="flex items-center gap-1 px-3 py-1 rounded text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <img className="w-4 h-4" src={assets.cancel_icon} alt="Cancel" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* Desktop View Row */}
                <p className="hidden sm:block pl-6 py-4">{index + 1}</p>
                
                <div className="hidden sm:flex items-center gap-3 py-4">
                  <img 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                    src={item.userData.image} 
                    alt={item.userData.name} 
                  /> 
                  <p className="font-medium text-gray-700 truncate">{item.userData.name}</p>
                </div>
                
                <p className="hidden sm:block py-4 text-gray-600">N/A</p>
                
                <div className="hidden sm:block py-4 text-gray-600">
                  <p>{slotDateFormat(item.slotDate)}</p>
                  <p className="text-sm text-gray-500">{item.slotTime}</p>
                </div>
                
                <div className="hidden sm:flex items-center gap-3 py-4">
                  <img 
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-100" 
                    src={item.docData.image} 
                    alt={item.docData.name} 
                  /> 
                  <p className="font-medium text-gray-700 truncate">{item.docData.name}</p>
                </div>
                
                <p className="hidden sm:block py-4 font-medium text-gray-700">₹{item.amount}</p>
                
                <div className="hidden sm:flex items-center gap-2 py-4 pr-6">
                  {getStatusBadge(item)}
                  
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="ml-2 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Cancel appointment"
                    >
                      <img className="w-10 h-10" src={assets.cancel_icon} alt="Cancel" />
                    </button>
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

export default AllAppointments