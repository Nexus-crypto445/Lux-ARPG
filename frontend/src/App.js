import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://lux11-aarpg.onrender.com"; // your backend URL

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch(`${API_URL}/api/test`)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Error connecting to backend"));
  }, []);

  return (
    <div className="App">
      <h1>Lux ARPG</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
