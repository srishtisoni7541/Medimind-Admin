import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const HospitalManagement = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [requests, setRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [stats, setStats] = useState({
    totalRequests: 0,
    openRequests: 0,
    completedDonations: 0,
    scheduledDonations: 0
  });

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        const atoken = localStorage.getItem('atoken');
        
        if (!atoken) {
          toast.error('Authentication required');
          navigate('/login');
          return;
        }
        
        if (!hospitalId) {
          toast.error('Hospital ID is required');
          navigate('/admin/hospitals');
          return;
        }
        
        const headers = { token: atoken };

        // Get hospital profile
        const hospitalRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get-hospital/${hospitalId}`,
        );
        setHospital(hospitalRes.data.hospital);

        // Get donation requests for this hospital
        const requestsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/hospitals/requests?hospitalId=${hospitalId}`,
          { headers }
        );
        setRequests(requestsRes.data.requests);

        // Get hospital's donations
        const donationsRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/hospitals/donations?hospitalId=${hospitalId}`,
          { headers }
        );
        setDonations(donationsRes.data.donations);

        // Calculate statistics
        const reqStats = requestsRes.data.requests;
        const donStats = donationsRes.data.donations;
        
        setStats({
          totalRequests: reqStats.length,
          openRequests: reqStats.filter(req => req.status === 'open').length,
          completedDonations: donStats.filter(don => don.status === 'completed').length,
          scheduledDonations: donStats.filter(don => don.status === 'scheduled').length
        });
      } catch (error) {
        console.error('Error fetching hospital data:', error);
        toast.error(error.response?.data?.message || 'Failed to load hospital data');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, [hospitalId, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCreateRequest = () => {
    navigate(`/admin/hospitals/${hospitalId}/create-request`);
  };

  const handleViewMatchDonors = (requestId) => {
    navigate(`/admin/hospitals/${hospitalId}/requests/${requestId}/match-donors`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10 pt-[15vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading hospital data...</p>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md pt-[15vh]">
        <h2 className="text-2xl font-bold mb-4">Hospital Not Found</h2>
        <p className="mb-4">The requested hospital could not be found.</p>
        <Link 
          to="/admin/hospitals" 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Return to Hospitals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pt-[15vh]">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-600">{hospital.name}</h2>
            <p className="text-gray-600">{hospital.address}</p>
            <p className="text-gray-600">Phone: {hospital.phone}</p>
          </div>
          
          <div>
            <button 
              onClick={handleCreateRequest} 
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Donation Request
            </button>
            <Link 
              to={`/admin/hospitals/${hospitalId}/match-donors`}
              className="bg-green-600  text-white mx-2 py-3 px-4 rounded hover:bg-green-700"
            >
              view Scheduled donations
            </Link>
          </div>
          
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h4 className="text-blue-600 font-medium text-sm">Total Requests</h4>
            <p className="text-2xl font-bold">{stats.totalRequests}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <h4 className="text-yellow-600 font-medium text-sm">Open Requests</h4>
            <p className="text-2xl font-bold">{stats.openRequests}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <h4 className="text-green-600 font-medium text-sm">Completed Donations</h4>
            <p className="text-2xl font-bold">{stats.completedDonations}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <h4 className="text-purple-600 font-medium text-sm">Scheduled Donations</h4>
            <p className="text-2xl font-bold">{stats.scheduledDonations}</p>
          </div>
        </div>
        
        <div className="border-b mb-6">
          <div className="flex">
            <button
              className={`px-4 py-2 ${activeTab === 'requests' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('requests')}
            >
              Donation Requests
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'donations' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
              onClick={() => setActiveTab('donations')}
            >
              Donations
            </button>
          </div>
        </div>
        
        {activeTab === 'requests' ? (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Donation Requests</h3>
              <div className="flex space-x-2">
                <select 
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setRequests([...requests]);
                    } else {
                      setRequests([...requests].filter(req => req.status === e.target.value));
                    }
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="matched">Matched</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            {requests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map(request => (
                      <tr key={request._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="capitalize">{request.requestType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {request.requestType === 'blood' 
                            ? `Blood Type ${request.bloodType}` 
                            : `Organ: ${request.organ}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.urgency === 'emergency' ? 'bg-red-100 text-red-800' : 
                            request.urgency === 'urgent' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                            {request.urgency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${request.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            request.status === 'matched' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/admin/hospitals/${hospitalId}/requests/${request._id}`}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            View
                          </Link>
                          {request.status === 'open' && (
                            <button 
                              onClick={() => handleViewMatchDonors(request._id)}
                              className="text-green-600 hover:text-green-800"
                            >
                              Match Donors
                            </button>
                          )}
                          {request.status === 'matched' && (
                            <span className="text-purple-600">
                              {request.matchedDonors?.length || 0} donor(s) matched
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-3">No donation requests found for this hospital.</p>
                <button 
                  onClick={handleCreateRequest} 
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Create Your First Request
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Donations</h3>
              <div className="flex space-x-2">
                <select 
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e) => {
                    if (e.target.value === 'all') {
                      setDonations([...donations]);
                    } else {
                      setDonations([...donations].filter(don => don.status === e.target.value));
                    }
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donation Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {donations.map(donation => (
                      <tr key={donation._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {donation.donor?.user?.name || 'Anonymous'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {donation.donationType === 'blood' 
                            ? `Blood (${donation.bloodType})` 
                            : `Organ (${donation.organ})`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatDate(donation.donationDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${donation.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            donation.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            to={`/admin/hospitals/${hospitalId}/donations/${donation._id}`}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            View
                          </Link>
                          {donation.status === 'scheduled' && (
                            <>
                              <button 
                                onClick={() => navigate(`/admin/hospitals/${hospitalId}/donations/${donation._id}/complete`)}
                                className="text-green-600 hover:text-green-800 mr-3"
                              >
                                Complete
                              </button>
                              <button 
                                onClick={() => navigate(`/admin/hospitals/${hospitalId}/donations/${donation._id}/cancel`)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No donations found for this hospital.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalManagement;