package com.aifitness.pro.ui.screens.training

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aifitness.pro.data.local.AppDatabase
import com.aifitness.pro.data.local.DataStoreManager
import com.aifitness.pro.data.local.entity.WorkoutEntity
import com.aifitness.pro.data.remote.ApiService
import com.aifitness.pro.ml.AngleCalculator.Point3D
import com.aifitness.pro.ml.RepCounter
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@HiltViewModel
class TrainingViewModel @Inject constructor(
    private val api: ApiService,
    private val ds: DataStoreManager,
    private val db: AppDatabase
) : ViewModel() {

    private val repCounter = RepCounter()
    private val _repCount = MutableStateFlow(0)
    val repCount: StateFlow<Int> = _repCount
    val feedback = repCounter.feedbackFlow
    val earned = MutableStateFlow(0f)
    val techniqueScore = MutableStateFlow(95f)
    val isFrontCamera = MutableStateFlow(false)
    val landmarks = MutableStateFlow<List<Point3D>>(emptyList())

    init {
        viewModelScope.launch {
            repCounter.repCountFlow.collect { count ->
                _repCount.value = count
                earned.value = count * 0.1f
            }
        }
    }

    fun switchCamera() { isFrontCamera.value = !isFrontCamera.value }

    fun reset() { repCounter.reset(); _repCount.value = 0; earned.value = 0f }

    fun finishTraining(onFinish: (Int, Float, Float) -> Unit) {
        viewModelScope.launch {
            try {
                val workout = WorkoutEntity(
                    id = UUID.randomUUID().toString(),
                    userId = "current",
                    exerciseType = "PUSHUP",
                    reps = _repCount.value,
                    durationSec = 120,
                    calories = _repCount.value * 0.5f,
                    earnedRub = earned.value,
                    techniqueScore = techniqueScore.value,
                    timestamp = System.currentTimeMillis()
                )
                db.workoutDao().insert(workout)
                onFinish(_repCount.value, earned.value, techniqueScore.value)
            } catch (e: Exception) {
                onFinish(_repCount.value, earned.value, techniqueScore.value)
            }
        }
    }
}
