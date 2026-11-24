package com.youngwoo.tick.account.api

import com.youngwoo.tick.account.domain.model.Account
import com.youngwoo.tick.account.domain.model.AccountSummary
import com.youngwoo.tick.account.domain.model.AccountTransaction
import com.youngwoo.tick.account.domain.model.TransactionType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class CreateAccountRequest(
    @field:NotBlank(message = "name은 필수입니다.")
    @field:Size(max = 24, message = "name은 24자 이하여야 합니다.")
    val name: String
)

data class AccountResponse(
    val accountId: Long,
    val name: String,
    val number: String,
    val balance: String,
    val openedAt: LocalDateTime
) {
    companion object {
        fun from(account: Account): AccountResponse = AccountResponse(
            accountId = account.id,
            name = account.name,
            number = account.accountNumber
                ?: throw IllegalStateException("저장된 계좌에 번호가 없습니다."),
            balance = account.balance.toString(),
            openedAt = account.openedAt
        )

        fun from(account: AccountSummary): AccountResponse = AccountResponse(
            accountId = account.id,
            name = account.name,
            number = account.accountNumber,
            balance = account.balance.toString(),
            openedAt = account.openedAt
        )
    }
}

data class CreateTransactionRequest(
    val type: TransactionType,
    @field:NotBlank(message = "amount는 필수입니다.")
    @field:Pattern(regexp = "^[0-9]+$", message = "amount는 0 이상의 정수 문자열이어야 합니다.")
    val amount: String
)

data class TransactionResponse(
    val transactionId: Long,
    val type: TransactionType,
    val amount: String,
    val balanceAfter: String,
    val transactedAt: LocalDateTime
) {
    companion object {
        fun from(transaction: AccountTransaction): TransactionResponse = TransactionResponse(
            transactionId = transaction.id
                ?: throw IllegalStateException("저장된 거래에는 ID가 필요합니다."),
            type = transaction.type,
            amount = transaction.amount.toString(),
            balanceAfter = transaction.balanceAfter?.toString()
                ?: throw IllegalStateException("저장된 거래에는 거래 후 잔고가 필요합니다."),
            transactedAt = transaction.transactedAt
        )
    }
}

data class ApiErrorResponse(
    val code: String,
    val message: String
)
