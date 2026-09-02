package com.aifitness.pro.data.local

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

class DataStoreManager(private val ds: DataStore<Preferences>) {
    companion object {
        val KEY_TOKEN = stringPreferencesKey("jwt_token")
        val KEY_USER_ID = stringPreferencesKey("user_id")
        val KEY_BALANCE = floatPreferencesKey("balance")
        val KEY_ONBOARDING_DONE = booleanPreferencesKey("onboarding_done")
        val KEY_CAMERA_FACING = stringPreferencesKey("camera_facing") // front/back
        val KEY_LANGUAGE = stringPreferencesKey("language")
        val KEY_PREMIUM = booleanPreferencesKey("is_premium")
        val KEY_TOTAL_REPS = intPreferencesKey("total_reps")
    }

    val token: Flow<String?> = ds.data.map { it[KEY_TOKEN] }
    val balance: Flow<Float> = ds.data.map { it[KEY_BALANCE] ?: 0f }
    val onboardingDone: Flow<Boolean> = ds.data.map { it[KEY_ONBOARDING_DONE] ?: false }

    suspend fun saveToken(token: String) { ds.edit { it[KEY_TOKEN] = token } }
    suspend fun saveBalance(v: Float) { ds.edit { it[KEY_BALANCE] = v } }
    suspend fun setOnboardingDone() { ds.edit { it[KEY_ONBOARDING_DONE] = true } }
    suspend fun clear() { ds.edit { it.clear() } }
}
