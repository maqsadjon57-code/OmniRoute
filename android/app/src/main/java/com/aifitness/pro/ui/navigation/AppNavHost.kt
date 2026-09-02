package com.aifitness.pro.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.aifitness.pro.ui.screens.achievements.AchievementsScreen
import com.aifitness.pro.ui.screens.balance.BalanceScreen
import com.aifitness.pro.ui.screens.competitions.CompetitionsScreen
import com.aifitness.pro.ui.screens.finish.FinishScreen
import com.aifitness.pro.ui.screens.friends.FriendsScreen
import com.aifitness.pro.ui.screens.home.HomeScreen
import com.aifitness.pro.ui.screens.onboarding.OnboardingScreen
import com.aifitness.pro.ui.screens.plans.PlansScreen
import com.aifitness.pro.ui.screens.profile.ProfileScreen
import com.aifitness.pro.ui.screens.settings.SettingsScreen
import com.aifitness.pro.ui.screens.social.SocialFeedScreen
import com.aifitness.pro.ui.screens.splash.SplashScreen
import com.aifitness.pro.ui.screens.stats.StatsScreen
import com.aifitness.pro.ui.screens.training.TrainingScreen

sealed class Screen(val route: String) {
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object Home : Screen("home")
    object Training : Screen("training")
    object Finish : Screen("finish/{reps}/{earned}/{score}") {
        fun create(reps: Int, earned: Float, score: Float) = "finish/$reps/$earned/$score"
    }
    object Stats : Screen("stats")
    object Plans : Screen("plans")
    object Balance : Screen("balance")
    object Competitions : Screen("competitions")
    object Social : Screen("social")
    object Profile : Screen("profile")
    object Friends : Screen("friends")
    object Settings : Screen("settings")
    object Achievements : Screen("achievements")
}

@Composable
fun AppNavHost() {
    val navController = rememberNavController()
    NavHost(navController = navController, startDestination = Screen.Splash.route) {
        composable(Screen.Splash.route) { SplashScreen(navController) }
        composable(Screen.Onboarding.route) { OnboardingScreen(navController) }
        composable(Screen.Home.route) { HomeScreen(navController) }
        composable(Screen.Training.route) { TrainingScreen(navController) }
        composable(Screen.Finish.route) { backStack ->
            val reps = backStack.arguments?.getString("reps")?.toIntOrNull() ?: 0
            val earned = backStack.arguments?.getString("earned")?.toFloatOrNull() ?: 0f
            val score = backStack.arguments?.getString("score")?.toFloatOrNull() ?: 0f
            FinishScreen(navController, reps, earned, score)
        }
        composable(Screen.Stats.route) { StatsScreen(navController) }
        composable(Screen.Plans.route) { PlansScreen(navController) }
        composable(Screen.Balance.route) { BalanceScreen(navController) }
        composable(Screen.Competitions.route) { CompetitionsScreen(navController) }
        composable(Screen.Social.route) { SocialFeedScreen(navController) }
        composable(Screen.Profile.route) { ProfileScreen(navController) }
        composable(Screen.Friends.route) { FriendsScreen(navController) }
        composable(Screen.Settings.route) { SettingsScreen(navController) }
        composable(Screen.Achievements.route) { AchievementsScreen(navController) }
    }
}
