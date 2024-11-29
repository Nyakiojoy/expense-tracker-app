import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { Budget } from '../models/Budget';
import { AppDataSource } from '../config/database';
import { User } from '../models/User';

interface RequestWithUser extends Request {
    user?: User;
}

export const addExpense = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { name, amount, budgetId } = req.body;
        const userId = req.user!.id;

        const budget = await AppDataSource.manager.findOne(Budget, { where: { id: budgetId, user: { id: userId } } });
        if (!budget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        if (budget.remainingAmount < amount) {
            res.status(400).json({ message: 'Insufficient remaining budget!' });
            return;
        }

        const expense = AppDataSource.manager.create(Expense, { 
            name, 
            amount, 
            budget, 
            user: { id: userId }
        });

        await AppDataSource.manager.save(expense);

        budget.remainingAmount -= amount;
        await AppDataSource.manager.save(budget);

        res.status(201).json({ message: 'Expense added successfully', expense });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getExpenses = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { budgetId } = req.params; // Retrieve budgetId from the route parameter

        console.log("Fetching expenses for user ID:", userId, "and budget ID:", budgetId);

        // Find expenses associated with the user and specific budget
        const expenses = await AppDataSource.manager.find(Expense, { 
            where: { 
                user: { id: userId },
                budget: { id: Number(budgetId) } // Filter by budget ID
            },
            relations: ['budget', 'user'], // Include budget and user relations
            select: {
                id: true,
                name: true,
                amount: true,
                budget: {
                    id: true,
                    name: true,
                    amount: true // Include full budget details
                },
                user: {
                    id: true // Only include user ID
                }
            }
        });

        console.log("Expenses found:", expenses);
        res.status(200).json(expenses);
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};


export const getExpenseById = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        const expense = await AppDataSource.manager.findOne(Expense, { where: { id: Number(id), user: { id: userId } } });

        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateExpense = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { name, amount, budgetId } = req.body;
        const userId = req.user!.id;

        // Retrieve the existing expense
        const expense = await AppDataSource.manager.findOne(Expense, { where: { id: Number(id), user: { id: userId } }, relations: ['budget'] });
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        // Retrieve the old budget
        const oldBudget = expense.budget;
        if (!oldBudget) {
            res.status(404).json({ message: 'Associated budget not found' });
            return;
        }

        // Determine if we're updating within the same budget or moving to a new budget
        let newBudget: Budget = oldBudget;
        if (oldBudget.id !== budgetId) {
            const fetchedNewBudget = await AppDataSource.manager.findOne(Budget, { where: { id: budgetId, user: { id: userId } } });
            if (!fetchedNewBudget) {
                res.status(404).json({ message: 'New budget not found' });
                return;
            }
            newBudget = fetchedNewBudget;
        }

        // Calculate the difference in amount between the old and new expense
        const amountDifference = amount - expense.amount;

        // Update remainingAmount in the respective budgets
        if (oldBudget.id === newBudget.id) {
            // If the budget hasn't changed, adjust remainingAmount in the same budget
            if (oldBudget.remainingAmount - amountDifference < 0) {
                res.status(400).json({ message: 'Insufficient remaining budget for this update!' });
                return;
            }
            oldBudget.remainingAmount -= amountDifference;
        } else {
            // Restore the old expense amount to the old budget’s remainingAmount
            oldBudget.remainingAmount += expense.amount;

            // Check if the new budget has enough remaining amount for the updated expense
            if (newBudget.remainingAmount < amount) {
                res.status(400).json({ message: 'Insufficient remaining budget in the new budget!' });
                return;
            }

            // Deduct the new amount from the new budget’s remainingAmount
            newBudget.remainingAmount -= amount;
        }

        // Update the expense details
        expense.name = name;
        expense.amount = amount;
        expense.budget = newBudget;
        await AppDataSource.manager.save(expense);

        // Save the updated budgets
        await AppDataSource.manager.save(oldBudget);
        if (oldBudget.id !== newBudget.id) {
            await AppDataSource.manager.save(newBudget);
        }

        res.status(200).json({ message: 'Expense updated successfully', remainingAmount: newBudget.remainingAmount });
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};



export const deleteExpense = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = req.user!.id;

        // Find the expense to delete, including the associated budget
        const expense = await AppDataSource.manager.findOne(Expense, { 
            where: { id: Number(id), user: { id: userId } }, 
            relations: ['budget'] 
        });
        
        if (!expense) {
            res.status(404).json({ message: 'Expense not found' });
            return;
        }

        const budget = expense.budget;
        if (!budget) {
            res.status(404).json({ message: 'Associated budget not found' });
            return;
        }

        // Ensure remainingAmount and expense amount are treated as numbers
        const expenseAmount = Number(expense.amount);
        const budgetRemainingAmount = Number(budget.remainingAmount);
        const budgetAmount = Number(budget.amount);

        // Correctly add the expense amount back to the remaining amount
        budget.remainingAmount = budgetRemainingAmount + expenseAmount;

        // Ensure remainingAmount does not exceed the budget's total amount
        if (budget.remainingAmount > budgetAmount) {
            budget.remainingAmount = budgetAmount;
        }

        await AppDataSource.manager.save(budget);

        // Remove the expense from the database
        await AppDataSource.manager.remove(Expense, expense);

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: 'Server error', error });
    }
};
