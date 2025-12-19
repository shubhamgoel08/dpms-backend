import {
  GenericContainer,
  StartedTestContainer,
  Wait,
} from 'testcontainers';

export class TestDatabaseHelper {
  private static mysqlContainer: StartedTestContainer | null = null;

  static async setupTestMysql(): Promise<StartedTestContainer> {
    if (this.mysqlContainer) {
      return this.mysqlContainer;
    }

    console.log('Starting MySQL test container...');

    const container = new GenericContainer('mysql:8.0')
      .withExposedPorts(3306)
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: 'test_root_password',
        MYSQL_DATABASE: 'test_db',
        MYSQL_USER: 'test_user',
        MYSQL_PASSWORD: 'test_password',
      })
      .withStartupTimeout(120000)
      .withWaitStrategy(
        Wait.forLogMessage(/.*mysqld: ready for connections.*/, 2),
      )
      .withCommand([
        '--character-set-server=utf8mb4',
        '--collation-server=utf8mb4_unicode_ci',
      ]);

    this.mysqlContainer = await container.start();

    console.log('MySQL test container started successfully');

    return this.mysqlContainer;
  }

  static async getMysqlConfig(): Promise<{
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  }> {
    if (!this.mysqlContainer) {
      throw new Error('MySQL container not started');
    }

    return {
      host: this.mysqlContainer.getHost(),
      port: this.mysqlContainer.getMappedPort(3306),
      username: 'test_user',
      password: 'test_password',
      database: 'test_db',
    };
  }

  static async teardownTestMysql(): Promise<void> {
    if (this.mysqlContainer) {
      console.log('Stopping MySQL test container...');
      await this.mysqlContainer.stop();
      this.mysqlContainer = null;
      console.log('MySQL test container stopped');
    }
  }
}
