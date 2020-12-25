import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './task.enum';
import { User } from '../auth/user.entity';

@Entity()
export class Task extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  // Note: Even though the userId column is created automatically by TypeOrm
  // we still have to define the column for Postgres
  @Column()
  userId: number;

  // Note eager property:
  // Eager is set to true on the user side.
  // Whenever we retrieve the user as an object we can access user.tasks
  // immediately and get an array of tasks owned by the same user.
  // So one side of their relationship can be eager not both of them.
  @ManyToOne((type) => User, (user) => user.tasks, { eager: false })
  user: User;
}
