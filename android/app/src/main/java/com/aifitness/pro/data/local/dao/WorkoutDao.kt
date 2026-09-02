package com.aifitness.pro.data.local.dao

import androidx.room.*
import com.aifitness.pro.data.local.entity.WorkoutEntity
import com.aifitness.pro.data.local.entity.BalanceTxEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutDao {
    @Query("SELECT * FROM workouts ORDER BY timestamp DESC")
    fun getAll(): Flow<List<WorkoutEntity>>

    @Query("SELECT * FROM workouts WHERE synced = 0")
    suspend fun getUnsynced(): List<WorkoutEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(workout: WorkoutEntity)

    @Query("UPDATE workouts SET synced = 1 WHERE id = :id")
    suspend fun markSynced(id: String)

    @Query("SELECT SUM(reps) FROM workouts WHERE timestamp >= :from")
    fun totalRepsSince(from: Long): Flow<Int>

    @Query("SELECT SUM(earnedRub) FROM workouts")
    fun totalEarned(): Flow<Float>
}

@Dao
interface BalanceDao {
    @Query("SELECT * FROM balance_tx ORDER BY timestamp DESC")
    fun getAll(): Flow<List<BalanceTxEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(tx: BalanceTxEntity)

    @Query("SELECT SUM(amount) FROM balance_tx")
    fun getBalance(): Flow<Float>
}
