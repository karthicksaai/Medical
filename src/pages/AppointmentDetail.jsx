import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStateContext } from "../context"; // Ensure correct import path

const AppointmentDetail = () => {
  const { id } = useParams(); // Get the appointment ID from the URL
  const { records } = useStateContext();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    // Find the appointment with the matching ID
    const foundAppointment = records.find((record) => record.id === parseInt(id));
    setAppointment(foundAppointment);
  }, [id, records]);

  if (!appointment) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">{appointment.recordName}</h1>
      <p><strong>Status:</strong> Pending</p>
      <p><strong>Details:</strong> {appointment.analysisResult}</p>
      <p><strong>Kanban Records:</strong></p>
      <pre>{appointment.kanbanRecords}</pre> {/* Displaying raw kanbanRecords, adjust as needed */}
    </div>
  );
};

export default AppointmentDetail;
