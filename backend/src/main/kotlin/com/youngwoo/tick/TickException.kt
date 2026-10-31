package com.youngwoo.tick

class TickException(
    message: String,
    cause: Throwable? = null
): RuntimeException(message, cause)
