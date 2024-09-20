import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./index.css";
import { PrivyProvider } from "@privy-io/react-auth";
import { StateContextProvider } from "./context";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <PrivyProvider
    appId="clzpd96fz0bfxe3y7r2u05abk"
    config={{
      appearance: {
        theme: "dark",
      },
      embeddedWallets: {
        createOnLogin: "users-without-wallets",
      },
    }}
  >
    <Router>
      <StateContextProvider>
          <App />
      </StateContextProvider>
    </Router>
  </PrivyProvider>,
)
