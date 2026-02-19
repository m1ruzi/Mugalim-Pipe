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
  onFileSelect: (file: File) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect }) => {
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
      onFileSelect(uploadedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (_file: File) => {
    return "~12 мин";
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-600 tracking-tight text-gray-900 mb-4 sm:mb-6">
          Проанализируйте <br className="hidden sm:inline" />
          <span className="text-carmine-600">свой урок</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-400">
          Загрузите видео своего урока и получите детальный анализ позы, жестикуляции и речи с персональными рекомендациями.
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-apple-gray-50 rounded-3xl p-6 sm:p-10 md:p-12 border border-apple-gray-200 shadow-sm">
        {!uploadedFile ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl md:rounded-3xl p-8 md:p-16 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-carmine-600 bg-carmine-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-100'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center space-y-4 md:space-y-6">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-carmine-600 rounded-2xl flex items-center justify-center shadow-md">
                <Upload className="w-7 h-7 md:w-8 md:h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-600 text-gray-900 mb-2">
                  Загрузите видео урока
                </h3>
                <p className="text-sm sm:text-base text-gray-500 font-400">
                  Перетащите файл сюда или выберите на диске
                </p>
              </div>
              
              <label className="inline-flex items-center px-6 md:px-8 py-2.5 md:py-3 bg-carmine-600 text-white font-600 rounded-full hover:bg-carmine-700 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg active:scale-95 text-sm md:text-base">
                <FileVideo className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Выбрать файл
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              
              <div className="text-xs text-gray-400 font-500 space-y-1">
                <p>MP4, AVI, MOV • 10-15 МИН • ДО 500 МБ</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            {/* File Preview */}
            <div className="bg-apple-gray-100 rounded-2xl p-4 md:p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-carmine-600 rounded-xl flex items-center justify-center shadow-sm">
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-600 text-gray-900">
                      {uploadedFile.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500 font-400">
                      <span className="flex items-center">
                        <FileVideo className="w-3 h-3 md:w-4 md:h-4 mr-1.5 opacity-50" />
                        {formatFileSize(uploadedFile.size)}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1.5 opacity-50" />
                        {formatDuration(uploadedFile)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setUploadedFile(null)}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
            
            {/* Analysis Features */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3">
              {[
                { label: "Поза и осанка", icon: PersonStanding },
                { label: "Жестикуляция", icon: Hand },
                { label: "Мимика", icon: ScanFace },
                { label: "Словарный запас", icon: Languages },
                { label: "Структура речи", icon: Speech }, 
                { label: "Рекомендации", icon: Sparkles }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 md:space-x-3 p-2.5 md:p-3 bg-apple-gray-100 rounded-lg md:rounded-xl border border-gray-200 group hover:bg-carmine-50 hover:border-carmine-200 transition-all duration-300">
                  <div className="w-6 h-6 md:w-7 md:h-7 rounded-lg bg-white flex items-center justify-center group-hover:bg-carmine-600 group-hover:text-white transition-all duration-300 shadow-sm">
                    <feature.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs md:text-sm font-500 text-gray-600 tracking-tight leading-tight">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              className="w-full bg-carmine-600 text-white py-3 md:py-4 px-4 md:px-6 rounded-full font-600 text-base md:text-lg hover:bg-carmine-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 md:space-x-3 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
              <span>Начать анализ урока</span>
            </button>
            
            <p className="text-center text-xs text-gray-400 font-500 uppercase tracking-wider">
              Powered by MediaPipe & Google Gemini AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;