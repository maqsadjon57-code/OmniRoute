package com.aifitness.pro.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.aifitness.pro.ui.navigation.Screen

data class HomeAction(val title: String, val icon: ImageVector, val route: String, val color: androidx.compose.ui.graphics.Color)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController, vm: HomeViewModel = hiltViewModel()) {
    val balance by vm.balance.collectAsState()
    val todayReps by vm.todayReps.collectAsState()
    val level by vm.level.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(title = { Text("AI Fitness Pro") }, actions = {
                IconButton(onClick = { navController.navigate(Screen.Profile.route) }) { Icon(Icons.Default.Person, null) }
            })
        },
        floatingActionButton = {
            ExtendedFloatingActionButton(onClick = { navController.navigate(Screen.Training.route) }, icon = { Icon(Icons.Default.PlayArrow, null) }, text = { Text("Тренировка") })
        }
    ) { padding ->
        Column(Modifier.padding(padding).padding(16.dp)) {
            // Balance card
            Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)) {
                Column(Modifier.padding(20.dp)) {
                    Text("Баланс", style = MaterialTheme.typography.labelLarge)
                    Text("${"%.1f".format(balance)} ₽", style = MaterialTheme.typography.headlineLarge)
                    Spacer(Modifier.height(8.dp))
                    LinearProgressIndicator(progress = { (balance % 100) / 100f }, modifier = Modifier.fillMaxWidth())
                    Text("До вывода ${"%.1f".format(100 - balance)} ₽", style = MaterialTheme.typography.bodySmall)
                }
            }
            Spacer(Modifier.height(16.dp))
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                StatChip("Сегодня: $todayReps", Icons.Default.FitnessCenter)
                StatChip("Уровень $level", Icons.Default.Star)
                StatChip("0.1₽/повтор", Icons.Default.AttachMoney)
            }
            Spacer(Modifier.height(20.dp))
            val actions = listOf(
                HomeAction("Планы", Icons.Default.List, Screen.Plans.route, MaterialTheme.colorScheme.primary),
                HomeAction("Статистика", Icons.Default.BarChart, Screen.Stats.route, MaterialTheme.colorScheme.secondary),
                HomeAction("Магазин", Icons.Default.ShoppingCart, Screen.Balance.route, MaterialTheme.colorScheme.tertiary),
                HomeAction("Соревнования", Icons.Default.EmojiEvents, Screen.Competitions.route, MaterialTheme.colorScheme.error),
                HomeAction("Лента", Icons.Default.Feed, Screen.Social.route, MaterialTheme.colorScheme.primary),
                HomeAction("Друзья", Icons.Default.Group, Screen.Friends.route, MaterialTheme.colorScheme.secondary),
                HomeAction("Достижения", Icons.Default.MilitaryTech, Screen.Achievements.route, MaterialTheme.colorScheme.tertiary),
                HomeAction("Настройки", Icons.Default.Settings, Screen.Settings.route, MaterialTheme.colorScheme.outline)
            )
            LazyVerticalGrid(columns = GridCells.Fixed(2), verticalArrangement = Arrangement.spacedBy(12.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                items(actions.size) { idx ->
                    val a = actions[idx]
                    Card(onClick = { navController.navigate(a.route) }, modifier = Modifier.height(100.dp)) {
                        Column(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(a.icon, null, tint = a.color, modifier = Modifier.size(32.dp))
                            Spacer(Modifier.height(8.dp))
                            Text(a.title)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatChip(text: String, icon: ImageVector) {
    AssistChip(onClick = {}, label = { Text(text) }, leadingIcon = { Icon(icon, null, Modifier.size(16.dp)) })
}

@dagger.hilt.android.lifecycle.HiltViewModel
class HomeViewModel @javax.inject.Inject constructor(
    private val ds: com.aifitness.pro.data.local.DataStoreManager,
    private val db: com.aifitness.pro.data.local.AppDatabase
) : androidx.lifecycle.ViewModel() {
    val balance = kotlinx.coroutines.flow.MutableStateFlow(23.5f)
    val todayReps = kotlinx.coroutines.flow.MutableStateFlow(42)
    val level = kotlinx.coroutines.flow.MutableStateFlow(5)
}
