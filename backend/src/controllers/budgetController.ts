import { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

interface RequestWithUser extends Request {
    user?: User;
}

export const createBudget = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { name, amount } = req.body;
        const userId = req.user!.id;

        const budget = AppDataSource.manager.create(Budget, { 
            name, 
            amount, 
            remainingAmount: amount,
            user: { id: userId } 
        });

        await AppDataSource.manager.save(budget);

        res.status(201).json({ message: 'Budget created successfully', budget });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getBudgets = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const budgets = await AppDataSource.manager.find(Budget, {
            relations: ['user'],
            select: {
                id: true,
                name: true,
                amount: true,
                remainingAmount: true,
                user: {
                    id: true,
                }
            }
        });

        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getUserBudgets = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const budgets = await AppDataSource.manager.find(Budget, { 
            where: { user: { id: userId } } });

        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getBudgetById = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const budget = await AppDataSource.manager.findOne(Budget, { where: { id: Number(id), user: { id: userId } } });

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        res.status(200).json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateBudget = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, amount } = req.body;
        const userId = req.user!.id;

        const budget = await AppDataSource.manager.findOne(Budget, { where: { id: Number(id), user: { id: userId } } });

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        budget.name = name;
        budget.amount = amount;
        await AppDataSource.manager.save(budget);

        res.status(200).json({ message: 'Budget updated successfully', budget });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteBudget = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const budget = await AppDataSource.manager.findOne(Budget, { where: { id: Number(id), user: { id: userId } } });

        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        await AppDataSource.manager.remove(budget);

        res.status(200).json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
