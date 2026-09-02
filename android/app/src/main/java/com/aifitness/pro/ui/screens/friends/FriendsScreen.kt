package com.aifitness.pro.ui.screens.friends
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FriendsScreen(navController: NavController){
  Scaffold(topBar={TopAppBar(title={Text("Друзья")})}){p->
    Column(Modifier.padding(p).padding(16.dp)){
      OutlinedTextField(value="", onValueChange={}, label={Text("Поиск")}, modifier=Modifier.fillMaxWidth())
      Spacer(Modifier.height(12.dp))
      LazyColumn(verticalArrangement=Arrangement.spacedBy(8.dp)){
        items(10){i->
          ListItem(headlineContent={Text("Друг ${i+1}")}, supportingContent={Text("${(i+1)*10} отжиманий сегодня")}, trailingContent={Button(onClick={}){Text("Чат")}})
        }
      }
    }
  }
}