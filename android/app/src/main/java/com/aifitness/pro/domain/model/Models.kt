package com.aifitness.pro.domain.model

data class User(val id:String, val email:String, val displayName:String, val balance:Float, val totalReps:Int, val level:Int, val isPremium:Boolean)
data class Workout(val id:String, val exerciseType:String, val reps:Int, val earnedRub:Float, val techniqueScore:Float, val timestamp:Long)
data class Achievement(val id:String, val title:String, val progress:Int, val target:Int, val unlocked:Boolean)
