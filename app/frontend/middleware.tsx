import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { getProtectedRouteData } from "@/utils/api/index";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await getProtectedRouteData().then(async (res) => {
          if ("error" in res) {
            throw new Error(`Требуется авторизация !\n${res.error}`);
          } else if ("message" in res) {
            setIsAuthenticated(true);
          }
        });
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="loader-container">
        <PuffLoader
          loading
          size={200}
          cssOverride={{
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}
