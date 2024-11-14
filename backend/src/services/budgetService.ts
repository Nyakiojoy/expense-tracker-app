import { Budget } from '../models/Budget';
import { AppDataSource } from '../config/database';

export const createBudget = async (name: string, amount: number, userId: number) => {
    const budget = AppDataSource.manager.create(Budget, { name, amount, user: { id: userId } });
    return await AppDataSource.manager.save(budget);
};

export const getBudgets = async (userId: number) => {
    return await AppDataSource.manager.find(Budget, { where: { user: { id: userId } } });
};

export const getBudgetById = async (budgetId: number, userId: number) => {
    return await AppDataSource.manager.findOne(Budget, { where: { id: budgetId, user: { id: userId } } });
};

export const updateBudget = async (budgetId: number, name: string, amount: number, userId: number) => {
    const budget = await getBudgetById(budgetId, userId);
    if (!budget) return null;

    budget.name = name;
    budget.amount = amount;
    return await AppDataSource.manager.save(budget);
};

export const deleteBudget = async (budgetId: number, userId: number) => {
    const budget = await getBudgetById(budgetId, userId);
    if (!budget) return null;

    await AppDataSource.manager.remove(budget);
    return budget;
};
