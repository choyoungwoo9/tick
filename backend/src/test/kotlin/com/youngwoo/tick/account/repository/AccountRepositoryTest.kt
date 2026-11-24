package com.youngwoo.tick.account.repository

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.repository.AccountRepository
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.test.context.ActiveProfiles

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AccountRepositoryTest(
    private val accountRepository: AccountRepository,
    private val jdbcTemplate: JdbcTemplate,
    private val entityManager: EntityManager
) {
    val ownerId = 1L

    @Test
    fun `계좌를 저장할 수 있다`(){
        val account = Account(ownerId)
        account.deposit(500.toBigInteger())
        val savedAccount = accountRepository.save(account)

        entityManager.flush()

        val actual = jdbcTemplate.queryForObject(
            "SELECT balance FROM accounts WHERE id = ?",
            String::class.java,
            savedAccount.id
        )

        assertTrue(savedAccount.id > 0)
        assertEquals(savedAccount.balance, 500.toBigInteger())
    }
}