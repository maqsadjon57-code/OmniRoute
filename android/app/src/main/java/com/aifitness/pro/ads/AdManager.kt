package com.aifitness.pro.ads

import android.content.Context
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class AdManager(private val context: Context) {
    private var rewardedAd: RewardedAd? = null
    private val _isLoaded = MutableStateFlow(false)
    val isLoaded: StateFlow<Boolean> = _isLoaded
    private var dailyCount = 0
    private val maxDaily = 5

    fun loadRewarded() {
        if (dailyCount >= maxDaily) return
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(context, "ca-app-pub-3940256099942544/5224354917",
            adRequest, object : RewardedAdLoadCallback() {
                override fun onAdFailedToLoad(adError: LoadAdError) {
                    _isLoaded.value = false
                }
                override fun onAdLoaded(ad: RewardedAd) {
                    rewardedAd = ad
                    _isLoaded.value = true
                }
            })
    }

    fun showRewarded(activity: android.app.Activity, onReward: () -> Unit) {
        if (dailyCount >= maxDaily) return
        rewardedAd?.let { ad ->
            ad.show(activity) { rewardItem ->
                dailyCount++
                onReward()
                _isLoaded.value = false
                loadRewarded()
            }
        }
    }

    fun canWatch(): Boolean = dailyCount < maxDaily
}
