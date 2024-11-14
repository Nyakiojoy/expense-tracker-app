export const jwtConfig = {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    expiresIn: '1d',
};
