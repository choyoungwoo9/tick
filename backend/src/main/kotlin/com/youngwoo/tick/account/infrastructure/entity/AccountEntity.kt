package com.youngwoo.tick.account.infrastructure.entity

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountTransaction
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OrderBy
import jakarta.persistence.OneToMany
import jakarta.persistence.Table

@Entity
@Table(name = "accounts")
open class AccountEntity(
    @field:Column(name = "owner_id", nullable = false)
    open var ownerId: Long
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
        val transactions = this.transactions.map {
            it.domain()
        }.toMutableList()
        return Account.restore(id ?: 0L, ownerId, balance.toBigInteger(), transactions)
    }

    companion object {
        fun from(account: Account): AccountEntity = AccountEntity(account.ownerId).apply {
            id = account.id.takeIf { it != 0L }
            balance = account.balance.toString()
        }
    }
}
