package com.youngwoo.tick.account.domain.model

import com.youngwoo.tick.TickException
import java.math.BigInteger
import java.time.LocalDateTime

class Account(
    val ownerId: Long,
    val name: String = "모의 계좌",
    val openedAt: LocalDateTime = LocalDateTime.now()
) {
    var id: Long = 0
    var balance: BigInteger = BigInteger.ZERO
        private set
    var accountNumber: String? = null
        private set
    private var _transactions: MutableList<AccountTransaction> = mutableListOf()

    val transactions: List<AccountTransaction>
        get() = _transactions.toMutableList()

    fun assignAccountNumber(accountNumber: String) {
        if (accountNumber.isBlank()) {
            throw TickException("계좌 번호는 비어 있을 수 없습니다.")
        }
        if (this.accountNumber != null) {
            throw TickException("계좌 번호가 이미 발급되었습니다.")
        }
        this.accountNumber = accountNumber
    }

    fun deposit(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 입금 금액은 음수일 수 없습니다.", code = "INVALID_AMOUNT")
        balance += amount
        _transactions.add(
            AccountTransaction(
                TransactionType.DEPOSIT,
                amount,
                LocalDateTime.now(),
                balanceAfter = balance
            ))
    }

    fun withdraw(amount: BigInteger){
        if(amount < BigInteger.ZERO)
            throw TickException("계좌 출금 금액은 음수일 수 없습니다.", code = "INVALID_AMOUNT")
        if(balance < amount)
            throw TickException("계좌의 잔액보다 큰 금액을 출금할 수 없습니다.", code = "INSUFFICIENT_BALANCE")
        balance -= amount
        _transactions.add(
            AccountTransaction(
                TransactionType.WITHDRAW,
                amount,
                LocalDateTime.now(),
                balanceAfter = balance
            ))
    }

    companion object {
        fun restore(
            id: Long,
            ownerId: Long,
            name: String,
            accountNumber: String?,
            openedAt: LocalDateTime,
            balance: BigInteger,
            transactions: MutableList<AccountTransaction>
        ): Account {
            val account = Account(ownerId, name, openedAt)
            account.id = id
            account.accountNumber = accountNumber
            account.balance = balance
            account._transactions = transactions
            return account
        }
    }
}
