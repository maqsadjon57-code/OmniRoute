package com.aifitness.pro.ui.screens.splash

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.aifitness.pro.ui.navigation.Screen
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(navController: NavController, viewModel: SplashViewModel = hiltViewModel()) {
    val isLoggedIn by viewModel.isLoggedIn.collectAsState()
    val onboardingDone by viewModel.onboardingDone.collectAsState()

    LaunchedEffect(Unit) {
        delay(1500)
        when {
            !onboardingDone -> navController.navigate(Screen.Onboarding.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
            !isLoggedIn -> navController.navigate(Screen.Onboarding.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
            else -> navController.navigate(Screen.Home.route) { popUpTo(Screen.Splash.route) { inclusive = true } }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.linearGradient(listOf(Color(0xFF0F172A), Color(0xFF1D4ED8)))),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("AI FITNESS", color = Color.White, fontSize = 36.sp, fontWeight = FontWeight.Black)
            Text("CAMERA PRO", color = Color(0xFF22C55E), fontSize = 20.sp, fontWeight = FontWeight.Bold)
            Spacer(Modifier.height(24.dp))
            CircularProgressIndicator(color = Color.White)
            Spacer(Modifier.height(12.dp))
            Text("Загрузка AI тренера…", color = Color.White.copy(alpha = 0.7f))
        }
    }
}

@dagger.hilt.android.lifecycle.HiltViewModel
class SplashViewModel @javax.inject.Inject constructor(
    private val dataStore: com.aifitness.pro.data.local.DataStoreManager
) : androidx.lifecycle.ViewModel() {
    val isLoggedIn = dataStore.token.map { !it.isNullOrEmpty() }.let {
        // convert to StateFlow
        kotlinx.coroutines.flow.MutableStateFlow(false).apply {
            // simplified
        }
    }
    val onboardingDone = kotlinx.coroutines.flow.MutableStateFlow(false)

    init {
        // In real app collect DataStore
    }
}
