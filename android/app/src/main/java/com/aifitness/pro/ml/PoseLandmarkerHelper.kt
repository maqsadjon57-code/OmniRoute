package com.aifitness.pro.ml

import android.content.Context
import android.graphics.Bitmap
import android.os.SystemClock
import androidx.camera.core.ImageProxy
import com.google.mediapipe.framework.image.BitmapImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker
import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarkerResult
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow

class PoseLandmarkerHelper(
    private val context: Context,
    private val runningMode: RunningMode = RunningMode.LIVE_STREAM
) {
    private var poseLandmarker: PoseLandmarker? = null

    private val _results = MutableSharedFlow<ResultBundle>(replay = 0, extraBufferCapacity = 1, onBufferOverflow = BufferOverflow.DROP_OLDEST)
    val results: SharedFlow<ResultBundle> = _results

    data class ResultBundle(
        val result: PoseLandmarkerResult,
        val inputWidth: Int,
        val inputHeight: Int,
        val inferenceTimeMs: Long
    )

    init {
        setup()
    }

    private fun setup() {
        val baseOptions = BaseOptions.builder()
            .setModelAssetPath("pose_landmarker_lite.task") // put model in assets
            .build()

        val options = PoseLandmarker.PoseLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setRunningMode(runningMode)
            .setMinPoseDetectionConfidence(0.5f)
            .setMinTrackingConfidence(0.5f)
            .setMinPosePresenceConfidence(0.5f)
            .setNumPoses(1)
            .apply {
                if (runningMode == RunningMode.LIVE_STREAM) {
                    setResultListener { result, inputImage ->
                        val inferenceTime = SystemClock.uptimeMillis() - result.timestampMs()
                        _results.tryEmit(ResultBundle(result, inputImage.width, inputImage.height, inferenceTime))
                    }
                    setErrorListener { e -> e.printStackTrace() }
                }
            }
            .build()

        poseLandmarker = PoseLandmarker.createFromOptions(context, options)
    }

    fun detectLiveStream(imageProxy: ImageProxy, isFrontCamera: Boolean) {
        val bitmap = imageProxy.toBitmap() ?: return
        // MediaPipe expects rotated correctly
        val mpImage = BitmapImageBuilder(bitmap).build()
        poseLandmarker?.detectAsync(mpImage, SystemClock.uptimeMillis())
        imageProxy.close()
    }

    fun detectBitmap(bitmap: Bitmap): PoseLandmarkerResult? {
        val mpImage = BitmapImageBuilder(bitmap).build()
        return poseLandmarker?.detect(mpImage)
    }

    fun close() {
        poseLandmarker?.close()
        poseLandmarker = null
    }

    private fun ImageProxy.toBitmap(): Bitmap? {
        val buffer = planes[0].buffer
        val bytes = ByteArray(buffer.remaining())
        buffer.get(bytes)
        return android.graphics.BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
        // Note: for real app use YUV->RGB conversion; simplified here
    }
}
