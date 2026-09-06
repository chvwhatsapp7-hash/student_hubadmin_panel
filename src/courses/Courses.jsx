import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const initialForm = {
  title: "",
  description: "",
  instructor: "",
  provider: "StudentHub Academy",
  category: "Computer Science",
  level: "Beginner",
  duration: "4 Weeks",
  price: 0,
  rating: 4.8,
  target_group: "college",
};

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/getCourses`);
      const json = await res.json();
      if (json.success && json.data) {
        setCourses(json.data);
      } else if (json.courses) {
        setCourses(json.courses);
      }
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    setForm({
      title: c.title || "",
      description: c.description || "",
      instructor: c.instructor || "",
      provider: c.provider || "StudentHub Academy",
      category: c.category || "Computer Science",
      level: c.level || "Beginner",
      duration: c.duration || "4 Weeks",
      price: c.price || 0,
      rating: c.rating || 4.8,
      target_group: c.target_group || "college",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCourse) {
        const res = await fetch(`${API_BASE_URL}/getCourses`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            course_id: editingCourse.course_id,
            ...form,
          }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Course updated successfully!", "success");
          setShowModal(false);
          fetchCourses();
        } else {
          showToast(json.message || "Failed to update course", "error");
        }
      } else {
        const res = await fetch(`${API_BASE_URL}/getCourses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const json = await res.json();
        if (json.success) {
          showToast("Course created successfully!", "success");
          setShowModal(false);
          fetchCourses();
        } else {
          showToast(json.message || "Failed to create course", "error");
        }
      }
    } catch (err) {
      showToast("Error saving course", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/getCourses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ course_id: courseId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Course deleted successfully", "success");
        setCourses((prev) => prev.filter((c) => c.course_id !== courseId));
      } else {
        showToast(json.message || "Failed to delete course", "error");
      }
    } catch (err) {
      showToast("Error deleting course", "error");
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.instructor || "").toLowerCase().includes(q) ||
      (c.category || "").toLowerCase().includes(q)
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
          <h1 className="page-title">📚 Course Management</h1>
          <p className="page-subtitle">Create, organize, and manage learning tracks and curriculum</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Create New Course
        </button>
      </div>

      {/* ── Search Bar ── */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Search course title, instructor, category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-badge">{filteredCourses.length} Courses</div>
      </div>

      {/* ── Courses Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Course Title</th>
              <th>Instructor</th>
              <th>Level & Duration</th>
              <th>Category</th>
              <th>Target</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="table-loading">Loading courses...</td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="8" className="table-empty">No courses found. Click "+ Create New Course" to add one.</td>
              </tr>
            ) : (
              filteredCourses.map((c) => (
                <tr key={c.course_id}>
                  <td className="text-muted">#{c.course_id}</td>
                  <td>
                    <div className="font-semibold">{c.title}</div>
                    <div className="item-sub text-truncate" style={{ maxWidth: 280 }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{c.instructor || "Staff"}</div>
                    <div className="text-muted text-sm">{c.provider || "Academy"}</div>
                  </td>
                  <td>
                    <span className="badge badge-secondary">{c.level || "All Levels"}</span>
                    <div className="text-muted text-sm mt-1">⏱️ {c.duration || "Self-paced"}</div>
                  </td>
                  <td>
                    <span className="badge badge-primary">{c.category || "General"}</span>
                  </td>
                  <td>
                    <span className="badge badge-purple">{c.target_group || "college"}</span>
                  </td>
                  <td>
                    <span className="text-warning font-semibold">★ {c.rating || "4.8"}</span>
                  </td>
                  <td>
                    <div className="action-button-group">
                      <button className="btn-sm btn-edit" onClick={() => openEditModal(c)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-sm btn-delete" onClick={() => handleDelete(c.course_id)}>
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
              <h2>{editingCourse ? "✏️ Edit Course" : "➕ Create New Course"}</h2>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mastering Flutter & Dart"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Instructor Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Mitchell"
                    value={form.instructor}
                    onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Provider</label>
                  <input
                    type="text"
                    placeholder="e.g. StudentHub Academy"
                    value={form.provider}
                    onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 8 Weeks"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile Development"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Target Audience</label>
                  <select
                    value={form.target_group}
                    onChange={(e) => setForm({ ...form, target_group: e.target.value })}
                  >
                    <option value="college">College Students</option>
                    <option value="school">School Students</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Comprehensive description of the course, topics covered, prerequisites..."
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
                  {formLoading ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
