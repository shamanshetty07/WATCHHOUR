import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const { fetchCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurrentUser().then(() => navigate("/", { replace: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
      Signing you in...
    </div>
  );
}
