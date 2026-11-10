package com.youngwoo.tick.account.application

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.repository.AccountRepository
import java.math.BigInteger

class AccountService(
    private val accountRepository: AccountRepository
) {
    fun openAccount(ownerId: Long): Long {
        val account = Account(0, ownerId)
        accountRepository.save(account)
        return account.id
    }
    fun getBalance(id: Long, ownerId: Long): BigInteger {
        val account = accountRepository.findByIdAndOwnerId(id, ownerId)
        return account.balance
    }
}