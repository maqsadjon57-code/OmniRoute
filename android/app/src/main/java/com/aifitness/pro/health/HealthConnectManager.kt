package com.aifitness.pro.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import java.time.Instant

class HealthConnectManager(context: Context) {
    private val client = HealthConnectClient.getOrCreate(context)

    suspend fun writeCalories(calories: Double) {
        try {
            val record = ActiveCaloriesBurnedRecord(
                energy = androidx.health.connect.client.units.Energy.calories(calories),
                startTime = Instant.now().minusSeconds(60),
                endTime = Instant.now(),
                startZoneOffset = null,
                endZoneOffset = null
            )
            client.insertRecords(listOf(record))
        } catch (e: Exception) { e.printStackTrace() }
    }

    suspend fun isAvailable(): Boolean {
        return HealthConnectClient.getSdkStatus(context = client as Context) == HealthConnectClient.SDK_AVAILABLE
    }
}
