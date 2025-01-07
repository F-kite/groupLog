import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./app/login/page.tsx";
import RegisterPage from "./app/register/page.tsx";
import MainPage from "./pages/MainPage/MainPage.tsx";
import ProtectedRoute from "../middleware.tsx";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
