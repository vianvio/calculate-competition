import { IsNumber, IsString, IsObject, IsArray } from 'class-validator';

export class CreateCompetitionRecordDto {
  @IsNumber()
  player1Id: number;

  @IsNumber()
  player2Id: number;

  @IsString()
  mode: string;

  @IsNumber()
  winnerId: number;

  @IsNumber()
  player1Score: number;

  @IsNumber()
  player2Score: number;

  @IsNumber()
  player1Correct: number;

  @IsNumber()
  player2Correct: number;

  @IsNumber()
  player1Time: number;

  @IsNumber()
  player2Time: number;

  @IsObject()
  settings: {
    calculationTypes: string[];
    questionCount: number;
    digits: number;
    hasRemainder: boolean;
    hasTimeLimit: boolean;
    timeLimitSeconds: number;
  };

  @IsArray()
  player1Questions: any[];

  @IsArray()
  player2Questions: any[];
}
