import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const initialForm = {
  title: "",
  organizer: "",
  location: "Online / Virtual",
  start_date: "",
  end_date: "",
  description: "",
  prize_pool: "",
  mode: "Online",
};

function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/hackathons`);
      const json = await res.json();
      if (json.success && json.data) {
        setHackathons(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch hackathons:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditingHackathon(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (h) => {
    setEditingHackathon(h);
    setForm({
      title: h.title || "",
      organizer: h.organizer || "",
      location: h.location || "Online / Virtual",
      start_date: h.start_date ? h.start_date.substring(0, 10) : "",
      end_date: h.end_date ? h.end_date.substring(0, 10) : "",
      description: h.description || "",
      prize_pool: h.prize_pool || "",
      mode: h.mode || "Online",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingHackathon) {
        const res = await fetch(`${API_BASE_URL}/hackathons`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hackathon_id: editingHackathon.hackathon_id,
            ...form,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Hackathon updated successfully!", "success");
          setShowModal(false);
          fetchHackathons();
        } else {
          showToast(json.message || "Failed to update hackathon", "error");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/hackathons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Hackathon created successfully!", "success");
          setShowModal(false);
          fetchHackathons();
        } else {
          showToast(json.message || "Failed to create hackathon", "error");
        }
      }
    } catch (err) {
      showToast("Error saving hackathon", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (hackathonId) => {
    if (!window.confirm("Are you sure you want to delete this hackathon?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/hackathons`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hackathon_id: hackathonId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Hackathon deleted successfully", "success");
        setHackathons((prev) => prev.filter((h) => h.hackathon_id !== hackathonId));
      } else {
        showToast(json.message || "Failed to delete hackathon", "error");
      }
    } catch (err) {
      showToast("Error deleting hackathon", "error");
    }
  };

  const filteredHackathons = hackathons.filter((h) => {
    const q = search.toLowerCase();
    return (
      (h.title || "").toLowerCase().includes(q) ||
      (h.organizer || "").toLowerCase().includes(q) ||
      (h.location || "").toLowerCase().includes(q)
    );
  });

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
          <h1 className="page-title">🏆 Hackathons Management</h1>
          <p className="page-subtitle">Host, schedule, and oversee student coding competitions and hackathons</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Host New Hackathon
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search hackathons, organizer, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-badge">{filteredHackathons.length} Hackathons</div>
      </div>

      {/* ── Hackathons Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Hackathon Event</th>
              <th>Organizer</th>
              <th>Location / Mode</th>
              <th>Timeline</th>
              <th>Prize Pool</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-loading">Loading hackathons...</td>
              </tr>
            ) : filteredHackathons.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No hackathons hosted yet. Click "+ Host New Hackathon" to add.</td>
              </tr>
            ) : (
              filteredHackathons.map((h) => (
                <tr key={h.hackathon_id}>
                  <td className="text-muted">#{h.hackathon_id}</td>
                  <td>
                    <div className="font-semibold">{h.title}</div>
                    <div className="item-sub text-truncate" style={{ maxWidth: 300 }}>
                      {h.description}
                    </div>
                  </td>
                  <td>
                    <span className="font-medium">{h.organizer}</span>
                  </td>
                  <td>
                    <span className="badge badge-purple">{h.mode || "Online"}</span>
                    <div className="text-muted text-sm mt-1">{h.location}</div>
                  </td>
                  <td>
                    <div className="text-sm font-medium">
                      📅 {h.start_date ? new Date(h.start_date).toLocaleDateString() : "TBA"}
                    </div>
                    <div className="text-muted text-xs">
                      to {h.end_date ? new Date(h.end_date).toLocaleDateString() : "TBA"}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {h.prize_pool ? `₹${h.prize_pool.toLocaleString()}` : "Certificates & Swag"}
                    </span>
                  </td>
                  <td>
                    <div className="action-button-group">
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(h)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-sm btn-delete" onClick={() => handleDelete(h.hackathon_id)}>
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

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingHackathon ? "✏️ Edit Hackathon" : "➕ Host New Hackathon"}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Hackathon Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. StudentHub AI Innovation Sprint 2026"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Organizer *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. StudentHub Community"
                    value={form.organizer}
                    onChange={(e) => setForm({ ...form, organizer: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Event Mode</label>
                  <select
                    value={form.mode}
                    onChange={(e) => setForm({ ...form, mode: e.target.value })}
                  >
                    <option value="Online">Online / Virtual</option>
                    <option value="Offline">In-Person</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru / Discord Server"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Prize Pool (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={form.prize_pool}
                    onChange={(e) => setForm({ ...form, prize_pool: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Hackathon tracks, judging criteria, eligibility, and rules..."
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
                  {formLoading ? "Saving..." : editingHackathon ? "Save Changes" : "Create Hackathon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Hackathons;
