package com.youngwoo.tick.account.domain

import java.math.BigInteger
import java.time.LocalDateTime

data class AccountTransaction(
    val type: TransactionType,
    val amount: BigInteger,
    val transactedAt: LocalDateTime
)

enum class TransactionType {
    DEPOSIT, WITHDRAW
}