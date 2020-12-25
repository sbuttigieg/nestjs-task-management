import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Unique } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Task } from '../tasks/task.entity';

@Entity()
@Unique(['username']) // will generate a 23505 error if username is not unique
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  salt: string;

  // Note eager property:
  // Eager is set to true on the user side.
  // Whenever we retrieve the user as an object we can access user.tasks
  // immediately and get an array of tasks owned by the same user.
  // So one side of their relationship can be eager not both of them.
  @OneToMany((type) => Task, (task) => task.user, { eager: true })
  tasks: Task[];

  // SCOPE: validate password
  // ERROR HANDLING: none
  // DETAILS 1: hashes the input password with the user salt
  // DETAILS 2: checks if the hashed password matches the stored hash
  // RETURNS: boolean - true if password matches
  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }
}
