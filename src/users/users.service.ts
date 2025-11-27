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

  async getStats(id: number, filter?: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['practiceSessions', 'competitionsAsPlayer1', 'competitionsAsPlayer2'],
    });

    if (!user) {
      return null;
    }

    // 根据filter过滤数据
    let filteredPracticeSessions = user.practiceSessions;
    let filteredCompetitions = [...user.competitionsAsPlayer1, ...user.competitionsAsPlayer2];
    
    if (filter === 'week' || filter === 'month' || filter === 'lastWeek' || filter === 'lastMonth') {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
      
      if (filter === 'week') {
        // 本周：从周一开始
        startDate = new Date(now);
        const day = startDate.getDay();
        const diff = day === 0 ? -6 : 1 - day; // 如果是周日，往前6天；否则往前到周一
        startDate.setDate(startDate.getDate() + diff);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'lastWeek') {
        // 上周：上周一到上周日
        const today = new Date(now);
        const day = today.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() + diff);
        
        startDate = new Date(thisMonday);
        startDate.setDate(thisMonday.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(thisMonday);
        endDate.setDate(thisMonday.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'month') {
        // 本月：从1号开始
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
      } else if (filter === 'lastMonth') {
        // 上月：上个月1号到最后一天
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
      }
      
      filteredPracticeSessions = user.practiceSessions.filter(session => 
        session.createdAt >= startDate && session.createdAt <= endDate
      );
      
      filteredCompetitions = filteredCompetitions.filter(comp => 
        comp.createdAt >= startDate && comp.createdAt <= endDate
      );
    }

    // Calculate practice stats
    const totalProblems = filteredPracticeSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
    const correctAnswers = filteredPracticeSessions.reduce((sum, session) => sum + session.correctAnswers, 0);
    const practiceAccuracy = totalProblems > 0 ? (correctAnswers / totalProblems * 100).toFixed(2) : 0;

    // 详细统计：按运算类型和位数
    const detailedStats = {
      byType: {
        addition: { total: 0, correct: 0, byDigits: {} },
        subtraction: { total: 0, correct: 0, byDigits: {} },
        multiplication: { total: 0, correct: 0, byDigits: {} },
        division: { total: 0, correct: 0, byDigits: {} },
      },
    };

    // 遍历所有练习记录
    filteredPracticeSessions.forEach(session => {
      const digits = session.settings.digits || 2;
      
      session.questions.forEach(q => {
        let type = '';
        if (q.question.includes('+')) type = 'addition';
        else if (q.question.includes('-')) type = 'subtraction';
        else if (q.question.includes('×')) type = 'multiplication';
        else if (q.question.includes('÷')) type = 'division';
        
        if (type && detailedStats.byType[type]) {
          // 总计
          detailedStats.byType[type].total++;
          if (q.correct) {
            detailedStats.byType[type].correct++;
          }
          
          // 按位数统计
          if (!detailedStats.byType[type].byDigits[digits]) {
            detailedStats.byType[type].byDigits[digits] = { total: 0, correct: 0 };
          }
          detailedStats.byType[type].byDigits[digits].total++;
          if (q.correct) {
            detailedStats.byType[type].byDigits[digits].correct++;
          }
        }
      });
    });

    // Calculate competition stats
    const wins = filteredCompetitions.filter(comp => {
      if (comp.player1Id === id) {
        return comp.winnerId === id;
      }
      return comp.winnerId === id;
    }).length;
    const winRate = filteredCompetitions.length > 0 ? (wins / filteredCompetitions.length * 100).toFixed(2) : 0;

    return {
      user,
      stats: {
        totalProblems,
        practiceAccuracy: parseFloat(practiceAccuracy as string),
        competitionWins: wins,
        competitionTotal: filteredCompetitions.length,
        winRate: parseFloat(winRate as string),
      },
      detailedStats,
    };
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async updateAvatar(id: number, avatar: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    user.avatar = avatar;
    return this.usersRepository.save(user);
  }
}
