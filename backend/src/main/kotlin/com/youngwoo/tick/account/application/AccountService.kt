package com.youngwoo.tick.account.application

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountTransaction
import com.youngwoo.tick.account.domain.repository.AccountRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigInteger

@Service
class AccountService(
    private val accountRepository: AccountRepository
) {
    @Transactional
    fun openAccount(ownerId: Long): Long {
        val account = Account(ownerId)
        val savedAccount = accountRepository.save(account)
        return savedAccount.id
    }

    @Transactional(readOnly = true)
    fun getBalance(accountId: Long, ownerId: Long): BigInteger {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        return account.balance
    }

    @Transactional
    fun deposit(accountId: Long, ownerId: Long, amount: BigInteger) {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.deposit(amount)
        accountRepository.save(account)
    }

    @Transactional
    fun withdraw(accountId: Long, ownerId: Long, amount: BigInteger) {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.withdraw(amount)
        accountRepository.save(account)
    }

    @Transactional(readOnly = true)
    fun getTransactions(accountId: Long, ownerId: Long): List<AccountTransaction> {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        return account.transactions
    }
}
