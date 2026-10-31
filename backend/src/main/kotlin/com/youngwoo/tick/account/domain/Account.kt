package com.youngwoo.tick.account.domain

import com.youngwoo.tick.TickException
import java.math.BigInteger

class Account(private val id: Long, private val ownerId: Long) {
    var balance: BigInteger = BigInteger.ZERO
        private set

    fun deposit(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 입금 금액은 음수일 수 없습니다.")
        balance += amount
    }

    fun withdraw(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 출금 금액은 음수일 수 없습니다.")
        if(balance < amount)
            throw TickException("계좌의 잔액보다 큰 금액을 출금할 수 없습니다.")
        balance -= amount
    }
}