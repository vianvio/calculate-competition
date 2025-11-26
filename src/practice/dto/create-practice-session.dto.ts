import { IsNumber, IsObject, IsArray } from 'class-validator';

export class CreatePracticeSessionDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  totalQuestions: number;

  @IsNumber()
  correctAnswers: number;

  @IsNumber()
  wrongAnswers: number;

  @IsNumber()
  timeSpent: number;

  @IsObject()
  settings: {
    calculationTypes: string[];
    digits: number;
    hasRemainder: boolean;
    hasTimeLimit: boolean;
    timeLimitSeconds: number;
  };

  @IsArray()
  questions: {
    question: string;
    answer: number;
    userAnswer: number;
    correct: boolean;
    timeSpent: number;
  }[];
}
