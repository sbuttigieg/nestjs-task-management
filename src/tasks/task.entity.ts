import { BaseEntity, Column, Entity, ManyToOne } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task.enum';

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

  // NOTE 1a: Even though the userId column is created automatically by TypeOrm
  // NOTE 1b: we still have to define the column for Postgres
  @Column()
  userId: number;

  // NOTE 2a: The eager property: -
  // NOTE 2b: Eager is set to true on the user side.
  // NOTE 2c: Whenever we retrieve the user as an object we can access
  // NOTE 2d: user.tasks immediately and get an array of tasks owned by the
  // NOTE 2e: same user. So only one side of their relationship can be eager
  // NOTE 2f: not both of them.
  @ManyToOne((type) => User, (user) => user.tasks, { eager: false })
  user: User;
}
