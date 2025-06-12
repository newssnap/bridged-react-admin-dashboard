import "./styles/global.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import store from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Create a root for concurrent mode rendering
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the main application inside a provider
root.render(
  <React.StrictMode>
    {/* Wrap your application with GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId="80245669623-5dr2q6m64lrgpb7neq1qamjk1tf7446g.apps.googleusercontent.com">
      {/* Use the Provider component to provide the Redux store to your application */}
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);

reportWebVitals();
