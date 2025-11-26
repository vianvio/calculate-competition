import { Controller, Get, Render, Param } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Math Competition App' };
  }

  @Get('select-user')
  @Render('select-user')
  selectUser() {
    return {};
  }

  @Get('practice/:userId')
  @Render('practice')
  practice(@Param('userId') userId: string) {
    return { userId };
  }

  @Get('competition/:userId')
  @Render('competition-setup')
  competitionSetup(@Param('userId') userId: string) {
    return { userId };
  }

  @Get('competition-play')
  @Render('competition-play')
  competitionPlay() {
    return {};
  }

  @Get('calendar/:userId')
  @Render('calendar')
  calendar(@Param('userId') userId: string) {
    return { userId };
  }

  @Get('stats/:userId')
  @Render('stats')
  stats(@Param('userId') userId: string) {
    return { userId };
  }

  @Get('competition-records/:userId')
  @Render('competition-records')
  competitionRecords(@Param('userId') userId: string) {
    return { userId };
  }
}
