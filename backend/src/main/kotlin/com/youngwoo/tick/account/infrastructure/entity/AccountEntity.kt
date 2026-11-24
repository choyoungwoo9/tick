package com.youngwoo.tick.account.infrastructure.entity

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountSummary
import com.youngwoo.tick.account.domain.model.AccountTransaction
import com.youngwoo.tick.account.domain.model.TransactionType
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OrderBy
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.math.BigInteger
import java.time.LocalDateTime

@Entity
@Table(name = "accounts")
open class AccountEntity(
    @field:Column(name = "owner_id", nullable = false)
    open var ownerId: Long,
    @field:Column(name = "name", nullable = false, length = 24)
    open var name: String,
    @field:Column(name = "account_number", unique = true, length = 32)
    open var accountNumber: String? = null,
    @field:Column(name = "opened_at", nullable = false)
    open var openedAt: LocalDateTime = LocalDateTime.now()
) {
    @field:Id
    @field:GeneratedValue(strategy = GenerationType.IDENTITY)
    open var id: Long? = null

    @field:Column(name = "balance", nullable = false, columnDefinition = "LONGTEXT")
    open var balance: String = "0"

    @field:OneToMany(mappedBy = "account", cascade = [CascadeType.ALL])
    @field:OrderBy("id ASC")
    open var transactions: MutableList<AccountTransactionEntity> = mutableListOf()

    fun addTransaction(transaction: AccountTransaction) {
        transactions.add(AccountTransactionEntity.from(transaction, this))
    }

    fun domain(): Account {
        val domainTransactions = this.transactions.map {
            it.domain()
        }
        val netChange = domainTransactions.fold(BigInteger.ZERO) { total, transaction ->
            total + signedAmount(transaction)
        }
        var transactionBalance = balance.toBigInteger() - netChange
        val transactions = domainTransactions.map { transaction ->
            transactionBalance += signedAmount(transaction)
            transaction.copy(balanceAfter = transactionBalance)
        }.toMutableList()
        return Account.restore(
            id = id ?: 0L,
            ownerId = ownerId,
            name = name,
            accountNumber = accountNumber,
            openedAt = openedAt,
            balance = balance.toBigInteger(),
            transactions = transactions
        )
    }

    private fun signedAmount(transaction: AccountTransaction): BigInteger =
        if (transaction.type == TransactionType.DEPOSIT) transaction.amount else transaction.amount.negate()

    fun summary(): AccountSummary = AccountSummary(
        id = id ?: 0L,
        ownerId = ownerId,
        name = name,
        accountNumber = accountNumber
            ?: throw IllegalStateException("저장된 계좌에 번호가 없습니다."),
        balance = balance.toBigInteger(),
        openedAt = openedAt
    )

    companion object {
        fun from(account: Account): AccountEntity = AccountEntity(
            ownerId = account.ownerId,
            name = account.name,
            accountNumber = account.accountNumber,
            openedAt = account.openedAt
        ).apply {
            id = account.id.takeIf { it != 0L }
            balance = account.balance.toString()
        }
    }
}
