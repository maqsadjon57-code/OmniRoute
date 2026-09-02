package com.aifitness.pro.ui.screens.plans
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
data class Plan(val id:String, val title:String, val desc:String, val days:Int, val progress:Float)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlansScreen(navController: NavController){
  val plans = listOf(
    Plan("1","100 отжиманий за 30 дней","От новичка до сотки",30,0.35f),
    Plan("2","Сушка 2 недели","Интенсив",14,0.1f),
    Plan("3","Грудь и трицепс","Силовой",21,0.0f)
  )
  Scaffold(topBar={TopAppBar(title={Text("Планы тренировок")})}){p->
    LazyColumn(Modifier.padding(p).padding(16.dp), verticalArrangement=Arrangement.spacedBy(12.dp)){
      items(plans.size){i->
        val pl=plans[i]
        Card(Modifier.fillMaxWidth()){
          Column(Modifier.padding(16.dp)){
            Text(pl.title, style=MaterialTheme.typography.titleLarge)
            Text(pl.desc)
            Spacer(Modifier.height(8.dp))
            LinearProgressIndicator(progress={pl.progress}, modifier=Modifier.fillMaxWidth())
            Spacer(Modifier.height(8.dp))
            Button(onClick={}){Text(if(pl.progress>0)"Продолжить" else "Начать")}
          }
        }
      }
    }
  }
}