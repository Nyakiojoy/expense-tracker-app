import { body } from 'express-validator';

export const validateExpense = [
    body('name').notEmpty().withMessage('Expense name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
];
