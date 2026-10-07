import { Controller, Get, Param } from '@nestjs/common';
import { FilmScheduleListDto, FilmsDto } from './dto/films.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  findAll(): Promise<FilmsDto> {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  findSchedule(@Param('id') id: string): Promise<FilmScheduleListDto> {
    return this.filmsService.findSchedule(id);
  }
}
