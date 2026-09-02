package com.aifitness.pro.ui.screens.settings
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(navController: NavController){
  var voice by remember{ mutableStateOf(true) }
  var frontCam by remember{ mutableStateOf(false) }
  Scaffold(topBar={TopAppBar(title={Text("Настройки")})}){p->
    Column(Modifier.padding(p).padding(16.dp), verticalArrangement=Arrangement.spacedBy(12.dp)){
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){
        Text("Камера")
        Row(Modifier.fillMaxWidth(), horizontalArrangement=Arrangement.SpaceBetween){ Text("Фронтальная по умолчанию"); Switch(checked=frontCam, onCheckedChange={frontCam=it}) }
      }}
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){
        Text("Звук")
        Row(Modifier.fillMaxWidth(), horizontalArrangement=Arrangement.SpaceBetween){ Text("Голосовой тренер"); Switch(checked=voice, onCheckedChange={voice=it}) }
      }}
      Card(Modifier.fillMaxWidth()){ Column(Modifier.padding(16.dp)){
        Text("Тема: Система • Язык: Русский")
        Text("Экспорт данных, удаление аккаунта (GDPR)")
      }}
      Button(onClick={}, modifier=Modifier.fillMaxWidth()){Text("Выйти")}
    }
  }
}