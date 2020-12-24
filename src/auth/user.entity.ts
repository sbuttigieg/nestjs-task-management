import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Unique } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
