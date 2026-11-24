package com.youngwoo.tick.account.domain.model

import java.math.BigInteger
import java.time.LocalDateTime

data class AccountSummary(
    val id: Long,
    val ownerId: Long,
    val name: String,
    val accountNumber: String,
    val balance: BigInteger,
    val openedAt: LocalDateTime
)
