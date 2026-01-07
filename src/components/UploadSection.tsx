import React, { useCallback, useState } from 'react';
import { 
  Upload, 
  Play, 
  FileVideo, 
  Clock, 
  CheckCircle, 
  X,
  PersonStanding, 
  Hand, 
  ScanFace, 
  Languages, 
  Speech, // Обновлено: новая иконка для структуры речи
  Sparkles 
} from 'lucide-react';

interface UploadSectionProps {
  onFileUpload: (file: File) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileUpload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
      }
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('video/')) {
        setUploadedFile(file);
      }
    }
  };

  const handleAnalyze = () => {
    if (uploadedFile) {
      onFileUpload(uploadedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (file: File) => {
    return "~12 мин";
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-black mb-6">
          Проанализируйте свой урок <br />
          <span className="font-extralight text-black/40 tracking-tight">с помощью ИИ</span>
        </h1>
        <p className="text-xl text-black/50 max-w-2xl mx-auto leading-relaxed font-light">
          Загрузите видео своего урока и получите детальный анализ позы, жестикуляции и речи с рекомендациями.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-[24px] md:rounded-[40px] p-6 md:p-10 border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
        {!uploadedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-[24px] md:rounded-[32px] p-8 md:p-12 text-center transition-all duration-500 ${
              dragActive 
                ? 'border-black bg-[#F5F5F7]' 
                : 'border-black/10 hover:border-black/20 hover:bg-[#F5F5F7]/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-6 md:space-y-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-3xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110">
                <Upload className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-xl md:text-2xl font-semibold text-black mb-2 tracking-tight">
                  Загрузите видео урока
                </h3>
                <p className="text-black/40 mb-6 md:mb-8 font-light text-sm md:text-base">
                  Перетащите файл сюда или выберите на диске
                </p>
                
                <label className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-black text-white font-medium rounded-full hover:bg-neutral-800 transition-all duration-300 cursor-pointer shadow-lg active:scale-95 text-sm md:text-base">
                  <FileVideo className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Выбрать файл
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-black/30 font-bold space-y-1">
                <p>MP4, AVI, MOV • 10-15 МИН • ДО 500 МБ</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-500">
            {/* File Preview */}
            <div className="bg-[#F5F5F7] rounded-2xl md:rounded-3xl p-4 md:p-6 border border-black/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-5">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-2xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-black tracking-tight">
                      {uploadedFile.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-black/40 font-medium">
                      <span className="flex items-center">
                        <FileVideo className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5 opacity-40" />
                        {formatFileSize(uploadedFile.size)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5 opacity-40" />
                        {formatDuration(uploadedFile)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setUploadedFile(null)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-black/20 hover:text-black transition-all"
                >
                  <X className="w-4 h-4 md:w-6 md:h-6" />
                </button>
              </div>
            </div>
            
            {/* Analysis Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              {[
                { label: "Поза и осанка", icon: PersonStanding },
                { label: "Жестикуляция", icon: Hand },
                { label: "Мимика", icon: ScanFace },
                { label: "Словарный запас", icon: Languages },
                { label: "Структура речи", icon: Speech }, 
                { label: "Рекомендации", icon: Sparkles }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 bg-[#F5F5F7]/50 rounded-xl md:rounded-2xl border border-black/[0.03] group hover:bg-white hover:shadow-sm transition-all duration-300">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-black/[0.03] flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <feature.icon className="w-3 h-3 md:w-4 md:h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-black/70 tracking-tight leading-none">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              className="w-full bg-black text-white py-4 md:py-5 px-4 md:px-6 rounded-xl md:rounded-2xl font-semibold text-base md:text-lg hover:bg-neutral-800 transition-all duration-300 shadow-xl flex items-center justify-center space-x-2 md:space-x-3 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span>Начать анализ урока</span>
            </button>
            
            <p className="text-center text-[10px] md:text-[12px] text-black/30 font-medium uppercase tracking-widest">
              Powered by MediaPipe & Google Gemini AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;