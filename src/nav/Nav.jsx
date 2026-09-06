import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <aside className="sidebar">
      {/* ── Brand ── */}
      <div className="sidebar-brand">
        <div className="brand-logo-circle">🎓</div>
        <div className="brand-text">
          <span className="brand-name">StudentHub</span>
          <span className="brand-badge">Admin Suite</span>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="sidebar-nav">
        <div className="nav-group-label">OVERVIEW</div>
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <div className="nav-group-label">RECRUITMENT & POSTS</div>
        <NavLink
          to="/jobs"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">💼</span>
          <span className="nav-text">Jobs</span>
        </NavLink>
        <NavLink
          to="/internships"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">📋</span>
          <span className="nav-text">Internships</span>
        </NavLink>
        <NavLink
          to="/applications"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">📝</span>
          <span className="nav-text">Applications</span>
        </NavLink>
        <NavLink
          to="/companies"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">🏢</span>
          <span className="nav-text">Companies</span>
        </NavLink>

        <div className="nav-group-label">COMMUNITY & LEARNING</div>
        <NavLink
          to="/courses"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">📚</span>
          <span className="nav-text">Courses</span>
        </NavLink>
        <NavLink
          to="/hackathons"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">🏆</span>
          <span className="nav-text">Hackathons</span>
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">Users</span>
        </NavLink>
        <NavLink
          to="/skills"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">⚡</span>
          <span className="nav-text">Skills</span>
        </NavLink>
        <NavLink
          to="/comments"
          className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-text">Comments</span>
        </NavLink>
      </nav>

      {/* ── Footer / Status ── */}
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot"></span>
          <span>Backend Connected</span>
        </div>
      </div>
    </aside>
  );
}

export default Nav;
