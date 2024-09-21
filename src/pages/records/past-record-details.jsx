// import React, { useState } from "react";
// import {
//   IconChevronRight,
//   IconFileUpload,
//   IconProgress,
// } from "@tabler/icons-react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useStateContext } from "../../context/index";
// import ReactMarkdown from "react-markdown";
// import FileUploadModal from "./components/file-upload-modal";
// import RecordDetailsHeader from "./components/record-details-header";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

// function PastRecordDetails() {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [uploadSuccess, setUploadSuccess] = useState(false);
//   const [processing, setIsProcessing] = useState(false);
//   const [summaryResult, setSummaryResult] = useState("");
//   const [filename, setFilename] = useState("");
//   const [filetype, setFileType] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { updatePatient } = useStateContext();

//   const handleOpenModal = () => {
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     console.log("Selected file:", file);
//     setFileType(file.type);
//     setFilename(file.name);
//     setFile(file);
//   };

//   const readFileAsBase64 = (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result.split(",")[1]);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   };

//   const handleFileUpload = async () => {
//     setUploading(true);
//     setUploadSuccess(false);
  
//     const genAI = new GoogleGenerativeAI(geminiApiKey);
  
//     try {
//       const base64Data = await readFileAsBase64(file);
  
//       const imageParts = [
//         {
//           inlineData: {
//             data: base64Data,
//             mimeType: filetype,
//           },
//         },
//       ];
  
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
//       const prompt = `
//         You are an AI specializing in summarizing patient past medical records. Please analyze the uploaded document and return a structured JSON response with the following fields:
//         {
//           "medicalHistory": "<Summary of the medical history>",
//           "allergies": "<List of allergies, should be an array>",
//           "treatmentCounts": "<Number of treatments>",
//           "createdBy": "<Doctor's name>"
//         }
//         Ensure that the 'allergies' field is returned as a valid array, even if empty.
//       `;
  
//       const result = await model.generateContent([prompt, ...imageParts]);
//       const response = await result.response;
//       let text = await response.text();
  
//       // Clean up any code blocks from the response
//       text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  
//       // Try parsing the cleaned-up JSON
//       let parsedResult;
//       try {
//         parsedResult = JSON.parse(text);
//       } catch (error) {
//         console.warn("Response is not directly parsable as JSON. Attempting manual extraction.");
        
//         // Manual fallback if the JSON parsing fails
//         const medicalHistory = text.match(/"medicalHistory":\s*"([^"]*)"/)?.[1] || "";
//         const allergiesRaw = text.match(/"allergies":\s*\[([^\]]*)\]/)?.[1] || "";
//         const treatmentCounts = text.match(/"treatmentCounts":\s*(\d+)/)?.[1] || 0;
//         const createdBy = text.match(/"createdBy":\s*"([^"]*)"/)?.[1] || "";
  
//         // Ensure allergies is an array
//         const allergies = allergiesRaw
//           ? allergiesRaw.split(',').map((a) => a.trim().replace(/"/g, ''))
//           : [];
  
//         parsedResult = { medicalHistory, allergies, treatmentCounts, createdBy };
//       }
  
//       const { medicalHistory, allergies, treatmentCounts, createdBy } = parsedResult;
  
//       setSummaryResult(parsedResult.medicalHistory);
  
//       // Ensure allergies is an array before passing it to updatePatient
//       await updatePatient(
//         state.id, // Patient ID from state
//         medicalHistory,
//         Array.isArray(allergies) ? allergies : [allergies], // Ensure allergies is an array
//         treatmentCounts,
//         createdBy
//       );
  
//       setUploadSuccess(true);
//       setIsModalOpen(false); // Close the modal after a successful upload
//       setFilename("");
//       setFile(null);
//       setFileType("");
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       setUploadSuccess(false);
//     } finally {
//       setUploading(false);
//     }
//   };  

//   const handleProceed = async () => {
//     // Handle what happens next
//   };

//   return (
//     <div className="flex flex-wrap gap-[26px]">
//       <button
//         type="button"
//         onClick={handleOpenModal}
//         className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
//       >
//         <IconFileUpload />
//         Upload Past Records
//       </button>
//       <FileUploadModal
//         isOpen={isModalOpen}
//         onClose={handleCloseModal}
//         onFileChange={handleFileChange}
//         onFileUpload={handleFileUpload}
//         uploading={uploading}
//         uploadSuccess={uploadSuccess}
//         filename={filename}
//       />
//       <RecordDetailsHeader recordName={state.recordName} />
//       <div className="w-full">
//         <div className="flex flex-col">
//           <div className="-m-1.5 overflow-x-auto">
//             <div className="inline-block min-w-full p-1.5 align-middle">
//               <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
//                 <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
//                   <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
//                     Past Record Summary
//                   </h2>
//                   <p className="text-sm text-gray-600 dark:text-neutral-400">
//                     A structured summary of the patient's past medical records.
//                   </p>
//                 </div>
//                 <div className="flex w-full flex-col px-6 py-4 text-white">
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
//                       Summary Result
//                     </h2>
//                     <div className="space-y-2 text-black">
//                       <ReactMarkdown>{summaryResult}</ReactMarkdown>
//                     </div>
//                   </div>
//                   <div className="mt-5 grid gap-2 sm:flex">
//                     <button
//                       type="button"
//                       onClick={handleProceed}
//                       className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
//                     >
//                       Proceed with Patient Record
//                       <IconChevronRight size={20} />
//                       {processing && (
//                         <IconProgress
//                           size={10}
//                           className="mr-3 h-5 w-5 animate-spin"
//                         />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//                 <div className="grid gap-3 border-t border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
//                   <div>
//                     <p className="text-sm text-gray-600 dark:text-neutral-400">
//                       <span className="font-semibold text-gray-800 dark:text-neutral-200"></span>{" "}
//                     </p>
//                   </div>
//                   <div>
//                     <div className="inline-flex gap-x-2"></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PastRecordDetails;





