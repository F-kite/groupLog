import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";
import supabase from "./supabase/index.js";

dotenv.config();

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.log("Validate error:", error);
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const authMiddleware = async (req, res, next) => {
  try {
    const authToken = req.cookies.authToken;
    const refreshToken = req.cookies.refreshToken;

    if (!supabase) {
      console.error("Supabase is not initialized");
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!authToken && !refreshToken) {
      console.debug("Ни один токен не найден");
      return res.status(401).json({ error: "Authorization required" });
    }

    if (authToken && refreshToken) {
      return next();
    }

    if (refreshToken) {
      const { data: refreshSession, refreshError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (refreshError || !refreshSession) {
        console.debug("Ошибка при обновлении токена:", refreshError);
        return res.status(401).json({ error: "Failed to refresh token" });
      }

      const { session } = refreshSession;

      // сохранение токена авторизации в куки
      res.cookie("authToken", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 час
      });
      console.debug(" -- Токен авторизации обновился");

      // сохранение токена обновления авторизации в куки
      res.cookie("refreshToken", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      });
      console.debug(" -- Токен обновления обновился");

      return next();
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};
