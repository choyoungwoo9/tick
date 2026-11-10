package com.youngwoo.tick.account.application

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.repository.AccountRepository
import java.math.BigInteger

class AccountService(
    private val accountRepository: AccountRepository
) {
    fun openAccount(ownerId: Long): Long {
        val account = Account(ownerId)
        val savedAccount = accountRepository.save(account)
        return savedAccount.id
    }

    fun getBalance(accountId: Long, ownerId: Long): BigInteger {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        return account.balance
    }

    fun deposit(accountId: Long, ownerId: Long, amount: BigInteger) {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.deposit(amount)
        accountRepository.save(account)
    }

    fun withdraw(accountId: Long, ownerId: Long, amount: BigInteger) {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.withdraw(amount)
        accountRepository.save(account)
    }
}