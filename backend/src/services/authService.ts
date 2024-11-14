import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

export const registerUser = async (email: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = AppDataSource.manager.create(User, { email, password: hashedPassword });
    await AppDataSource.manager.save(user);
    return user;
};

