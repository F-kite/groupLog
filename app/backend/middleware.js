import dotenv from "dotenv";
import supabase from "./supabase/index.js";

dotenv.config();

async function getAuthUser(authToken) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(authToken);
    if (error) {
      console.error("Ошибка получения данных пользователя:", error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error("Ошибка при работе с Supabase:", error.message);
    return null;
  }
}

async function getUserInfo(email) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      console.error(error.message);
      return null;
    }

    const { data: group, error: fetchGroupError } = await supabase
      .from("group")
      .select("name")
      .eq("group_id", data.assigned_group)
      .single();

    if (fetchGroupError) {
      console.error(fetchGroupError.message);
      return null;
    }

    const { data: role, error: fetchRoleError } = await supabase
      .from("user_role")
      .select("name")
      .eq("role_id", data.role_id)
      .single();

    if (fetchRoleError) {
      console.error(fetchRoleError.message);
      return null;
    }
    const result = {
      name: data.name,
      group: group.name,
      role: role.name,
    };
    return result;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    console.error("Validate error:", error);
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
      console.warn("Ни один токен не найден");
      return res.status(401).json({ error: "Authorization required" });
    }

    if (authToken && refreshToken) {
      const authUserInfo = await getAuthUser(authToken);
      const { aud, email } = authUserInfo;
      const userGroupAndRole = await getUserInfo(email);
      req.user = { aud, email, ...userGroupAndRole };
      return next();
    }

    if (refreshToken) {
      const { data: refreshSession, refreshError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

      if (refreshError || !refreshSession) {
        console.error("Ошибка при обновлении токена:", refreshError);
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
      console.info(" -- Токен авторизации обновился");

      // сохранение токена обновления авторизации в куки
      res.cookie("refreshToken", session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 дней
      });
      console.info(" -- Токен обновления обновился");

      const authUserInfo = await getAuthUser(authToken);
      const { aud, email } = authUserInfo;
      const userGroupAndRole = await getUserInfo(email);
      req.user = { aud, email, ...userGroupAndRole };
      return next();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};
