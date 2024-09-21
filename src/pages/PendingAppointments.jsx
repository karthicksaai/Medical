import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useStateContext } from "../context";


const PendingAppointments = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { fetchUserRecords, records } = useStateContext();
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (user) {
      // Fetch user records
      fetchUserRecords(user.email.address)
        .then(() => {
          // Filter records to get pending appointments
          const pendingAppointments = records.filter((record) => {
            try {
              const kanban = JSON.parse(record.kanbanRecords);
              // Assuming 'doing' columnId is for pending appointments
              return kanban.tasks.some((task) => task.columnId === "doing");
            } catch (error) {
              console.error("Failed to parse kanbanRecords:", error);
              return false;
            }
          });
          setAppointments(pendingAppointments);
        })
        .catch((e) => {
          console.error("Error fetching records:", e);
        });
    }
  }, [user, fetchUserRecords, records]);

  const handleClick = (appointmentId) => {
    // Navigate to a detailed view or another relevant page
    navigate(`/appointments/${appointmentId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Pending Appointments</h1>
      {appointments.length > 0 ? (
        <ul>
          {appointments.map((appointment) => (
            <li
              key={appointment.id}
              className="mb-4 p-4 border rounded cursor-pointer bg-blue-100 hover:bg-gray-100"
              onClick={() => handleClick(appointment.id)}
            >
              <h2 className="text-lg font-medium">{appointment.recordName}</h2>
              <p>Status: Pending</p>
              <p>Details: {appointment.analysisResult}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending appointments.</p>
      )}
    </div>
  );
};

export default PendingAppointments;
