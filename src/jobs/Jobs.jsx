import { useState, useEffect } from "react";
import ImageUpload from "../components/ImageUpload";
import { API_BASE_URL } from "../config";

const initialForm = {
  title: "",
  company_id: "",
  location: "",
  job_type: "Full Time",
  experience_level: "Fresher",
  salary_min: "",
  salary_max: "",
  description: "",
  image_url: "",
  skills: [],
};

function Jobs() {
  const [jobs, setJobs]               = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  // ── Form State ──
  const [form, setForm]               = useState(initialForm);
  const [companies, setCompanies]     = useState([]);
  const [skillsList, setSkillsList]   = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm]       = useState(false);
  const [success, setSuccess]         = useState(null);
  const [error, setError]             = useState(null);

  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/companies`)
      .then((r) => r.json())
      .then((json) => { if (json.success) setCompanies(json.data); })
      .catch(() => {});

    fetch(`${API_BASE_URL}/skills`)
      .then((r) => r.json())
      .then((json) => { if (json.skills) setSkillsList(json.skills); })
      .catch(() => {});
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/bulk?type=jobs&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccess(null);
    setError(null);

    const payload = {
      title: form.title,
      company_id: parseInt(form.company_id),
      location: form.location,
      job_type: form.job_type,
      experience_level: form.experience_level,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      description: form.description,
      image_url: form.image_url,
      skills: form.skills,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setSuccess("✅ Job posted successfully!");
        setForm(initialForm);
        setShowForm(false);
        fetchJobs();
      } else {
        setError(json.message || "Failed to post job");
      }
    } catch {
      setError("Failed to connect to server");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>

      {/* ── Header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1>{total} Jobs</h1>
          <p>Total {total} job listings</p>
        </div>
        <button
          type="button"
          onClick={() => { setShowForm((v) => !v); setSuccess(null); setError(null); }}
          style={{
            padding: "10px 18px",
            backgroundColor: "#2563EB",
            color: "#FFF",
            border: "none",
            borderRadius: "8px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          {showForm ? "✖ Cancel" : "➕ Post New Job"}
        </button>
      </div>

      {/* ── Create Job Form ── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#FFF",
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #E5E7EB",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Create Job Listing</h2>

          {success && <p style={{ color: "#10B981", fontWeight: "600" }}>{success}</p>}
          {error && <p style={{ color: "#EF4444", fontWeight: "600" }}>{error}</p>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Job Title *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Senior Backend Engineer"
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Company *</label>
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bangalore / Remote"
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Job Type</label>
              <select
                name="job_type"
                value={form.job_type}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Experience Level</label>
              <select
                name="experience_level"
                value={form.experience_level}
                onChange={handleChange}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              >
                <option value="Fresher">Fresher</option>
                <option value="0-2 Years">0-2 Years</option>
                <option value="2-5 Years">2-5 Years</option>
                <option value="5+ Years">5+ Years</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Min Salary (₹/year)</label>
              <input
                type="number"
                name="salary_min"
                value={form.salary_min}
                onChange={handleChange}
                placeholder="e.g. 600000"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Max Salary (₹/year)</label>
              <input
                type="number"
                name="salary_max"
                value={form.salary_max}
                onChange={handleChange}
                placeholder="e.g. 1200000"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
              />
            </div>
          </div>

          {/* Cloudinary Post Banner Image Uploader */}
          <ImageUpload
            label="Post Banner / Image (Cloudinary)"
            value={form.image_url}
            onChange={(url) => setForm((prev) => ({ ...prev, image_url: url }))}
          />

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the role requirements and benefits..."
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            style={{
              padding: "12px 24px",
              backgroundColor: "#2563EB",
              color: "#FFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: "700",
              cursor: formLoading ? "not-allowed" : "pointer",
            }}
          >
            {formLoading ? "Submitting..." : "Publish Job Post"}
          </button>
        </form>
      )}

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} style={{ marginBottom: "16px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Search by title, company, location or type..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB" }}
        />
        <button type="submit" style={{ padding: "10px 16px", backgroundColor: "#374151", color: "#FFF", border: "none", borderRadius: "8px" }}>
          Search
        </button>
        {search && (
          <button type="button" onClick={handleClear} style={{ padding: "10px 16px", backgroundColor: "#E5E7EB", border: "none", borderRadius: "8px" }}>
            Clear
          </button>
        )}
      </form>

      {/* ── Table ── */}
      <table>
        <thead>
          <tr>
            {["#", "Media", "Title", "Company", "Location", "Salary", "Type", "Experience", "Applications", "Posted"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10}>⏳ Loading jobs...</td>
            </tr>
          ) : jobs.length === 0 ? (
            <tr>
              <td colSpan={10}>No jobs found</td>
            </tr>
          ) : (
            jobs.map((job, index) => (
              <tr key={job.job_id}>
                <td>{(page - 1) * limit + index + 1}</td>

                <td>
                  {job.image_url ? (
                    <img
                      src={job.image_url}
                      alt={job.title}
                      style={{ width: "45px", height: "32px", objectFit: "cover", borderRadius: "6px" }}
                    />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#9CA3AF" }}>No media</span>
                  )}
                </td>

                <td><strong>{job.title}</strong></td>

                <td>{job.company_name || "—"}</td>

                <td>{job.location || "—"}</td>

                <td>
                  {job.salary_min && job.salary_max
                    ? `₹${job.salary_min} – ₹${job.salary_max}`
                    : job.salary_min
                    ? `₹${job.salary_min}+`
                    : "—"}
                </td>

                <td>{job.job_type || "—"}</td>

                <td>{job.experience_level || "—"}</td>

                <td>{job.total_applications ?? 0}</td>

                <td>
                  {new Date(job.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} jobs
          </span>
          <div>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{ fontWeight: p === page ? "bold" : "normal" }}>
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Jobs;
