package com.aifitness.pro.ui.screens.social
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SocialFeedScreen(navController: NavController){
  Scaffold(topBar={TopAppBar(title={Text("Лента")})}, floatingActionButton={FloatingActionButton(onClick={}){Text("+")}}){p->
    LazyColumn(Modifier.padding(p).padding(16.dp), verticalArrangement=Arrangement.spacedBy(12.dp)){
      items(10){i->
        Card(Modifier.fillMaxWidth()){
          Column(Modifier.padding(16.dp)){
            Text("Алексей • 2ч назад", style=MaterialTheme.typography.labelMedium)
            Spacer(Modifier.height(4.dp))
            Text("Сделал 50 отжиманий за подход! Новый рекорд 🔥 Заработал 5₽")
            Spacer(Modifier.height(8.dp))
            Row{ Icon(Icons.Default.Favorite, null); Spacer(Modifier.width(4.dp)); Text("${12+i} лайков") }
          }
        }
      }
    }
  }
}