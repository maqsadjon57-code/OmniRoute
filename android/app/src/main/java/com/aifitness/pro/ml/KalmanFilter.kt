package com.aifitness.pro.ml

/**
 * Simple 1D Kalman filter for smoothing angle measurements
 */
class KalmanFilter(
    private var q: Float = 0.01f, // process noise
    private var r: Float = 0.1f,  // measurement noise
    private var p: Float = 1f,
    private var x: Float = 0f
) {
    fun update(measurement: Float): Float {
        // prediction
        p += q
        // update
        val k = p / (p + r)
        x += k * (measurement - x)
        p *= (1 - k)
        return x
    }

    fun reset(value: Float = 0f) {
        x = value
        p = 1f
    }
}
