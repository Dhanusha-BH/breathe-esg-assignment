import { useEffect, useState } from "react";
import API from "../api";

export default function FailedRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await API.get("failed-records/", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        setRecords(res.data);
        setError(null);
      } catch (err) {
        console.log("API ERROR:", err.response);
        setError("Failed to load data (check login/token)");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h2>❌ Failed Records</h2>

      {loading && <p>Loading...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Scope</th>
            <th>Activity</th>
            <th>Value</th>
            <th>Company</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          {!loading && records.length === 0 ? (
            <tr>
              <td colSpan="6">No failed records 🎉</td>
            </tr>
          ) : (
            records.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.scope}</td>
                <td>{r.activity_type}</td>
                <td>{r.value ?? 0}</td>
                <td>{r.company_name}</td>
                <td style={{ color: "red" }}>
                  {r.failed_reason}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}