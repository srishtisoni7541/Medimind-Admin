import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const DoctorPrescriptions = () => {
  const navigate = useNavigate();
  const { dToken, backendUrl, profileData, getProfileData } = useContext(DoctorContext);
  console.log(profileData);
  
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    if (dToken) {
      if (!profileData) {
        getProfileData();
      }
      fetchPrescriptions();
    }
  }, [dToken, profileData]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      
      if (!profileData) {
        await getProfileData();
      }
      
      const doctorId = profileData._id;
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/prescriptions/doctor/${doctorId}`,
        { headers: { token: dToken } }
      );
      console.log(data,"datat");
      
      if (data.success) {
        setPrescriptions(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const viewPrescription = (prescriptionId) => {
    navigate(`/doctor/update-prescription/${prescriptionId}`);
  };

  if (loading && !prescriptions.length) {
    return (
      <div className="w-full max-w-6xl m-5 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">My Prescriptions</h2>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white border rounded-md p-8 text-center">
          <p className="text-gray-500">No prescriptions found.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="max-sm:hidden grid grid-cols-[2fr_1fr_2fr_1fr] gap-1 py-3 px-6 border-b font-medium">
            <p>Patient</p>
            <p>Date</p>
            <p>Diagnosis</p>
            <p>Action</p>
          </div>

          {prescriptions.map((prescription, index) => (
            <div 
              key={prescription._id} 
              className="flex flex-wrap justify-between max-sm:gap-3 max-sm:p-4 max-sm:border-b sm:grid grid-cols-[2fr_1fr_2fr_1fr] gap-1 items-center text-gray-700 py-3 px-6 border-b hover:bg-gray-50"
            >
              <div>
                <p className="sm:hidden text-xs text-gray-500">Patient:</p>
                <p>{prescription.patientId?.name || "Unknown Patient"}</p>
              </div>
              
              <div>
                <p className="sm:hidden text-xs text-gray-500">Date:</p>
                <p className="text-sm">{formatDate(prescription.createdAt)}</p>
              </div>
              
              <div>
                <p className="sm:hidden text-xs text-gray-500">Diagnosis:</p>
                <p className="truncate">{prescription.diagnosis}</p>
              </div>
              
              <div>
                <button
                  onClick={() => viewPrescription(prescription._id)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm"
                >
                  View/Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;