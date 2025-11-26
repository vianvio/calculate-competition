import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class CompetitionRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  player1Id: number;

  @Column()
  player2Id: number;

  @ManyToOne(() => User, user => user.competitionsAsPlayer1)
  player1: User;

  @ManyToOne(() => User, user => user.competitionsAsPlayer2)
  player2: User;

  @Column()
  mode: string; // 'accuracy' or 'speed'

  @Column()
  winnerId: number;

  @Column()
  player1Score: number;

  @Column()
  player2Score: number;

  @Column()
  player1Correct: number;

  @Column()
  player2Correct: number;

  @Column()
  player1Time: number;

  @Column()
  player2Time: number;

  @Column({ type: 'simple-json' })
  settings: {
    calculationTypes: string[];
    questionCount: number;
    digits: number;
    hasRemainder: boolean;
    hasTimeLimit: boolean;
    timeLimitSeconds: number;
  };

  @Column({ type: 'simple-json' })
  player1Questions: {
    question: string;
    answer: number;
    userAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];

  @Column({ type: 'simple-json' })
  player2Questions: {
    question: string;
    answer: number;
    userAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
