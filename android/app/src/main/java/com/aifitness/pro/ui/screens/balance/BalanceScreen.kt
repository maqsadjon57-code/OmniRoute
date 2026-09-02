package com.aifitness.pro.ui.screens.balance
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BalanceScreen(navController: NavController){
  var balance by remember{ mutableStateOf(23.5f) }
  Scaffold(topBar={TopAppBar(title={Text("Баланс и магазин")})}){p->
    Column(Modifier.padding(p).padding(16.dp)){
      Card(Modifier.fillMaxWidth(), colors=CardDefaults.cardColors(containerColor=MaterialTheme.colorScheme.primaryContainer)){
        Column(Modifier.padding(20.dp)){
          Text("Баланс: ${"%.1f".format(balance)} ₽", style=MaterialTheme.typography.headlineMedium)
          Spacer(Modifier.height(8.dp))
          Button(onClick={}){Text("Вывести от 100₽")}
          Text("Комиссия 5-10%, верификация по телефону", style=MaterialTheme.typography.bodySmall)
        }
      }
      Spacer(Modifier.height(16.dp))
      Text("Заработать больше", style=MaterialTheme.typography.titleMedium)
      Row(Modifier.fillMaxWidth(), horizontalArrangement=Arrangement.spacedBy(8.dp)){
        Card(Modifier.weight(1f)){ Column(Modifier.padding(12.dp)){ Text("📺 Реклама"); Text("+0.5₽"); Button(onClick={balance+=0.5f}){Text("Смотреть")} } }
        Card(Modifier.weight(1f)){ Column(Modifier.padding(12.dp)){ Text("👥 Реферал"); Text("+10₽"); Button(onClick={}){Text("Пригласить")} } }
      }
      Spacer(Modifier.height(16.dp))
      Text("Магазин", style=MaterialTheme.typography.titleMedium)
      LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){
        items(5){i->
          ListItem(headlineContent={Text(listOf("Тема Neon","Бейдж Чемпион","Без рекламы 7д","Аналитика PRO","Буст x1.5")[i])}, supportingContent={Text("${(i+1)*10}₽")}, trailingContent={Button(onClick={}){Text("Купить")}})
        }
      }
    }
  }
}