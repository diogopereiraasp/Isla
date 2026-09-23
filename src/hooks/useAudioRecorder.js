import { useState, useRef } from 'react';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState(null);
  const [recordingUrl, setRecordingUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    setError(null);
    setRecordingBlob(null);
    setRecordingUrl(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordingBlob(audioBlob);
        setRecordingUrl(url);

        // Stop all audio tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      setError("Permissão de microfone negada ou indisponível.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const clearRecording = () => {
    setRecordingBlob(null);
    setRecordingUrl(null);
    setRecordingTime(0);
    setError(null);
  };

  return {
    isRecording,
    recordingBlob,
    recordingUrl,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    setRecordingBlob
  };
}
