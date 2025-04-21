import React, { useContext, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { z } from 'zod'

const hospitalSchema = z.object({
  name: z.string().min(1, "Hospital name is required"),
  phone: z.string().min(1, "Phone number is required").regex(/^\d+$/, "Phone must be a valid number"),
  address: z.string().min(1, "Address is required"),
  operatingHours: z.string().min(1, "Operating hours are required"),
  providesUrgentCare: z.boolean(),
  hospitalType: z.string().min(1, "Hospital type is required"),
  specialties: z.array(z.string().min(1)).min(1, "At least one specialty is required")
})

const AddHospital = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [address, setAddress] = useState('')
  const [operatingHours, setOperatingHours] = useState('')
  const [providesUrgentCare, setProvidesUrgentCare] = useState(false)
  const [hospitalType, setHospitalType] = useState('general')
  const [specialty, setSpecialty] = useState('')
  
  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { backendUrl, atoken } = useContext(AdminContext)

  const handleAddSpecialty = () => {
    if (specialty.trim() === '') return
    setSpecialties([...specialties, specialty])
    setSpecialty('')
  }

  const handleRemoveSpecialty = (index) => {
    const updated = [...specialties]
    updated.splice(index, 1)
    setSpecialties(updated)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    
    // Prevent multiple submissions
    if (isSubmitting) return

    const hospitalData = {
      name,
      phone,
      specialties,
      address,
      operatingHours,
      providesUrgentCare,
      hospitalType
    }

    const validation = hospitalSchema.safeParse(hospitalData)

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors
      for (const key in errors) {
        toast.error(errors[key][0])
      }
      return
    }

    try {
      // Set loading state to true before submission
      setIsSubmitting(true)
      
      const { data } = await axios.post(
        `${backendUrl}/api/admin/add-hospital`,
        {
          ...hospitalData,
          phone: Number(phone)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            atoken: atoken
          }
        }
      )

      if (data.success) {
        toast.success("Hospital added successfully")
        setName('')
        setPhone('')
        setSpecialties([])
        setAddress('')
        setOperatingHours('')
        setProvidesUrgentCare(false)
        setHospitalType('general')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      console.error(error)
    } finally {
      // Reset loading state regardless of success or failure
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Hospital</p>
      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Hospital Name</p>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                className='border rounded px-3 py-2' 
                type="text" 
                placeholder='Hospital Name' 
                required 
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Phone Number</p>
              <input 
                onChange={(e) => setPhone(e.target.value)} 
                value={phone} 
                className='border rounded px-3 py-2' 
                type="number" 
                placeholder='Phone Number' 
                required 
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Address</p>
              <textarea 
                onChange={(e) => setAddress(e.target.value)} 
                value={address} 
                className='border rounded px-3 py-2' 
                placeholder='Full Hospital Address' 
                rows={3}
                required 
              />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Hospital Type</p>
              <select 
                onChange={(e) => setHospitalType(e.target.value)} 
                value={hospitalType} 
                className='border rounded px-3 py-2' 
                required
              >
                <option value="general">General Hospital</option>
                <option value="university">University Hospital</option>
                <option value="local clinic">Local Clinic</option>
                <option value="traditional korean medicine clinic">Traditional Korean Medicine Clinic</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Operating Hours</p>
              <input 
                onChange={(e) => setOperatingHours(e.target.value)} 
                value={operatingHours} 
                className='border rounded px-3 py-2' 
                type="text" 
                placeholder='e.g. Mon-Fri: 9AM-5PM, Sat: 10AM-2PM' 
                required 
              />
            </div>

            <div className='flex-1 flex items-center gap-2 mt-2'>
              <input 
                id="urgentCare"
                onChange={(e) => setProvidesUrgentCare(e.target.checked)} 
                checked={providesUrgentCare} 
                className='w-4 h-4' 
                type="checkbox" 
              />
              <label htmlFor="urgentCare">Provides Urgent/Emergency Care</label>
            </div>
          </div>
        </div>

        <div className='mt-6'>
          <p className='mb-2'>Specialties</p>
          <div className='flex items-center gap-2'>
            <input 
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className='flex-1 border rounded px-3 py-2' 
              type="text" 
              placeholder='Add a specialty (e.g. Cardiology, Pediatrics)' 
            />
            <button 
              type="button"
              onClick={handleAddSpecialty}
              className='bg-primary px-4 py-2 text-white rounded'
            >
              Add
            </button>
          </div>

          <div className='flex flex-wrap gap-2 mt-3'>
            {specialties.length > 0 ? (
              specialties.map((spec, index) => (
                <div key={index} className='bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2'>
                  <span>{spec}</span>
                  <button 
                    type="button"
                    onClick={() => handleRemoveSpecialty(index)}
                    className='text-red-500 font-bold'
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className='text-gray-400 italic'>No specialties added yet</p>
            )}
          </div>
        </div>

        <button 
          type='submit' 
          disabled={isSubmitting}
          className={`bg-primary px-10 py-3 mt-6 text-white rounded-full flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : 'Add Hospital'}
        </button>
      </div>
    </form>
  )
}

export default AddHospital