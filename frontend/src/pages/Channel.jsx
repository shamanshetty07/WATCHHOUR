import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import VideoCard from "../components/VideoCard";

export default function Channel() {
  const { username } = useParams();
  const { user, setUser } = useAuth();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [uploading, setUploading] = useState("");
  const avatarInput = useRef(null);
  const coverInput = useRef(null);

  useEffect(() => {
    const fetchChannel = async () => {
      setLoading(true);
      setError("");

      try {
        const channelResponse = await api.get(`/users/c/${username}`);
        setChannel(channelResponse.data.data);

        const videosResponse = await api.get("/videos", {
          params: { userId: channelResponse.data.data._id },
        });
        setVideos(videosResponse.data.data.docs || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load channel");
      } finally {
        setLoading(false);
      }
    };

    fetchChannel();
  }, [username]);

  const toggleSubscription = async () => {
    if (!user || !channel) return;

    setSubscribing(true);
    try {
      const response = await api.post(`/subscriptions/c/${channel._id}`);
      const subscribed = response.data.data.subscribed;
      setChannel((prev) => ({
        ...prev,
        isSubscribed: subscribed,
        subscribersCount: subscribed
          ? (prev.subscribersCount || 0) + 1
          : Math.max((prev.subscribersCount || 1) - 1, 0),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const uploadImage = async (kind, file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file");
      return;
    }

    const field = kind === "avatar" ? "avatar" : "coverImage";
    const formData = new FormData();
    formData.append(field, file);

    setUploading(kind);
    setError("");
    try {
      const response = await api.patch(
        kind === "avatar" ? "/users/avatar" : "/users/cover-image",
        formData
      );
      const updated = response.data.data;
      setChannel((prev) => ({ ...prev, [field]: updated[field] }));
      setUser((prev) => (prev ? { ...prev, [field]: updated[field] } : prev));
    } catch (err) {
      setError(err.response?.data?.message || `Failed to update ${kind}`);
    } finally {
      setUploading("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
        Loading channel...
      </div>
    );
  }

  if (error && !channel) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-red-300">{error}</div>
    );
  }

  const isOwnChannel = user?.username === channel.username;

  return (
    <div>
      <input
        ref={avatarInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          uploadImage("avatar", e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <input
        ref={coverInput}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          uploadImage("cover", e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="relative h-48 bg-zinc-800 md:h-64">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt="Cover"
            className="h-full w-full object-cover"
          />
        )}
        {isOwnChannel && (
          <button
            onClick={() => coverInput.current?.click()}
            disabled={uploading === "cover"}
            className="absolute bottom-3 right-3 rounded-full bg-black/70 px-4 py-2 text-sm hover:bg-black disabled:opacity-60"
          >
            {uploading === "cover" ? "Uploading..." : "Change cover"}
          </button>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="-mt-12 flex flex-wrap items-end gap-4 pb-6">
          <div className="relative">
            <img
              src={channel.avatar}
              alt={channel.username}
              className="h-24 w-24 rounded-full border-4 border-[#0f0f0f] object-cover md:h-32 md:w-32"
            />
            {isOwnChannel && (
              <button
                onClick={() => avatarInput.current?.click()}
                disabled={uploading === "avatar"}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 text-xs opacity-0 hover:opacity-100 disabled:opacity-100"
              >
                {uploading === "avatar" ? "Uploading..." : "Change"}
              </button>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold md:text-3xl">{channel.fullname}</h1>
            <p className="text-zinc-400">@{channel.username}</p>
            <p className="mt-1 text-sm text-zinc-500">
              {channel.subscribersCount || 0} subscribers •{" "}
              {channel.channelsSubscribedToCount || 0} subscriptions
            </p>
          </div>

          {user && !isOwnChannel && (
            <button
              onClick={toggleSubscription}
              disabled={subscribing}
              className={`rounded-full px-6 py-2 font-medium ${
                channel.isSubscribed
                  ? "bg-zinc-700 text-white hover:bg-zinc-600"
                  : "bg-white text-black hover:bg-zinc-200"
              }`}
            >
              {channel.isSubscribed ? "Subscribed" : "Subscribe"}
            </button>
          )}
        </div>

        {error && (
          <p className="mb-4 rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <h2 className="mb-4 text-xl font-semibold">Videos</h2>

        {videos.length === 0 ? (
          <p className="py-10 text-zinc-400">No videos uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
