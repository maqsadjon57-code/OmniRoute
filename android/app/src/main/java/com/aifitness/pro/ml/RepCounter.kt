package com.aifitness.pro.ml

import com.aifitness.pro.ml.AngleCalculator.Point3D
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class PoseFrame(
    val timestamp: Long,
    val landmarks: List<Point3D>, // 33 points MediaPipe
    val visibility: List<Float>
)

data class RepResult(
    val index: Int,
    val startTs: Long,
    val endTs: Long,
    val minElbowAngle: Float,
    val maxElbowAngle: Float,
    val backDeviation: Float,
    val depthScore: Float,
    val isValid: Boolean,
    val feedback: String
)

enum class PushupState { UP, DOWN, INVALID }

class RepCounter(private val exerciseType: ExerciseType = ExerciseType.PUSHUP) {

    private val elbowFilter = KalmanFilter()
    private val backFilter = KalmanFilter()

    private var state = PushupState.UP
    private var repCount = 0
    private var currentRepStart = 0L
    private var minAngleInRep = 180f
    private var maxAngleInRep = 0f
    private var maxBackDeviation = 0f
    private var lastRepTime = 0L

    private val _repCountFlow = MutableStateFlow(0)
    val repCountFlow: StateFlow<Int> = _repCountFlow

    private val _feedbackFlow = MutableStateFlow("Приготовьтесь")
    val feedbackFlow: StateFlow<String> = _feedbackFlow

    private val _reps = mutableListOf<RepResult>()
    val reps: List<RepResult> get() = _reps

    // MediaPipe indices
    companion object {
        const val LEFT_SHOULDER = 11
        const val RIGHT_SHOULDER = 12
        const val LEFT_ELBOW = 13
        const val RIGHT_ELBOW = 14
        const val LEFT_WRIST = 15
        const val RIGHT_WRIST = 16
        const val LEFT_HIP = 23
        const val RIGHT_HIP = 24
        const val LEFT_KNEE = 25
        const val RIGHT_KNEE = 26
        const val LEFT_ANKLE = 27
        const val RIGHT_ANKLE = 28
    }

    fun process(frame: PoseFrame): RepResult? {
        if (frame.landmarks.size < 33) return null

        val leftShoulder = frame.landmarks[LEFT_SHOULDER]
        val leftElbow = frame.landmarks[LEFT_ELBOW]
        val leftWrist = frame.landmarks[LEFT_WRIST]
        val leftHip = frame.landmarks[LEFT_HIP]
        val leftAnkle = frame.landmarks[LEFT_ANKLE]

        val rightShoulder = frame.landmarks[RIGHT_SHOULDER]
        val rightElbow = frame.landmarks[RIGHT_ELBOW]
        val rightWrist = frame.landmarks[RIGHT_WRIST]
        val rightHip = frame.landmarks[RIGHT_HIP]
        val rightAnkle = frame.landmarks[RIGHT_ANKLE]

        // Average both sides for robustness
        val elbowAngleLeft = AngleCalculator.angle(leftShoulder, leftElbow, leftWrist)
        val elbowAngleRight = AngleCalculator.angle(rightShoulder, rightElbow, rightWrist)
        val rawElbowAngle = (elbowAngleLeft + elbowAngleRight) / 2f

        val backDevLeft = AngleCalculator.backDeviation(leftShoulder, leftHip, leftAnkle)
        val backDevRight = AngleCalculator.backDeviation(rightShoulder, rightHip, rightAnkle)
        val rawBackDev = (backDevLeft + backDevRight) / 2f

        val elbowAngle = elbowFilter.update(rawElbowAngle)
        val backDev = backFilter.update(rawBackDev)

        // Track min/max
        if (state == PushupState.DOWN) {
            if (elbowAngle < minAngleInRep) minAngleInRep = elbowAngle
        } else {
            if (elbowAngle > maxAngleInRep) maxAngleInRep = elbowAngle
        }
        if (backDev > maxBackDeviation) maxBackDeviation = backDev

        // State machine with hysteresis
        val now = frame.timestamp
        // debounce 500ms
        if (now - lastRepTime < 500 && repCount > 0 && state == PushupState.UP) {
            // still in debounce after last rep
        }

        return when (state) {
            PushupState.UP -> {
                if (elbowAngle <= 90f) {
                    // going down
                    state = PushupState.DOWN
                    if (currentRepStart == 0L) currentRepStart = now
                    minAngleInRep = elbowAngle
                    maxBackDeviation = backDev
                    _feedbackFlow.value = "Ниже!"
                    null
                } else {
                    // feedback
                    if (backDev > 15f) _feedbackFlow.value = "Выпрямите спину! Отклонение ${backDev.toInt()}°"
                    else if (elbowAngle < 160f) _feedbackFlow.value = "Полное разгибание!"
                    else _feedbackFlow.value = "Отлично, держите!"
                    null
                }
            }
            PushupState.DOWN -> {
                if (elbowAngle >= 160f) {
                    // completed rep
                    val duration = now - currentRepStart
                    val isValid = validateRep(minAngleInRep, maxAngleInRep, maxBackDeviation, duration)
                    val feedback = generateFeedback(minAngleInRep, maxAngleInRep, maxBackDeviation)

                    val result = RepResult(
                        index = repCount,
                        startTs = currentRepStart,
                        endTs = now,
                        minElbowAngle = minAngleInRep,
                        maxElbowAngle = maxAngleInRep,
                        backDeviation = maxBackDeviation,
                        depthScore = calculateDepthScore(minAngleInRep),
                        isValid = isValid,
                        feedback = feedback
                    )

                    if (isValid) {
                        repCount++
                        _repCountFlow.value = repCount
                        lastRepTime = now
                        _feedbackFlow.value = "Отлично! ${repCount}"
                    } else {
                        _feedbackFlow.value = feedback
                    }

                    // reset for next
                    state = PushupState.UP
                    currentRepStart = 0L
                    minAngleInRep = 180f
                    maxAngleInRep = elbowAngle
                    maxBackDeviation = 0f
                    _reps.add(result)
                    result
                } else {
                    if (backDev > 15f) _feedbackFlow.value = "Спина! ${backDev.toInt()}°"
                    null
                }
            }
            else -> null
        }
    }

    private fun validateRep(minElbow: Float, maxElbow: Float, backDev: Float, durationMs: Long): Boolean {
        if (durationMs < 400 || durationMs > 5000) return false
        if (minElbow > 90f) return false // not deep enough
        if (maxElbow < 160f) return false // not fully extended
        if (backDev > 20f) return false // back too bent (allow 20 deg)
        return true
    }

    private fun calculateDepthScore(minElbow: Float): Float {
        return ((90f - minElbow).coerceIn(0f, 40f) / 40f * 100f).coerceIn(0f, 100f)
    }

    private fun generateFeedback(minElbow: Float, maxElbow: Float, backDev: Float): String {
        return when {
            minElbow > 90f -> "Глубже! Угол ${minElbow.toInt()}° > 90°"
            maxElbow < 160f -> "До конца выпрямляйте руки!"
            backDev > 15f -> "Держите спину прямой!"
            else -> "Повтор засчитан!"
        }
    }

    fun reset() {
        state = PushupState.UP
        repCount = 0
        _repCountFlow.value = 0
        _reps.clear()
        elbowFilter.reset()
        backFilter.reset()
    }
}
