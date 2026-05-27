import { useState } from "react";
import API from "../api";

/* ✅ MOVE CARD OUTSIDE */
function Card({ title, file, setFile, onUpload, color }) {
  return (
    <div style={styles.card}>
      <h3>{title}</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={styles.input}
      />

      {file && <p>📄 {file.name}</p>}

      <button
        onClick={onUpload}
        style={{ ...styles.button, backgroundColor: color }}
      >
        Upload {title}
      </button>
    </div>
  );
}

export default function Upload() {
  const [sapFile, setSapFile] = useState(null);
  const [utilityFile, setUtilityFile] = useState(null);
  const [travelFile, setTravelFile] = useState(null);

  const uploadFile = async (file, endpoint, label, setFile) => {
    if (!file) return alert("Select file first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post(endpoint, formData);
      alert(`${label} Upload Success`);
      setFile(null);
    } catch (err) {
      console.log(err);
      alert(`${label} Upload Failed`);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📤 ESG Upload</h2>

      <Card
        title="SAP (Scope 1)"
        file={sapFile}
        setFile={setSapFile}
        onUpload={() =>
          uploadFile(sapFile, "upload-sap/", "SAP", setSapFile)
        }
        color="blue"
      />

      <Card
        title="Utility (Scope 2)"
        file={utilityFile}
        setFile={setUtilityFile}
        onUpload={() =>
          uploadFile(
            utilityFile,
            "upload-utility/",
            "Utility",
            setUtilityFile
          )
        }
        color="green"
      />

      <Card
        title="Travel (Scope 3)"
        file={travelFile}
        setFile={setTravelFile}
        onUpload={() =>
          uploadFile(
            travelFile,
            "upload-travel/",
            "Travel",
            setTravelFile
          )
        }
        color="orange"
      />
    </div>
  );
}

/* styles */
const styles = {
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
  },
  input: {
    marginTop: "10px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px",
    border: "none",
    color: "white",
    cursor: "pointer",
  },
};