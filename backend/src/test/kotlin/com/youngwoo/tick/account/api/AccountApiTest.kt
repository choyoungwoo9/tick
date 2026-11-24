package com.youngwoo.tick.account.api

import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AccountApiTest @Autowired constructor(
    private val mockMvc: MockMvc,
    private val entityManager: EntityManager
) {
    @Test
    fun `계좌를 개설하고 잔액을 조회할 수 있다`() {
        val accountId = createAccount(name = "주거래 모의계좌")

        mockMvc.perform(
            get("/accounts/{accountId}", accountId)
                .header("X-Owner-Id", 1L)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.accountId").value(accountId))
            .andExpect(jsonPath("$.name").value("주거래 모의계좌"))
            .andExpect(jsonPath("$.number").value("TICK 2000-${accountId.toString().padStart(4, '0')}"))
            .andExpect(jsonPath("$.balance").value("0"))
    }

    @Test
    fun `소유자의 계좌 목록을 이름과 번호와 함께 조회할 수 있다`() {
        createAccount(name = "저축 계좌")
        createAccount(name = "여행 계좌")

        mockMvc.perform(
            get("/accounts")
                .header("X-Owner-Id", 1L)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("저축 계좌"))
            .andExpect(jsonPath("$[0].number").exists())
            .andExpect(jsonPath("$[1].name").value("여행 계좌"))
    }

    @Test
    fun `입출금 후 거래 내역을 조회할 수 있다`() {
        val accountId = createAccount()

        postTransaction(accountId, "DEPOSIT", "500")
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.type").value("DEPOSIT"))
            .andExpect(jsonPath("$.amount").value("500"))

        postTransaction(accountId, "WITHDRAW", "200")
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.type").value("WITHDRAW"))

        mockMvc.perform(
            get("/accounts/{accountId}", accountId)
                .header("X-Owner-Id", 1L)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.balance").value("300"))

        mockMvc.perform(
            get("/accounts/{accountId}/transactions", accountId)
                .header("X-Owner-Id", 1L)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].type").value("DEPOSIT"))
            .andExpect(jsonPath("$[0].amount").value("500"))
            .andExpect(jsonPath("$[1].type").value("WITHDRAW"))
            .andExpect(jsonPath("$[1].amount").value("200"))
    }

    @Test
    fun `잘못된 금액은 통일된 오류 형식으로 거절한다`() {
        val accountId = createAccount()

        postTransaction(accountId, "DEPOSIT", "-1")
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
            .andExpect(jsonPath("$.message").exists())
    }

    @Test
    fun `잔액보다 많이 출금하면 구분 가능한 오류를 반환한다`() {
        val accountId = createAccount()

        postTransaction(accountId, "WITHDRAW", "1")
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.code").value("INSUFFICIENT_BALANCE"))
    }

    @Test
    fun `다른 사용자의 계좌는 조회할 수 없다`() {
        val accountId = createAccount(ownerId = 1L)

        mockMvc.perform(
            get("/accounts/{accountId}", accountId)
                .header("X-Owner-Id", 2L)
        )
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.code").value("ACCOUNT_NOT_FOUND"))
    }

    private fun createAccount(ownerId: Long = 1L, name: String = "나의 모의 계좌"): Long {
        val result = mockMvc.perform(
            post("/accounts")
                .header("X-Owner-Id", ownerId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"name":"$name"}""")
        )
            .andExpect(status().isCreated)
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.accountId").isNumber)
            .andExpect(jsonPath("$.name").value(name))
            .andExpect(jsonPath("$.number").isNotEmpty)
            .andReturn()

        entityManager.flush()
        entityManager.clear()

        val location = result.response.getHeader("Location")
            ?: throw AssertionError("Location header가 없습니다.")
        return location.substringAfterLast('/').toLong()
    }

    private fun postTransaction(accountId: Long, type: String, amount: String) =
        mockMvc.perform(
            post("/accounts/{accountId}/transactions", accountId)
                .header("X-Owner-Id", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"type":"$type","amount":"$amount"}""")
        )
}
