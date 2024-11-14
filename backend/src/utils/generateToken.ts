import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig';

export const generateToken = (user: { id: number, email: string }) => {
    return jwt.sign({ id: user.id, email: user.email }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};
