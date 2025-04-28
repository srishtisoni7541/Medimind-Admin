import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ViewDonationRequest = () => {
  const { hospitalId, requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    urgency: '',
    patientCondition: '',
    preferredDonationDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchRequestDetails();
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      // Fetch the specific donation request
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/hospitals/requests?hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      const foundRequest = response.data.requests.find(req => req._id === requestId);
      
      if (!foundRequest) {
        toast.error('Donation request not found');
        navigate(`/admin/hospitals/${hospitalId}`);
        return;
      }
      
      setRequest(foundRequest);
      
      // If request has matched donors, populate them
      if (foundRequest.matchedDonors && foundRequest.matchedDonors.length > 0) {
        setMatchedDonors(foundRequest.matchedDonors);
      }
      
      // Set form data for potential updates
      setFormData({
        urgency: foundRequest.urgency || '',
        patientCondition: foundRequest.patientCondition || '',
        preferredDonationDate: foundRequest.preferredDonationDate ? 
          foundRequest.preferredDonationDate.split('T')[0] : '',
        notes: foundRequest.notes || '',
      });
    } catch (error) {
      console.error('Error fetching request details:', error);
      toast.error(error.response?.data?.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchDonors = async () => {
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/requests/${requestId}/match?hospitalId=${hospitalId}`,
        { headers: { token: atoken } }
      );
      
      setMatchedDonors(response.data.matchedDonors);
      setRequest({
        ...request,
        status: 'matched',
        matchedDonors: response.data.matchedDonors.map(donor => donor._id)
      });
      
      toast.success(`Successfully matched ${response.data.matchedDonors.length} donors`);
    } catch (error) {
      console.error('Error matching donors:', error);
      toast.error(error.response?.data?.message || 'Failed to match donors');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMatchDonors = () => {
    navigate(`/admin/hospitals/${hospitalId}/match-donors`, { state: { selectedRequest: request } });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const toggleUpdate = () => {
    setIsUpdating(!isUpdating);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const atoken = localStorage.getItem('atoken');
      
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/requests/${requestId}?hospitalId=${hospitalId}`,
        formData,
        { headers: { token: atoken } }
      );
      
      setRequest(response.data.request);
      setIsUpdating(false);
      toast.success('Donation request updated successfully');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error(error.response?.data?.message || 'Failed to update request');
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

  if (loading && !request) {
    return (
      <div className="flex justify-center items-center p-10 pt-[15vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-gray-600">Loading request details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pt-[15vh]">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-blue-600">
              {request?.requestType === 'blood' ? 
                `Blood Donation Request (${request?.bloodType})` : 
                `Organ Donation Request (${request?.organ})`}
            </h2>
            <p className="text-gray-600">Status: 
              <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                request?.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                request?.status === 'matched' ? 'bg-green-100 text-green-800' :
                request?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {request?.status}
              </span>
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              to={`/admin/hospitals/${hospitalId}`}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
            >
              Back to Hospital
            </Link>
            
            {request?.status === 'open' && (
              <button
                onClick={toggleUpdate}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                {isUpdating ? 'Cancel' : 'Update Request'}
              </button>
            )}
          </div>
        </div>

        {isUpdating ? (
          <form onSubmit={handleUpdateRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 mb-1">Preferred Donation Date</label>
                <input
                  type="date"
                  name="preferredDonationDate"
                  value={formData.preferredDonationDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Patient Condition</label>
              <textarea
                name="patientCondition"
                value={formData.patientCondition}
                onChange={handleInputChange}
                className="w-full p-2 border rounded min-h-[100px]"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded min-h-[100px]"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={toggleUpdate}
                className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Request Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Type:</span> <span className="capitalize">{request?.requestType}</span></p>
                  
                  {request?.requestType === 'blood' && (
                    <p><span className="font-medium">Blood Type:</span> {request?.bloodType}</p>
                  )}
                  
                  {request?.requestType === 'organ' && (
                    <p><span className="font-medium">Organ:</span> <span className="capitalize">{request?.organ}</span></p>
                  )}
                  
                  <p>
                    <span className="font-medium">Urgency:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${
                      request?.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                      request?.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {request?.urgency}
                    </span>
                  </p>
                  
                  <p><span className="font-medium">Created:</span> {formatDate(request?.createdAt)}</p>
                  
                  {request?.preferredDonationDate && (
                    <p><span className="font-medium">Preferred Donation Date:</span> {formatDate(request?.preferredDonationDate)}</p>
                  )}
                  
                  <p><span className="font-medium">Expires:</span> {formatDate(request?.expiresAt)}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
                <div className="space-y-2">
                  {request?.patientCondition ? (
                    <p className="whitespace-pre-wrap">{request?.patientCondition}</p>
                  ) : (
                    <p className="text-gray-500 italic">No patient information provided</p>
                  )}
                </div>
              </div>
            </div>
            
            {request?.notes && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">Additional Notes</h3>
                <p className="whitespace-pre-wrap">{request?.notes}</p>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3">Matched Donors</h3>
              
              {matchedDonors.length > 0 ? (
                <div className="space-y-3">
                  <p className="mb-2">
                    <span className="font-medium">{matchedDonors.length}</span> potential {matchedDonors.length === 1 ? 'donor' : 'donors'} matched for this request.
                  </p>
                  
                  <button
                    onClick={handleViewMatchDonors}
                    className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                  >
                    View & Schedule Donors
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-500">No donors have been matched to this request yet.</p>
                  
                  {request?.status === 'open' && (
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0">
                      <button
                        onClick={handleMatchDonors}
                        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                      >
                        Auto-Match Donors
                      </button>
                      
                      <button
                        onClick={handleViewMatchDonors}
                        className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                      >
                        Manually Find Donors
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewDonationRequest;