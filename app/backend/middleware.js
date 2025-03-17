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

    if (authToken && refreshToken) {
      next();
    } else if (refreshToken) {
      const { data: refreshSession, refreshError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });
      const { session } = refreshSession;

      if (refreshError || !refreshSession) {
        console.debug(refreshSession);
        return res.status(400).json({ error: "Ошибка при обновлении токена" });
      }

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
    } else {
      console.debug("Ни один токен не найден");
      return res.status(400).json({ error: "Tokens were not found" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid token" });
  }
};
