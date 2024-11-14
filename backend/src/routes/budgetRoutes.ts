import { Router } from 'express';
import { createBudget, getBudgets, getUserBudgets, getBudgetById, updateBudget, deleteBudget } from '../controllers/budgetController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, createBudget);
router.get('/', authMiddleware, getBudgets);
router.get('/user', authMiddleware, getUserBudgets);
router.get('/:id', authMiddleware, getBudgetById);      
router.put('/:id', authMiddleware, updateBudget);
router.delete('/:id', authMiddleware, deleteBudget);   

export default router;
