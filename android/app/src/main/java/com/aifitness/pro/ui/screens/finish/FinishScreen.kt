package com.aifitness.pro.ui.screens.finish

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.aifitness.pro.ui.navigation.Screen

@Composable
fun FinishScreen(navController: NavController, reps: Int, earned: Float, score: Float) {
    Column(Modifier.fillMaxSize().padding(24.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
        Text("🎉", fontSize = 80.sp)
        Spacer(Modifier.height(16.dp))
        Text("Тренировка завершена!", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(24.dp))
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("$reps", fontSize = 48.sp, fontWeight = FontWeight.Black, color = MaterialTheme.colorScheme.primary)
                Text("отжиманий")
                Spacer(Modifier.height(12.dp))
                Text("+${"%.1f".format(earned)} ₽", color = Color(0xFF22C55E), fontSize = 28.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(8.dp))
                Text("Техника: ${score.toInt()}%")
                LinearProgressIndicator(progress = { score / 100f }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            }
        }
        Spacer(Modifier.height(24.dp))
        Button(onClick = { navController.navigate(Screen.Home.route) { popUpTo(Screen.Home.route) { inclusive = true } } }, modifier = Modifier.fillMaxWidth()) {
            Text("На главный")
        }
        OutlinedButton(onClick = { navController.navigate(Screen.Stats.route) }, modifier = Modifier.fillMaxWidth()) {
            Text("Статистика")
        }
    }
}
