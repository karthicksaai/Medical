import React, { createContext, useContext, useState, useCallback } from "react";
import { db } from "../utils/dbConfig"; // Adjust the path to your dbConfig
import { Users, Records, Patients } from "../utils/schema"; // Adjust the path to your schema definitions
import { eq } from "drizzle-orm";

// Create a context
const StateContext = createContext();

// Provider component
export const StateContextProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [records, setRecords] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [patients, setPatients] = useState([]); // New state for patients
  const [currentUser, setCurrentUser] = useState(null);

  // Function to fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      const result = await db.select().from(Users).execute();
      setUsers(result);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  // Function to fetch user details by email
  const fetchUserByEmail = useCallback(async (email) => {
    try {
      const result = await db
        .select()
        .from(Users)
        .where(eq(Users.createdBy, email))
        .execute();
      if (result.length > 0) {
        setCurrentUser(result[0]);
      }
    } catch (error) {
      console.error("Error fetching user by email:", error);
    }
  }, []);

  // Function to create a new user
  const createUser = useCallback(async (userData) => {
    try {
      const newUser = await db
        .insert(Users)
        .values(userData)
        .returning({ id: Users.id, createdBy: Users.createdBy })
        .execute();
      setUsers((prevUsers) => [...prevUsers, newUser[0]]);
      return newUser[0];
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }, []);

  // Function to fetch all records for a specific user
  const fetchUserRecords = useCallback(async (userEmail) => {
    try {
      const result = await db
        .select()
        .from(Records)
        .where(eq(Records.createdBy, userEmail))
        .execute();
      setRecords(result);
    } catch (error) {
      console.error("Error fetching user records:", error);
    }
  }, []);

  const fetchAllAnalysisResults = useCallback(async () => {
    try {
      const result = await db
        .select({
          // id: Records.id,
          recordName: Records.recordName,
          analysisResult: Records.analysisResult,
          // createdBy: Records.createdBy
        })
        .from(Records)
        // .where(
        //   and(
        //     notEmpty(Records.analysisResult),
        //     ne(Records.analysisResult, '')
        //   )
        // )
        .execute();
      setAnalysis(result);
      console.log("Fetched analysis results:", result);
      return result;
    } catch (error) {
      console.error("Error fetching analysis results:", error);
      return [];
    }
  }, []);

  // Function to create a new record
  const createRecord = useCallback(async (recordData) => {
    try {
      const newRecord = await db
        .insert(Records)
        .values(recordData)
        .returning({ id: Records.id })
        .execute();
      setRecords((prevRecords) => [...prevRecords, newRecord[0]]);
      return newRecord[0];
    } catch (error) {
      console.error("Error creating record:", error);
      return null;
    }
  }, []);

  // Function to update a record
  const updateRecord = useCallback(async (recordData) => {
    try {
      const { documentID, ...dataToUpdate } = recordData;
      console.log(documentID, dataToUpdate);
      const updatedRecords = await db
        .update(Records)
        .set(dataToUpdate)
        .where(eq(Records.id, documentID))
        .returning();
    } catch (error) {
      console.error("Error updating record:", error);
      return null;
    }
  }, []);

  // Function to fetch all patients
  const fetchPatients = useCallback(async () => {
    try {
      const result = await db.select().from(Patients).execute();
      setPatients(result);
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }, []);

  // Function to create a new patient
  const createPatient = useCallback(async (patientData) => {
    try {
      const newPatient = await db
        .insert(Patients)
        .values(patientData)
        .returning({ id: Patients.id })
        .execute();
      setPatients((prevPatients) => [...prevPatients, newPatient[0]]);
      return newPatient[0];
    } catch (error) {
      console.error("Error creating patient:", error);
      return null;
    }
  }, []);

  const updatePatient = useCallback(async (patientId, medicalHistory, allergies, treatmentCounts, createdBy) => {
    try {
      // Assuming you have access to a database object (db) and Patients schema
      const updatedRecord = await db
        .update(Patients)
        .set({
          medicalHistory,
          allergies,
          treatmentCounts,
          createdBy
        })
        .where(eq(Patients.id, patientId))
        .returning(); // Fetch updated data
  
      return updatedRecord;
    } catch (error) {
      console.error("Error updating patient record:", error);
    }
  },[]);

  // Function to fetch a patient's records (including analysis results)
  const fetchPatientRecords = useCallback(async (email) => {
    try {
      const result = await db
        .select({
          patient: Patients,
          record: Records,
        })
        .from(Patients)
        .leftJoin(Records, eq(Patients.id, Records.patientId))
        .where(eq(Patients.createdBy, email))
        .execute();

      return result;
    } catch (error) {
      console.error("Error fetching patient records:", error);
      return [];
    }
  }, []);

  return (
    <StateContext.Provider
      value={{
        users,
        records,
        patients,  // Add patients to the context
        analysis,
        fetchUsers,
        fetchAllAnalysisResults,
        fetchUserByEmail,
        createUser,
        fetchUserRecords,
        createRecord,
        currentUser,
        updateRecord,
        fetchPatients,    // Add fetchPatients to the context
        createPatient,    // Add createPatient to the context
        updatePatient,
        fetchPatientRecords // Add fetchPatientRecords to the context
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

// Custom hook to use the context
export const useStateContext = () => useContext(StateContext);
