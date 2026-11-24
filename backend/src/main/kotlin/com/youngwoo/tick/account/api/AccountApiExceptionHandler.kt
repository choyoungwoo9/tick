package com.youngwoo.tick.account.api

import com.youngwoo.tick.TickException
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingRequestHeaderException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException

@RestControllerAdvice
class AccountApiExceptionHandler {
    @ExceptionHandler(TickException::class)
    fun handleTickException(exception: TickException): ResponseEntity<ApiErrorResponse> {
        val status = when (exception.code) {
            "ACCOUNT_NOT_FOUND" -> HttpStatus.NOT_FOUND
            else -> HttpStatus.BAD_REQUEST
        }

        return ResponseEntity.status(status)
            .body(ApiErrorResponse(exception.code, exception.message ?: "요청을 처리할 수 없습니다."))
    }

    @ExceptionHandler(
        ConstraintViolationException::class,
        MethodArgumentNotValidException::class,
        HttpMessageNotReadableException::class,
        MissingRequestHeaderException::class,
        MethodArgumentTypeMismatchException::class
    )
    fun handleInvalidRequest(exception: Exception): ResponseEntity<ApiErrorResponse> =
        ResponseEntity.badRequest()
            .body(ApiErrorResponse("INVALID_REQUEST", "요청 값이 올바르지 않습니다."))
}
