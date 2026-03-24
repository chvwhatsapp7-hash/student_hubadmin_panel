import { useState, useEffect } from "react";

const initialForm = {
  title:       "",
  company_id:  "",
  location:    "",
  duration:    "",
  stipend:     "",
  description: "",
  skill_ids:   [],
};

function Internships() {
  // ── List state ──
  const [internships, setInternships] = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  // ── Form state ──
  const [form, setForm]               = useState(initialForm);
  const [companies, setCompanies]     = useState([]);
  const [skills, setSkills]           = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess]         = useState(null);
  const [error, setError]             = useState(null);
  const [showForm, setShowForm]       = useState(false);

  // ── Fetch list on page/search change ──
  useEffect(() => { fetchInternships(); }, [page, search]);

  // ── Fetch companies + skills once ──
  useEffect(() => {
    // ✅ from /api/companies GET
    fetch("https://studenthub-backend-woad.vercel.app/api/companies")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCompanies(json.data); })
      .catch(() => {});

    // ✅ from /api/skills GET
    fetch("https://studenthub-backend-woad.vercel.app/api/skills")
      .then((r) => r.json())
      .then((json) => { if (json.skills) setSkills(json.skills); })
      .catch(() => {});
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://studenthub-backend-woad.vercel.app/api/bulk?type=internships&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setInternships(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch internships:", err); // ✅ err is used
    } finally {
      setLoading(false);
    }
  };

  // ── Search handlers ──
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

  // ── Form handlers ──
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ✅ Multi-select: collect selected option values as integers
  const handleSkillChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) =>
      parseInt(o.value)
    );
    setForm((prev) => ({ ...prev, skill_ids: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setSuccess(null);
    setError(null);

    const payload = {
      title:       form.title,
      company_id:  parseInt(form.company_id),
      location:    form.location,
      duration:    form.duration,
      stipend:     form.stipend,
      description: form.description,
      skill_ids:   form.skill_ids, // ✅ array of IDs
    };

    try {
      const res = await fetch(
        "https://studenthub-backend-woad.vercel.app/api/internships",
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );
      const json = await res.json();

      if (json.success) {
        setSuccess("✅ Internship created successfully!");
        setForm(initialForm);
        setShowForm(false);
        fetchInternships(); // ✅ refresh table
      } else {
        setError(json.message || "Something went wrong.");
      }
    } catch {
      // ✅ no variable — avoids no-unused-vars warning
      setError("Failed to connect to server.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>

      {/* ── Header ── */}
      <div>
        <h1>{total} Internships</h1>
        <p>Total {total} internship listings</p>
        <button onClick={() => { setShowForm((v) => !v); setSuccess(null); setError(null); }}>
          {showForm ? "✖ Cancel" : "➕ Post Internship"}
        </button>
      </div>

      {/* ── Create Form (toggle) ── */}
      {showForm && (
        <form onSubmit={handleSubmit}>
          <h2>New Internship</h2>

          {success && <p>{success}</p>}
          {error   && <p>{error}</p>}

          {/* Title */}
          <div>
            <label>Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Flutter Developer Intern"
              required
            />
          </div>

          {/* Company — from /api/companies */}
          <div>
            <label>Company *</label>
            <select
              name="company_id"
              value={form.company_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Company --</option>
              {companies.map((c) => (
                <option key={c.company_id} value={c.company_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label>Location *</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Hyderabad / Remote"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label>Duration *</label>
            <input
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="e.g. 3 months"
              required
            />
          </div>

          {/* Stipend */}
          <div>
            <label>Stipend</label>
            <input
              name="stipend"
              value={form.stipend}
              onChange={handleChange}
              placeholder="e.g. ₹10,000/month or Unpaid"
            />
          </div>

          {/* Description */}
          <div>
            <label>Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the internship role..."
              rows={4}
            />
          </div>

          {/* Skills — from /api/skills, multi-select sends IDs */}
          <div>
            <label>Skills</label>
            <select
              multiple
              value={form.skill_ids.map(String)}
              onChange={handleSkillChange}
              size={5}
            >
              {skills.map((s) => (
                <option key={s.skill_id} value={s.skill_id}>
                  {s.name}
                </option>
              ))}
            </select>
            <small>
              Hold <kbd>Ctrl</kbd> (Windows) or <kbd>Cmd</kbd> (Mac) to select multiple
            </small>
          </div>

          {/* Buttons */}
          <div>
            <button type="button" onClick={() => setForm(initialForm)}>
              Reset
            </button>
            <button type="submit" disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Internship"}
            </button>
          </div>

        </form>
      )}

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title, company or location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" onClick={handleClear}>Clear</button>
        )}
      </form>

      {/* ── Table ── */}
      <table>
        <thead>
          <tr>
            {["#", "Title", "Company", "Location", "Stipend", "Duration", "Type", "Applications", "Status", "Posted"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={10}>⏳ Loading internships...</td></tr>
          ) : internships.length === 0 ? (
            <tr><td colSpan={10}>No internships found</td></tr>
          ) : (
            internships.map((internship, index) => (
              <tr key={internship.internship_id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td>{internship.title}</td>
                <td>{internship.company_name || "—"}</td>
                <td>{internship.location || "—"}</td>
                <td>{internship.stipend || "—"}</td>
                <td>{internship.duration || "—"}</td>
                <td>{internship.internship_type || "—"}</td>
                <td>{internship.total_applications ?? 0}</td>
                <td>{internship.status}</td>
                <td>
                  {new Date(internship.created_at).toLocaleDateString("en-IN", {
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
        <div>
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} internships
          </span>
          <div>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}>{p}</button>
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

export default Internships;
