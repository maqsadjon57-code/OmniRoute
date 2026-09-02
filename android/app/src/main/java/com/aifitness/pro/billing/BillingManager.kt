package com.aifitness.pro.billing

import android.content.Context
import com.android.billingclient.api.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class BillingManager(context: Context) : PurchasesUpdatedListener {

    private val billingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    private val _isPremium = MutableStateFlow(false)
    val isPremium: StateFlow<Boolean> = _isPremium

    init {
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                    queryPurchases()
                }
            }
            override fun onBillingServiceDisconnected() {}
        })
    }

    private fun queryPurchases() {
        billingClient.queryPurchasesAsync(BillingClient.SkuType.SUBS) { _, purchases ->
            _isPremium.value = purchases.any { it.purchaseState == Purchase.PurchaseState.PURCHASED }
        }
    }

    fun launchPremiumPurchase(activity: android.app.Activity) {
        val params = SkuDetailsParams.newBuilder()
            .setSkusList(listOf("premium_monthly", "premium_yearly"))
            .setType(BillingClient.SkuType.SUBS)
            .build()
        billingClient.querySkuDetailsAsync(params) { _, skuDetailsList ->
            skuDetailsList?.firstOrNull()?.let {
                val flowParams = BillingFlowParams.newBuilder().setSkuDetails(it).build()
                billingClient.launchBillingFlow(activity, flowParams)
            }
        }
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        if (result.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            _isPremium.value = true
        }
    }
}
