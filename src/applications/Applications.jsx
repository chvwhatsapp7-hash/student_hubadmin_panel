import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [toast, setToast] = useState(null);
  const limit = 10;

  useEffect(() => {
    fetchApplications();
  }, [page, search]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/bulk?type=applications&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setApplications(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch(`${API_BASE_URL}/applications`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application_id: applicationId, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setApplications((prev) =>
          prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
        );
        showToast(`Status updated to "${newStatus}"`, "success");
      } else {
        showToast(json.message || "Failed to update status", "error");
      }
    } catch (err) {
      showToast("Error updating application status", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredApps = applications.filter((app) => {
    if (typeFilter !== "all" && app.application_type !== typeFilter) return false;
    if (statusFilter !== "all" && (app.status || "applied").toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    const s = (status || "applied").toLowerCase();
    switch (s) {
      case "accepted":
        return <span className="badge badge-success">✓ Accepted</span>;
      case "rejected":
        return <span className="badge badge-danger">✕ Rejected</span>;
      case "under_review":
      case "under review":
        return <span className="badge badge-warning">⏳ Under Review</span>;
      default:
        return <span className="badge badge-primary">📥 Applied</span>;
    }
  };

  return (
    <div className="admin-page">
      {/* ── Toast Notification ── */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === "success" ? "✓ " : "⚠️ "} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📝 Candidate Applications</h1>
          <p className="page-subtitle">Review, manage, and update candidate job & internship applications</p>
        </div>
        <div className="header-badge">{total} Total Applications</div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search candidate name, email, job or company..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
          )}
        </form>

        <div className="filter-selects">
          <select
            className="select-input"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types (Jobs & Internships)</option>
            <option value="job">💼 Jobs Only</option>
            <option value="internship">📋 Internships Only</option>
          </select>

          <select
            className="select-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="applied">📥 Applied</option>
            <option value="under_review">⏳ Under Review</option>
            <option value="accepted">✓ Accepted</option>
            <option value="rejected">✕ Rejected</option>
          </select>
        </div>
      </div>

      {/* ── Applications Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Candidate</th>
              <th>Applied For</th>
              <th>Company</th>
              <th>Type</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-loading">Loading applications...</td>
              </tr>
            ) : filteredApps.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">No applications match the criteria.</td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id}>
                  <td className="text-muted">#{app.id}</td>
                  <td>
                    <div className="candidate-name">{app.candidate_name || "Unknown"}</div>
                    <div className="candidate-meta">{app.candidate_email}</div>
                    {app.candidate_phone && <div className="candidate-phone">📞 {app.candidate_phone}</div>}
                  </td>
                  <td>
                    <div className="font-semibold">
                      {app.job_title || app.internship_title || "N/A"}
                    </div>
                    {app.university && (
                      <div className="candidate-meta">🎓 {app.degree || ""} {app.university}</div>
                    )}
                  </td>
                  <td>
                    <span className="company-tag">{app.company_name || "Direct Post"}</span>
                  </td>
                  <td>
                    <span className={`badge ${app.application_type === "job" ? "badge-primary" : "badge-purple"}`}>
                      {app.application_type === "job" ? "💼 Job" : "📋 Internship"}
                    </span>
                  </td>
                  <td className="text-muted text-sm">
                    {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : "Recently"}
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td>
                    <div className="action-button-group">
                      <select
                        className="select-status"
                        value={(app.status || "applied").toLowerCase()}
                        disabled={updatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      >
                        <option value="applied">Applied</option>
                        <option value="under_review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className="pagination-info">Page {page} of {totalPages}</span>
          <button
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default Applications;
