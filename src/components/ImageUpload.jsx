import { useState } from "react";
import { API_BASE_URL } from "../config";

export default function ImageUpload({ value, onChange, label = "Post Banner / Image", folder = "studenthub/posts" }) {
  const [preview, setPreview] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP)");
      return;
    }

    // Size limit ~5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size must be less than 5MB");
      return;
    }

    setUploadError("");
    setUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64data = reader.result;
        setPreview(base64data);

        // Upload to backend Cloudinary upload API
        try {
          const res = await fetch(`${API_BASE_URL}/upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64data, folder }),
          });
          const data = await res.json();
          if (data.success && data.data?.url) {
            setPreview(data.data.url);
            onChange(data.data.url);
          } else {
            // If local upload route fails, we can still use base64 or remote url
            onChange(base64data);
          }
        } catch (err) {
          console.warn("Upload to backend failed, saving base64:", err);
          onChange(base64data);
        } finally {
          setUploading(false);
        }
      };
    } catch (err) {
      setUploadError("Failed to read image file");
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <label style={{ display: "block", fontWeight: "600", marginBottom: "6px", color: "#374151" }}>
        {label}
      </label>

      {preview ? (
        <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "180px",
              objectFit: "cover",
              borderRadius: "10px",
              border: "1px solid #E5E7EB",
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              backgroundColor: "rgba(239, 68, 68, 0.9)",
              color: "#FFF",
              border: "none",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ✕ Remove
          </button>
        </div>
      ) : (
        <div
          style={{
            border: "2px dashed #D1D5DB",
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#F9FAFB",
            cursor: "pointer",
          }}
          onClick={() => document.getElementById("post-image-input")?.click()}
        >
          <input
            id="post-image-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>📸</div>
          <div style={{ fontSize: "14px", color: "#4B5563", fontWeight: "500" }}>
            {uploading ? "Uploading to Cloudinary..." : "Click to upload post image / banner"}
          </div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>
            Supports PNG, JPG, WebP up to 5MB
          </div>
        </div>
      )}

      {uploadError && (
        <p style={{ color: "#EF4444", fontSize: "12px", marginTop: "4px" }}>{uploadError}</p>
      )}
    </div>
  );
}
