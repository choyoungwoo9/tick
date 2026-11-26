package com.youngwoo.tick.account.repository

import com.youngwoo.tick.TestDatabaseConfiguration
import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.TransactionType
import com.youngwoo.tick.account.domain.repository.AccountRepository
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
@Import(TestDatabaseConfiguration::class)
@Transactional
class AccountRepositoryTest @Autowired constructor(
    private val accountRepository: AccountRepository,
    private val entityManager: EntityManager
) {
    val ownerId = 1L

    @Test
    fun `계좌를 저장할 수 있다`(){
        val account = Account(ownerId)
        account.deposit(500.toBigInteger())
        val savedAccount = accountRepository.save(account)

        entityManager.flush()
        entityManager.clear()

        val actual = accountRepository.findByIdAndOwnerId(savedAccount.id, ownerId)

        assertTrue(savedAccount.id > 0)
        assertEquals(savedAccount.id, actual.id)
        assertEquals(ownerId, actual.ownerId)
        assertEquals(500.toBigInteger(), actual.balance)
        assertEquals(1, actual.transactions.size)
        assertEquals(TransactionType.DEPOSIT, actual.transactions.single().type)
        assertEquals(500.toBigInteger(), actual.transactions.single().amount)
    }

    @Test
    fun `기존 계좌를 저장하면 기존 거래는 유지하고 새 거래만 추가한다`() {
        val account = Account(ownerId)
        account.deposit(500.toBigInteger())
        val savedAccount = accountRepository.save(account)

        entityManager.flush()
        entityManager.clear()

        val accountWithHistory = accountRepository.findByIdAndOwnerId(savedAccount.id, ownerId)
        val existingTransactionId = accountWithHistory.transactions.single().id
            ?: error("저장된 거래에 ID가 없습니다.")
        accountWithHistory.deposit(300.toBigInteger())
        accountRepository.save(accountWithHistory)

        entityManager.flush()
        entityManager.clear()

        val actual = accountRepository.findByIdAndOwnerId(savedAccount.id, ownerId)
        val transactions = actual.transactions

        assertEquals(800.toBigInteger(), actual.balance)
        assertEquals(2, transactions.size)
        assertEquals(listOf(TransactionType.DEPOSIT, TransactionType.DEPOSIT), transactions.map { it.type })
        assertEquals(listOf(500.toBigInteger(), 300.toBigInteger()), transactions.map { it.amount })
        assertEquals(listOf(500.toBigInteger(), 800.toBigInteger()), transactions.map { it.balanceAfter })
        assertEquals(existingTransactionId, transactions.first().id)
        assertTrue(transactions.last().id!! > existingTransactionId)
    }
}
