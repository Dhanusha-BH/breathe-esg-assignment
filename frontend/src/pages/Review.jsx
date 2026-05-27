import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Review() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ SINGLE fetch function ONLY
  const fetchRecords = async () => {
    try {
      const companyId = localStorage.getItem("company_id");

      const url = companyId
        ? `records/?company_id=${companyId}`
        : "records/";

      const res = await API.get(url);
      setRecords(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load records");
    }
  };

  useEffect(() => {
  const load = async () => {
    try {
      const companyId = localStorage.getItem("company_id");

      const url = companyId
        ? `records/?company_id=${companyId}`
        : "records/";

      const res = await API.get(url);
      setRecords(res.data);
    } catch (err) {
      console.log(err);
      setError("Failed to load records");
    }
  };

  load();
}, []);

  // =========================
  // ACTIONS
  // =========================
  const approve = async (id) => {
    await API.post(`approve/${id}/`);
    fetchRecords();
  };

  const reject = async (id) => {
    await API.post(`reject/${id}/`);
    fetchRecords();
  };

  const lock = async (id) => {
    await API.post(`lock/${id}/`);
    fetchRecords();
  };

  // =========================
  // ERROR
  // =========================
  if (error) return <h3 style={{ color: "red" }}>❌ {error}</h3>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>🧑‍💼 Analyst Review</h2>

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Scope</th>
            <th>Category</th>
            <th>Activity</th>
            <th>Status</th>
            <th>Emission</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan="7">No records found</td>
            </tr>
          ) : (
            records.map((r) => (
              <tr key={r.id}>
                <td
                  onClick={() => navigate(`/review/${r.id}`)}
                  style={{ color: "blue", cursor: "pointer" }}
                >
                  {r.id}
                </td>

                <td>{r.scope}</td>
                <td>{r.category}</td>
                <td>{r.activity_type}</td>
                <td>{r.status}</td>
                <td>{r.normalized_value}</td>

                <td>
                  <button onClick={() => approve(r.id)}>Approve</button>
                  <button onClick={() => reject(r.id)}>Reject</button>
                  <button onClick={() => lock(r.id)}>Lock</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
