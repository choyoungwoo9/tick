package com.youngwoo.tick.account.domain.repository

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountSummary

interface AccountRepository {
    fun findByIdAndOwnerId(id: Long, ownerId: Long): Account
    fun findAllByOwnerId(ownerId: Long): List<AccountSummary>
    fun save(account: Account): Account
}
