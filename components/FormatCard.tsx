
import React from 'react';
import { FileFormat } from '../types';

interface FormatCardProps {
  format: FileFormat;
  isSelected: boolean;
  onSelect: (format: FileFormat) => void;
  icon: React.ReactNode;
  description: string;
}

const FormatCard: React.FC<FormatCardProps> = ({ format, isSelected, onSelect, icon, description }) => {
  return (
    <button
      onClick={() => onSelect(format)}
      className={`flex flex-col items-center justify-center p-5 rounded-[1.5rem] border transition-all duration-500 relative group overflow-hidden ${
        isSelected
          ? 'border-blue-500 bg-blue-600 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] scale-[1.02] z-10'
          : 'border-white bg-white/40 hover:border-blue-200 hover:bg-white/80 hover:-translate-y-1 hover:shadow-2xl'
      }`}
    >
      {/* Background decoration for selected state */}
      {isSelected && (
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-2xl" />
      )}
      
      <div className={`mb-3 p-3.5 rounded-2xl transition-all duration-500 ${
        isSelected 
          ? 'bg-white text-blue-600 rotate-[360deg]' 
          : 'bg-slate-100/50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'
      }`}>
        {icon}
      </div>
      
      <span className={`text-[11px] font-black uppercase tracking-[0.15em] ${isSelected ? 'text-white' : 'text-slate-800'}`}>
        {format}
      </span>
      
      <p className={`text-[9px] mt-1.5 font-bold tracking-tight ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
        {description}
      </p>

      {isSelected && (
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white rounded-full animate-ping" />
      )}
    </button>
  );
};

export default FormatCard;
