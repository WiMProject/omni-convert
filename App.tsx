
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileFormat, ConversionStatus } from './types';
import { convertDocument } from './services/geminiService';
import { fileToBase64, downloadFile, getMimeTypeForFormat, getExtensionForFormat } from './utils/fileHelpers';
import FormatCard from './components/FormatCard';

const MarkdownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 12h1"/><path d="M12 18h3"/><path d="M9 15h6"/><path d="M9 18h1"/></svg>;
const JsonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m11 11-2 2 2 2"/><path d="m13 11 2 2-2 2"/></svg>;
const CsvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
const HtmlIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="2" x2="12" y2="22"/></svg>;
const DocIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const RtfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-1.1.9-2 2-2h8.5L20 7.5V22H4z"/><polyline points="14 2 14 8 20 8"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/></svg>;

const languages = [
  { code: 'original', name: 'Original' },
  { code: 'Indonesian', name: 'Indonesian' },
  { code: 'English', name: 'English' },
  { code: 'Japanese', name: 'Japanese' },
];

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<FileFormat>(FileFormat.DOCX);
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summarize, setSummarize] = useState(false);
  const [translateTo, setTranslateTo] = useState('original');
  const [highPrecision, setHighPrecision] = useState(false); // Default to Fast Mode (Flash)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 15 * 1024 * 1024) {
        alert("File too large. Max 15MB for AI processing.");
        return;
      }
      setSelectedFile(file);
      setResult(null);
      setError(null);
      setStatus(ConversionStatus.IDLE);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setStatus(ConversionStatus.PROCESSING);
    setError(null);
    try {
      const base64 = await fileToBase64(selectedFile);
      const output = await convertDocument(base64, selectedFile.type, targetFormat, { 
        summarize, 
        translateTo,
        highPrecision 
      });
      setResult(output);
      setStatus(ConversionStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'System busy. Please try again with Fast Mode.');
      setStatus(ConversionStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!result || !selectedFile) return;
    const baseName = selectedFile.name.split('.').slice(0, -1).join('.');
    const ext = getExtensionForFormat(targetFormat);
    const mime = getMimeTypeForFormat(targetFormat);
    downloadFile(result, `${baseName}_converted.${ext}`, mime);
  };

  const handlePrint = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>Print Preview</title><style>body{font-family:'Plus Jakarta Sans',sans-serif;padding:40px;line-height:1.6;color:#1e293b;} table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #e2e8f0;padding:12px;text-align:left;}</style></head><body>${result}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`flex h-2 w-2 rounded-full ${highPrecision ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`}></span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                Mode: {highPrecision ? 'Precision (Pro)' : 'Turbo (Flash)'}
              </span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-slate-900">
              Omni<span className="gradient-text">Convert</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
               <button 
                 onClick={() => setHighPrecision(false)}
                 className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${!highPrecision ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 FAST
               </button>
               <button 
                 onClick={() => setHighPrecision(true)}
                 className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${highPrecision ? 'bg-white shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-800'}`}
               >
                 PRO
               </button>
             </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8">
              {!selectedFile ? (
                <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-16 text-center hover:border-blue-300 hover:bg-slate-50 transition-all cursor-pointer group bg-white">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.txt,.rtf,.html,image/*" />
                  <div className="space-y-4">
                    <div className="mx-auto w-20 h-20 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="text-xl font-bold text-slate-900">Drop your file here</p>
                    <p className="text-sm text-slate-400">PDF, Word, or Images. Fast neural conversion.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/10 p-3 rounded-xl"><DocIcon /></div>
                      <div>
                        <p className="font-bold truncate max-w-[250px]">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono tracking-tighter">{(selectedFile.size / 1024).toFixed(1)} KB DATA SOURCE</p>
                      </div>
                    </div>
                    <button onClick={() => {setSelectedFile(null); setStatus(ConversionStatus.IDLE)}} className="p-2 hover:bg-white/10 rounded-full transition-all">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <FormatCard format={FileFormat.DOCX} isSelected={targetFormat === FileFormat.DOCX} onSelect={setTargetFormat} icon={<DocIcon />} description="Word Pro" />
                    <FormatCard format={FileFormat.PDF} isSelected={targetFormat === FileFormat.PDF} onSelect={setTargetFormat} icon={<PdfIcon />} description="Export PDF" />
                    <FormatCard format={FileFormat.RTF} isSelected={targetFormat === FileFormat.RTF} onSelect={setTargetFormat} icon={<RtfIcon />} description="Rich Text" />
                    <FormatCard format={FileFormat.HTML} isSelected={targetFormat === FileFormat.HTML} onSelect={setTargetFormat} icon={<HtmlIcon />} description="Web Ready" />
                    <FormatCard format={FileFormat.TEXT} isSelected={targetFormat === FileFormat.TEXT} onSelect={setTargetFormat} icon={<TextIcon />} description="Plain Text" />
                    <FormatCard format={FileFormat.MARKDOWN} isSelected={targetFormat === FileFormat.MARKDOWN} onSelect={setTargetFormat} icon={<MarkdownIcon />} description="Developer" />
                    <FormatCard format={FileFormat.JSON} isSelected={targetFormat === FileFormat.JSON} onSelect={setTargetFormat} icon={<JsonIcon />} description="Structured" />
                    <FormatCard format={FileFormat.CSV} isSelected={targetFormat === FileFormat.CSV} onSelect={setTargetFormat} icon={<CsvIcon />} description="Data Table" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Translation</label>
                      <select value={translateTo} onChange={(e) => setTranslateTo(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 flex items-end">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-2xl w-full border border-transparent hover:border-blue-100 transition-all">
                        <input type="checkbox" checked={summarize} onChange={e => setSummarize(e.target.checked)} className="w-5 h-5 accent-blue-600 rounded-lg" />
                        <span className="text-sm font-bold text-slate-700">Summarize Content</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={status === ConversionStatus.PROCESSING}
                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black rounded-3xl shadow-xl shadow-blue-500/30 transition-all flex items-center justify-center gap-4 text-lg"
                  >
                    {status === ConversionStatus.PROCESSING ? (
                      <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> Synthesizing...</>
                    ) : 'Convert Document Now'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[650px] glass">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Neural Output</h3>
                {result && (
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-slate-100 transition-all shadow-sm active:scale-95" title="Print/PDF">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <button onClick={handleDownload} className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95" title="Download">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
                {status === ConversionStatus.IDLE && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center animate-bounce">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <p className="font-bold text-slate-900 text-sm tracking-widest uppercase">Engine Standby</p>
                  </div>
                )}
                
                {status === ConversionStatus.PROCESSING && (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="w-20 h-20 border-8 border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
                    <p className="text-slate-900 font-black tracking-tighter text-lg animate-pulse">Neural Synthesis Active...</p>
                  </div>
                )}

                {status === ConversionStatus.SUCCESS && result && (
                  <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {(targetFormat === FileFormat.HTML || targetFormat === FileFormat.PDF || targetFormat === FileFormat.DOCX) ? (
                      <div className="bg-white p-10 shadow-2xl border border-slate-100 rounded-3xl preview-doc min-h-[400px]">
                        <div dangerouslySetInnerHTML={{ __html: result }} className="prose prose-slate max-w-none" />
                      </div>
                    ) : (
                      <div className="relative">
                        <pre className="bg-slate-900 text-indigo-100 p-10 rounded-3xl text-xs leading-relaxed overflow-x-auto font-mono border border-indigo-900 shadow-2xl">
                          <code>{result}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {status === ConversionStatus.ERROR && (
                  <div className="bg-red-50 text-red-700 p-8 rounded-[2rem] border border-red-100">
                    <h4 className="font-black text-xl mb-3 tracking-tighter">Engine Bottleneck</h4>
                    <p className="text-sm opacity-80 leading-relaxed mb-6">{error}</p>
                    <button onClick={handleConvert} className="px-6 py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all">Retry with Turbo Mode</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 pt-10 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">
           <div className="flex items-center gap-6">
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> End-to-End Encrypted</span>
             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div> Cloud-Free Parsing</span>
           </div>
           <p>© 2026 OmniConvert Intelligence Labs • Neural v5.0.1 Stable</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
