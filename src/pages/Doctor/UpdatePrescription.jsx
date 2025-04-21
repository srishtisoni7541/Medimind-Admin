import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const UpdatePrescription = () => {
  const { prescriptionId } = useParams()
  const navigate = useNavigate()
  const { dToken, backendUrl } = useContext(DoctorContext)
  const { formatDate } = useContext(AppContext)
  
  const [loading, setLoading] = useState(true)
  const [prescription, setPrescription] = useState(null)
  const [appointment, setAppointment] = useState(null)
  const [patient, setPatient] = useState(null)
  
  // Form state
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }])
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (dToken && prescriptionId) {
      fetchPrescriptionData()
    }
  }, [dToken, prescriptionId])

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/prescriptions/${prescriptionId}`,
        { headers: { token: dToken } }
      )
      
      if (data.success) {
        setPrescription(data.data)
        setAppointment(data.data.appointmentId)
        setPatient(data.data.patientId)
        
        // Initialize form data
        setMedications(data.data.medications.length > 0 ? 
          data.data.medications : 
          [{ name: '', dosage: '', frequency: '', duration: '' }]
        )
        setDiagnosis(data.data.diagnosis || '')
        setNotes(data.data.notes || '')
      }
    } catch (error) {
      console.error("Error fetching prescription:", error)
      setError("Failed to fetch prescription details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications]
    updatedMedications[index][field] = value
    setMedications(updatedMedications)
  }

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }])
  }

  const removeMedication = (index) => {
    if (medications.length > 1) {
      const updatedMedications = medications.filter((_, i) => i !== index)
      setMedications(updatedMedications)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    // Basic validation
    if (medications.some(med => !med.name || !med.dosage)) {
      setError("Please fill in all required medication fields")
      return
    }
    
    if (!diagnosis.trim()) {
      setError("Diagnosis is required")
      return
    }
    
    try {
      const { data } = await axios.put(
        `${backendUrl}/api/doctor/prescriptions/${prescriptionId}`,
        { medications, diagnosis, notes },
        { headers: { token: dToken } }
      )
      
      if (data.success) {
        setSuccess("Prescription updated successfully")
        // Refresh data
        fetchPrescriptionData()
      } else {
        setError(data.message || "Failed to update prescription")
      }
    } catch (error) {
      console.error("Error updating prescription:", error)
      setError(error.response?.data?.message || "An error occurred while updating prescription")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-xl text-red-500 mb-4">Prescription not found</p>
        <button 
          onClick={() => navigate('/doctor/appointments')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          Back to Appointments
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          {prescription ? 'Update Prescription' : 'View Prescription'}
        </h2>
        <button 
          onClick={() => navigate('/doctor/appointments')} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md"
        >
          Back to Appointments
        </button>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium mb-4 text-gray-700 border-b pb-2">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Patient Name</p>
            <p className="font-medium">{patient?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Appointment Date</p>
            <p className="font-medium">
              {appointment?.slotDate ? formatDate(appointment.slotDate) : 'N/A'} {appointment?.slotTime || ''}
            </p>
          </div>
        </div>
      </div>

      {/* Prescription Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md mb-4">
            {success}
          </div>
        )}

        {/* Diagnosis */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="diagnosis">
            Diagnosis*
          </label>
          <textarea
            id="diagnosis"
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full border rounded-md px-3 py-2 min-h-[100px]"
            placeholder="Enter diagnosis"
            required
          />
        </div>

        {/* Medications */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-gray-700 font-medium">Medications*</label>
            <button 
              type="button" 
              onClick={addMedication}
              className="text-blue-500 hover:text-blue-600 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Medication
            </button>
          </div>

          {medications.map((med, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md mb-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Medication #{index + 1}</span>
                {medications.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor={`med-name-${index}`}>
                    Medication Name*
                  </label>
                  <input
                    id={`med-name-${index}`}
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="Medication name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor={`med-dosage-${index}`}>
                    Dosage*
                  </label>
                  <input
                    id={`med-dosage-${index}`}
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., 500mg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor={`med-frequency-${index}`}>
                    Frequency
                  </label>
                  <input
                    id={`med-frequency-${index}`}
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., Twice daily"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1" htmlFor={`med-duration-${index}`}>
                    Duration
                  </label>
                  <input
                    id={`med-duration-${index}`}
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    placeholder="e.g., 7 days"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="notes">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border rounded-md px-3 py-2 min-h-[100px]"
            placeholder="Enter any additional notes or instructions"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Update Prescription
          </button>
        </div>
      </form>
    </div>
  )
}

export default UpdatePrescription