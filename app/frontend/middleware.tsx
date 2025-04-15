import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { getProtectedRouteData } from "@/utils/api/index";
import { MyContext } from "@/hooks/MyContextProvider";
export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const context = useContext(MyContext);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const { setUserInfo } = context;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await getProtectedRouteData();
        if ("error" in response) {
          throw new Error(`${response.error}`);
        }
        // console.log(response);
        const { aud, email, group, role, name } = response.message;
        setUserInfo({ email, group, role, name });
        if (aud == "authenticated") setIsAuthenticated(true);
      } catch (error: any) {
        console.error(error.message);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [setIsAuthenticated, setUserInfo]);

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
