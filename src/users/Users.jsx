import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Users() {
  const [users, setUsers]             = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/bulk?type=users&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
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

  return (
    <div className="admin-page">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 User Directory</h1>
          <p className="page-subtitle">Manage registered students, recruiters, and platform administrators</p>
        </div>
        <div className="header-badge">{total} Registered Users</div>
      </div>

      {/* ── Search Bar ── */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search by candidate name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
          )}
        </form>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Education</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="table-loading">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-empty">No users found</td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.user_id}>
                  <td className="text-muted">{(page - 1) * limit + index + 1}</td>

                  <td>
                    <div className="font-semibold">{user.full_name}</div>
                  </td>

                  <td>{user.email}</td>

                  <td className="text-muted text-sm">{user.phone || "—"}</td>

                  <td>
                    <div className="font-medium text-sm">{user.degree || "Student"}</div>
                    <div className="text-muted text-xs">{user.university || "—"}</div>
                  </td>

                  <td>
                    <span className={`badge ${user.role_name === "Admin" ? "badge-danger" : user.role_name === "Recruiter" ? "badge-warning" : "badge-primary"}`}>
                      {user.role_name || "Student"}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${user.status === "active" ? "badge-success" : "badge-secondary"}`}>
                      {user.status === "active" ? "✓ Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="text-muted text-sm">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
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

export default Users;
