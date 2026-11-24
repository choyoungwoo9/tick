package com.youngwoo.tick.account.infrastructure.repository.jpa

import com.youngwoo.tick.account.infrastructure.entity.AccountEntity
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository

interface AccountJpaRepository : JpaRepository<AccountEntity, Long> {
    @EntityGraph(attributePaths = ["transactions"])
    fun findByIdAndOwnerId(id: Long, ownerId: Long): AccountEntity?
}
