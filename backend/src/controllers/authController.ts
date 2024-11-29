import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';
import { jwtConfig } from '../config/jwtConfig';
import { generateToken } from '../utils/generateToken';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const existingUser = await AppDataSource.manager.findOne(User, { where: { email } });

        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = AppDataSource.manager.create(User, { email, password: hashedPassword });
        await AppDataSource.manager.save(user);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await AppDataSource.manager.findOne(User, { where: { email } });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id, email: user.email }, jwtConfig.secret, {
            expiresIn: jwtConfig.expiresIn,
        });

        res.cookie('jwt', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.status(200).json({ message: 'Logged in successfully', token });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie('jwt', { httpOnly: true });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
