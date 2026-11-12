package com.youngwoo.tick.account.application

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.repository.AccountRepository
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class AccountServiceTest {
    private val accountRepository = mockk<AccountRepository>()
    private val accountService = AccountService(accountRepository)

    private val ownerId = 1L
    private val accountId = 1L
    private val savedAccount = Account(ownerId).apply{
        this.id = accountId
    }

    @Test
    fun `계좌를 개설할 수 있다`(){
        every {
            accountRepository.save(any())
        } returns savedAccount

        every {
            accountRepository.findByIdAndOwnerId(any(), any())
        } returns savedAccount

        val accountId = accountService.openAccount(ownerId)
        assertEquals(accountId, 1L)

        val balance = accountService.getBalance(accountId, ownerId)
        assertEquals(balance, 0.toBigInteger())
    }

    @Test
    fun `계좌에 입출금을 할 수 있다`(){
        every {
            accountRepository.findByIdAndOwnerId(accountId, ownerId)
        } returns savedAccount

        every {
            accountRepository.save(savedAccount)
        } returns savedAccount

        accountService.deposit(accountId, ownerId, 1000.toBigInteger())
        var balance = accountService.getBalance(accountId, ownerId)
        assertEquals(balance, 1000.toBigInteger())

        accountService.withdraw(accountId, ownerId, 500.toBigInteger())
        balance = accountService.getBalance(accountId, ownerId)
        assertEquals(balance, 500.toBigInteger())
    }

    @Test
    fun `계좌의 입출금 이력을 조회할 수 있다`(){
        savedAccount.deposit(1000.toBigInteger())
        savedAccount.withdraw(500.toBigInteger())
        val expected = savedAccount.transactions

        every {
            accountRepository.findByIdAndOwnerId(accountId, ownerId)
        } returns savedAccount

        val actual = accountService.getTransactions(accountId, ownerId)
        assertEquals(
            expected.groupingBy{it}.eachCount(),
            actual.groupingBy{it}.eachCount()
        )
    }
}
