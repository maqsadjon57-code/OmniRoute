package com.aifitness.pro.data.repository

import com.aifitness.pro.data.local.AppDatabase
import com.aifitness.pro.data.local.DataStoreManager
import com.aifitness.pro.data.remote.ApiService
import com.aifitness.pro.data.remote.dto.RepDto
import com.aifitness.pro.data.remote.dto.RepVerificationRequest
import kotlinx.coroutines.flow.first
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FitnessRepository @Inject constructor(
    private val api: ApiService,
    private val db: AppDatabase,
    private val ds: DataStoreManager
) {
    suspend fun verifyReps(reps: List<RepDto>, workoutId: String, signature: String): Result<Float> {
        return try {
            val token = ds.token.first() ?: return Result.failure(Exception("No token"))
            val req = RepVerificationRequest(
                exerciseType = "PUSHUP",
                reps = reps,
                workoutId = workoutId,
                timestamp = System.currentTimeMillis(),
                signature = signature
            )
            val resp = api.verifyReps("Bearer $token", req)
            ds.saveBalance(resp.newBalance)
            Result.success(resp.earnedRub)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getBalance() = db.balanceDao().getBalance()
}
