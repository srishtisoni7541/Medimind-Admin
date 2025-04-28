import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateDonationRequest = () => {
  const { hospitalId } = useParams();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    requestType: 'blood',
    bloodType: 'A+',
    organ: 'kidney',
    urgency: 'routine',
    patientCondition: '',
    preferredDonationDate: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchHospital = async () => {
      try {
        const atoken = localStorage.getItem('atoken');
        
        if (!atoken) {
          toast.error('Authentication required');
          navigate('/login');
          return;
        }
        
        const headers = { token: atoken };
        
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/get-hospital/${hospitalId}`,
        );
        
        setHospital(response.data.hospital);
      } catch (error) {
        console.error('Error fetching hospital:', error);
        toast.error(error.response?.data?.message || 'Failed to load hospital data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHospital();
  }, [hospitalId, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.requestType) {
      newErrors.requestType = 'Request type is required';
    }
    
    if (formData.requestType === 'blood' && !formData.bloodType) {
      newErrors.bloodType = 'Blood type is required';
    }
    
    if (formData.requestType === 'organ' && !formData.organ) {
      newErrors.organ = 'Organ type is required';
    }
    
    if (!formData.urgency) {
      newErrors.urgency = 'Urgency level is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const atoken = localStorage.getItem('atoken');
      
      if (!atoken) {
        toast.error('Authentication required');
        navigate('/login');
        return;
      }
      
      const headers = { token: atoken };
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/donations/admin/requests?hospitalId=${hospitalId}`,
        formData,
        { headers }
      );
      
      toast.success('Donation request created successfully');
      navigate(`/admin/hospitals/${hospitalId}`);
    } catch (error) {
      console.error('Error creating donation request:', error);
      toast.error(error.response?.data?.message || 'Failed to create donation request');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-10">Loading...</div>;
  }
  
  if (!hospital) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Hospital Not Found</h2>
        <p className="mb-4">The hospital could not be found.</p>
        <button 
          onClick={() => navigate('/admin/hospitals')}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Return to Hospitals
        </button>
      </div>
    );
  }
  
  return (
   <div className='h-[100vh] overflow-y-scroll w-full flex items-center justify-center'>
     <div className="w-[50vw]  p-4 pt-[15vh]">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600">Create Donation Request</h2>
          <p className="text-gray-600">Hospital: {hospital.name}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Request Type
            </label>
            <select
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="blood">Blood Donation</option>
              <option value="organ">Organ Donation</option>
            </select>
            {errors.requestType && (
              <p className="text-red-500 text-xs italic">{errors.requestType}</p>
            )}
          </div>
          
          {formData.requestType === 'blood' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Blood Type
              </label>
              <select
                name="bloodType"
                value={formData.bloodType}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              {errors.bloodType && (
                <p className="text-red-500 text-xs italic">{errors.bloodType}</p>
              )}
            </div>
          )}
          
          {formData.requestType === 'organ' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Organ
              </label>
              <select
                name="organ"
                value={formData.organ}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="kidney">Kidney</option>
                <option value="liver">Liver</option>
                <option value="heart">Heart</option>
                <option value="lungs">Lungs</option>
                <option value="pancreas">Pancreas</option>
                <option value="intestines">Intestines</option>
                <option value="cornea">Cornea</option>
                <option value="bone marrow">Bone Marrow</option>
              </select>
              {errors.organ && (
                <p className="text-red-500 text-xs italic">{errors.organ}</p>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Urgency
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
            {errors.urgency && (
              <p className="text-red-500 text-xs italic">{errors.urgency}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Patient Condition (Optional)
            </label>
            <textarea
              name="patientCondition"
              value={formData.patientCondition}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Brief description of patient's condition"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Preferred Donation Date (Optional)
            </label>
            <input
              type="date"
              name="preferredDonationDate"
              value={formData.preferredDonationDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Any additional information"
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/admin/hospitals/${hospitalId}`)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
   </div>
  );
};

export default CreateDonationRequest;