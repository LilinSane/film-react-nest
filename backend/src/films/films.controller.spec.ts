import { Test, TestingModule } from '@nestjs/testing';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: {
    findAll: jest.Mock;
    findSchedule: jest.Mock;
  };

  beforeEach(async () => {
    filmsService = {
      findAll: jest.fn(),
      findSchedule: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [{ provide: FilmsService, useValue: filmsService }],
    }).compile();

    controller = module.get<FilmsController>(FilmsController);
  });

  it('returns all films from the service', async () => {
    const response = { total: 1, items: [{ id: 'film-1' }] };
    filmsService.findAll.mockResolvedValue(response);

    await expect(controller.findAll()).resolves.toBe(response);
    expect(filmsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('passes the film id to the schedule service method', async () => {
    const response = { total: 0, items: [] };
    filmsService.findSchedule.mockResolvedValue(response);

    await expect(controller.findSchedule('film-1')).resolves.toBe(response);
    expect(filmsService.findSchedule).toHaveBeenCalledWith('film-1');
  });
});
