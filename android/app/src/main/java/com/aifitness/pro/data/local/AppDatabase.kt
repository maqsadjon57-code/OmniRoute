package com.aifitness.pro.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.aifitness.pro.data.local.dao.BalanceDao
import com.aifitness.pro.data.local.dao.WorkoutDao
import com.aifitness.pro.data.local.entity.BalanceTxEntity
import com.aifitness.pro.data.local.entity.WorkoutEntity
import com.aifitness.pro.data.local.entity.AchievementEntity
import androidx.room.Dao
import androidx.room.Query
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import kotlinx.coroutines.flow.Flow

@Dao
interface AchievementDao {
    @Query("SELECT * FROM achievements")
    fun getAll(): Flow<List<AchievementEntity>>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(a: AchievementEntity)
}

@Database(
    entities = [WorkoutEntity::class, BalanceTxEntity::class, AchievementEntity::class],
    version = 3,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun workoutDao(): WorkoutDao
    abstract fun balanceDao(): BalanceDao
    abstract fun achievementDao(): AchievementDao
}
