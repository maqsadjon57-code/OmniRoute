package com.aifitness.pro.ui.screens.competitions
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CompetitionsScreen(navController: NavController){
  Scaffold(topBar={TopAppBar(title={Text("Соревнования")})}){p->
    LazyColumn(Modifier.padding(p).padding(16.dp), verticalArrangement=Arrangement.spacedBy(12.dp)){
      items(5){i->
        Card(Modifier.fillMaxWidth()){
          Column(Modifier.padding(16.dp)){
            Text("Челлендж #${i+1}: 1000 отжиманий", style=MaterialTheme.typography.titleLarge)
            Text("Призовой фонд: ${(i+1)*500}₽ • Участников: ${(i+1)*42}")
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(progress={0.2f+i*0.1f}, modifier=Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            Row(horizontalArrangement=Arrangement.spacedBy(8.dp)){
              Button(onClick={}){Text("Участвовать")}
              OutlinedButton(onClick={}){Text("Лидерборд")}
            }
          }
        }
      }
    }
  }
}