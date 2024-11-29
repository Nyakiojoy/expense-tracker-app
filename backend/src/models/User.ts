import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Expense } from './Expense';
import { Budget } from './Budget';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @OneToMany(() => Expense, expense => expense.user)
    expenses!: Expense[];

    @OneToMany(() => Budget, budget => budget.user)
    budgets!: Budget[];
}
