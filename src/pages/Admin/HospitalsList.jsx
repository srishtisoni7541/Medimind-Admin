import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const HospitalList = () => {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    specialties: '',
    rating: '',
    providesUrgentCare: '',
    name: ''
  })

  const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

  // Fetch hospitals on component mount
  useEffect(() => {
    fetchHospitals()
  }, [])

  // Function to fetch hospitals with optional filters
  const fetchHospitals = async () => {
    setLoading(true)
    try {
      // Build query parameters from filters
      const queryParams = new URLSearchParams()
      
      if (filters.specialties) {
        queryParams.append('specialties', filters.specialties)
      }
      
      if (filters.rating) {
        queryParams.append('rating', filters.rating)
      }
      
      if (filters.providesUrgentCare) {
        queryParams.append('providesUrgentCare', filters.providesUrgentCare)
      }
      
      if (filters.name) {
        queryParams.append('name', filters.name)
      }
      
      const query = queryParams.toString() ? `?${queryParams.toString()}` : ''
      
      const { data } = await axios.get(`${backendUrl}/api/user/find-hospitals${query}`)
      
      if (data.success) {
        setHospitals(data.hospitals)
      } else {
        toast.error('Failed to fetch hospitals')
      }
    } catch (error) {
      toast.error(error.message || 'Error fetching hospitals')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault()
    fetchHospitals()
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      specialties: '',
      rating: '',
      providesUrgentCare: '',
      name: ''
    })
    // Wait for state update then fetch
    setTimeout(fetchHospitals, 0)
  }

  // Get hospital type icon
  const getHospitalTypeIcon = (type) => {
    switch(type) {
      case 'general': return '🏥';
      case 'university': return '🏫';
      case 'local clinic': return '🏡';
      case 'traditional korean medicine clinic': return '💊';
      default: return '🏥';
    }
  }

  return (
    <div className='h-[100vh] overflow-y-scroll pb-[5vh]'>
        <div className="max-w-7xl mx-auto p-4 ">
      <h1 className="text-2xl font-bold mb-6">Find Hospitals</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Filter Hospitals</h2>
        <form onSubmit={applyFilters} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Search by name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
            <input
              type="text"
              name="specialties"
              value={filters.specialties}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g. cardiology,pediatrics"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
            <select
              name="rating"
              value={filters.rating}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgent Care</label>
            <select
              name="providesUrgentCare"
              value={filters.providesUrgentCare}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">All Hospitals</option>
              <option value="true">Provides Urgent Care</option>
            </select>
          </div>
          
          <div className="md:col-span-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-md"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      {/* Hospital List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-600">No hospitals found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="h-24 bg-indigo-50 flex items-center justify-center">
                {hospital.isVerified && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                )}
                <span className="text-8xl">{getHospitalTypeIcon(hospital.hospitalType)}</span>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800">{hospital.name}</h3>
                <p className="text-gray-600 mt-1 truncate">{hospital.address}</p>
                
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span>{hospital.rating.toFixed(1)}</span>
                  <span className="text-gray-400 text-sm ml-1">
                    ({hospital.reviews ? hospital.reviews.length : 0} reviews)
                  </span>
                </div>
                
                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700">Specialties:</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                        <span 
                          key={idx} 
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                      {hospital.specialties.length > 3 && (
                        <span className="text-gray-500 text-xs py-1">
                          +{hospital.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                
                {hospital.providesUrgentCare && (
                  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                    Provides urgent care services
                  </div>
                )}
                
                <div className="mt-4 flex justify-between">
                  <Link to={`/admin/hospitals/${hospital._id}/create-request`} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    create donation request
                  </Link>
                  <Link to={`/admin/hospitals/${hospital._id}/match-donors`} className="bg-green-500 mx-2 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    donation dashboard
                  </Link>
                </div>
                
                {hospital.operatingHours && (
                  <p className="mt-2 text-xs text-gray-500">
                    Hours: {hospital.operatingHours}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

export default HospitalList