import { useEffect, useState } from "react";
import API from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState(
    localStorage.getItem("company_id") || ""
  );

  // LOAD COMPANIES
  useEffect(() => {
    API.get("companies/")
      .then((res) => setCompanies(res.data))
      .catch((err) => console.log(err));
  }, []);

  // LOAD DASHBOARD + RECORDS
  useEffect(() => {
    const params = selectedCompany
      ? `?company_id=${selectedCompany}`
      : "";

    Promise.all([
      API.get(`dashboard/${params}`),
      API.get(`records/${params}`)
    ])
      .then(([dashboardRes, recordsRes]) => {
        setData(dashboardRes.data);
        setRecords(recordsRes.data.slice(0, 10));
      })
      .catch((err) => setError(err.message));
  }, [selectedCompany]);

  if (error) {
    return (
      <h3 style={{ color: "red" }}>
        ❌ {error}
      </h3>
    );
  }

  if (!data) {
    return <h3>Loading dashboard...</h3>;
  }

  return (
    <div style={{ padding: "10px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            🌱 ESG Dashboard
          </h1>
          <p style={{ color: "gray" }}>
            Monitor emissions, review activity
            records, and audit sustainability
            data.
          </p>
        </div>

        <select
          value={selectedCompany}
          onChange={(e) => {
            const id = e.target.value;
            setSelectedCompany(id);
            localStorage.setItem(
              "company_id",
              id
            );
          }}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "14px",
          }}
        >
          <option value="">
            -- Select Company --
          </option>

          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* DASHBOARD CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "15px",
          marginBottom: "30px",
        }}
      >
        <Card
          title="Total Records"
          value={data.total_records}
        />
        <Card
          title="Scope 1"
          value={data.scope_1}
        />
        <Card
          title="Scope 2"
          value={data.scope_2}
        />
        <Card
          title="Scope 3"
          value={data.scope_3}
        />
        <Card
          title="Pending"
          value={data.pending}
        />
        <Card
          title="Approved"
          value={data.approved}
        />
        <Card
          title="Failed"
          value={data.failed}
        />
        <Card
          title="Suspicious"
          value={data.suspicious}
        />
      </div>

      {/* TABLE */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h3 style={{ marginBottom: "15px" }}>
          📋 Recent Records
        </h3>

        <table
          width="100%"
          style={{
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f3f4f6",
                textAlign: "left",
              }}
            >
              <th style={tableHeader}>
                ID
              </th>
              <th style={tableHeader}>
                Scope
              </th>
              <th style={tableHeader}>
                Activity
              </th>
              <th style={tableHeader}>
                Value
              </th>
              <th style={tableHeader}>
                Status
              </th>
              <th style={tableHeader}>
                Company
              </th>
            </tr>
          </thead>

          <tbody>
            {records.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "20px",
                  }}
                >
                  No records found
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr
                  key={r.id}
                  style={{
                    borderBottom:
                      "1px solid #eee",
                  }}
                >
                  <td style={tableCell}>
                    {r.id}
                  </td>

                  <td style={tableCell}>
                    {r.scope}
                  </td>

                  <td style={tableCell}>
                    {r.activity_type}
                  </td>

                  <td style={tableCell}>
                    {r.normalized_value}
                  </td>

                  <td style={tableCell}>
                    <StatusBadge
                      status={r.status}
                    />
                  </td>

                  <td style={tableCell}>
                    {r.company_name}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* CARD */
function Card({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "14px",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h4
        style={{
          color: "gray",
          marginBottom: "10px",
        }}
      >
        {title}
      </h4>

      <h1 style={{ margin: 0 }}>
        {value}
      </h1>
    </div>
  );
}

/* STATUS BADGE */
function StatusBadge({ status }) {
  let bg = "#ddd";

  if (status === "APPROVED")
    bg = "#22c55e";
  if (status === "FAILED")
    bg = "#ef4444";
  if (status === "PENDING")
    bg = "#f59e0b";
  if (status === "REJECTED")
    bg = "#dc2626";

  return (
    <span
      style={{
        background: bg,
        color: "white",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "bold",
      }}
    >
      {status}
    </span>
  );
}

const tableHeader = {
  padding: "12px",
};

const tableCell = {
  padding: "12px",
};