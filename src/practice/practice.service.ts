import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PracticeSession } from './practice-session.entity';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';

@Injectable()
export class PracticeService {
  constructor(
    @InjectRepository(PracticeSession)
    private practiceSessionRepository: Repository<PracticeSession>,
  ) {}

  generateQuestions(settings: any) {
    const { calculationTypes, questionCount, digits, hasRemainder } = settings;
    const questions = [];

    for (let i = 0; i < questionCount; i++) {
      const type = calculationTypes[Math.floor(Math.random() * calculationTypes.length)];
      const question = this.generateQuestion(type, digits, hasRemainder);
      questions.push(question);
    }

    return questions;
  }

  private generateQuestion(type: string, digits: number, hasRemainder: boolean) {
    const max = Math.pow(10, digits) - 1;
    const min = Math.pow(10, digits - 1);

    let num1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let num2 = Math.floor(Math.random() * (max - min + 1)) + min;

    // Ensure num1 >= num2 for subtraction
    if (type === 'subtraction' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }

    // For multiplication with 2 or 3 digits, use single digit multiplier or 10, 11
    if (type === 'multiplication' && digits >= 2) {
      const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      num2 = multipliers[Math.floor(Math.random() * multipliers.length)];
    }

    // For division, adjust to avoid remainder if needed
    if (type === 'division') {
      if (digits >= 2) {
        // For 2 or 3 digit numbers, divisor is 1-10
        const divisors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        num2 = divisors[Math.floor(Math.random() * divisors.length)];
        if (!hasRemainder) {
          // Generate a number divisible by num2
          const quotient = Math.floor(Math.random() * Math.floor(max / num2)) + 1;
          num1 = num2 * quotient;
        } else {
          // Keep the original num1
          num1 = Math.floor(Math.random() * (max - min + 1)) + min;
        }
      } else {
        // For single digit, keep original logic
        num2 = Math.floor(Math.random() * 9) + 1;
        if (!hasRemainder) {
          num1 = num2 * Math.floor(Math.random() * 9 + 1);
        }
      }
    }

    let operator = '';
    let answer = 0;

    switch (type) {
      case 'addition':
        operator = '+';
        answer = num1 + num2;
        break;
      case 'subtraction':
        operator = '-';
        answer = num1 - num2;
        break;
      case 'multiplication':
        operator = '×';
        answer = num1 * num2;
        break;
      case 'division':
        operator = '÷';
        const quotient = Math.floor(num1 / num2);
        const remainder = num1 % num2;
        answer = quotient;
        return {
          question: `${num1} ${operator} ${num2}`,
          answer: quotient,
          quotient,
          remainder,
          hasRemainder: remainder > 0,
        };
    }

    return {
      question: `${num1} ${operator} ${num2}`,
      answer: Math.floor(answer),
    };
  }

  async createSession(createPracticeSessionDto: CreatePracticeSessionDto): Promise<PracticeSession> {
    const session = this.practiceSessionRepository.create(createPracticeSessionDto);
    return this.practiceSessionRepository.save(session);
  }

  async getUserSessions(userId: number): Promise<PracticeSession[]> {
    return this.practiceSessionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getCalendar(userId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await this.practiceSessionRepository.find({
      where: {
        userId,
        createdAt: Between(startDate, endDate),
      },
    });

    // Group by date
    const calendar = {};
    sessions.forEach(session => {
      const date = session.createdAt.toISOString().split('T')[0];
      if (!calendar[date]) {
        calendar[date] = {
          totalQuestions: 0,
          correctAnswers: 0,
          sessions: [],
        };
      }
      calendar[date].totalQuestions += session.totalQuestions;
      calendar[date].correctAnswers += session.correctAnswers;
      calendar[date].sessions.push(session);
    });

    // Mark perfect days
    Object.keys(calendar).forEach(date => {
      calendar[date].isPerfect = calendar[date].totalQuestions === calendar[date].correctAnswers;
      calendar[date].hasPractice = true;
    });

    return calendar;
  }

  async findOne(id: number): Promise<PracticeSession> {
    return this.practiceSessionRepository.findOne({ where: { id } });
  }
}
