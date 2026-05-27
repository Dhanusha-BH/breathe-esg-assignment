import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function ReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const companyId = localStorage.getItem("company_id");

        const url = companyId
          ? `records/${id}/?company_id=${companyId}`
          : `records/${id}/`;

        const res = await API.get(url);
        setRecord(res.data);
      } catch (err) {
        console.log(err);
        setError("Failed to load record");
      }
    };

    fetchDetail();
  }, [id]);

  if (error) return <h3 style={{ color: "red" }}>❌ {error}</h3>;
  if (!record) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate(-1)}>⬅ Back</button>

      <h2>📄 ESG Record Detail</h2>

      <p><strong>ID:</strong> {record.id}</p>
      <p><strong>Scope:</strong> {record.scope}</p>
      <p><strong>Category:</strong> {record.category}</p>
      <p><strong>Activity:</strong> {record.activity_type}</p>

      <p>
        <strong>Status:</strong>{" "}
        <span style={{ fontWeight: "bold" }}>
          {record.status}
        </span>
      </p>

      <p><strong>Company:</strong> {record.company_name || "Unknown"}</p>
      <p><strong>Source:</strong> {record.source_type || "Unknown"}</p>

      <p>
        <strong>Created:</strong>{" "}
        {record.created_at
          ? new Date(record.created_at).toLocaleString()
          : "N/A"}
      </p>

      <p>
        <strong>Updated:</strong>{" "}
        {record.updated_at
          ? new Date(record.updated_at).toLocaleString()
          : "N/A"}
      </p>

      <p>
        <strong>Emission:</strong> {record.normalized_value} kgCO₂
      </p>

      <p>
        <strong>Suspicious:</strong>{" "}
        {record.is_suspicious ? "⚠️ Yes" : "✅ No"}
      </p>

      <hr />

      {/* Scope 1 */}
      {record.scope === "SCOPE_1" && (
        <div>
          <h3>⛽ Scope 1</h3>
          <p><strong>Fuel Type:</strong> {record.activity_type}</p>
        </div>
      )}

      {/* Scope 2 */}
      {record.scope === "SCOPE_2" && (
        <div>
          <h3>⚡ Scope 2</h3>
          <p><strong>Electricity Usage</strong></p>
        </div>
      )}

      {/* Scope 3 */}
      {record.scope === "SCOPE_3" && (
        <div>
          <h3>✈️ Travel</h3>
          <p><strong>From:</strong> {record.travel_from || "N/A"}</p>
          <p><strong>To:</strong> {record.travel_to || "N/A"}</p>
          <p><strong>Type:</strong> {record.travel_type || "N/A"}</p>
        </div>
      )}
    </div>
  );
}