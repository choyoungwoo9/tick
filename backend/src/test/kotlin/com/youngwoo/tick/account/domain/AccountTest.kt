package com.youngwoo.tick.account.domain

import com.youngwoo.tick.TickException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.math.BigInteger

class AccountTest {
    private val accountId = 1L
    private val ownerId = 1L

    @Test
    fun `개설한 계좌의 잔고는 0원이다`(){
        val account = Account(accountId, ownerId)
        assertEquals(0L.toBigInteger(), account.balance)
    }

    @Test
    fun `입금 시 입금액만큼 계좌의 잔고가 증가한다`(){
        val account = Account(accountId, ownerId)
        account.deposit(30000.toBigInteger())
        assertEquals(30000.toBigInteger(), account.balance)
        account.deposit(30000.toBigInteger())
        assertEquals(60000.toBigInteger(), account.balance)
    }

    @Test
    fun `출금 시 출금액만큼 계좌의 잔고가 감소한다`(){
        val account = Account(accountId, ownerId)
        account.deposit(60000.toBigInteger())
        account.withdraw(30000.toBigInteger())
        assertEquals(30000.toBigInteger(), account.balance)
        account.withdraw(30000.toBigInteger())
        assertEquals(0.toBigInteger(), account.balance)
    }

    @Test
    fun `계좌의 잔액보다 많은 금액을 출금 시 실패한다`(){
        val account = Account(accountId, ownerId)
        account.deposit(60000.toBigInteger())
        assertThrows<TickException> {
            account.withdraw(70000.toBigInteger())
        }
        account.withdraw(60000.toBigInteger())
        assertEquals(0.toBigInteger(), account.balance)
    }

    @Test
    fun `Long 표현범위보다 큰 금액을 입출금할 수 있다`(){
        val account = Account(accountId, ownerId)
        val amount = BigInteger.valueOf(Long.MAX_VALUE).add(BigInteger.ONE)
        account.deposit(amount)
        assertEquals(amount, account.balance)

        val withdrawAmount = BigInteger.valueOf(Long.MAX_VALUE)
        account.withdraw(withdrawAmount)
        assertEquals(BigInteger.ONE, account.balance)
    }

    @Test
    fun `음수를 입출금 할 수 없다`(){
        val account = Account(accountId, ownerId)
        val minusAmount = (-1).toBigInteger()
        assertThrows<TickException> {
            account.deposit(minusAmount)
        }
        assertThrows<TickException> {
            account.withdraw(minusAmount)
        }
    }
}
