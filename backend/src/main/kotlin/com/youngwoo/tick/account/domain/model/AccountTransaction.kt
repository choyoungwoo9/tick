package com.youngwoo.tick.account.domain.model

import java.math.BigInteger
import java.time.LocalDateTime

data class AccountTransaction(
    val type: TransactionType,
    val amount: BigInteger,
    val transactedAt: LocalDateTime,
    val id: Long? = null,
    val balanceAfter: BigInteger? = null
)

enum class TransactionType {
    DEPOSIT, WITHDRAW
}
