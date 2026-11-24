package com.youngwoo.tick.account.application

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountSummary
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
    fun openAccount(ownerId: Long, name: String = "모의 계좌"): Account {
        val savedAccount = accountRepository.save(Account(ownerId, name))
        savedAccount.assignAccountNumber(accountNumberFor(savedAccount.id))
        return accountRepository.save(savedAccount)
    }

    @Transactional(readOnly = true)
    fun getAccount(accountId: Long, ownerId: Long): Account =
        accountRepository.findByIdAndOwnerId(accountId, ownerId)

    @Transactional(readOnly = true)
    fun getAccounts(ownerId: Long): List<AccountSummary> =
        accountRepository.findAllByOwnerId(ownerId)

    @Transactional(readOnly = true)
    fun getBalance(accountId: Long, ownerId: Long): BigInteger {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        return account.balance
    }

    @Transactional
    fun deposit(accountId: Long, ownerId: Long, amount: BigInteger): AccountTransaction {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.deposit(amount)
        return accountRepository.save(account).transactions.last()
    }

    @Transactional
    fun withdraw(accountId: Long, ownerId: Long, amount: BigInteger): AccountTransaction {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        account.withdraw(amount)
        return accountRepository.save(account).transactions.last()
    }

    @Transactional(readOnly = true)
    fun getTransactions(accountId: Long, ownerId: Long): List<AccountTransaction> {
        val account = accountRepository.findByIdAndOwnerId(accountId, ownerId)
        return account.transactions
    }

    private fun accountNumberFor(accountId: Long): String =
        "TICK 2000-${accountId.toString().padStart(4, '0')}"
}
