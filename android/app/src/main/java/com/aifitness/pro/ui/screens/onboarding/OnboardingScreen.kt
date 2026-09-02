package com.aifitness.pro.ui.screens.onboarding

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.aifitness.pro.ui.navigation.Screen
import kotlinx.coroutines.launch

@Composable
fun OnboardingScreen(navController: NavController) {
    val pagerState = rememberPagerState(pageCount = { 3 })
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().padding(24.dp)) {
        HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { page ->
            Column(Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    when (page) {
                        0 -> "🏋️"
                        1 -> "💰"
                        else -> "🏆"
                    }, fontSize = 80.sp
                )
                Spacer(Modifier.height(24.dp))
                Text(
                    when (page) {
                        0 -> "Тренируйся с ИИ"
                        1 -> "Зарабатывай на спорте"
                        else -> "Соревнуйся и побеждай"
                    },
                    fontSize = 28.sp, fontWeight = FontWeight.Bold
                )
                Spacer(Modifier.height(12.dp))
                Text(
                    when (page) {
                        0 -> "Камера распознаёт скелет в реальном времени и считает повторения с точностью 95%"
                        1 -> "Каждое правильное отжимание = 0.1₽ на баланс. Вывод от 100₽. Защита от накруток."
                        else -> "Челленджи, лидерборды, друзья и достижения. Стань легендой!"
                    },
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }

        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            TextButton(onClick = { navController.navigate(Screen.Home.route) }) { Text("Пропустить") }
            Row {
                repeat(3) { i ->
                    Box(Modifier.padding(4.dp).size(if (pagerState.currentPage == i) 12.dp else 8.dp))
                }
            }
            Button(onClick = {
                if (pagerState.currentPage < 2) scope.launch { pagerState.animateScrollToPage(pagerState.currentPage + 1) }
                else navController.navigate(Screen.Home.route) { popUpTo(Screen.Onboarding.route) { inclusive = true } }
            }) {
                Text(if (pagerState.currentPage == 2) "Начать" else "Далее")
            }
        }

        Spacer(Modifier.height(16.dp))
        OutlinedButton(onClick = { /* Firebase Auth */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Войти через Google")
        }
    }
}
