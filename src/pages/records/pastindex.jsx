import React, { useState, useEffect } from "react";
import { IconCirclePlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useStateContext } from "../../context/index";
import CreateRecordModal from "./components/create-record-modal"; // Adjust the import path
import RecordCard from "./components/record-card"; // Adjust the import path

const PastRecordsIndex = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const {
    patients,
    fetchPatientRecords,
    createPatient,
    fetchUserByEmail,
    currentUser,
  } = useStateContext();
  const [records, setRecords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserByEmail(user.email.address);
      fetchPatientRecords(user.email.address);
    }
  }, [user, fetchUserByEmail,fetchPatientRecords]);

  useEffect(() => {
    if (Array.isArray(patients) && patients.length > 0) {
      console.log("Fetched patients:", patients);
      // If the expected properties are not available, handle that scenario
      const updatedRecords = patients.map(patient => ({
        id: patient.id,
        name: patient.name || 'Unnamed Patient', // Provide a fallback
        // other properties...
      }));
      setRecords(updatedRecords);
      localStorage.setItem("patients", JSON.stringify(updatedRecords));
    }
  }, [patients]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const createFolderForPatient = async (patientName) => {
    try {
      if (currentUser) {
        const newRecord = await createPatient({
          name: patientName,
          createdBy: user.email.address,
        });
  
        if (newRecord) {
          console.log(newRecord);
          setRecords((prevRecords) => [...prevRecords, newRecord]);
          handleCloseModal();
        }
      }
    } catch (e) {
      console.log(e);
      handleCloseModal();
    }
  };

  // const handleNavigate = (record) => {
  //   navigate(`/past-records/${record.name}`, {
  //     state: { recordName: record.name, id: record.id },
  //   });
  // };

  const handleNavigate = (record) => {
    if (record && record.name) {
      navigate(`/past-records/${record.name}`, {
        state: { recordName: record.name, id: record.id },
      });
    } else {
      console.log("Record data is missing:", record); // This log will help you diagnose further
    }
  };

  // const handleNavigate = (name) => {
  //   const filteredRecords = records.filter(
  //     (record) => record.name === name,
  //   );
  //   navigate(`/past-records/${name}`, {
  //     state: filteredRecords[0], // Pass the filtered record object
  //   });
  // };
  

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
        onClick={handleOpenModal}
      >
        <IconCirclePlus />
        Create Patient Record
      </button>

      <CreateRecordModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreate={createFolderForPatient}
        label="Patient"
      />

      <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {records?.map((record) => (
          <RecordCard
            key={record.id}
            record={record}
            onNavigate={() => handleNavigate(record)}
            isPatientRecord={true}
          />
        ))}
      </div>
    </div>
  );
};

export default PastRecordsIndex;
