import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './User';
import { Budget } from './Budget';

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column('decimal')
    amount!: number;

    @ManyToOne(() => User, user => user.expenses)
    user!: User;

    @ManyToOne(() => Budget, budget => budget.expenses)
    budget!: Budget;
}
