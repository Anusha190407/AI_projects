import React, { useState } from 'react';
import { initialDocs, initialChunks, searchKnowledgeChunks, processUploadedDocument } from '../../engine/ragEngine';
import { KnowledgeDoc, KnowledgeChunk, SearchResult } from '../../types';
import {
  BookOpen,
  Search,
  Upload,
  FileText,
  FileCode,
  File,
  Layers,
  Sparkles,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(initialDocs);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>(initialChunks);
  const [searchQuery, setSearchQuery] = useState('liquidated damages for delivery delay');
  const [searchResults, setSearchResults] = useState<SearchResult[]>(() => searchKnowledgeChunks('liquidated damages for delivery delay'));
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDoc | null>(initialDocs[0]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = searchKnowledgeChunks(searchQuery, chunks);
    setSearchResults(res);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = String(evt.target?.result || '');
      const docType: KnowledgeDoc['type'] = file.name.endsWith('.md')
        ? 'MD'
        : file.name.endsWith('.txt')
        ? 'TXT'
        : file.name.endsWith('.pdf')
        ? 'PDF'
        : 'DOCX';

      const { doc, chunks: newChunks } = processUploadedDocument(file.name, text, docType);
      setDocs(prev => [doc, ...prev]);
      setChunks(prev => [...newChunks, ...prev]);
      alert(`Ingested "${file.name}" into RAG Vector Store (${newChunks.length} chunks generated).`);
    };
    reader.readAsText(file);
  };

  const docChunks = chunks.filter(c => c.doc_id === selectedDoc?.id);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Vector RAG Knowledge Architecture
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Legal Contracts, SLAs & Disruption Playbooks
          </h2>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md cursor-pointer transition">
          <Upload className="w-4 h-4" />
          <span>Upload Document (PDF, MD, TXT)</span>
          <input type="file" accept=".pdf,.txt,.md,.docx" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Semantic Search Console */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Semantic Vector Query & Similarity Search
          </h3>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Query supplier liability, festive penalties, or blend yarn rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition"
          >
            Search Chunks
          </button>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2.5 pt-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Top Ranked Retrieved Chunks (BM25 / Cosine Distance):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/20 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-600 dark:text-blue-400 truncate">
                      {res.chunk.doc_name} &bull; Chunk #{res.chunk.chunk_index}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                      {Math.round(res.score * 100)}% Match
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 font-mono text-[11px] leading-relaxed line-clamp-4">
                    {res.chunk.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Library & Chunk Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-500" />
            Ingested Documents ({docs.length})
          </h3>

          <div className="space-y-2">
            {docs.map(doc => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 shadow-sm'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span className="truncate">{doc.name}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {doc.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{doc.chunks_count} chunks &bull; {doc.size_kb} KB</span>
                    <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chunk Inspection Viewer */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Extracted Chunks: {selectedDoc?.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Token window ~500 tokens with 50-token semantic overlap
              </p>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {docChunks.length} Chunks
            </span>
          </div>

          <div className="space-y-3">
            {docChunks.map((chunk, idx) => (
              <div
                key={chunk.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>CHUNK #{chunk.chunk_index} &bull; ID: {chunk.id}</span>
                  <span>~{chunk.tokens_estimate} tokens</span>
                </div>
                <div className="font-mono text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap text-[11px]">
                  {chunk.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

