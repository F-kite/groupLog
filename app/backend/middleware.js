import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET_TOKEN;

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.log("Validate error:", error);
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.authToken;

  // if (!token) {
  //   return res.status(401).json({ message: "Unauthorized: No token" });
  // }

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file.");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Добавляем информацию о пользователе в запрос
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      try {
        const refreshResponse = await axios.post(
          "http://localhost:3001/api/refresh-token",
          {},
          { headers: { Cookie: req.headers.cookie } }
        );

        const decoded = jwt.verify(newToken, JWT_SECRET);
        req.user = decoded;
        next();
      } catch (refreshError) {
        console.error(refreshError.message);
        return res
          .status(401)
          .json({ message: "Session expired. Please login again." });
      }
    } else {
      console.error(error.message);
      res.status(401).json({ message: "Invalid token" });
    }
  }
};
