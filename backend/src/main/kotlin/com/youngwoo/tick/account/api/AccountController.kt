package com.youngwoo.tick.account.api

import com.youngwoo.tick.account.application.AccountService
import com.youngwoo.tick.account.domain.model.TransactionType
import jakarta.validation.Valid
import jakarta.validation.constraints.Positive
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.net.URI

@RestController
@RequestMapping("/accounts")
@Validated
class AccountController(
    private val accountService: AccountService
) {
    @PostMapping
    fun openAccount(
        @RequestHeader("X-Owner-Id") @Positive ownerId: Long,
        @Valid @RequestBody request: CreateAccountRequest
    ): ResponseEntity<AccountResponse> {
        val account = accountService.openAccount(ownerId, request.name)
        return ResponseEntity.created(URI.create("/accounts/${account.id}"))
            .body(AccountResponse.from(account))
    }

    @GetMapping
    fun getAccounts(
        @RequestHeader("X-Owner-Id") @Positive ownerId: Long
    ): List<AccountResponse> = accountService.getAccounts(ownerId).map(AccountResponse::from)

    @GetMapping("/{accountId}")
    fun getAccount(
        @PathVariable @Positive accountId: Long,
        @RequestHeader("X-Owner-Id") @Positive ownerId: Long
    ): AccountResponse = AccountResponse.from(accountService.getAccount(accountId, ownerId))

    @PostMapping("/{accountId}/transactions")
    fun createTransaction(
        @PathVariable @Positive accountId: Long,
        @RequestHeader("X-Owner-Id") @Positive ownerId: Long,
        @Valid @RequestBody request: CreateTransactionRequest
    ): ResponseEntity<TransactionResponse> {
        val amount = request.amount.toBigInteger()
        val transaction = when (request.type) {
            TransactionType.DEPOSIT -> accountService.deposit(accountId, ownerId, amount)
            TransactionType.WITHDRAW -> accountService.withdraw(accountId, ownerId, amount)
        }

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(TransactionResponse.from(transaction))
    }

    @GetMapping("/{accountId}/transactions")
    fun getTransactions(
        @PathVariable @Positive accountId: Long,
        @RequestHeader("X-Owner-Id") @Positive ownerId: Long
    ): List<TransactionResponse> = accountService.getTransactions(accountId, ownerId)
        .map(TransactionResponse::from)
}
