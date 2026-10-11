import { Link } from "react-router-dom";

function formatViews(views) {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
  return `${views || 0} views`;
}

export default function VideoCard({ video }) {
  return (
    <Link
      to={`/video/${video._id}`}
      className="group overflow-hidden rounded-xl bg-zinc-900 transition hover:bg-zinc-800/80"
    >
      <div className="aspect-video overflow-hidden bg-zinc-800">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="flex gap-3 p-3">
        {video.owner?.avatar && (
          <img
            src={video.owner.avatar}
            alt={video.owner.username}
            className="h-9 w-9 rounded-full object-cover"
          />
        )}
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-medium text-white">{video.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">
            {video.owner?.fullname || "Unknown channel"}
          </p>
          <p className="text-sm text-zinc-500">
            {formatViews(video.views)} •{" "}
            {new Date(video.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
