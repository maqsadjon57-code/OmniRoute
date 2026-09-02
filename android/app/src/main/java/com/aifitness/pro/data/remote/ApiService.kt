package com.aifitness.pro.data.remote

import com.aifitness.pro.data.remote.dto.*
import retrofit2.http.*

interface ApiService {
    @POST("api/auth/register")
    suspend fun register(@Body req: AuthRequest): AuthResponse

    @POST("api/auth/login")
    suspend fun login(@Body req: AuthRequest): AuthResponse

    @POST("api/reps/verify")
    suspend fun verifyReps(@Header("Authorization") token: String, @Body req: RepVerificationRequest): RepVerificationResponse

    @POST("api/workouts/sync")
    suspend fun syncWorkout(@Header("Authorization") token: String, @Body req: WorkoutSyncRequest): BalanceResponse

    @GET("api/balance")
    suspend fun getBalance(@Header("Authorization") token: String): BalanceResponse

    @POST("api/balance/withdraw")
    suspend fun withdraw(@Header("Authorization") token: String, @Body req: WithdrawRequest): BalanceResponse

    @POST("api/ads/reward")
    suspend fun rewardAd(@Header("Authorization") token: String): BalanceResponse

    @GET("api/leaderboard")
    suspend fun leaderboard(@Header("Authorization") token: String, @Query("period") period: String = "week"): List<LeaderboardEntryDto>

    @GET("api/competitions")
    suspend fun competitions(@Header("Authorization") token: String): List<CompetitionDto>

    @POST("api/competitions/{id}/join")
    suspend fun joinCompetition(@Header("Authorization") token: String, @Path("id") id: String)

    @GET("api/stats")
    suspend fun getStats(@Header("Authorization") token: String): Map<String, Float>
}
