package com.aifitness.pro.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun BalanceChip(balance: Float, modifier: Modifier = Modifier) {
    AssistChip(onClick = {}, label = { Text("${"%.1f".format(balance)} ₽") }, modifier = modifier)
}

@Composable
fun TechniqueIndicator(score: Float) {
    Column {
        Text("Техника: ${score.toInt()}%")
        LinearProgressIndicator(progress = { score/100f }, modifier = Modifier.fillMaxWidth())
    }
}
