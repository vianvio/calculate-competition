import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { PracticeSession } from '../practice/practice-session.entity';
import { CompetitionRecord } from '../competition/competition-record.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PracticeSession, session => session.user)
  practiceSessions: PracticeSession[];

  @OneToMany(() => CompetitionRecord, record => record.player1)
  competitionsAsPlayer1: CompetitionRecord[];

  @OneToMany(() => CompetitionRecord, record => record.player2)
  competitionsAsPlayer2: CompetitionRecord[];
}
