package com.youngwoo.tick.account.repository

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.TransactionType
import com.youngwoo.tick.account.domain.repository.AccountRepository
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@ActiveProfiles("test")
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
}
