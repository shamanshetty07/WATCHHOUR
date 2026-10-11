import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function VideoDetail() {
  const { videoId } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVideo = async () => {
    try {
      const response = await api.get(`/videos/v/${videoId}`);
      setVideo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load video");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments/${videoId}`);
      setComments(response.data.data || []);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchVideo();
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  const toggleLike = async () => {
    if (!user) return;
    try {
      const response = await api.post(`/likes/toggle/v/${videoId}`);
      const liked = response.data.data.liked;
      setVideo((prev) => ({
        ...prev,
        isLiked: liked,
        likesCount: liked
          ? (prev.likesCount || 0) + 1
          : Math.max((prev.likesCount || 1) - 1, 0),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update like");
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      await api.post(`/comments/${videoId}`, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add comment");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
        Loading video...
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">{error}</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="overflow-hidden rounded-xl bg-black">
        <video
          src={video.videoFile}
          controls
          className="aspect-video w-full bg-black"
          poster={video.thumbnail}
        />
      </div>

      <div className="mt-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {video.owner && (
              <>
                <img
                  src={video.owner.avatar}
                  alt={video.owner.username}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <Link
                    to={`/channel/${video.owner.username}`}
                    className="font-medium hover:underline"
                  >
                    {video.owner.fullname}
                  </Link>
                  <p className="text-sm text-zinc-400">@{video.owner.username}</p>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">
              {video.views || 0} views • {video.likesCount || 0} likes
            </span>
            {user && (
              <button
                onClick={toggleLike}
                className={`rounded-full px-4 py-2 text-sm ${
                  video.isLiked
                    ? "bg-red-600 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {video.isLiked ? "Liked" : "Like"}
              </button>
            )}
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap rounded-xl bg-zinc-900 p-4 text-zinc-300">
          {video.description}
        </p>
      </div>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">
          Comments ({comments.length})
        </h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-6 flex gap-2">
            <input
              value={newComment}
              onChange={(event) => setNewComment(event.target.value)}
              placeholder="Add a comment..."
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-black hover:bg-white"
            >
              Comment
            </button>
          </form>
        ) : (
          <p className="mb-6 text-sm text-zinc-400">
            <Link to="/login" className="underline">
              Sign in
            </Link>{" "}
            to comment
          </p>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 rounded-xl bg-zinc-900 p-4">
              {comment.owner?.avatar && (
                <img
                  src={comment.owner.avatar}
                  alt={comment.owner.username}
                  className="h-9 w-9 rounded-full object-cover"
                />
              )}
              <div>
                <p className="font-medium">{comment.owner?.username}</p>
                <p className="mt-1 text-zinc-300">{comment.content}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Date(comment.createdAt).toLocaleString()} •{" "}
                  {comment.likesCount || 0} likes
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
