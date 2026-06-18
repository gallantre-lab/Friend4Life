import React, { useState } from "react";
import { Search, Pin, Edit2, Trash2, Shield, Lock, ChevronLeft, Plus, Check } from "lucide-react";
import PinGate from "./PinGate";

export interface JournalEntry {
  id: string;
  date: string;
  time: string;
  type: string;
  content: string;
  user: "Rhon" | "Suz";
}

interface NotesWorkspaceProps {
  currentUser: "Rhon" | "Suz";
  journalEntries: any[];
  onAddEntry: (content: string, type: string, overrideUser?: "Rhon" | "Suz") => void;
  onEditEntry: (id: string, content: string) => void;
  onDeleteEntry: (id: string) => void;
  onBlissInteract: (text: string) => void;
  onLockSession: () => void;
}

export default function NotesWorkspace({
  currentUser,
  journalEntries,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onBlissInteract,
  onLockSession
}: NotesWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSavedMsg, setIsSavedMsg] = useState(false);

  const handleSaveEdit = (id: string) => {
    if (!editContent.trim()) return;
    onEditEntry(id, editContent);
    setEditingId(null);
    setEditContent("");
  };

  const handleAddNewNote = (targetUser: "Rhon" | "Suz") => {
    if(!newNoteContent.trim()) return;
    
    // Auto-route since NotesWorkspace uses expectedPin already
    onAddEntry(newNoteContent, "journal", targetUser);
    
    setNewNoteContent("");
    setIsSavedMsg(true);
    setTimeout(() => setIsSavedMsg(false), 2000);
  };

  const renderNoteList = (targetUser: "Rhon" | "Suz") => {
    const list = journalEntries
      .filter((n) => n.user === targetUser)
      .filter((n) => !searchQuery || n.content.toLowerCase().includes(searchQuery.toLowerCase()) || n.type.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => b.id.localeCompare(a.id));

    return (
      <div className="space-y-4 pt-4">
        <div className="bg-white p-4 rounded-2xl shadow-3xs border border-stone-100 flex flex-col gap-3">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            placeholder={`Write a new note or journal entry for ${targetUser === "Rhon" ? "Rhonda" : "Susan"}...`}
            className="w-full bg-stone-50 border border-stone-200 focus:border-indigo-400 focus:bg-white focus:outline-none rounded-xl p-3 text-sm text-stone-800"
            rows={3}
          />
          <div className="flex justify-between items-center">
            {isSavedMsg ? <span className="text-xs text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Saved securely!</span> : <span />}
            <button 
              onClick={() => handleAddNewNote(targetUser)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <Plus className="w-4 h-4"/> Add Note
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-stone-400 text-sm"
          />
        </div>

        {list.length === 0 ? (
          <div className="text-center py-10 bg-white border border-stone-100 rounded-2xl">
            <p className="text-stone-400 text-sm">No notes found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map(entry => (
              <div key={entry.id} className="bg-white p-4 rounded-2xl shadow-3xs border border-stone-100 relative group">
                <div className="text-[10px] text-stone-400 font-mono tracking-wide flex justify-between mb-2">
                  <span>{new Date(entry.date).toLocaleDateString()} {entry.time}</span>
                  <span className="uppercase text-stone-300 font-black">{entry.type}</span>
                </div>
                
                {editingId === entry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="text-xs bg-stone-200 px-3 py-1.5 rounded-lg font-bold">Cancel</button>
                      <button onClick={() => handleSaveEdit(entry.id)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold flex gap-1 items-center"><Check className="w-3.5 h-3.5"/> Save</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-stone-800 leading-relaxed font-medium whitespace-pre-wrap">{entry.content}</p>
                )}

                {!editingId && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                    <button 
                      onClick={() => { setEditingId(entry.id); setEditContent(entry.content); }}
                      className="p-1.5 bg-stone-100 text-stone-500 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => onDeleteEntry(entry.id)}
                      className="p-1.5 bg-stone-100 text-stone-500 rounded-md hover:bg-rose-50 hover:text-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 bg-white border border-stone-200 rounded-3xl shadow-3xs flex justify-between items-center bg-indigo-50 border-indigo-100">
        <div>
          <h2 className="text-xl font-black text-slate-800">{currentUser === "Rhon" ? "Rhonda's Secure Vault" : "Susan's Secure Vault"}</h2>
          <p className="text-xs text-indigo-500 mt-1 font-semibold">Your private notes and journals</p>
        </div>
        <button
          onClick={onLockSession}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-sm text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
          title="Lock Journal"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          Lock Journal
        </button>
      </div>
      
      <div className="animate-fade-in">
        <div className="flex items-center gap-2 mb-2 px-2">
          <Shield className={`w-4 h-4 ${currentUser === "Rhon" ? "text-amber-500" : "text-emerald-500"}`}/>
          <span className="text-sm font-black text-slate-800">Your Entries</span>
        </div>
        {renderNoteList(currentUser)}
      </div>

    </div>
  );
}
