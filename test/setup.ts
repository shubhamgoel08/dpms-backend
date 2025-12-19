import {GenericContainer, StartedTestContainer} from 'testcontainers'

let mysqlContainer: StartedTestContainer | null = null

export const setupTestMysql = async (): Promise<StartedTestContainer> => {
  const container = await new GenericContainer('mysql:8.0')
    .withExposedPorts(3306)
    .withEnvironment({
      MYSQL_ROOT_PASSWORD: 'test_root_password',
      MYSQL_USER: 'test_user',
      MYSQL_PASSWORD: 'test_password',
      MYSQL_DATABASE: 'test_db',
    })
    .withStartupTimeout(120000)
    .withCommand(['--character-set-server=utf8mb4'])
    .start()

  mysqlContainer = container
  return container
}

export const teardownTestMysql = async (): Promise<void> => {
  if (mysqlContainer) {
    await mysqlContainer.stop()
    mysqlContainer = null
  }
}

export const getTestDatabaseConfig = (container: StartedTestContainer) => ({
  host: container.getHost(),
  port: container.getMappedPort(3306),
  username: 'test_user',
  password: 'test_password',
  database: 'test_db',
})

