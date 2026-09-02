package com.aifitness.pro.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class AuthRequest(val email: String, val password: String, val deviceId: String? = null)

@Serializable
data class AuthResponse(val token: String, val refreshToken: String, val user: UserDto)

@Serializable
data class UserDto(
    val id: String,
    val email: String,
    val displayName: String,
    val balance: Float,
    val totalReps: Int,
    val level: Int,
    val isPremium: Boolean
)

@Serializable
data class RepVerificationRequest(
    val exerciseType: String, // PUSHUP, SQUAT, etc.
    val reps: List<RepDto>,
    val workoutId: String,
    val timestamp: Long,
    val signature: String // HMAC of payload to prevent tampering
)

@Serializable
data class RepDto(
    val index: Int,
    val startTs: Long,
    val endTs: Long,
    val minElbowAngle: Float,
    val maxElbowAngle: Float,
    val backDeviation: Float,
    val depthScore: Float,
    val keypoints: List<KeypointDto>, // sampled
    val durationMs: Long
)

@Serializable
data class KeypointDto(val x: Float, val y: Float, val z: Float, val visibility: Float, val type: Int)

@Serializable
data class RepVerificationResponse(
    val verifiedCount: Int,
    val rejectedCount: Int,
    val earnedRub: Float,
    val newBalance: Float,
    val achievementsUnlocked: List<String>,
    val techniqueFeedback: String?
)

@Serializable
data class WorkoutSyncRequest(
    val id: String,
    val exerciseType: String,
    val reps: Int,
    val durationSec: Int,
    val calories: Float,
    val earnedRub: Float,
    val techniqueScore: Float,
    val timestamp: Long
)

@Serializable
data class BalanceResponse(val balance: Float, val pendingWithdraw: Float)

@Serializable
data class WithdrawRequest(val amount: Float, val method: String, val details: String)

@Serializable
data class LeaderboardEntryDto(val rank: Int, val userId: String, val displayName: String, val reps: Int, val avatarUrl: String?)

@Serializable
data class CompetitionDto(
    val id: String,
    val title: String,
    val description: String,
    val prizePool: Float,
    val participants: Int,
    val endsAt: Long,
    val joined: Boolean
)
