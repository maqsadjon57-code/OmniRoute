package com.aifitness.pro.ml

import kotlin.math.acos
import kotlin.math.sqrt

object AngleCalculator {
    data class Point3D(val x: Float, val y: Float, val z: Float = 0f)

    fun angle(a: Point3D, b: Point3D, c: Point3D): Float {
        // angle ABC at B
        val abx = a.x - b.x
        val aby = a.y - b.y
        val abz = a.z - b.z
        val cbx = c.x - b.x
        val cby = c.y - b.y
        val cbz = c.z - b.z

        val dot = abx * cbx + aby * cby + abz * cbz
        val magAB = sqrt(abx * abx + aby * aby + abz * abz)
        val magCB = sqrt(cbx * cbx + cby * cby + cbz * cbz)
        if (magAB == 0f || magCB == 0f) return 0f
        val cos = (dot / (magAB * magCB)).coerceIn(-1f, 1f)
        return Math.toDegrees(acos(cos).toDouble()).toFloat()
    }

    fun backDeviation(shoulder: Point3D, hip: Point3D, ankle: Point3D): Float {
        // deviation from straight line 0 = straight, higher = bent
        // angle between shoulder-hip-ankle should be ~180 for straight plank/pushup
        val ang = angle(shoulder, hip, ankle)
        return kotlin.math.abs(180f - ang)
    }
}
