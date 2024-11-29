import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await AppDataSource.manager.find(User);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const user = await AppDataSource.manager.findOne(User, { where: { id: Number(id) } });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { email, password } = req.body;

        const user = await AppDataSource.manager.findOne(User, { where: { id: Number(id) } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);

        await AppDataSource.manager.save(user);

        res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await AppDataSource.manager.findOne(User, { where: { id: Number(id) } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await AppDataSource.manager.remove(User, user);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
