import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

function Comments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/comments?limit=100`);
      const json = await res.json();
      if (json.success && json.data) {
        setComments(json.data);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to remove this comment?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/posts/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Comment deleted successfully", "success");
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        showToast(json.message || "Failed to delete comment", "error");
      }
    } catch (err) {
      showToast("Error deleting comment", "error");
    }
  };

  const filteredComments = comments.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.content || "").toLowerCase().includes(q) ||
      (c.author_name || "").toLowerCase().includes(q) ||
      (c.post_title || "").toLowerCase().includes(q)
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
          <h1 className="page-title">💬 Comments Moderation</h1>
          <p className="page-subtitle">Monitor, inspect, and moderate student comments across Job and Internship posts</p>
        </div>
        <div className="header-badge">{comments.length} Total Comments</div>
      </div>

      {/* ── Search Bar ── */}
      <div className="filter-bar">
        <input
          type="text"
          className="search-input"
          placeholder="Filter by comment text, author, or post title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="header-badge">{filteredComments.length} Matching</div>
      </div>

      {/* ── Comments Table ── */}
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Comment Content</th>
              <th>Author</th>
              <th>Post Attached</th>
              <th>Type</th>
              <th>Posted Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="table-loading">Loading comments...</td>
              </tr>
            ) : filteredComments.length === 0 ? (
              <tr>
                <td colSpan="7" className="table-empty">No comments found.</td>
              </tr>
            ) : (
              filteredComments.map((c) => (
                <tr key={c.id}>
                  <td className="text-muted">#{c.id}</td>
                  <td>
                    <div className="font-semibold text-slate-800" style={{ maxWidth: 360 }}>
                      "{c.content}"
                    </div>
                  </td>
                  <td>
                    <div className="font-medium">{c.author_name || "Anonymous Student"}</div>
                    <div className="text-muted text-sm">{c.author_email || ""}</div>
                  </td>
                  <td>
                    <span className="font-medium text-primary">
                      {c.post_title || `Post #${c.post_id}`}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${c.post_type === "job" ? "badge-primary" : "badge-purple"}`}>
                      {c.post_type === "job" ? "💼 Job" : "📋 Internship"}
                    </span>
                  </td>
                  <td className="text-muted text-sm">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recently"}
                  </td>
                  <td>
                    <button className="btn-sm btn-delete" onClick={() => handleDelete(c.id)}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Comments;
