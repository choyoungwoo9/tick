package com.youngwoo.tick.account.domain

import com.youngwoo.tick.TickException
import java.math.BigInteger
import java.time.LocalDateTime

class Account(private val id: Long, private val ownerId: Long) {
    var balance: BigInteger = BigInteger.ZERO
        private set
    private val _transactions: MutableList<AccountTransaction> = mutableListOf()

    val transactions: List<AccountTransaction>
        get() = _transactions.toMutableList()


    fun deposit(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 입금 금액은 음수일 수 없습니다.")
        balance += amount
        _transactions.add(
            AccountTransaction(
                TransactionType.DEPOSIT,
                amount,
                LocalDateTime.now()
            ))
    }

    fun withdraw(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 출금 금액은 음수일 수 없습니다.")
        if(balance < amount)
            throw TickException("계좌의 잔액보다 큰 금액을 출금할 수 없습니다.")
        balance -= amount
        _transactions.add(
            AccountTransaction(
                TransactionType.WITHDRAW,
                amount,
                LocalDateTime.now()
            ))
    }
}