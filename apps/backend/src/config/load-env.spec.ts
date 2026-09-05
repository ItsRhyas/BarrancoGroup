const mockedExistsSync = jest.fn((path: unknown) => Boolean(path));

jest.mock('node:fs', () => ({
  existsSync: (path: unknown) => mockedExistsSync(path),
}));

describe('loadEnv', () => {
  const originalEnv = process.env;
  let loadEnv: () => void;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NODE_ENV;
    mockedExistsSync.mockReset();

    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('./load-env') as typeof import('./load-env');
      loadEnv = mod.loadEnv;
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  function mockLoadEnvFile() {
    return jest
      .spyOn(process, 'loadEnvFile')
      .mockImplementation(() => undefined);
  }

  it('loads root .env in development mode', () => {
    mockedExistsSync.mockImplementation((path) =>
      String(path).endsWith('pnpm-workspace.yaml'),
    );

    const spy = mockLoadEnvFile();
    loadEnv();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/\.env$/));
  });

  it('does nothing in production', () => {
    process.env.NODE_ENV = 'production';
    mockedExistsSync.mockImplementation((path) =>
      String(path).endsWith('pnpm-workspace.yaml'),
    );

    const spy = mockLoadEnvFile();
    loadEnv();

    expect(spy).not.toHaveBeenCalled();
  });

  it('swallows ENOENT when .env is missing', () => {
    mockedExistsSync.mockImplementation((path) =>
      String(path).endsWith('pnpm-workspace.yaml'),
    );

    jest.spyOn(process, 'loadEnvFile').mockImplementation(() => {
      const error = new Error('ENOENT') as NodeJS.ErrnoException;
      error.code = 'ENOENT';
      throw error;
    });

    expect(() => loadEnv()).not.toThrow();
  });

  it('is idempotent across multiple calls', () => {
    mockedExistsSync.mockImplementation((path) =>
      String(path).endsWith('pnpm-workspace.yaml'),
    );

    const spy = mockLoadEnvFile();
    loadEnv();
    loadEnv();

    expect(spy).toHaveBeenCalledTimes(1);
  });
});
