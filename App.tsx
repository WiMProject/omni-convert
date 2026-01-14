
import React, { useState, useEffect } from 'react';
import { FileFormat, ConversionStatus } from './types';
import { convertDocument } from './services/geminiService';
import { fileToBase64, downloadFile, getMimeTypeForFormat, getExtensionForFormat } from './utils/fileHelpers';
import FormatCard from './components/FormatCard';

const MarkdownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 12h1"/><path d="M12 18h3"/><path d="M9 15h6"/><path d="M9 18h1"/></svg>;
const JsonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m11 11-2 2 2 2"/><path d="m13 11 2 2-2 2"/></svg>;
const CsvIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h2"/><path d="M14 13h2"/><path d="M8 17h2"/><path d="M14 17h2"/></svg>;
const TextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>;
const HtmlIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/><line x1="12" y1="2" x2="12" y2="22"/></svg>;
const DocIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const RtfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22V4c0-1.1.9-2 2-2h8.5L20 7.5V22H4z"/><polyline points="14 2 14 8 20 8"/></svg>;
const PdfIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="14" r="3"/></svg>;

const languages = [
  { code: 'original', name: '🌍 Original Language' },
  { code: 'Indonesian', name: '🇮🇩 Indonesian' },
  { code: 'English', name: '🇺🇸 English' },
  { code: 'Japanese', name: '🇯🇵 Japanese' },
];

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<FileFormat>(FileFormat.DOCX);
  const [status, setStatus] = useState<ConversionStatus>(ConversionStatus.IDLE);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summarize, setSummarize] = useState(false);
  const [translateTo, setTranslateTo] = useState('original');
  const [highPrecision, setHighPrecision] = useState(false);
  const [copied, setCopied] = useState(false);

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
      setError(err.message || 'System busy. Please try again with Turbo Mode.');
      setStatus(ConversionStatus.ERROR);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Navigation / Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="px-3 py-1 bg-blue-600 text-[10px] font-black text-white rounded-full tracking-widest shadow-lg shadow-blue-500/20">
                STABLE v5.1.0
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-full">
                <span className={`w-2 h-2 rounded-full ${highPrecision ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'}`}></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {highPrecision ? 'Precision Engine' : 'Turbo Engine Active'}
                </span>
              </div>
            </div>
            <h1 className="text-6xl font-[900] tracking-[-0.05em] text-slate-900 leading-none">
              Omni<span className="gradient-text">Convert</span><span className="text-blue-600">.</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-2 tracking-tight">The ultimate document synthesis engine powered by Gemini AI.</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex bg-white/60 p-1.5 rounded-[1.2rem] border border-slate-200/50 backdrop-blur-md shadow-xl">
               <button 
                 onClick={() => setHighPrecision(false)}
                 className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${!highPrecision ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 TURBO
               </button>
               <button 
                 onClick={() => setHighPrecision(true)}
                 className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${highPrecision ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}`}
               >
                 PRECISION
               </button>
             </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Input Panel */}
          <section className="lg:col-span-7 flex flex-col gap-8 animate-in fade-in slide-in-from-left-8 duration-1000 delay-200">
            <div className="glass rounded-[3rem] p-10 flex flex-col gap-10">
              {!selectedFile ? (
                <div className="relative border-4 border-dashed border-slate-200/50 rounded-[2.5rem] p-24 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group bg-white/30 backdrop-blur-sm">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.doc,.docx,.txt,.rtf,.html,image/*" />
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="w-24 h-24 bg-white shadow-2xl rounded-3xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Initialize System Input</h3>
                      <p className="text-sm text-slate-500 font-medium px-10">Upload any document or image. Our neural engine will reconstruct the content with pixel-perfect accuracy.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex items-center justify-between p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -mr-10 -mt-10" />
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500"><DocIcon /></div>
                      <div>
                        <p className="text-lg font-black truncate max-w-[280px] tracking-tight">{selectedFile.name}</p>
                        <p className="text-[10px] text-blue-400 font-black tracking-[0.2em] uppercase">{(selectedFile.size / 1024).toFixed(1)} KB SOURCE DETECTED</p>
                      </div>
                    </div>
                    <button onClick={() => {setSelectedFile(null); setStatus(ConversionStatus.IDLE)}} className="p-3 bg-white/5 hover:bg-white/20 rounded-full transition-all border border-white/10 relative z-10">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    <FormatCard format={FileFormat.DOCX} isSelected={targetFormat === FileFormat.DOCX} onSelect={setTargetFormat} icon={<DocIcon />} description="Microsoft Word" />
                    <FormatCard format={FileFormat.PDF} isSelected={targetFormat === FileFormat.PDF} onSelect={setTargetFormat} icon={<PdfIcon />} description="Adobe PDF" />
                    <FormatCard format={FileFormat.RTF} isSelected={targetFormat === FileFormat.RTF} onSelect={setTargetFormat} icon={<RtfIcon />} description="Standard RTF" />
                    <FormatCard format={FileFormat.HTML} isSelected={targetFormat === FileFormat.HTML} onSelect={setTargetFormat} icon={<HtmlIcon />} description="Semantic HTML" />
                    <FormatCard format={FileFormat.TEXT} isSelected={targetFormat === FileFormat.TEXT} onSelect={setTargetFormat} icon={<TextIcon />} description="Plain Text" />
                    <FormatCard format={FileFormat.MARKDOWN} isSelected={targetFormat === FileFormat.MARKDOWN} onSelect={setTargetFormat} icon={<MarkdownIcon />} description="MD Developer" />
                    <FormatCard format={FileFormat.JSON} isSelected={targetFormat === FileFormat.JSON} onSelect={setTargetFormat} icon={<JsonIcon />} description="JSON Schema" />
                    <FormatCard format={FileFormat.CSV} isSelected={targetFormat === FileFormat.CSV} onSelect={setTargetFormat} icon={<CsvIcon />} description="Data Sheet" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-8 border-t border-slate-200/50">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Target Localization</label>
                      <select value={translateTo} onChange={(e) => setTranslateTo(e.target.value)} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none transition-all cursor-pointer appearance-none shadow-sm">
                        {languages.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className={`flex items-center gap-4 cursor-pointer p-4 rounded-2xl w-full border-2 transition-all duration-300 ${summarize ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white hover:border-blue-200'}`}>
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${summarize ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}>
                          {summarize && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                        </div>
                        <input type="checkbox" checked={summarize} onChange={e => setSummarize(e.target.checked)} className="hidden" />
                        <span className="text-sm font-black text-slate-800 tracking-tight uppercase">Executive Summary Mode</span>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={status === ConversionStatus.PROCESSING}
                    className="w-full py-7 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white font-black rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all duration-500 flex items-center justify-center gap-4 text-xl tracking-tight btn-glow active:scale-[0.98]"
                  >
                    {status === ConversionStatus.PROCESSING ? (
                      <><div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> SYNTHESIZING...</>
                    ) : (
                      <>
                        START NEURAL CONVERSION
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Output Panel */}
          <section className="lg:col-span-5 flex flex-col gap-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-400">
            <div className="glass rounded-[3rem] overflow-hidden flex flex-col min-h-[750px] group/output">
              <div className="p-8 border-b border-slate-200/50 flex items-center justify-between bg-white/40 backdrop-blur-md">
                <div className="flex items-center gap-3">
                   <div className="w-3 h-3 bg-red-400 rounded-full" />
                   <div className="w-3 h-3 bg-amber-400 rounded-full" />
                   <div className="w-3 h-3 bg-green-400 rounded-full" />
                   <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] ml-4">Neural Output Stream</h3>
                </div>
                {result && (
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className={`p-3.5 ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-slate-600'} border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm active:scale-95 flex items-center gap-2`} title="Copy to Clipboard">
                      {copied ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>}
                    </button>
                    <button onClick={handlePrint} className="p-3.5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm text-slate-600 active:scale-95" title="Print/PDF">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    </button>
                    <button onClick={handleDownload} className="p-3.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95" title="Download">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex-1 p-10 overflow-y-auto bg-slate-50/30">
                {status === ConversionStatus.IDLE && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-6">
                    <div className="w-24 h-24 bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center float-anim">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs tracking-[0.3em] uppercase mb-2">Engine Idle</p>
                      <p className="text-xs text-slate-400 max-w-[200px] font-medium leading-relaxed">Waiting for data stream to initialize neural processing.</p>
                    </div>
                  </div>
                )}
                
                {status === ConversionStatus.PROCESSING && (
                  <div className="h-full flex flex-col items-center justify-center space-y-8">
                    <div className="relative">
                      <div className="w-24 h-24 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin shadow-inner"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-2xl animate-pulse blur-lg"></div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-900 font-black tracking-tighter text-xl mb-1">Synthesizing Structure...</p>
                      <p className="text-[10px] text-blue-600 font-black tracking-widest uppercase animate-pulse">Neural Matrix Rebuild</p>
                    </div>
                  </div>
                )}

                {status === ConversionStatus.SUCCESS && result && (
                  <div className="animate-in fade-in zoom-in-95 duration-700">
                    {(targetFormat === FileFormat.HTML || targetFormat === FileFormat.PDF || targetFormat === FileFormat.DOCX) ? (
                      <div className="bg-white p-12 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.1)] border border-slate-100 rounded-[2.5rem] preview-doc min-h-[500px]">
                        <div dangerouslySetInnerHTML={{ __html: result }} className="prose prose-slate max-w-none prose-headings:font-black prose-p:font-medium prose-p:text-slate-600" />
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="absolute top-4 right-4 text-[9px] font-black text-indigo-400/50 uppercase tracking-widest">Format: {targetFormat}</div>
                        <pre className="bg-slate-900 text-indigo-100 p-12 rounded-[2.5rem] text-sm leading-relaxed overflow-x-auto font-mono border-4 border-slate-800 shadow-2xl selection:bg-blue-500/40">
                          <code>{result}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {status === ConversionStatus.ERROR && (
                  <div className="bg-red-50 text-red-700 p-10 rounded-[2.5rem] border border-red-100 shadow-xl shadow-red-500/5 animate-in shake duration-500">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mb-6">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h4 className="font-black text-2xl mb-3 tracking-tighter">System Interrupted</h4>
                    <p className="text-sm font-medium opacity-80 leading-relaxed mb-8">{error}</p>
                    <button onClick={handleConvert} className="w-full px-6 py-4 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95">Re-Attempt Neural Burst</button>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-24 pt-12 border-t border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-8">
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS 1.3 Encryption</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(37,99,235,1)]"></div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural v5.1-Stable</span>
             </div>
           </div>
           
           <div className="flex items-center gap-10">
             <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">© 2026 WiM Project Intelligence</p>
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></div>
             </div>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
