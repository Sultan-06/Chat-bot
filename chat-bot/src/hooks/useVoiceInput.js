import { useState, useRef, useCallback, useEffect } from 'react'
import { getLanguageByCode } from '../utils/languages'

const isSupported =
  typeof window !== 'undefined' &&
  !!(window.SpeechRecognition || window.webkitSpeechRecognition)

export function useVoiceInput({ languageCode = 'en', onTranscript }) {
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    if (isListening) {
      stop()
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    const lang = getLanguageByCode(languageCode)
    recognition.lang = lang.locale
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (e) => {
      let transcript = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript
      }
      onTranscript?.(transcript, e.results[e.results.length - 1].isFinal)
    }

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        setError('Microphone permission denied. Please allow microphone access.')
      } else if (e.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else {
        setError(`Voice error: ${e.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isListening, languageCode, onTranscript, stop])

  return { isListening, isSupported, error, start, stop }
}
