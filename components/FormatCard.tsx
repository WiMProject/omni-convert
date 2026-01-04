
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
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 relative group ${
        isSelected
          ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/5 shadow-lg scale-100 z-10'
          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xl hover:-translate-y-1'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      <div className={`mb-3 p-3 rounded-xl transition-colors duration-300 ${
        isSelected 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'bg-slate-50 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'
      }`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{format}</span>
      <p className={`text-[9px] mt-1 font-medium text-center ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}>{description}</p>
    </button>
  );
};

export default FormatCard;
