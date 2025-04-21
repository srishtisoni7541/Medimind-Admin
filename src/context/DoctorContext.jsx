import { createContext, useState } from "react"
import axios from 'axios'
import { toast } from "react-toastify"

export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL

      const [dToken, setDToken] = useState(localStorage.getItem('dToken') || '')
      const [appointments, setAppointments] = useState([])
      const [dashData, setDashData] = useState(false)
      const [profileData, setProfileData] = useState(false)
      const [prescriptions, setPrescriptions] = useState([])

      const getAppointments = async () => {
            try {
                  const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { token:dToken } })

                  if (data.success) {
                        setAppointments(data.appointments)
                  } else {
                        toast.error(data.message)
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
            }
      }

      const completeAppointment = async (appointmentId) => {
            try {
                  const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { token:dToken } })
                  if (data.success) {
                        toast.success(data.message)
                        getAppointments()
                  } else {
                        toast.error(data.message)
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
            }
      }

      const cancelAppointment = async (appointmentId) => {
            try {
                  const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { token:dToken } })
                  if (data.success) {
                        toast.success(data.message)
                        getAppointments()
                  } else {
                        toast.error(data.message)
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
            }
      }

      const getDashData = async () => {
            try {
                  const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { token:dToken } })
                  if (data.success) {
                        setDashData(data.dashData)
                  } else {
                        toast.error(data.message)
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
            }
      }

      const getProfileData = async () => {
            try {
                  const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { token:dToken } })
                  if (data.success) {
                        setProfileData(data.profileData)
                  } else {
                        toast.error(data.message)
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
            }
      }

      // New prescription-related functions
      const getDoctorPrescriptions = async () => {
            try {
                  if (!profileData) {
                        await getProfileData();
                  }
                  
                  const doctorId = profileData._id;
                  const { data } = await axios.get(
                        `${backendUrl}/api/doctor/prescriptions/doctor/${doctorId}`,
                        { headers: { token: dToken } }
                  )
                  
                  if (data.success) {
                        setPrescriptions(data.data)
                        return data.data
                  } else {
                        toast.error(data.message)
                        return []
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.message)
                  return []
            }
      }

      const createPrescription = async (prescriptionData) => {
            try {
                  const { data } = await axios.post(
                        `${backendUrl}/api/doctor/prescriptions`,
                        prescriptionData,
                        { headers: { token: dToken } }
                  )
                  
                  if (data.success) {
                        toast.success("Prescription created successfully")
                        return data.data
                  } else {
                        toast.error(data.message)
                        return null
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.response?.data?.message || error.message)
                  return null
            }
      }

      const updatePrescription = async (prescriptionId, prescriptionData) => {
            try {
                  const { data } = await axios.put(
                        `${backendUrl}/api/doctor/prescriptions/${prescriptionId}`,
                        prescriptionData,
                        { headers: { token: dToken } }
                  )
                  
                  if (data.success) {
                        toast.success("Prescription updated successfully")
                        return data.data
                  } else {
                        toast.error(data.message)
                        return null
                  }
            } catch (error) {
                  console.log(error)
                  toast.error(error.response?.data?.message || error.message)
                  return null
            }
      }

      const getPrescriptionByAppointment = async (appointmentId) => {
            try {
                  const { data } = await axios.get(
                        `${backendUrl}/api/doctor/prescriptions/appointment/${appointmentId}`,
                        { headers: { token: dToken } }
                  )
                  
                  if (data.success) {
                        return data.data
                  } else {
                        toast.error(data.message)
                        return null
                  }
            } catch (error) {
                  if (error.response?.status !== 404) {
                        console.log(error)
                        toast.error(error.message)
                  }
                  return null
            }
      }

      const value = {
            dToken,
            setDToken,
            backendUrl,
            appointments,
            setAppointments,
            getAppointments,
            completeAppointment,
            cancelAppointment,
            dashData,
            setDashData,
            getDashData,
            profileData,
            setProfileData,
            getProfileData,
            // New prescription-related props
            prescriptions,
            setPrescriptions,
            getDoctorPrescriptions,
            createPrescription,
            updatePrescription,
            getPrescriptionByAppointment
      }

      return (
            <DoctorContext.Provider value={value}>
                  {props.children}
            </DoctorContext.Provider>
      )
}

export default DoctorContextProvider