import React, { useState } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function PastRecordDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [editableMedicalHistory, setEditableMedicalHistory] = useState("");
  const [editableAllergies, setEditableAllergies] = useState([]);
  const [editableTreatmentCounts, setEditableTreatmentCounts] = useState(0);
  const [editableCreatedBy, setEditableCreatedBy] = useState("");
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updatePatient } = useStateContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    setFileType(file.type);
    setFilename(file.name);
    setFile(file);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async () => {
    setUploading(true);
    setUploadSuccess(false);
  
    const genAI = new GoogleGenerativeAI(geminiApiKey);
  
    try {
      const base64Data = await readFileAsBase64(file);
  
      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: filetype,
          },
        },
      ];
  
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
      const prompt = `
        You are an AI specializing in summarizing patient past medical records. Please analyze the uploaded document and return a structured JSON response with the following fields:
        {
          "medicalHistory": "<Summary of the medical history>",
          "allergies": "<List of allergies, should be an array>",
          "treatmentCounts": "<Number of treatments>",
          "createdBy": "<Doctor's name>"
        }
        Ensure that the 'allergies' field is returned as a valid array, even if empty.
      `;
  
      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      let text = await response.text();
  
      // Clean up any code blocks from the response
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
  
      // Try parsing the cleaned-up JSON
      let parsedResult;
      try {
        parsedResult = JSON.parse(text);
      } catch (error) {
        console.warn("Response is not directly parsable as JSON. Attempting manual extraction.");
        
        // Manual fallback if the JSON parsing fails
        const medicalHistory = text.match(/"medicalHistory":\s*"([^"]*)"/)?.[1] || "";
        const allergiesRaw = text.match(/"allergies":\s*\[([^\]]*)\]/)?.[1] || "";
        const treatmentCounts = text.match(/"treatmentCounts":\s*(\d+)/)?.[1] || 0;
        const createdBy = text.match(/"createdBy":\s*"([^"]*)"/)?.[1] || "";
  
        // Ensure allergies is an array
        const allergies = allergiesRaw
          ? allergiesRaw.split(',').map((a) => a.trim().replace(/"/g, ''))
          : [];
  
        parsedResult = { medicalHistory, allergies, treatmentCounts, createdBy };
      }
  
      const { medicalHistory, allergies, treatmentCounts, createdBy } = parsedResult;
  
      // Set editable state with extracted data
      setEditableMedicalHistory(medicalHistory);
      setEditableAllergies(allergies);
      setEditableTreatmentCounts(treatmentCounts);
      setEditableCreatedBy(createdBy);
  
      setUploadSuccess(true);
      setIsModalOpen(false); // Close the modal after a successful upload
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleProceed = async () => {
    setIsProcessing(true);

    // Ensure allergies is an array before passing it to updatePatient
    await updatePatient(
      state.id, // Patient ID from state
      editableMedicalHistory,
      Array.isArray(editableAllergies) ? editableAllergies : [editableAllergies], // Ensure allergies is an array
      editableTreatmentCounts,
      editableCreatedBy
    );

    // Proceed to the next step after updating patient info
    navigate("/patient-records", { state: { id: state.id } });
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
      >
        <IconFileUpload />
        Upload Past Records
      </button>
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />
      <RecordDetailsHeader recordName={state.recordName} />
      <div className="w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="inline-block min-w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    Editable Past Record Summary
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                    Review and modify the extracted patient data before proceeding.
                  </p>
                </div>
                <div className="flex w-full flex-col px-6 py-4 text-white">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Medical History
                    </h2>
                    <textarea
                      className="w-full border border-gray-300 p-2 rounded-md text-black"
                      value={editableMedicalHistory}
                      onChange={(e) => setEditableMedicalHistory(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Allergies (comma-separated)
                    </h2>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2 rounded-md text-black"
                      value={editableAllergies.join(", ")}
                      onChange={(e) => setEditableAllergies(e.target.value.split(",").map(a => a.trim()))}
                    />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Number of Treatments
                    </h2>
                    <input
                      type="number"
                      className="w-full border border-gray-300 p-2 rounded-md text-black"
                      value={editableTreatmentCounts}
                      onChange={(e) => setEditableTreatmentCounts(Number(e.target.value))}
                    />
                  </div>
                  <div className="mt-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Doctor's Name
                    </h2>
                    <input
                      type="text"
                      className="w-full border border-gray-300 p-2 rounded-md text-black"
                      value={editableCreatedBy}
                      onChange={(e) => setEditableCreatedBy(e.target.value)}
                    />
                  </div>
                  <div className="mt-5 grid gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={handleProceed}
                      className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                    >
                      Proceed with Patient Record
                      <IconChevronRight size={20} />
                      {processing && (
                        <IconProgress
                          size={10}
                          className="mr-3 h-5 w-5 animate-spin"
                        />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-semibold text-gray-800 dark:text-neutral-200"></span>{" "}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex gap-x-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PastRecordDetails;
