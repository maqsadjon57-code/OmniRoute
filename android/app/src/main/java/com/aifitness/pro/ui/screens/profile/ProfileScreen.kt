package com.aifitness.pro.ui.screens.profile
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(navController: NavController){
  Scaffold(topBar={TopAppBar(title={Text("Профиль")})}){p->
    Column(Modifier.padding(p).padding(16.dp), horizontalAlignment=Alignment.CenterHorizontally){
      Card(Modifier.size(100.dp), shape=MaterialTheme.shapes.extraLarge){ Box(Modifier.fillMaxSize(), contentAlignment=Alignment.Center){ Text("👤", style=MaterialTheme.typography.displayMedium) } }
      Spacer(Modifier.height(12.dp))
      Text("Иван Иванов", style=MaterialTheme.typography.headlineSmall)
      Text("Уровень 5 • 342 отжимания • 34.2₽ заработано")
      Spacer(Modifier.height(16.dp))
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){ Text("Достижения: 7/30"); LinearProgressIndicator(progress={0.23f}, modifier=Modifier.fillMaxWidth()) } }
      Spacer(Modifier.height(12.dp))
      Button(onClick={}, modifier=Modifier.fillMaxWidth()){Text("Редактировать")}
      OutlinedButton(onClick={}, modifier=Modifier.fillMaxWidth()){Text("Приватность")}
    }
  }
}