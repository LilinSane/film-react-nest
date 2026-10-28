import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { OrderRequestDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: {
    create: jest.Mock;
  };

  beforeEach(async () => {
    orderService = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: OrderService, useValue: orderService }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('passes the order to the service and returns its response', async () => {
    const order: OrderRequestDto = {
      email: 'user@example.com',
      phone: '+10000000000',
      tickets: [{ film: 'film-1', session: 'session-1', row: 1, seat: 2 }],
    };
    const response = { total: 1, items: [{ id: 'ticket-1' }] };
    orderService.create.mockResolvedValue(response);

    await expect(controller.create(order)).resolves.toBe(response);
    expect(orderService.create).toHaveBeenCalledWith(order);
  });
});
