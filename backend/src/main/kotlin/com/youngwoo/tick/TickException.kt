package com.youngwoo.tick

class TickException(
    message: String,
    cause: Throwable? = null,
    val code: String = "BUSINESS_ERROR"
): RuntimeException(message, cause)
