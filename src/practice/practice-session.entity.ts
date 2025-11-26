import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class PracticeSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.practiceSessions)
  user: User;

  @Column()
  totalQuestions: number;

  @Column()
  correctAnswers: number;

  @Column()
  wrongAnswers: number;

  @Column()
  timeSpent: number; // in seconds

  @Column({ type: 'simple-json' })
  settings: {
    calculationTypes: string[]; // ['addition', 'subtraction', 'multiplication', 'division']
    digits: number;
    hasRemainder: boolean;
    hasTimeLimit: boolean;
    timeLimitSeconds: number;
  };

  @Column({ type: 'simple-json' })
  questions: {
    question: string;
    answer: number;
    userAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
