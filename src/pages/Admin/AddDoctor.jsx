import React, { useContext, useState, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AdminContext } from '../../context/AdminContext'
import { toast } from 'react-toastify'
import axios from 'axios'
import { Upload, User, Mail, Lock, Award, DollarSign, Building, Stethoscope, BookOpen, MapPin, FileText, Search, X, Check, Plus } from 'lucide-react'

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
  
  // Add loading state for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { backendUrl, atoken } = useContext(AdminContext)

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
        headers: { token: atoken }
      })
      
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

    // Prevent multiple submissions
    if (isSubmitting) return

    try {
      if (!docImg) {
        return toast.error('Image not selected')
      }

      if (!selectedHospital) {
        return toast.error('Please select a hospital')
      }

      // Set loading state to true before submission
      setIsSubmitting(true)

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
        headers: { 'Content-Type': 'multipart/form-data', token: atoken },
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
    } finally {
      // Reset loading state regardless of success or failure
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Add New Doctor</h1>
        </div>
        
        <form onSubmit={onSubmitHandler} className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header section with image upload */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6 border-b">
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 border-2 ${docImg ? 'border-primary' : 'border-gray-200'}`}>
                  {docImg ? (
                    <img 
                      className="w-full h-full object-cover" 
                      src={URL.createObjectURL(docImg)} 
                      alt="Doctor preview" 
                    />
                  ) : (
                    <Upload className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <label htmlFor="doc-img" className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-md">
                  <Plus className="h-4 w-4" />
                </label>
                <input 
                  id="doc-img" 
                  type="file" 
                  onChange={(e) => setDocImg(e.target.files[0])} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800">Doctor Profile Picture</h2>
                <p className="text-sm text-gray-500">Upload a professional photo of the doctor</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Hospital Selection Section */}
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                <Building className="mr-2 h-5 w-5 text-primary" />
                Hospital Assignment
              </h3>
              <div className="relative">
                <div className="flex items-center border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary">
                  <div className="pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search hospital by name..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.length > 2 && setShowDropdown(true)}
                    className="w-full px-3 py-3 focus:outline-none"
                  />
                </div>
                
                {/* Dropdown for search results */}
                {showDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg border max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500 flex justify-center">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map(hospital => (
                        <div 
                          key={hospital._id} 
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                          onClick={() => selectHospital(hospital)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{hospital.name}</p>
                              <p className="text-sm text-gray-500">{hospital.address}</p>
                            </div>
                            <div className="text-primary">
                              <Check className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">No hospitals found</div>
                    )}
                  </div>
                )}
                
                {/* Selected Hospital Display */}
                {selectedHospital && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-start gap-3">
                        <Building className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="font-medium text-gray-800">{selectedHospital.name}</p>
                          <p className="text-sm text-gray-600">{selectedHospital.address}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => {
                          setSelectedHospital(null)
                          setSearchTerm('')
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form sections in cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="Dr. John Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="doctor@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <Stethoscope className="mr-2 h-5 w-5 text-primary" />
                  Professional Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speciality</label>
                    <select 
                      value={speciality}
                      onChange={(e) => setSpeciality(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                    >
                      <option value="General physician">General Physician</option>
                      <option value="Gynaecologist">Gynaecologist</option>
                      <option value="Dermatologist">Dermatologist</option>
                      <option value="Pediatricians">Pediatrician</option>
                      <option value="Neurologist">Neurologist</option>
                      <option value="Gastroenterologist">Gastroenterologist</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                    <select 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                    >
                      {[...Array(10)].map((_, i) => (
                        <option key={i} value={`${i+1} Year`}>{i+1} Year{i !== 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Education/Degree</label>
                    <input 
                      type="text" 
                      placeholder="MD, MBBS, etc." 
                      value={degree}
                      onChange={(e) => setDegree(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Practice Details */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Practice Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee</label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number" 
                        placeholder="100" 
                        value={fees}
                        onChange={(e) => setFees(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 pl-10 pr-3"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                    <input 
                      type="text" 
                      placeholder="Office/Clinic address" 
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input 
                      type="text" 
                      placeholder="City, State, Zip" 
                      value={address2}
                      onChange={(e) => setAddress2(e.target.value)}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* About Doctor */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" />
                  Doctor Biography
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                  <textarea 
                    placeholder="Write a detailed professional description about the doctor..." 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 py-2 px-3"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Include relevant experience, areas of expertise, and approach to patient care.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-end">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`flex items-center px-8 py-3 rounded-lg text-white bg-primary hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Doctor...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-5 w-5" />
                    Add Doctor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDoctor