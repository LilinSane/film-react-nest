import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
    jest.restoreAllMocks();
  });

  it('formats entries as flat tab-separated string fields', () => {
    const output = logger.formatMessage('log', 'Started', { port: 3000 });
    const fields = output.split('\t');

    expect(fields).toHaveLength(4);
    expect(fields[0]).toMatch(/^time=\d{4}-\d{2}-\d{2}T/);
    expect(fields[1]).toBe('level=log');
    expect(fields[2]).toBe('message=Started');
    expect(fields[3]).toBe('optionalParam1={"port":3000}');
  });

  it('escapes characters that would break the record format', () => {
    const output = logger.formatMessage('warn', 'first\tsecond\nline=value');

    expect(output).not.toContain('\n');
    expect(output.split('\t')).toHaveLength(3);
    expect(output).toContain('message=first\\tsecond\\nline\\=value');
  });

  it('serializes errors and circular values safely', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    const output = logger.formatMessage(
      'error',
      new Error('Request failed'),
      circular,
    );

    expect(output).toContain('level=error');
    expect(output).toContain('Request failed');
    expect(output).toContain('optionalParam1={"self":"[Circular]"}');
  });

  it.each([
    ['log', 'log'],
    ['error', 'error'],
    ['warn', 'warn'],
    ['debug', 'log'],
    ['verbose', 'log'],
    ['fatal', 'error'],
  ] as const)('writes %s messages using console.%s', (level, consoleMethod) => {
    const consoleSpy = jest
      .spyOn(console, consoleMethod)
      .mockImplementation(() => undefined);

    logger[level]('Test message');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`level=${level}`),
    );
  });
});
