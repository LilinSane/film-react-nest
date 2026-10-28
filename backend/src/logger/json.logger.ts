import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  formatMessage(level: string, message: any, ...optionalParams: any[]) {
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

  log(message: any, ...optionalParams: any[]) {
    this.write('log', message, optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.write('error', message, optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.write('warn', message, optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.write('debug', message, optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.write('verbose', message, optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]) {
    this.write('fatal', message, optionalParams);
  }

  private write(level: string, message: any, optionalParams: any[]) {
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
