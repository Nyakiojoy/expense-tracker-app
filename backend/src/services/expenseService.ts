import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { AppDataSource } from '../config/database';

export const addExpense = async (name: string, amount: number, budgetId: number, userId: number) => {
    const budget = await AppDataSource.manager.findOne(Budget, { where: { id: budgetId, user: { id: userId } } });
    if (!budget) throw new Error("Budget not found");

    const expense = AppDataSource.manager.create(Expense, { name, amount, budget, user: { id: userId } });
    return await AppDataSource.manager.save(expense);
};

export const getExpenses = async (userId: number) => {
    return await AppDataSource.manager.find(Expense, { where: { user: { id: userId } } });
};

export const getExpenseById = async (expenseId: number, userId: number) => {
    return await AppDataSource.manager.findOne(Expense, { where: { id: expenseId, user: { id: userId } } });
};

export const updateExpense = async (expenseId: number, name: string, amount: number, budgetId: number, userId: number) => {
    const expense = await getExpenseById(expenseId, userId);
    if (!expense) throw new Error("Expense not found");

    const budget = await AppDataSource.manager.findOne(Budget, { where: { id: budgetId, user: { id: userId } } });
    if (!budget) throw new Error("Budget not found");

    expense.name = name;
    expense.amount = amount;
    expense.budget = budget;
    return await AppDataSource.manager.save(expense);
};

export const deleteExpense = async (expenseId: number, userId: number) => {
    const expense = await getExpenseById(expenseId, userId);
    if (!expense) throw new Error("Expense not found");

    await AppDataSource.manager.remove(expense);
    return expense;
};
