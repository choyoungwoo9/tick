package com.youngwoo.tick.account.domain.repository

import com.youngwoo.tick.account.domain.model.Account

interface AccountRepository {
    fun findByOwnerId(ownerId: Long): Account?
    fun save(account: Account): Account
}