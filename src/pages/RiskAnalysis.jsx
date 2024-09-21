import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useStateContext } from '../context';
import { usePrivy } from '@privy-io/react-auth';

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function RiskAnalysisComponent() {
  const [rankedRecords, setRankedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { analysis, fetchAllAnalysisResults } = useStateContext();
  const {user} = usePrivy();

  useEffect(() => {
    async function fetchAndAnalyzeRecords() {
      if (!user) {
        setError("No current user found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const records = await fetchAllAnalysisResults();
        console.log("Fetched records:", records); // Debugging log

        if (!Array.isArray(records) || records.length === 0) {
          setError("No records found or invalid records data");
          setLoading(false);
          return;
        }

        const analyzedRecords = await analyzeAndRankRecords(records);
        setRankedRecords(analyzedRecords);
      } catch (err) {
        console.error("Error in fetching or analyzing records:", err);
        setError("An error occurred while analyzing records: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAndAnalyzeRecords();
  }, [user, fetchAllAnalysisResults]);

  async function analyzeAndRankRecords(records) {
    if (!Array.isArray(records) || records.length === 0) {
      throw new Error("Invalid records data");
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const analysisPromises = records.map(async (record) => {
      if (!record || !record.analysisResult) {
        console.log("Skipping record due to missing data:", record);
        return null;
      }

      const prompt = `Analyze the following medical record analysis result and provide a risk assessment. 
      Rate the risk on a scale of 1-10 (10 being highest risk) and provide a short explanation of the rating. 
      Analysis result: ${record.analysisResult}`;

      try {
        const result = await model.generateContent(prompt);
        const analysis = result.response.text();
        
        // Extract risk score and explanation using regex
        const riskScoreMatch = analysis.match(/(\d+)(?=\s*\/\s*10)/);
        const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 0;
        
        const explanationMatch = analysis.match(/Explanation:(.+)/i);
        const explanation = explanationMatch ? explanationMatch[1].trim() : "No explanation provided.";

        return {
          ...record,
          riskScore,
          riskExplanation: explanation
        };
      } catch (error) {
        console.error("Error in AI analysis for record:", record.id, error);
        return null;
      }
    });

    const analyzedRecords = await Promise.all(analysisPromises);
    return analyzedRecords
      .filter(record => record !== null)
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  if (loading) return <div>Loading risk analysis...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Analysis of Medical Records</h2>
      
      {rankedRecords.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rankedRecords.map((record, index) => (
            <div
              key={record.id}
              className="border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {record.recordName || `Record ${index + 1}`}
              </h3>
              <p className="text-gray-600 mb-4">Risk Score: 
                <span
                  className={`font-bold ml-1 ${
                    record.riskScore >= 8
                      ? "text-red-500"
                      : record.riskScore >= 5
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {record.riskScore}/10
                </span>
              </p>
              <p className="text-gray-700">{record.analysisResult}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No records found or no valid analysis results available.</p>
      )}
    </div>
  );
}

export default RiskAnalysisComponent;
