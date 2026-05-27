import { useEffect, useState } from "react";
import API from "../api";

export default function Audit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("token");

        const res = await API.get("audit-logs/", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        setLogs(res.data);
        setError(null);

      } catch (error) {
        console.log("Audit fetch error:", error.response);
        setError("Failed to load audit logs (check login/token)");
      } finally {
        setLoading(false);
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>🔐 Audit Page</h2>

      {loading && <p>Loading audit logs...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      <table border="1" width="100%" cellPadding="10">
        <thead>
          <tr>
            <th>Record ID</th>
            <th>Action</th>
            <th>Old Status</th>
            <th>New Status</th>
            <th>Timestamp</th>
          </tr>
        </thead>

        <tbody>
          {!loading && logs.length === 0 ? (
            <tr>
              <td colSpan="5">No audit logs found</td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr key={index}>
                <td>{log.record_id}</td>
                <td><strong>{log.action}</strong></td>
                <td>{log.old_value}</td>
                <td>{log.new_value}</td>
                <td>
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}