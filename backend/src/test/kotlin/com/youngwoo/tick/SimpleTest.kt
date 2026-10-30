package com.youngwoo.tick

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class SimpleTest {
    @Test
    fun 진짜_아무_테스트를_실행할수있다(){
        val result = 1 + 2
        assertEquals(result, 3)
    }
}