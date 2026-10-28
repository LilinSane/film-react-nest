import { Injectable, LoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  formatMessage(
    level: LogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const seen = new WeakSet<object>();
    return JSON.stringify({ level, message, optionalParams }, (_key, value) => {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (value && typeof value === 'object') {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    });
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.write('log', message, optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.write('error', message, optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.write('warn', message, optionalParams);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.write('debug', message, optionalParams);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.write('fatal', message, optionalParams);
  }

  private write(
    level: LogLevel,
    message: unknown,
    optionalParams: unknown[],
  ): void {
    const formattedMessage = this.formatMessage(
      level,
      message,
      ...optionalParams,
    );
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'debug':
      case 'verbose':
        console.debug(formattedMessage);
        break;
      default:
        console.log(formattedMessage);
    }
  }
}
