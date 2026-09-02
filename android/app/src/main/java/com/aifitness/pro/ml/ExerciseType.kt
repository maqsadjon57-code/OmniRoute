package com.aifitness.pro.ml

enum class ExerciseType {
    PUSHUP, SQUAT, LUNGE, PLANK, SITUP, PULLUP, KNEE_PUSHUP, WIDE_PUSHUP, NARROW_PUSHUP;

    companion object {
        fun fromString(s: String): ExerciseType = try { valueOf(s.uppercase()) } catch (e: Exception) { PUSHUP }
    }
}
