package com.aifitness.pro.voice

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class VoiceCoach(context: Context) : TextToSpeech.OnInitListener {
    private var tts: TextToSpeech = TextToSpeech(context, this)
    private var ready = false

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale("ru", "RU")
            ready = true
        }
    }

    fun speak(text: String) {
        if (!ready) return
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "coach")
    }

    fun speakRep(count: Int) {
        speak("$count")
    }

    fun speakFeedback(feedback: String) {
        speak(feedback)
    }

    fun shutdown() {
        tts.stop()
        tts.shutdown()
    }
}
