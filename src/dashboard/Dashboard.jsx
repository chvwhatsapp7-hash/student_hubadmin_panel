import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "../config";

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    jobs: 0,
    internships: 0,
    companies: 0,
    courses: 0,
    hackathons: 0,
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentInternships, setRecentInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, jobsRes, internRes, compRes, coursesRes, hackRes] = await Promise.all([
        fetch(`${API_BASE_URL}/bulk?type=users&limit=1`).then(r => r.json()).catch(() => ({ total: 0 })),
        fetch(`${API_BASE_URL}/bulk?type=jobs&limit=5`).then(r => r.json()).catch(() => ({ total: 0, data: [] })),
        fetch(`${API_BASE_URL}/bulk?type=internships&limit=5`).then(r => r.json()).catch(() => ({ total: 0, data: [] })),
        fetch(`${API_BASE_URL}/companies`).then(r => r.json()).catch(() => ({ data: [] })),
        fetch(`${API_BASE_URL}/getCourses`).then(r => r.json()).catch(() => ({ courses: [] })),
        fetch(`${API_BASE_URL}/hackathons`).then(r => r.json()).catch(() => ({ data: [] })),
      ]);

      setStats({
        users: usersRes.total || 0,
        jobs: jobsRes.total || (jobsRes.data ? jobsRes.data.length : 0),
        internships: internRes.total || (internRes.data ? internRes.data.length : 0),
        companies: compRes.data ? compRes.data.length : 0,
        courses: coursesRes.courses ? coursesRes.courses.length : 0,
        hackathons: hackRes.data ? hackRes.data.length : 0,
      });

      if (jobsRes.data) setRecentJobs(jobsRes.data);
      if (internRes.data) setRecentInternships(internRes.data);
    } catch (err) {
      console.error("Failed to load dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    { label: "Total Users", count: stats.users, icon: "👥", link: "/users", color: "#3B82F6" },
    { label: "Active Jobs", count: stats.jobs, icon: "💼", link: "/jobs", color: "#10B981" },
    { label: "Open Internships", count: stats.internships, icon: "📋", link: "/internships", color: "#8B5CF6" },
    { label: "Partner Companies", count: stats.companies, icon: "🏢", link: "/companies", color: "#F59E0B" },
    { label: "Available Courses", count: stats.courses, icon: "📚", link: "/courses", color: "#EC4899" },
    { label: "Active Hackathons", count: stats.hackathons, icon: "🏆", link: "/hackathons", color: "#06B6D4" },
  ];

  return (
    <div className="admin-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Admin Dashboard</h1>
          <p className="page-subtitle">Platform overview, live metrics, and administrative shortcuts</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData} disabled={loading}>
          {loading ? "Refreshing..." : "🔄 Refresh Stats"}
        </button>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div className="stats-grid">
        {metricCards.map((card, i) => (
          <Link to={card.link} key={i} className="stat-card" style={{ borderTop: `4px solid ${card.color}` }}>
            <div className="stat-card-header">
              <span className="stat-icon">{card.icon}</span>
              <span className="stat-arrow">→</span>
            </div>
            <div className="stat-number">{card.count}</div>
            <div className="stat-label">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="section-box">
        <h2 className="section-title">⚡ Quick Management Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/jobs" className="quick-action-btn">
            <span>💼</span> Post New Job
          </Link>
          <Link to="/internships" className="quick-action-btn">
            <span>📋</span> Add Internship
          </Link>
          <Link to="/companies" className="quick-action-btn">
            <span>🏢</span> Register Company
          </Link>
          <Link to="/courses" className="quick-action-btn">
            <span>📚</span> Create Course
          </Link>
          <Link to="/hackathons" className="quick-action-btn">
            <span>🏆</span> Host Hackathon
          </Link>
          <Link to="/skills" className="quick-action-btn">
            <span>⚡</span> Manage Skills
          </Link>
        </div>
      </div>

      {/* ── Recent Activity / Post Previews ── */}
      <div className="grid-2-col">
        {/* Recent Jobs */}
        <div className="section-box">
          <div className="box-header">
            <h3>💼 Recent Job Posts</h3>
            <Link to="/jobs" className="view-all-link">View all</Link>
          </div>
          {recentJobs.length === 0 ? (
            <p className="empty-text">No jobs posted yet</p>
          ) : (
            <div className="recent-list">
              {recentJobs.slice(0, 4).map((j) => (
                <div key={j.job_id} className="recent-item">
                  {j.image_url ? (
                    <img src={j.image_url} alt="" className="item-thumb" />
                  ) : (
                    <div className="item-icon-box">💼</div>
                  )}
                  <div className="item-info">
                    <div className="item-title">{j.title}</div>
                    <div className="item-sub">{j.company_name || `Company #${j.company_id}`} • {j.location}</div>
                  </div>
                  <span className="badge badge-primary">{j.job_type || "Full Time"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Internships */}
        <div className="section-box">
          <div className="box-header">
            <h3>📋 Recent Internships</h3>
            <Link to="/internships" className="view-all-link">View all</Link>
          </div>
          {recentInternships.length === 0 ? (
            <p className="empty-text">No internships posted yet</p>
          ) : (
            <div className="recent-list">
              {recentInternships.slice(0, 4).map((intern) => (
                <div key={intern.internship_id} className="recent-item">
                  {intern.image_url ? (
                    <img src={intern.image_url} alt="" className="item-thumb" />
                  ) : (
                    <div className="item-icon-box">📋</div>
                  )}
                  <div className="item-info">
                    <div className="item-title">{intern.title}</div>
                    <div className="item-sub">{intern.company_name || `Company #${intern.company_id}`} • {intern.location}</div>
                  </div>
                  <span className="badge badge-success">
                    {intern.stipend ? `₹${intern.stipend}/mo` : "Unpaid"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
