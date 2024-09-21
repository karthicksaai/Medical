import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { Home, Profile, Onboarding } from "./pages";
import { useStateContext } from "./context";
import MedicalRecord from "./pages/records/index";
import SingleRecordDetails from "./pages/records/single-record-details";
import ScreeningSchedule from "./pages/ScreeningSchedule";
import PendingAppointments from "./pages/PendingAppointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import TreatmentProgress from "./pages/TreatmentProgress";
import Screenings from "./pages/Screenings";
import CompletedScreenings from "./pages/CompletedScreenings";
import PendingScreenings from "./pages/PendingScreenings";
import OverdueScreenings from "./pages/OverdueScreenings";
import PastRecordsIndex from "./pages/records/pastindex";
import PastRecordDetails from "./pages/records/past-record-details";

const App = ()=>{
    const { user, authenticated, ready, login, currentUser } = useStateContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (ready && !authenticated) {
        login();
        } else if (user && !currentUser) {
        navigate("/onboarding");
        }
    }, [user, authenticated, ready, login, currentUser, navigate]);
    return (
        <div className="sm:-8 relative flex min-h-screen flex-row bg-[#8787e4] p-4">
             <div className="relative mr-10 hidden sm:flex">
                <Sidebar />
            </div>
            <div className="mx-auto max-w-[1280px] flex-1 max-sm:w-full sm:pr-5">
                <Navbar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/medical-records" element={<MedicalRecord />} />
                    <Route path="/past-records" element={<PastRecordsIndex />} />
                    <Route path="/medical-records/:id" element={<SingleRecordDetails />} />
                    <Route path="/past-records/:id" element={<PastRecordDetails />} />
                    <Route path="/screening-schedules" element={<ScreeningSchedule />} />
                    <Route path="/appointments/pending" element={<PendingAppointments />} />
                    <Route path="/appointments/:id" element={<AppointmentDetail />}/>
                    <Route path="/treatment/progress"element={<TreatmentProgress />}/>
                    <Route path="/folders" element={<MedicalRecord />}/>
                    <Route path="/screenings" element={<Screenings />}/>
                    <Route path="/screenings/completed" element={<CompletedScreenings />}/>
                    <Route path="/screenings/pending" element={<PendingScreenings />}/>
                    <Route path="/screenings/overdue" element={<OverdueScreenings />}/>
                </Routes>
            </div>
        </div>
    )
}

export default App;
