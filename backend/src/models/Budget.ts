// models/Budget.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from './User';
import { Expense } from './Expense';

@Entity()
export class Budget {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column('decimal')
    amount!: number;

    @Column('decimal', { default: 0 })
    remainingAmount: number;

    @ManyToOne(() => User, user => user.budgets)
    user!: User;

    @OneToMany(() => Expense, expense => expense.budget)
    expenses!: Expense[];

    constructor() {
        this.remainingAmount = this.amount;
    }
}
