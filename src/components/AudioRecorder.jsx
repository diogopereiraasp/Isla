import React from 'react';
import { Mic, Square, Trash2, Play, Volume2, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

export default function AudioRecorder({ onAudioRecorded, initialAudioBlob = null }) {
  const {
    isRecording,
    recordingBlob,
    recordingUrl,
    recordingTime,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    setRecordingBlob
  } = useAudioRecorder();

  // Se já tinha um blob inicial salvo
  const [hasExistingAudio, setHasExistingAudio] = React.useState(!!initialAudioBlob);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    stopRecording();
  };

  // Notificar pai quando blob mudar
  React.useEffect(() => {
    if (recordingBlob) {
      onAudioRecorded(recordingBlob);
      setHasExistingAudio(false);
    }
  }, [recordingBlob, onAudioRecorded]);

  const handleClear = () => {
    clearRecording();
    setHasExistingAudio(false);
    onAudioRecorded(null);
  };

  const playRecorded = () => {
    if (recordingUrl) {
      new Audio(recordingUrl).play();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className={`w-4 h-4 ${isRecording ? 'text-red-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-xs font-semibold text-slate-200">Gravar Áudio com Microfone</span>
        </div>
        {isRecording && (
          <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {error && (
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !recordingBlob && !hasExistingAudio && (
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-2.5 px-4 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Iniciar Gravação de Voz</span>
          </button>
        )}

        {isRecording && (
          <button
            type="button"
            onClick={handleStop}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-xs flex items-center justify-center gap-2 transition pulse-record shadow-lg shadow-red-900/40"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Parar e Salvar Gravação</span>
          </button>
        )}

        {(recordingBlob || hasExistingAudio) && !isRecording && (
          <div className="flex-1 flex items-center justify-between bg-slate-800/80 border border-slate-700/70 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00c57c]"></span>
              <span className="text-xs text-slate-300 font-medium">Áudio gravado pronto</span>
            </div>
            <div className="flex items-center gap-1.5">
              {recordingUrl && (
                <button
                  type="button"
                  onClick={playRecorded}
                  className="p-1.5 bg-[#00c57c]/10 text-[#00c57c] hover:bg-[#00c57c]/20 rounded-lg transition"
                  title="Ouvir Gravação"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition"
                title="Descartar Gravação"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
