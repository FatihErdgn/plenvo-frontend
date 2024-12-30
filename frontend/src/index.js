import React from "react";
import ReactDOM from "react-dom/client"; // ReactDOM'dan artık 'createRoot' kullanacağız
import App from "./App";
import "./index.css"; // CSS dosyasını içe aktar

const root = ReactDOM.createRoot(document.getElementById("root")); // 'createRoot' ile root oluşturuyoruz
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
