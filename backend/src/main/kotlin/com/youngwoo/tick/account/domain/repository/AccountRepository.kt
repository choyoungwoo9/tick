package com.youngwoo.tick.account.domain.repository

import com.youngwoo.tick.account.domain.model.Account

interface AccountRepository {
    fun findByIdAndOwnerId(id: Long, ownerId: Long): Account
    fun save(account: Account): Account
}