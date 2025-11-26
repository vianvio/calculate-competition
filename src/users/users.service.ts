import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async getStats(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['practiceSessions', 'competitionsAsPlayer1', 'competitionsAsPlayer2'],
    });

    if (!user) {
      return null;
    }

    // Calculate practice stats
    const totalProblems = user.practiceSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = user.practiceSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    const practiceAccuracy = totalProblems > 0 ? (correctAnswers / totalProblems * 100).toFixed(2) : 0;

    // Calculate competition stats
    const competitions = [...user.competitionsAsPlayer1, ...user.competitionsAsPlayer2];
    const wins = competitions.filter(comp => {
      if (comp.player1Id === id) {
        return comp.winnerId === id;
      }
      return comp.winnerId === id;
    }).length;
    const winRate = competitions.length > 0 ? (wins / competitions.length * 100).toFixed(2) : 0;

    return {
      user,
      stats: {
        totalProblems,
        practiceAccuracy: parseFloat(practiceAccuracy as string),
        competitionWins: wins,
        competitionTotal: competitions.length,
        winRate: parseFloat(winRate as string),
      },
    };
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
