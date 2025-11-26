import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompetitionRecord } from './competition-record.entity';
import { CreateCompetitionRecordDto } from './dto/create-competition-record.dto';

@Injectable()
export class CompetitionService {
  constructor(
    @InjectRepository(CompetitionRecord)
    private competitionRecordRepository: Repository<CompetitionRecord>,
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

  async createRecord(createCompetitionRecordDto: CreateCompetitionRecordDto): Promise<CompetitionRecord> {
    const record = this.competitionRecordRepository.create(createCompetitionRecordDto);
    return this.competitionRecordRepository.save(record);
  }

  async getUserRecords(userId: number): Promise<CompetitionRecord[]> {
    return this.competitionRecordRepository.find({
      where: [
        { player1Id: userId },
        { player2Id: userId },
      ],
      relations: ['player1', 'player2'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<CompetitionRecord> {
    return this.competitionRecordRepository.findOne({
      where: { id },
      relations: ['player1', 'player2'],
    });
  }
}
