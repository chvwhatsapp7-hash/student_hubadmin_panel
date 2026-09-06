import { useState, useEffect } from "react";
import ImageUpload from "../components/ImageUpload";
import { API_BASE_URL } from "../config";

const initialForm = {
  name: "",
  description: "",
  industry: "Technology & Software",
  website: "",
  logo_url: "",
  location: "Bengaluru, India",
  company_size: "50-200",
  founded_year: new Date().getFullYear(),
};

function Companies() {
  const [companies, setCompanies]     = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  // ── Form / Modal State ──
  const [showModal, setShowModal]         = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [form, setForm]                   = useState(initialForm);
  const [formLoading, setFormLoading]     = useState(false);
  const [toast, setToast]                 = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/bulk?type=companies&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setCompanies(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
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

  const openCreateModal = () => {
    setEditingCompany(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCompany(c);
    setForm({
      name: c.name || "",
      description: c.description || "",
      industry: c.industry || "Technology & Software",
      website: c.website || "",
      logo_url: c.logo_url || "",
      location: c.location || "Bengaluru, India",
      company_size: c.company_size || "50-200",
      founded_year: c.founded_year || new Date().getFullYear(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCompany) {
        const res = await fetch(`${API_BASE_URL}/companies`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company_id: editingCompany.company_id,
            ...form,
            founded_year: form.founded_year ? parseInt(form.founded_year) : null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Company updated successfully!", "success");
          setShowModal(false);
          fetchCompanies();
        } else {
          showToast(json.message || "Failed to update company", "error");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/companies`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            founded_year: form.founded_year ? parseInt(form.founded_year) : null,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Company registered successfully!", "success");
          setShowModal(false);
          fetchCompanies();
        } else {
          showToast(json.message || "Failed to register company", "error");
        }
      }
    } catch (err) {
      showToast("Error saving company", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/companies`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Company deleted successfully", "success");
        setCompanies((prev) => prev.filter((c) => c.company_id !== companyId));
      } else {
        showToast(json.message || "Failed to delete company", "error");
      }
    } catch (err) {
      showToast("Error deleting company", "error");
    }
  };

  return (
    <div className="admin-page">
      {/* ── Toast ── */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === "success" ? "✓ " : "⚠️ "} {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🏢 Companies Management</h1>
          <p className="page-subtitle">Register and manage partner hiring organizations and employer brands</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Register New Company
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            className="search-input"
            placeholder="Search by company name or industry..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {search && (
            <button type="button" className="btn btn-secondary" onClick={handleClear}>Clear</button>
          )}
        </form>
        <div className="header-badge">{total} Companies</div>
      </div>

      {/* ── Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Website</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="table-loading">Loading companies...</td>
              </tr>
            ) : companies.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-empty">No companies found. Click "+ Register New Company" to add one.</td>
              </tr>
            ) : (
              companies.map((company, index) => (
                <tr key={company.company_id}>
                  <td className="text-muted">{(page - 1) * limit + index + 1}</td>

                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="item-thumb"
                        />
                      ) : (
                        <div className="item-icon-box">🏢</div>
                      )}
                      <div>
                        <div className="font-semibold">{company.name}</div>
                        <div className="text-muted text-xs">ID #{company.company_id}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-purple">{company.industry || "General"}</span>
                  </td>

                  <td>{company.location || "—"}</td>

                  <td>
                    {company.website ? (
                      <a
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="view-all-link"
                      >
                        🔗 {company.website.replace(/^https?:\/\//, "")}
                      </a>
                    ) : (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </td>

                  <td>
                    <span className={`badge ${company.status === "active" ? "badge-success" : "badge-secondary"}`}>
                      {company.status === "active" ? "✓ Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <div className="action-button-group">
                      <button
                        className="btn-sm btn-edit"
                        onClick={() => openEditModal(company)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn-sm btn-delete"
                        onClick={() => handleDelete(company.company_id, company.name)}
                      >
                        🗑️ Delete
                      </button>
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCompany ? "✏️ Edit Company" : "➕ Register New Company"}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Company Logo</label>
                <ImageUpload
                  value={form.logo_url}
                  onChange={(url) => setForm({ ...form, logo_url: url })}
                  folder="studenthub/companies"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wati / TAKA AI"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    placeholder="e.g. Artificial Intelligence & SaaS"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru / Remote"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Website URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://wati.io"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Company Size</label>
                  <select
                    value={form.company_size}
                    onChange={(e) => setForm({ ...form, company_size: e.target.value })}
                  >
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="50-200">50-200 employees</option>
                    <option value="200-500">200-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Founded Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2020"
                    value={form.founded_year}
                    onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="About the company, mission, culture, and products..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={formLoading}
                >
                  {formLoading ? "Saving..." : editingCompany ? "Save Changes" : "Register Company"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Companies;
