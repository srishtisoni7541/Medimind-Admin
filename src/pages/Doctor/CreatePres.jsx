import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const CreatePres = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { dToken, backendUrl } = useContext(DoctorContext);
  
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState(null);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [medications, setMedications] = useState([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);

  useEffect(() => {
    if (dToken && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [dToken, appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      // Check if prescription already exists
      const prescriptionRes = await axios.get(
        `${backendUrl}/api/doctor/prescriptions/appointment/${appointmentId}`,
        { headers: { token: dToken } }
      );
      
      if (prescriptionRes.data.success) {
        // Prescription exists, redirect to update page
        toast.info("Prescription already exists for this appointment");
        navigate(`/doctor/update-prescription/${prescriptionRes.data.data._id}`);
        return;
      }
    } catch (error) {
      // If 404, means no prescription exists yet - continue creating
      if (error.response?.status !== 404) {
        toast.error("Error checking prescription status");
        console.error(error);
      }
    }

    // Fetch appointment details
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/doctor/appointments`,
        { headers: { token: dToken } }
      );
      console.log(data);
      
      if (data.success) {
        const foundAppointment = data.appointments.find(
          (appt) => appt._id === appointmentId
        );
        
        if (!foundAppointment) {
          toast.error("Appointment not found");
          navigate('/doctor-appointments');
          return;
        }
        
        if (!foundAppointment.isCompleted) {
          toast.error("Cannot create prescription for incomplete appointment");
          navigate('/doctor-appointments');
          return;
        }
        
        setAppointment(foundAppointment);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching appointment details");
    } finally {
      setLoading(false);
    }
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedication = (index) => {
    if (medications.length === 1) {
      toast.info("At least one medication is required");
      return;
    }
    
    const updatedMedications = medications.filter((_, i) => i !== index);
    setMedications(updatedMedications);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!diagnosis.trim()) {
      toast.error("Diagnosis is required");
      return;
    }
    
    const isValidMedications = medications.every(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim() && med.duration.trim()
    );
    
    if (!isValidMedications) {
      toast.error("Please fill all required medication fields");
      return;
    }
    
    try {
      setLoading(true);
      
      const prescriptionData = {
        appointmentId,
        doctorId: appointment.docId,
        patientId: appointment.userId,
        medications,
        diagnosis,
        notes
      };
      
      const { data } = await axios.post(
        `${backendUrl}/api/doctor/prescriptions`,
        prescriptionData,
        { headers: { token: dToken } }
      );
      
      if (data.success) {
        toast.success("Prescription created successfully");
        navigate('/doctor-appointments');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error creating prescription");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl m-5 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading appointment details...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="w-full max-w-6xl m-5">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-500">Appointment not found or not authorized.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Create Prescription</h2>
        <button 
          onClick={() => navigate('/doctor-appointments')}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
        >
          Back to Appointments
        </button>
      </div>

      <div className="bg-white border rounded-md p-6">
        <div className="mb-6 bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">Appointment Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Patient Name</p>
              <p className="font-medium">{appointment.userData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Appointment Date & Time</p>
              <p className="font-medium">
                {new Date(appointment.slotDate).toLocaleDateString()} at {appointment.slotTime}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis *
            </label>
            <textarea
              id="diagnosis"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Medications *
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md text-sm"
              >
                + Add Medication
              </button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Medication #{index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 500mg"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., Twice daily"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Duration *
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g., 7 days"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-500 mb-1">
                    Special Instructions
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., Take after meals"
                    value={medication.instructions}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              className="w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions or notes for the patient"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor-appointments')}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePres;