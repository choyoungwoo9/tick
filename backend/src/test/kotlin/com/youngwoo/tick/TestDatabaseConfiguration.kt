package com.youngwoo.tick

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.mysql.MySQLContainer
import org.testcontainers.utility.DockerImageName

@TestConfiguration(proxyBeanMethods = false)
class TestDatabaseConfiguration {
    @Bean
    @ServiceConnection
    fun mysqlContainer(): MySQLContainer = MySQLContainer(DockerImageName.parse("mysql:8.4"))
        .withDatabaseName("tick_test")
        .withUsername("tick_test")
        .withPassword("tick-test-local")
        .withInitScript("schema.sql")
        .withCommand("--character-set-server=utf8mb4", "--collation-server=utf8mb4_0900_ai_ci")
}
