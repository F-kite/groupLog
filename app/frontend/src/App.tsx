import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/login/page.tsx";
import RegisterPage from "./app/register/page.tsx";
import HomePage from "./components/HomePage/HomePage.tsx";
import MainLayout from "./pages/MainLayout/MainLayout.tsx";
import AttendanceTable from "./pages/AttendancePage/AttendancePage.tsx";
import ErrorPageNotFound from "./pages/ErrorPages/404Page.tsx";
import ErrorServerUnavailable from "./pages/ErrorPages/503Page.tsx";
import TestingPage from "./pages/TestingPage/TestingPage.tsx";

import ProtectedRoute from "../middleware.tsx";
import { MyContextProvider } from "./hooks/MyContextProvider.tsx";
import { checkServer } from "./utils/api/index.ts";
import "./App.css";

{
  /*
  Сделать хеширование паролей при регистрации / авторизации
   */
}
interface InfoProps {
  group: string;
  week: number;
}

const Info: InfoProps = {
  group: "ИСт-221",
  week: 10,
};

export default function App() {
  const [isServerDown, setIsServerDown] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const performCheck = async () => {
      try {
        const result = await checkServer();
        if (!result.error) {
          console.log("Сервер доступен");
          setIsServerDown(false);
        } else {
          console.error("Ошибка соединения с сервером:", result.error);
          setIsServerDown(true);
        }
      } catch (error) {
        console.error("Не удалось выполнить проверку:", error);
      }
    };

    performCheck();

    const intervalId = setInterval(performCheck, 20 * 1000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(intervalId);
  }, [isServerDown]);

  //Рендер страницы (503), если сервер недоступен
  if (isServerDown) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<ErrorServerUnavailable />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <MyContextProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </MyContextProvider>
  );
}
