import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/login/page.tsx";
import RegisterPage from "./app/register/page.tsx";
import MainLayout from "./pages/MainLayout/MainLayout.tsx";
import ErrorPageNotFound from "./pages/ErrorPages/404Page.tsx";
import TestingPage from "./pages/TestingPage/TestingPage.tsx";
import ProtectedRoute from "../middleware.tsx";

import "./App.css";
import HomePage from "./components/HomePage/HomePage.tsx";
import AttendanceTable from "./pages/AttendancePage/AttendancePage.tsx";
import studentApi from "./utils/api/students.ts";
import { useEffect, useState } from "react";
import { StudentContext, Students } from "@/hooks/StudentContext.ts";

{
  /*
  Сделать хеширование паролей при регистрации / авторизации
   */
}

export default function App() {
  const [students, setStudents] = useState<Students[]>([]);
  const [group, setGroup] = useState("ИСт-221");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStudents = async (group: string) => {
      try {
        setLoading(true);
        const response = await studentApi.getStudentsByGroup(group);
        if (response.error) {
          throw new Error(response.error);
        }
        setStudents(response);
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents(group);
  }, []);

  return (
    <BrowserRouter>
      <StudentContext.Provider value={students}>
        <Routes>
          <Route path="*" element={<ErrorPageNotFound />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registration" element={<RegisterPage />} />
          <Route path="/testing" element={<TestingPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <HomePage />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AttendanceTable />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </StudentContext.Provider>
    </BrowserRouter>
  );
}
