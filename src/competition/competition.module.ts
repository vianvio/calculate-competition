import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitionRecord } from './competition-record.entity';
import { CompetitionService } from './competition.service';
import { CompetitionController } from './competition.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CompetitionRecord])],
  providers: [CompetitionService],
  controllers: [CompetitionController],
  exports: [CompetitionService],
})
export class CompetitionModule {}
