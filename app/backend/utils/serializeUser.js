const serializeUser = (user) =>
    user
        ? {
            id: user.id, //может быть user.user_id 
            email: user.email,
            ...user.user_metadata
        }
        : null

export default serializeUser