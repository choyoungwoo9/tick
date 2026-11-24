package com.youngwoo.tick.account.infrastructure.entity

import com.youngwoo.tick.account.domain.model.AccountTransaction
import com.youngwoo.tick.account.domain.model.TransactionType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "account_transactions")
open class AccountTransactionEntity(
    @field:Column(name = "type", nullable = false, length = 20)
    open var type: String,
    @field:Column(name = "amount", nullable = false, columnDefinition = "LONGTEXT")
    open var amount: String,
    @field:Column(name = "transacted_at", nullable = false)
    open var transactedAt: LocalDateTime,

    @field:ManyToOne(fetch = FetchType.LAZY)
    @field:JoinColumn(name = "account_id", nullable = false)
    open var account: AccountEntity
) {
    @field:Id
    @field:GeneratedValue(strategy = GenerationType.IDENTITY)
    open var id: Long? = null

    fun domain(): AccountTransaction = AccountTransaction(
        type = TransactionType.valueOf(type),
        amount = amount.toBigInteger(),
        transactedAt = transactedAt,
        id = id
    )

    companion object {
        fun from(transaction: AccountTransaction, account: AccountEntity): AccountTransactionEntity =
            AccountTransactionEntity(
                type = transaction.type.name,
                amount = transaction.amount.toString(),
                transactedAt = transaction.transactedAt,
                account = account
            )
    }
}
