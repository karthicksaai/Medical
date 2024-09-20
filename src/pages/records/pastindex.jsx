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
    patientRecords,
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
    console.log(patientRecords);
    setRecords(patientRecords);
    localStorage.setItem("patientRecords", JSON.stringify(patientRecords));
  }, [patientRecords]);

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
          id: currentUser.id,
          name: patientName,
          createdBy: user.email.address,
        });
  
        if (newRecord) {
          fetchPatientRecords(user.email.address);
          handleCloseModal();
        }
      }
    } catch (e) {
      console.log(e);
      handleCloseModal();
    }
  };

  const handleNavigate = (name) => {
    const filteredRecords = records.filter(
      (record) => record.patientName === name,
    );
    navigate(`/patient-records/${name}`, {
      state: filteredRecords[0],
    });
  };

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
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
};

export default PastRecordsIndex;
