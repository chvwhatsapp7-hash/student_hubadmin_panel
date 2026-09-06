import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/skills`);
      const json = await res.json();
      if (json.success && json.skills) {
        setSkills(json.skills);
      }
    } catch (err) {
      console.error("Failed to load skills:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    setAddLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkill.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message === "Skill already exists" ? "Skill already exists!" : "Skill added successfully!", "success");
        setNewSkill("");
        fetchSkills();
      } else {
        showToast(json.message || "Failed to add skill", "error");
      }
    } catch (err) {
      showToast("Error adding skill", "error");
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = async (skillId, skillName) => {
    if (!window.confirm(`Are you sure you want to delete skill "${skillName}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/skills`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill_id: skillId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Skill deleted successfully", "success");
        setSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
      } else {
        showToast(json.message || "Failed to delete skill", "error");
      }
    } catch (err) {
      showToast("Error deleting skill", "error");
    }
  };

  const filteredSkills = skills.filter((s) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="page-title">⚡ Skills Taxonomy</h1>
          <p className="page-subtitle">Manage technology and domain skill tags used across candidate profiles, jobs, and internships</p>
        </div>
        <div className="header-badge">{skills.length} Total Skills</div>
      </div>

      {/* ── Add Skill Card ── */}
      <div className="section-box mb-4">
        <h2 className="section-title">➕ Add New Skill</h2>
        <form onSubmit={handleAddSkill} className="add-skill-form">
          <input
            type="text"
            className="search-input"
            style={{ maxWidth: 400 }}
            placeholder="e.g. Flutter, Kotlin, Kubernetes, PyTorch..."
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={addLoading || !newSkill.trim()}>
            {addLoading ? "Adding..." : "+ Add Skill"}
          </button>
        </form>
      </div>

      {/* ── Search & Tag Cloud ── */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Filter skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-badge">{filteredSkills.length} Matching</div>
      </div>

      {/* ── Skills Grid / Tags ── */}
      <div className="skills-grid">
        {loading ? (
          <p className="table-loading">Loading platform skills...</p>
        ) : filteredSkills.length === 0 ? (
          <p className="table-empty">No skills match the query.</p>
        ) : (
          filteredSkills.map((s) => (
            <div key={s.skill_id} className="skill-chip">
              <span className="skill-chip-name">{s.name}</span>
              <button
                className="skill-delete-btn"
                title="Delete skill"
                onClick={() => handleDelete(s.skill_id, s.name)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Skills;
