package com.aifitness.pro.ui.screens.stats
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.hilt.navigation.compose.hiltViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StatsScreen(navController: NavController, vm: StatsVM = hiltViewModel()){
  val total by vm.total.collectAsState()
  Scaffold(topBar={TopAppBar(title={Text("Статистика")})}){p->
    Column(Modifier.padding(p).padding(16.dp)){
      Text("Всего отжиманий: $total", style=MaterialTheme.typography.headlineMedium)
      Spacer(Modifier.height(16.dp))
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){ Text("График за неделю (заглушка)"); LinearProgressIndicator(progress={0.7f}, modifier=Modifier.fillMaxWidth()) } }
      Spacer(Modifier.height(12.dp))
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){ Text("Калории: ${total*0.5f} ккал"); Text("Заработано: ${total*0.1f} ₽"); Text("Рекорд: 87 за подход") } }
    }
  }
}
@HiltViewModel
class StatsVM @Inject constructor(db: com.aifitness.pro.data.local.AppDatabase): androidx.lifecycle.ViewModel(){
  val total = kotlinx.coroutines.flow.MutableStateFlow(342)
}