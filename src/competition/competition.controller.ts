import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CompetitionService } from './competition.service';
import { CreateCompetitionRecordDto } from './dto/create-competition-record.dto';

@Controller('api/competition')
export class CompetitionController {
  constructor(private readonly competitionService: CompetitionService) {}

  @Post('generate')
  generateQuestions(@Body() settings: any) {
    return this.competitionService.generateQuestions(settings);
  }

  @Post('record')
  createRecord(@Body() createCompetitionRecordDto: CreateCompetitionRecordDto) {
    return this.competitionService.createRecord(createCompetitionRecordDto);
  }

  @Get('user/:userId')
  getUserRecords(@Param('userId') userId: string) {
    return this.competitionService.getUserRecords(+userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.competitionService.findOne(+id);
  }
}
