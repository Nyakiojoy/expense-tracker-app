import { body } from 'express-validator';

export const validateBudget = [
    body('name').notEmpty().withMessage('Budget name is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
];
