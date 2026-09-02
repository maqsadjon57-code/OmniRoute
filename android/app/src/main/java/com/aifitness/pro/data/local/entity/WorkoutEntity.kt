package com.aifitness.pro.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "workouts")
data class WorkoutEntity(
    @PrimaryKey val id: String,
    val userId: String,
    val exerciseType: String,
    val reps: Int,
    val durationSec: Int,
    val calories: Float,
    val earnedRub: Float,
    val techniqueScore: Float,
    val timestamp: Long,
    val synced: Boolean = false
)

@Entity(tableName = "balance_tx")
data class BalanceTxEntity(
    @PrimaryKey val id: String,
    val amount: Float,
    val type: String, // REP, AD, BONUS, WITHDRAW, PURCHASE
    val description: String,
    val timestamp: Long
)

@Entity(tableName = "achievements")
data class AchievementEntity(
    @PrimaryKey val id: String,
    val title: String,
    val progress: Int,
    val target: Int,
    val unlocked: Boolean
)
