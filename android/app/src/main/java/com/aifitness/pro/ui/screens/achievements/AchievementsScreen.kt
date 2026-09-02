package com.aifitness.pro.ui.screens.achievements
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AchievementsScreen(navController: NavController){
  val badges = listOf("Первые 10","50 в день","100 за раз","Марафонец","Технарь","Социальный","Чемпион","Легенда")
  Scaffold(topBar={TopAppBar(title={Text("Достижения")})}){p->
    LazyVerticalGrid(columns=GridCells.Fixed(2), modifier=Modifier.padding(p).padding(16.dp), verticalArrangement=Arrangement.spacedBy(12.dp), horizontalArrangement=Arrangement.spacedBy(12.dp)){
      items(badges.size){i->
        Card(Modifier.height(120.dp)){
          Column(Modifier.fillMaxSize().padding(12.dp), verticalArrangement=Arrangement.Center, horizontalAlignment=Alignment.CenterHorizontally){
            Text("🏅", style=MaterialTheme.typography.displaySmall)
            Text(badges[i])
            LinearProgressIndicator(progress={if(i<3)1f else 0.3f}, modifier=Modifier.fillMaxWidth().padding(top=8.dp))
          }
        }
      }
    }
  }
}