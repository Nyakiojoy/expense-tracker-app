import { Router } from 'express';
import { addExpense, getExpenses, getExpenseById, updateExpense, deleteExpense } from '../controllers/expenseController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, addExpense);
router.get('/:budgetId', authMiddleware, getExpenses);
router.get('/:id', authMiddleware, getExpenseById);      
router.put('/:id', authMiddleware, updateExpense);       
router.delete('/:id', authMiddleware, deleteExpense);   
 
export default router;
