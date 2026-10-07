import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { FilmSchedule } from '../films/schemas/film.schema';
import { FilmRepository } from '../repository/film.repository';
import {
  OrderRequestDto,
  OrderResponseDto,
  TicketRequestDto,
  TicketResponseDto,
} from './dto/order.dto';

interface SeatReservation {
  film: string;
  session: string;
  seat: string;
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsRepository: FilmRepository) {}

  async create(order: OrderRequestDto): Promise<OrderResponseDto> {
    const { tickets } = order;
    this.ensureNoDuplicateSeats(tickets);

    const schedules = new Map<string, FilmSchedule>();
    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}`;
      if (schedules.has(key)) {
        continue;
      }

      const film = await this.filmsRepository.findById(ticket.film);
      if (!film) {
        throw new NotFoundException(`Film "${ticket.film}" was not found`);
      }

      const session = film.schedule.find(
        (schedule) => schedule.id === ticket.session,
      );
      if (!session) {
        throw new NotFoundException(
          `Session "${ticket.session}" was not found for film "${ticket.film}"`,
        );
      }

      schedules.set(key, session);
    }

    this.validateSeatBounds(tickets, schedules);

    const reserved: SeatReservation[] = [];
    try {
      for (const ticket of tickets) {
        const seat = `${ticket.row}:${ticket.seat}`;
        if (
          !(await this.filmsRepository.reserveSeat(
            ticket.film,
            ticket.session,
            seat,
          ))
        ) {
          throw new BadRequestException(
            `Seat ${seat} is already booked for session "${ticket.session}"`,
          );
        }

        reserved.push({ film: ticket.film, session: ticket.session, seat });
      }
    } catch (error) {
      await this.releaseReservations(reserved);
      throw error;
    }

    const items: TicketResponseDto[] = tickets.map((ticket) => {
      const session = schedules.get(`${ticket.film}:${ticket.session}`)!;
      return {
        film: ticket.film,
        session: ticket.session,
        row: ticket.row,
        seat: ticket.seat,
        id: randomUUID(),
        daytime: session.daytime,
        price: session.price,
      };
    });

    return { total: items.length, items };
  }

  private ensureNoDuplicateSeats(tickets: TicketRequestDto[]): void {
    const requestedSeats = new Set<string>();
    for (const ticket of tickets) {
      const key = `${ticket.film}:${ticket.session}:${ticket.row}:${ticket.seat}`;
      if (requestedSeats.has(key)) {
        throw new BadRequestException(
          `Seat ${ticket.row}:${ticket.seat} occurs more than once in the order`,
        );
      }
      requestedSeats.add(key);
    }
  }

  private validateSeatBounds(
    tickets: TicketRequestDto[],
    schedules: Map<string, FilmSchedule>,
  ): void {
    for (const ticket of tickets) {
      const schedule = schedules.get(`${ticket.film}:${ticket.session}`)!;
      if (ticket.row > schedule.rows || ticket.seat > schedule.seats) {
        throw new BadRequestException(
          `Seat ${ticket.row}:${ticket.seat} is outside the session seating plan`,
        );
      }
    }
  }

  private async releaseReservations(
    reservations: SeatReservation[],
  ): Promise<void> {
    const results = await Promise.allSettled(
      reservations.map(({ film, session, seat }) =>
        this.filmsRepository.releaseSeat(film, session, seat),
      ),
    );

    if (
      results.some((result) => result.status === 'rejected' || !result.value)
    ) {
      throw new InternalServerErrorException(
        'The order failed and one or more reserved seats could not be released',
      );
    }
  }
}
