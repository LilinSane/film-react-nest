import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  formatMessage(level: string, message: any, ...optionalParams: any[]) {
    const fields: [string, string][] = [
      ['time', new Date().toISOString()],
      ['level', level],
      ['message', this.toLogString(message)],
    ];

    optionalParams.forEach((param, index) => {
      fields.push([`optionalParam${index + 1}`, this.toLogString(param)]);
    });

    return fields
      .map(([key, value]) => `${key}=${this.escapeValue(value)}`)
      .join('\t');
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
    const line = this.formatMessage(level, message, ...optionalParams);
    if (level === 'error' || level === 'fatal') {
      console.error(line);
    } else if (level === 'warn') {
      console.warn(line);
    } else {
      console.log(line);
    }
  }

  private toLogString(value: any): string {
    if (value instanceof Error) {
      return value.stack ?? `${value.name}: ${value.message}`;
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'undefined') {
      return 'undefined';
    }
    if (typeof value === 'bigint') {
      return value.toString();
    }

    const seen = new WeakSet<object>();
    const serialized = JSON.stringify(value, (_key, nestedValue) => {
      if (typeof nestedValue === 'bigint') {
        return nestedValue.toString();
      }
      if (nestedValue && typeof nestedValue === 'object') {
        if (seen.has(nestedValue)) {
          return '[Circular]';
        }
        seen.add(nestedValue);
      }
      return nestedValue;
    });
    return serialized === undefined ? String(value) : serialized;
  }

  private escapeValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/=/g, '\\=');
  }
}
