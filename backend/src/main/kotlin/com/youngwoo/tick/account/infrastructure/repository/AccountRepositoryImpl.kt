package com.youngwoo.tick.account.infrastructure.repository

import com.youngwoo.tick.TickException
import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountSummary
import com.youngwoo.tick.account.domain.repository.AccountRepository
import com.youngwoo.tick.account.infrastructure.entity.AccountEntity
import com.youngwoo.tick.account.infrastructure.repository.jpa.AccountJpaRepository
import org.springframework.stereotype.Repository

@Repository
class AccountRepositoryImpl(
    private val accountJpaRepository: AccountJpaRepository
) : AccountRepository {
    override fun findByIdAndOwnerId(id: Long, ownerId: Long): Account {
        val accountEntity = accountJpaRepository.findByIdAndOwnerId(id, ownerId)
            ?: throw TickException("계좌를 찾을 수 없습니다.", code = "ACCOUNT_NOT_FOUND")
        return accountEntity.domain()
    }

    override fun findAllByOwnerId(ownerId: Long): List<AccountSummary> =
        accountJpaRepository.findAllByOwnerIdOrderByIdAsc(ownerId).map(AccountEntity::summary)

    override fun save(account: Account): Account {
        val accountEntity = if (account.id == 0L) {
            AccountEntity.from(account).also { entity ->
                account.transactions.forEach(entity::addTransaction)
            }
        } else {
            val existingEntity = accountJpaRepository.findByIdAndOwnerId(account.id, account.ownerId)
                ?: throw TickException("계좌를 찾을 수 없습니다.", code = "ACCOUNT_NOT_FOUND")

            existingEntity.name = account.name
            existingEntity.accountNumber = account.accountNumber
            existingEntity.balance = account.balance.toString()
            account.transactions
                .drop(existingEntity.transactions.size)
                .forEach(existingEntity::addTransaction)
            existingEntity
        }

        return accountJpaRepository.save(accountEntity).domain()
    }
}
