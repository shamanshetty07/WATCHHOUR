import { useEffect, useState } from "react";
import api from "../api/axios";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const [videos, setVideos] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideos = async (searchQuery = "") => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/videos", {
        params: searchQuery ? { query: searchQuery } : {},
      });
      setVideos(response.data.data.docs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    fetchVideos(query);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search videos..."
          className="flex-1 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          className="rounded-full bg-zinc-100 px-5 py-2 font-medium text-black hover:bg-white"
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="py-20 text-center text-zinc-400">Loading videos...</div>
      )}

      {error && (
        <div className="rounded-lg border border-red-900 bg-red-950/40 p-4 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="py-20 text-center text-zinc-400">
          No videos yet. Be the first to upload!
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}
