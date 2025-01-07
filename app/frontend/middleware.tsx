import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getProtectedRouteData } from "@/utils/api";

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
            throw new Error(`ProtectedRoute error: ${res.error}`);
          } else if ("message" in res) {
            setIsAuthenticated(true);
            const userEmail = res.message.data.user.email;
            console.debug({ message: userEmail });
          }
        });
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div>
        Загрузка страницы.. <br /> *проверка через middleware
      </div>
    );
  }
  return isAuthenticated ? children : <Navigate to="/login" />;
}
