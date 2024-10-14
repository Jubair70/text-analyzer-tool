import { TextAnalysisDto } from './text-analysis.dto';

export class UserReportDto {
  userId: number;
  texts: TextAnalysisDto[];
}