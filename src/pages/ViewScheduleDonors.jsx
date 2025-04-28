import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewScheduleDonors = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulingDonor, setSchedulingDonor] = useState(null);
  const [filters, setFilters] = useState({
    bloodType: '',
    organ: '',
    status: 'all'
  });
  const [formData, setFormData] = useState({
    donationType: 'blood',
    bloodType: 'A+',
    organ: '',
    donationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchDonors();
    fetchDonations();
  }, []);

  const fetchDonors = async () => {
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
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/donors/search?${queryParams}&hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      setDonors(response.data.donors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      toast.error(error.response?.data?.message || 'Failed to load donors');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/hospitals/donations?hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      setDonations(response.data.donations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error(error.response?.data?.message || 'Failed to load donation history');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleSearch = () => {
    fetchDonors();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'donationType') {
      // Reset type-specific fields when switching donation type
      if (value === 'blood') {
        setFormData({
          ...formData,
          donationType: value,
          bloodType: 'A+',
          organ: ''
        });
      } else {
        setFormData({
          ...formData,
          donationType: value,
          bloodType: '',
          organ: 'kidney'
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const openScheduleModal = (donor) => {
    setSchedulingDonor(donor);
    // Pre-fill form data based on donor info
    setFormData({
      ...formData,
      bloodType: donor.bloodType || 'A+',
      organ: donor.organs && donor.organs.length > 0 ? donor.organs[0] : ''
    });
  };

  const closeScheduleModal = () => {
    setSchedulingDonor(null);
  };

  const handleScheduleDonation = async (e) => {
    e.preventDefault();
    
    if (!schedulingDonor) {
      toast.error('No donor selected');
      return;
    }
    
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const payload = {
        donorId: schedulingDonor._id,
        donationType: formData.donationType,
        bloodType: formData.donationType === 'blood' ? formData.bloodType : undefined,
        organ: formData.donationType === 'organ' ? formData.organ : undefined,
        donationDate: formData.donationDate,
        notes: formData.notes
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/donations/schedule?hospitalId=${hospitalId}`,
        payload,
        { headers: { token: atoken } }
      );
      
      toast.success('Donation scheduled successfully');
      closeScheduleModal();
      
      // Refresh lists
      fetchDonors();
      fetchDonations();
    } catch (error) {
      console.error('Error scheduling donation:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule donation');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteDonation = async (donationId) => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const payload = {
        amount: 'Standard donation',
        notes: 'Donation completed successfully'
      };
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/${donationId}/complete?hospitalId=${hospitalId}`,
        payload,
        { headers: { token: atoken } }
      );
      
      toast.success('Donation marked as completed');
      fetchDonations();
    } catch (error) {
      console.error('Error completing donation:', error);
      toast.error(error.response?.data?.message || 'Failed to complete donation');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to cancel this donation?')) {
      return;
    }
    
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const payload = {
        reason: 'Cancelled by hospital'
      };
      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/${donationId}/cancel?hospitalId=${hospitalId}`,
        payload,
        { headers: { token: atoken } }
      );
      
      toast.success('Donation cancelled');
      fetchDonations();
      fetchDonors(); // Refresh donors as availability might have changed
    } catch (error) {
      console.error('Error cancelling donation:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel donation');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Filter donations based on status
  const filteredDonations = donations.filter(donation => {
    if (filters.status === 'all') return true;
    return donation.status === filters.status;
  });

  return (
    <div className='flex items-center justify-center w-full h-[100vh] overflow-y-scroll'>
      <div className="max-w-6xl mx-auto p-4 ">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-600">Donor Management</h2>
        <Link 
          to={`/admin/hospitals/${hospitalId}`}
          className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
        >
          Back to Hospital Dashboard
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left sidebar - Filters */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Find Donors</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Blood Type</label>
              <select
                name="bloodType"
                value={filters.bloodType}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any Blood Type</option>
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
              <label className="block text-sm font-medium mb-1">Organ</label>
              <select
                name="organ"
                value={filters.organ}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Any Organ</option>
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
            
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Search Donors
            </button>
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h3 className="font-semibold text-lg mb-4">Donation History</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded"
              >
                <option value="all">All Donations</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="lg:col-span-4 space-y-6">
          {/* Available Donors */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Available Donors</h3>
            
            {loading && donors.length === 0 ? (
              <div className="flex justify-center items-center p-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <p className="ml-3 text-gray-600">Loading donors...</p>
              </div>
            ) : donors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No donors found matching your criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donors.map(donor => (
                  <div key={donor._id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{donor.user?.name || 'Anonymous Donor'}</h4>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Available
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">Blood Type: <span className="font-medium">{donor.bloodType}</span></p>
                      
                      {donor.organDonor && (
                        <p className="text-sm text-gray-600">
                          Available Organs: <span className="font-medium">{donor.organs.map(o => o.charAt(0).toUpperCase() + o.slice(1)).join(', ')}</span>
                        </p>
                      )}
                      
                      {donor.lastDonated && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last donated: {formatDate(donor.lastDonated)}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => openScheduleModal(donor)}
                        className="bg-blue-600 text-white py-1.5 px-3 rounded text-sm hover:bg-blue-700"
                      >
                        Schedule Donation
                      </button>
                      
                      <a
                        href={`tel:${donor.user?.phone || ''}`}
                        className="bg-gray-100 text-gray-800 py-1.5 px-3 rounded text-sm hover:bg-gray-200 text-center"
                      >
                        Contact
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Scheduled/Active Donations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              {filters.status === 'all' ? 'All Donations' : 
               filters.status === 'scheduled' ? 'Scheduled Donations' :
               filters.status === 'completed' ? 'Completed Donations' : 
               'Cancelled Donations'}
            </h3>
            
            {filteredDonations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No {filters.status === 'all' ? '' : filters.status} donations found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Donation Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDonations.map(donation => (
                      <tr key={donation._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {donation.donor?.user?.name || 'Anonymous'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Blood Type: {donation.donor?.bloodType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {donation.donationType}
                            {donation.donationType === 'blood' && donation.bloodType && `: ${donation.bloodType}`}
                            {donation.donationType === 'organ' && donation.organ && `: ${donation.organ}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(donation.donationDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${donation.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' : 
                              donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}`}>
                            {donation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {donation.status === 'scheduled' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCompleteDonation(donation._id)}
                                className="bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700"
                              >
                                Mark Complete
                              </button>
                              <button
                                onClick={() => handleCancelDonation(donation._id)}
                                className="bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Schedule Donation Modal */}
      {schedulingDonor && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative bg-white rounded-lg shadow-xl mx-4 max-w-md md:max-w-lg w-full">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-gray-900">
                  Schedule Donation - {schedulingDonor.user?.name || 'Anonymous Donor'}
                </h3>
                <button 
                  onClick={closeScheduleModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleScheduleDonation} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donation Type</label>
                  <select
                    name="donationType"
                    value={formData.donationType}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="blood">Blood</option>
                    {schedulingDonor.organDonor && <option value="organ">Organ</option>}
                  </select>
                </div>
                
                {formData.donationType === 'blood' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded"
                      required
                    >
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
                )}
                
                {formData.donationType === 'organ' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organ</label>
                    <select
                      name="organ"
                      value={formData.organ}
                      onChange={handleFormChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      {schedulingDonor.organs.map((organ) => (
                        <option key={organ} value={organ}>{organ.charAt(0).toUpperCase() + organ.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Donation Date</label>
                  <input
                    type="date"
                    name="donationDate"
                    value={formData.donationDate}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    className="w-full p-2 border rounded"
                    rows="3"
                    placeholder="Any additional information or instructions..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeScheduleModal}
                    className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                  >
                    Schedule Donation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default ViewScheduleDonors;