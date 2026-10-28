import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
    jest.restoreAllMocks();
  });

  it('formats a log entry as JSON with the level, message, and optional parameters', () => {
    const output = logger.formatMessage('log', 'Started', { port: 3000 });

    expect(JSON.parse(output)).toEqual({
      level: 'log',
      message: 'Started',
      optionalParams: [{ port: 3000 }],
    });
  });

  it('serializes errors and circular references safely', () => {
    const circular: { self?: unknown } = {};
    circular.self = circular;

    const output = logger.formatMessage(
      'error',
      new Error('Request failed'),
      circular,
    );
    const entry = JSON.parse(output);

    expect(entry.message).toMatchObject({
      name: 'Error',
      message: 'Request failed',
    });
    expect(entry.optionalParams).toEqual([{ self: '[Circular]' }]);
  });

  it.each([
    ['log', 'log'],
    ['error', 'error'],
    ['warn', 'warn'],
    ['debug', 'debug'],
    ['verbose', 'debug'],
    ['fatal', 'error'],
  ] as const)('writes %s messages using console.%s', (level, consoleMethod) => {
    const consoleSpy = jest
      .spyOn(console, consoleMethod)
      .mockImplementation(() => undefined);

    logger[level]('Test message');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining(`"level":"${level}"`),
    );
  });
});
