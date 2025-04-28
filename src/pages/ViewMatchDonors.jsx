import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewMatchDonors = () => {
     const { hospitalId } = useParams(); // Get hospitalId from URL params
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({
    bloodType: '',
    organ: '',
    maxDistance: '10', // Default 10km
  });
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.warning("Could not access location. Some features may be limited.");
        }
      );
    }

    // Load hospital's donation requests
    fetchRequests();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      // When a request is selected, automatically set the filter based on request type
      if (selectedRequest.requestType === 'blood') {
        setFilters({
          ...filters,
          bloodType: selectedRequest.bloodType,
          organ: ''
        });
      } else if (selectedRequest.requestType === 'organ') {
        setFilters({
          ...filters,
          bloodType: '',
          organ: selectedRequest.organ
        });
      }
      searchDonors();
    }
  }, [selectedRequest]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/hospitals/requests?hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      setRequests(response.data.requests.filter(req => req.status === 'open'));
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error(error.response?.data?.message || 'Failed to load donation requests');
    } finally {
      setLoading(false);
    }
  };

  const searchDonors = async () => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }

      let queryParams = new URLSearchParams();
      
      if (filters.bloodType) queryParams.append('bloodType', filters.bloodType);
      if (filters.organ) queryParams.append('organ', filters.organ);
      if (filters.maxDistance) queryParams.append('maxDistance', filters.maxDistance);
      if (coordinates) queryParams.append('coordinates', coordinates.join(','));
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/donors/search?${queryParams}&hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      setDonors(response.data.donors);
    } catch (error) {
      console.error('Error searching donors:', error);
      toast.error(error.response?.data?.message || 'Failed to search donors');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchDonors = async (requestId) => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/requests/${requestId}/match?hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      toast.success(`Successfully matched ${response.data.matchedDonors.length} donors`);
      
      // Update the local state
      const updatedRequests = requests.map(req => 
        req._id === requestId ? { ...req, status: 'matched', matchedDonors: response.data.matchedDonors } : req
      );
      
      setRequests(updatedRequests);
      setDonors(response.data.matchedDonors);
    } catch (error) {
      console.error('Error matching donors:', error);
      toast.error(error.response?.data?.message || 'Failed to match donors');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleDonation = async (donorId) => {
    try {
      if (!selectedRequest) {
        toast.warning('Please select a donation request first');
        return;
      }

      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const payload = {
        donorId,
        requestId: selectedRequest._id,
        donationType: selectedRequest.requestType,
        bloodType: selectedRequest.bloodType,
        organ: selectedRequest.organ,
        donationDate: selectedRequest.preferredDonationDate || new Date().toISOString().split('T')[0],
        notes: `Scheduled by hospital for ${selectedRequest.requestType} donation`
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/donations/schedule?hospitalId=${hospitalId}`,
        payload,
        { headers: { token: atoken } }
      );
      
      toast.success('Donation scheduled successfully');
      
      // Update states after scheduling
      fetchRequests();
      setSelectedRequest(null);
      setDonors([]);
    } catch (error) {
      console.error('Error scheduling donation:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule donation');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Handle filter changes
    if (name === 'requestType') {
      if (value === 'blood') {
        setFilters({ ...filters, bloodType: 'A+', organ: '' });
      } else if (value === 'organ') {
        setFilters({ ...filters, bloodType: '', organ: 'kidney' });
      }
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const selectRequest = (request) => {
    setSelectedRequest(request);
  };
  console.log(selectedRequest);
  
  return (
    <div className='flex items-center justify-center w-full h-[100vh] overflow-y-scroll'>
       <div className="max-w-6xl mx-auto p-4 ">
      <h2 className="text-2xl font-bold mb-6 text-blue-600">Find and Match Donors</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">Active Requests</h3>
          
          {loading && requests.length === 0 ? (
            <div className="text-center py-4">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No active donation requests</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {requests.map(request => (
                <div 
                  key={request._id}
                  className={`p-3 border rounded-md cursor-pointer transition ${
                    selectedRequest?._id === request._id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => selectRequest(request)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium capitalize">
                        {request.requestType}: {request.requestType === 'blood' ? request.bloodType : request.organ}
                      </p>
                      <p className="text-sm text-gray-600">
                        Urgency: <span className={`${
                          request.urgency === 'emergency' ? 'text-red-600 font-bold' : 
                          request.urgency === 'urgent' ? 'text-orange-600 font-semibold' : 
                          'text-gray-600'
                        }`}>{request.urgency}</span>
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      request.urgency === 'emergency' ? 'bg-red-100 text-red-800' : 
                      request.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {request.patientCondition && (
                    <p className="text-sm text-gray-700 mt-1">
                      Patient: {request.patientCondition.slice(0, 50)}
                      {request.patientCondition.length > 50 ? '...' : ''}
                    </p>
                  )}
                  
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMatchDonors(request._id);
                      }}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Auto-Match Donors
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Manual Search</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Blood Type</label>
                <select
                  name="bloodType"
                  value={filters.bloodType}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Any</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Organ</label>
                <select
                  name="organ"
                  value={filters.organ}
                  onChange={handleFilterChange}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Any</option>
                  <option value="kidney">Kidney</option>
                  <option value="liver">Liver</option>
                  <option value="heart">Heart</option>
                  <option value="lungs">Lungs</option>
                  <option value="pancreas">Pancreas</option>
                  <option value="corneas">Corneas</option>
                  <option value="tissue">Tissue</option>
                  <option value="bone marrow">Bone Marrow</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Max Distance (km)</label>
                <input
                  type="number"
                  name="maxDistance"
                  value={filters.maxDistance}
                  onChange={handleFilterChange}
                  min="1"
                  max="100"
                  className="w-full p-2 border rounded text-sm"
                />
              </div>
              <button
                onClick={searchDonors}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Search Donors
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedRequest 
              ? `Matching Donors for ${selectedRequest.requestType === 'blood' 
                 ? `Blood Type ${selectedRequest.bloodType}` 
                 : `${selectedRequest.organ} Donation`}` 
              : 'Available Donors'}
          </h3>
          
          {loading && donors.length === 0 ? (
            <div className="text-center py-10">
              <svg className="inline w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
              </svg>
              <p className="mt-2 text-gray-600">Searching for donors...</p>
            </div>
          ) : donors.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p>No matching donors found</p>
              <p className="text-sm mt-2">Try adjusting your search criteria or select a different request</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {donors.map(donor => (
                <div key={donor._id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{donor.user?.name || 'Anonymous Donor'}</h4>
                      <p className="text-sm text-gray-600">Blood Type: {donor.bloodType}</p>
                      
                      {donor.organDonor && (
                        <p className="text-sm text-gray-600">
                          Organs: {donor.organs.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')}
                        </p>
                      )}
                      
                      {donor.medicalConditions.length > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Medical Conditions: {donor.medicalConditions.join(', ')}
                        </p>
                      )}
                      
                      {donor.medications.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Medications: {donor.medications.join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Available
                      </span>
                      
                      {donor.lastDonated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last donated: {new Date(donor.lastDonated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleScheduleDonation(donor._id)}
                      disabled={!selectedRequest}
                      className={`flex-1 py-1 px-2 text-sm rounded ${
                        selectedRequest
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Schedule Donation
                    </button>
                    
                    <a
                      href={`tel:${donor.user?.phone || ''}`}
                      className="flex-1 py-1 px-2 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-center"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
   
  );
};

export default ViewMatchDonors;