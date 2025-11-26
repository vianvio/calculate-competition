import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';

@Controller('api/practice')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Post('generate')
  generateQuestions(@Body() settings: any) {
    return this.practiceService.generateQuestions(settings);
  }

  @Post('session')
  createSession(@Body() createPracticeSessionDto: CreatePracticeSessionDto) {
    return this.practiceService.createSession(createPracticeSessionDto);
  }

  @Get('user/:userId')
  getUserSessions(@Param('userId') userId: string) {
    return this.practiceService.getUserSessions(+userId);
  }

  @Get('calendar/:userId')
  getCalendar(@Param('userId') userId: string, @Query('year') year: string, @Query('month') month: string) {
    return this.practiceService.getCalendar(+userId, +year, +month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.practiceService.findOne(+id);
  }
}
