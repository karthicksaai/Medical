import React, { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useStateContext } from "../context"; // Ensure correct import path
import { useNavigate } from "react-router-dom";

const CompletedScreenings = () => {
  const navigate = useNavigate();
  const { user } = usePrivy();
  const { fetchUserRecords, records } = useStateContext();
  const [completedScreenings, setCompletedScreenings] = useState([]);
  const [metrics, setMetrics] = useState({
    totalScreenings: 0,
    completedScreenings: 0,
  });

  useEffect(() => {
    if (user) {
      fetchUserRecords(user.email.address)
        .then(() => {
          const allCompletedScreenings = [];
          let totalScreenings = 0;
          let completedScreeningsCount = 0;

          records.forEach((record) => {
            if (record.kanbanRecords) {
              try {
                const kanban = JSON.parse(record.kanbanRecords);

                // Ensure tasks exist and are an array
                if (Array.isArray(kanban.tasks)) {
                  kanban.tasks.forEach((task) => {
                    totalScreenings += 1;
                    if (task.columnId === "done") {
                      completedScreeningsCount += 1;
                      allCompletedScreenings.push({
                        id: task.id,
                        title: task.title,
                        recordName: record.recordName,
                        analysisResult: record.analysisResult,
                        status: task.columnId,
                      });
                    }
                  });
                }
              } catch (error) {
                console.error("Failed to parse kanbanRecords:", error);
              }
            }
          });

          setCompletedScreenings(allCompletedScreenings);
          setMetrics({
            totalScreenings,
            completedScreenings: completedScreeningsCount,
          });
        })
        .catch((e) => {
          console.error("Error fetching records:", e);
        });
    }
  }, [user, fetchUserRecords, records]);

  const handleTaskClick = (taskId) => {
    navigate(`/screenings/${taskId}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Completed Screenings</h1>
      <div className="mb-4">
        <h2 className="text-lg font-medium">Metrics</h2>
        <p>Total Screenings: {metrics.totalScreenings}</p>
        <p>Completed Screenings: {metrics.completedScreenings}</p>
      </div>
      {completedScreenings.length > 0 ? (
        <ul>
          {completedScreenings.map((screening) => (
            <li
              key={screening.id}
              className="mb-4 p-4 border rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleTaskClick(screening.id)}
            >
              <h2 className="text-lg font-medium">{screening.title}</h2>
              <p>Record Name: {screening.recordName}</p>
              <p>Analysis Result: {screening.analysisResult}</p>
              <p>Status: {screening.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No completed screenings available.</p>
      )}
    </div>
  );
};

export default CompletedScreenings;
