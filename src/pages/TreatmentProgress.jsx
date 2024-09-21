import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useStateContext } from "../context"; // Ensure correct import path

const TreatmentProgress = () => {
  const { user } = usePrivy();
  const { fetchUserRecords, records } = useStateContext();
  const [progressData, setProgressData] = useState({
    totalTreatments: 0,
    completedTreatments: 0,
    ongoingTreatments: 0,
    treatmentDetails: [],
  });

  useEffect(() => {
    if (user) {
      fetchUserRecords(user.email.address)
        .then(() => {
          let totalTreatments = 0;
          let completedTreatments = 0;
          let ongoingTreatments = 0;
          const treatmentDetails = [];

          records.forEach((record) => {
            if (record.kanbanRecords) {
              try {
                const kanban = JSON.parse(record.kanbanRecords);
                totalTreatments += kanban.tasks.length;
                completedTreatments += kanban.tasks.filter(
                  (task) => task.columnId === "done"
                ).length;
                ongoingTreatments += kanban.tasks.filter(
                  (task) => task.columnId === "doing"
                ).length;

                treatmentDetails.push({
                  name: record.recordName,
                  details: record.analysisResult,
                  status: kanban.tasks.some((task) => task.columnId === "done")
                    ? "Completed"
                    : "Ongoing",
                });
              } catch (error) {
                console.error("Failed to parse kanbanRecords:", error);
              }
            }
          });

          setProgressData({
            totalTreatments,
            completedTreatments,
            ongoingTreatments,
            treatmentDetails,
          });
        })
        .catch((e) => {
          console.error("Error fetching records:", e);
        });
    }
  }, [user, fetchUserRecords, records]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Treatment Progress</h1>
      <div className="mb-6">
        <h2 className="text-lg font-medium">Summary</h2>
        <p><strong>Total Treatments:</strong> {progressData.totalTreatments}</p>
        <p><strong>Completed Treatments:</strong> {progressData.completedTreatments}</p>
        <p><strong>Ongoing Treatments:</strong> {progressData.ongoingTreatments}</p>
      </div>
      <div>
        <h2 className="text-lg font-medium mb-4">Treatment Details</h2>
        {progressData.treatmentDetails.length > 0 ? (
          <ul>
            {progressData.treatmentDetails.map((treatment) => (
              <li key={treatment.name} className="mb-4 p-4 border rounded cursor-pointer bg-blue-100 hover:bg-gray-100">
                <h3 className="text-md font-semibold">{treatment.name}</h3>
                <p><strong>Status:</strong> {treatment.status}</p>
                <p><strong>Details:</strong> {treatment.details}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No treatment details available.</p>
        )}
      </div>
    </div>
  );
};

export default TreatmentProgress;
