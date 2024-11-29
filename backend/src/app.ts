import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import expenseRoutes from './routes/expenseRoutes';
import budgetRoutes from './routes/budgetRoutes';
import { AppDataSource } from './config/database';
import { validateData } from './utils/validateData';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(validateData);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budget', budgetRoutes);

AppDataSource.initialize()
    .then(() => console.log("Database connected successfully!"))
    .catch((err) => console.error("Error during Data Source initialization", err));

export default app;
