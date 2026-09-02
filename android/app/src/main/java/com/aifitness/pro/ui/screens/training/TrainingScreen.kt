package com.aifitness.pro.ui.screens.training

import android.Manifest
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cameraswitch
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.aifitness.pro.ml.AngleCalculator.Point3D
import com.aifitness.pro.ui.navigation.Screen
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.isGranted
import com.google.accompanist.permissions.rememberPermissionState

@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun TrainingScreen(navController: NavController, vm: TrainingViewModel = hiltViewModel()) {
    val cameraPermission = rememberPermissionState(Manifest.permission.CAMERA)
    val repCount by vm.repCount.collectAsState()
    val feedback by vm.feedback.collectAsState()
    val earned by vm.earned.collectAsState()
    val techniqueScore by vm.techniqueScore.collectAsState()
    val isFront by vm.isFrontCamera.collectAsState()
    val landmarks by vm.landmarks.collectAsState()

    LaunchedEffect(Unit) { if (!cameraPermission.status.isGranted) cameraPermission.launchPermissionRequest() }

    if (!cameraPermission.status.isGranted) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { Text("Нужен доступ к камере") }
        return
    }

    Box(Modifier.fillMaxSize()) {
        // Camera preview
        AndroidView(factory = { ctx -> PreviewView(ctx) }, modifier = Modifier.fillMaxSize())

        Column(Modifier.fillMaxSize().padding(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                IconButton(onClick = { navController.popBackStack() }, modifier = Modifier.background(Color.Black.copy(alpha = 0.4f), shape = MaterialTheme.shapes.small)) {
                    Icon(Icons.Default.Close, null, tint = Color.White)
                }
                IconButton(onClick = { vm.switchCamera() }, modifier = Modifier.background(Color.Black.copy(alpha = 0.4f), shape = MaterialTheme.shapes.small)) {
                    Icon(Icons.Default.Cameraswitch, null, tint = Color.White)
                }
            }
            Spacer(Modifier.weight(1f))
            SkeletonOverlay(landmarks = landmarks, modifier = Modifier.fillMaxWidth().height(300.dp))
            Card(Modifier.fillMaxWidth(), colors = CardDefaults.cardColors(containerColor = Color.Black.copy(alpha = 0.7f))) {
                Column(Modifier.padding(16.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Column {
                            Text("Отжимания: $repCount", color = Color.White, style = MaterialTheme.typography.headlineMedium)
                            Text("Заработано: ${"%.1f".format(earned)} ₽", color = Color(0xFF22C55E))
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("Техника", color = Color.White.copy(alpha = 0.7f))
                            Text("${techniqueScore.toInt()}%", color = if (techniqueScore > 80) Color.Green else Color.Yellow, style = MaterialTheme.typography.headlineSmall)
                        }
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(feedback, color = if (feedback.contains("Отлично")) Color(0xFF22C55E) else Color(0xFFFBBF24), style = MaterialTheme.typography.bodyLarge)
                    Spacer(Modifier.height(12.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceEvenly) {
                        Button(onClick = { vm.finishTraining { reps, earn, score -> navController.navigate(Screen.Finish.create(reps, earn, score)) } }) {
                            Text("Завершить")
                        }
                        OutlinedButton(onClick = { vm.reset() }) { Text("Сброс", color = Color.White) }
                    }
                }
            }
        }
    }
}

@Composable
fun SkeletonOverlay(landmarks: List<Point3D>, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        if (landmarks.size < 33) return@Canvas
        val connections = listOf(
            11 to 12, 11 to 13, 13 to 15, 12 to 14, 14 to 16,
            11 to 23, 12 to 24, 23 to 24, 23 to 25, 24 to 26, 25 to 27, 26 to 28
        )
        connections.forEach { (a, b) ->
            val p1 = landmarks[a]
            val p2 = landmarks[b]
            drawLine(
                color = Color.Green,
                start = androidx.compose.ui.geometry.Offset(p1.x * size.width, p1.y * size.height),
                end = androidx.compose.ui.geometry.Offset(p2.x * size.width, p2.y * size.height),
                strokeWidth = 4f
            )
        }
        landmarks.forEach { pt ->
            drawCircle(
                color = Color(0xFF22C55E),
                radius = 6f,
                center = androidx.compose.ui.geometry.Offset(pt.x * size.width, pt.y * size.height)
            )
        }
    }
}
