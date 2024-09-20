import React, { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";

import { useStateContext } from "./context";


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
                </Routes>
            </div>
        </div>
    )
}

export default App;
