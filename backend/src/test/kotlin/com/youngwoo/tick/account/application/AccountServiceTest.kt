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

    @Test
    fun `계좌를 개설할 수 있다`(){
        val savedAccount = Account(1L, ownerId)

        every {
            accountRepository.save(any())
        } returns savedAccount

        every {
            accountRepository.findByIdAndOwnerId(any(), any())
        } returns savedAccount

        val accountId = accountService.openAccount(ownerId)
        assertEquals(accountId, 0)

        val balance = accountService.getBalance(accountId, ownerId)
        assertEquals(balance, 0.toBigInteger())
    }

    @Test
    fun `계좌에 입출금을 할 수 있다`(){

    }

    @Test
    fun `계좌의 입출금 이력을 조회할 수 있다`(){

    }
}