import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState('1 Year')
  const [fees, setFees] = useState('')
  const [about, setAbout] = useState('')
  const [speciality, setSpeciality] = useState('General physician')
  const [degree, setDegree] = useState('')
  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  
  // Hospital search related states
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const { backendUrl, adminToken } = useContext(AdminContext)

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    if (value.length > 2) {
      setShowDropdown(true)
      searchHospitals(value)
    } else {
      setShowDropdown(false)
      setSearchResults([])
    }
  }

  // Function to search hospitals by name
  const searchHospitals = async (query) => {
    setIsSearching(true)
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/find-hospitals?name=${query}`, {
        headers: { atoken: adminToken }
      })
      console.log(data);
      
      
      if (data.success) {
        setSearchResults(data.hospitals)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.log(error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle hospital selection
  const selectHospital = (hospital) => {
    setSelectedHospital(hospital)
    setSearchTerm(hospital.name)
    setShowDropdown(false)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    try {
      if (!docImg) {
        return toast.error('Image not selected')
      }

      if (!selectedHospital) {
        return toast.error('Please select a hospital')
      }

      const formData = new FormData()
      formData.append('image', docImg)
      formData.append('name', name)
      formData.append('email', email)
      formData.append('password', password)
      formData.append('experience', experience)
      formData.append('fees', Number(fees))
      formData.append('about', about)
      formData.append('speciality', speciality)
      formData.append('degree', degree)
      formData.append('address', JSON.stringify({ line1: address1, line2: address2 }))
      formData.append('hospitalId', selectedHospital._id) // Add hospital ID to the form data

      const { data } = await axios.post(backendUrl + '/api/admin/add-doctor', formData, {
        headers: { 'Content-Type': 'multipart/form-data', atoken: adminToken },
      })

      if (data.success) {
        toast.success(data.message)
        setDocImg(false)
        setName('')
        setEmail('')
        setPassword('')
        setAddress1('')
        setAddress2('')
        setDegree('')
        setAbout('')
        setFees('')
        setSelectedHospital(null)
        setSearchTerm('')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>
      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc.img">
            <img className='w-16 bg-gray-200 rounded-full cursor-pointer' src={docImg ? URL.createObjectURL(docImg) : assets.upload_area} alt="" />
          </label>
          <input onChange={(e) => setDocImg(e.target.files[0])} type="file" id='doc.img' hidden />
          <p>Upload doctor <br /> picture</p>
        </div>

        {/* Hospital Search Bar */}
        <div className='w-full mb-6 relative'>
          <p className='mb-2 text-gray-600'>Select Hospital</p>
          <input 
            type="text" 
            placeholder="Search hospital by name..." 
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
            className='w-full border rounded px-3 py-2 text-gray-600'
          />
          
          {/* Selected Hospital Display */}
          {selectedHospital && (
            <div className='mt-2 p-2 bg-blue-50 border border-blue-200 rounded flex justify-between items-center'>
              <div>
                <p className='font-medium'>{selectedHospital.name}</p>
                <p className='text-sm text-gray-500'>{selectedHospital.address}</p>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setSelectedHospital(null)
                  setSearchTerm('')
                }}
                className='text-red-500'
              >
                Remove
              </button>
            </div>
          )}
          
          {/* Dropdown for search results */}
          {showDropdown && (
            <div className='absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto'>
              {isSearching ? (
                <div className='p-3 text-center text-gray-500'>Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map(hospital => (
                  <div 
                    key={hospital._id} 
                    className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
                    onClick={() => selectHospital(hospital)}
                  >
                    <p className='font-medium'>{hospital.name}</p>
                    <p className='text-sm text-gray-500'>{hospital.address}</p>
                  </div>
                ))
              ) : (
                <div className='p-3 text-center text-gray-500'>No hospitals found</div>
              )}
            </div>
          )}
        </div>

        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} className='border rounded px-3 py-2' type="text" placeholder='Name' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor Email</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} className='border rounded px-3 py-2' type="email" placeholder='Email' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Doctor Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} className='border rounded px-3 py-2' type="password" placeholder='Password' required />
            </div>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Experience</p>
              <select onChange={(e) => setExperience(e.target.value)} value={experience} className='border rounded px-3 py-2' name="" id="">
                <option value="1 Year">1 Year</option>
                <option value="2 Year">2 Year</option>
                <option value="3 Year">3 Year</option>
                <option value="4 Year">4 Year</option>
                <option value="5 Year">5 Year</option>
                <option value="6 Year">6 Year</option>
                <option value="7 Year">7 Year</option>
                <option value="8 Year">8 Year</option>
                <option value="9 Year">9 Year</option>
                <option value="10 Year">10 Year</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Fees</p>
              <input onChange={(e) => setFees(e.target.value)} value={fees} className='border rounded px-3 py-2' type="number" placeholder='fees' required />
            </div>
          </div>

          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Speciality</p>
              <select onChange={(e) => setSpeciality(e.target.value)} value={speciality} className='border rounded px-3 py-2' name="" id="">
                <option value="General physician">General physician</option>
                <option value="Gynaecologist">Gynaecologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatricians">Pediatricians</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Education</p>
              <input onChange={(e) => setDegree(e.target.value)} value={degree} className='border rounded px-3 py-2' type="text" placeholder='Education' required />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Address</p>
              <input onChange={(e) => setAddress1(e.target.value)} value={address1} className='border rounded px-3 py-2' type="text" placeholder='address 1' required />
              <input onChange={(e) => setAddress2(e.target.value)} value={address2} className='border rounded px-3 py-2' type="text" placeholder='address 2' required />
            </div>
          </div>
        </div>

        <div>
          <p className='mt-4 mb-2'>About Doctor</p>
          <textarea onChange={(e) => setAbout(e.target.value)} value={about} className='w-full px-4 pt-2 border rounded' type='text' placeholder='write about doctor' rows={5} required />
        </div>

        <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>Add doctor</button>
      </div>
    </form>
  )
}

export default AddDoctor