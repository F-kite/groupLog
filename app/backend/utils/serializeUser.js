const serializeUser = (user) =>
  user
    ? {
        user_id: user.id,
        user_name: user.name,
        user_email: user.email,
        user_password: user.password,
        ...user.user_metadata,
      }
    : null;

export default serializeUser;
