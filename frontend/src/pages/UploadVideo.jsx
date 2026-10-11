import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function UploadVideo() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      if (videoFile) formData.append("videoFile", videoFile);
      if (thumbnail) formData.append("thumbnail", thumbnail);

      const response = await api.post("/videos", formData);

      navigate(`/video/${response.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload video");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-3xl font-bold">Upload video</h1>
      <p className="mb-6 text-zinc-400">Share your content with the world</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          placeholder="Video title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          rows={5}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-500"
        />

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">Video file</span>
          <input
            type="file"
            accept="video/*"
            onChange={(event) => setVideoFile(event.target.files?.[0] || null)}
            required
            className="w-full text-sm text-zinc-400"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-400">
            Thumbnail (optional)
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setThumbnail(event.target.files?.[0] || null)}
            className="w-full text-sm text-zinc-400"
          />
        </label>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-white py-3 font-medium text-black hover:bg-zinc-200 disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Publish video"}
        </button>
      </form>
    </div>
  );
}
