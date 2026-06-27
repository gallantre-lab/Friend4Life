import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Clock, X, Edit2
} from "lucide-react";

interface CalendarWorkspaceProps {
  currentUser: "Rhon" | "Suz";
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  weightHistory: any[]; // Kept for prop signature compat, but unused
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  notes: string;
}

export default function CalendarWorkspace({
  currentUser,
  selectedDate,
  setSelectedDate
}: CalendarWorkspaceProps) {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem("forlife_calendar_events");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [viewMode, setViewMode] = useState<"month" | "day">("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Current active month reference for month browsing
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    return new Date(selectedDate + "T00:00:00");
  });

  const todayStr = new Date().toISOString().substring(0, 10);

  // New/Editing event form state
  const [newEvent, setNewEvent] = useState({ title: "", time: "", notes: "" });

  useEffect(() => {
    localStorage.setItem("forlife_calendar_events", JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return;

    if (editingEventId) {
      // Edit mode
      setEvents(events.map(ev => {
        if (ev.id === editingEventId) {
          return {
            ...ev,
            title: newEvent.title.trim(),
            time: newEvent.time,
            notes: newEvent.notes.trim(),
            date: selectedDate
          };
        }
        return ev;
      }));
      setEditingEventId(null);
    } else {
      // Add mode
      const event: CalendarEvent = {
        id: "ev_" + Date.now(),
        title: newEvent.title.trim(),
        date: selectedDate,
        time: newEvent.time,
        notes: newEvent.notes.trim()
      };
      setEvents([...events, event]);
    }
    setNewEvent({ title: "", time: "", notes: "" });
  };

  const startEditEvent = (ev: CalendarEvent) => {
    setEditingEventId(ev.id);
    setNewEvent({
      title: ev.title,
      time: ev.time,
      notes: ev.notes
    });
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setNewEvent({ title: "", time: "", notes: "" });
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(ev => ev.id !== id));
    if (editingEventId === id) {
      cancelEditEvent();
    }
  };

  // Month Math Helpers
  const year = currentMonthDate.getFullYear();
  const monthIdx = currentMonthDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, monthIdx - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, monthIdx + 1, 1));
  };

  // Get days in current month grid
  const getDaysInMonthGrid = () => {
    const firstDayOfMonth = new Date(year, monthIdx, 1);
    const lastDayOfMonth = new Date(year, monthIdx + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); 
    const totalDays = lastDayOfMonth.getDate();

    const grid = [];

    // Pad previous month days
    const prevMonthLastDay = new Date(year, monthIdx, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDay = prevMonthLastDay - i;
      const prevMonthIdx = monthIdx === 0 ? 11 : monthIdx - 1;
      const prevYear = monthIdx === 0 ? year - 1 : year;
      const iso = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, "0")}-${String(prevDay).padStart(2, "0")}`;
      grid.push({ dayNum: prevDay, isCurrentMonth: false, isoDate: iso });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const iso = `${year}-${String(monthIdx + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      grid.push({ dayNum: i, isCurrentMonth: true, isoDate: iso });
    }

    // Pad next month days to complete grid 42 cells
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthIdx = monthIdx === 11 ? 0 : monthIdx + 1;
      const nextYear = monthIdx === 11 ? year + 1 : year;
      const iso = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      grid.push({ dayNum: i, isCurrentMonth: false, isoDate: iso });
    }

    return grid;
  };

  const daysGrid = getDaysInMonthGrid();
  const currentMonthLabel = currentMonthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const selectedDateEvents = events.filter(e => e.date === selectedDate).sort((a,b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-4 font-sans text-stone-800">
      
      {/* View selector and Calendar Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 p-4 rounded-2xl shadow-3xs">
        <div>
          <h2 className="text-xl font-black tracking-tight text-purple-900 m-0 leading-tight">Shared Scheduling</h2>
          <p className="text-xs text-stone-500 m-0 mt-0.5 font-medium">Shared calendar for Rhonda and Susan's appointments and plans.</p>
        </div>

        <div className="flex bg-stone-100 p-1 rounded-xl items-center text-xs">
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className={`px-4 py-1.5 rounded-lg font-black text-center transition-all cursor-pointer ${
              viewMode === "month" ? "bg-purple-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Month View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`px-4 py-1.5 rounded-lg font-black text-center transition-all cursor-pointer ${
              viewMode === "day" ? "bg-purple-600 text-white shadow-xs" : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Day View
          </button>
        </div>
      </div>

      {viewMode === "month" ? (
        <div className="w-full">
          
          {/* Month calendar panel - Full Width */}
          <div className="p-4 bg-white border border-stone-200 rounded-2xl shadow-3xs space-y-3.5">
            
            {/* Headers navigation */}
            <div className="flex items-center justify-between pb-1">
              <h3 className="m-0 text-lg font-black text-slate-800 tracking-tight">{currentMonthLabel}</h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5 text-stone-600" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentMonthDate(new Date(todayStr + "T00:00:00"));
                    setSelectedDate(todayStr);
                  }}
                  className="px-3 py-1 font-bold text-stone-600 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 text-sm"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 transition"
                  title="Next Month"
                >
                  <ChevronRight className="w-5 h-5 text-stone-600" />
                </button>
              </div>
            </div>

            {/* Week labels */}
            <div className="grid grid-cols-7 text-center text-xs font-bold text-stone-400">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysGrid.map((cell, idx) => {
                const isSelected = cell.isoDate === selectedDate;
                const isToday = cell.isoDate === todayStr;
                const dateEvents = events.filter(e => e.date === cell.isoDate);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedDate(cell.isoDate);
                      setIsModalOpen(true);
                    }}
                    className={`h-24 p-1.5 relative rounded-xl border flex flex-col items-start transition-all cursor-pointer ${
                      cell.isCurrentMonth ? "bg-white" : "bg-stone-50/50 text-stone-400"
                    } ${
                      isSelected 
                        ? "border-purple-400 bg-purple-50 ring-1 ring-purple-300" 
                        : isToday
                          ? "border-purple-500 font-black text-purple-700"
                          : "border-stone-100 hover:border-stone-300"
                    }`}
                  >
                    <span className={`text-xs font-bold ${isToday ? "text-purple-600" : ""}`}>{cell.dayNum}</span>
                    
                    {dateEvents.length > 0 && (
                      <div className="mt-1 w-full flex flex-col gap-0.5 overflow-hidden">
                         {dateEvents.slice(0,2).map(ev => (
                           <div key={ev.id} className="text-[9px] bg-purple-100 text-purple-800 px-1 py-0.5 rounded truncate font-medium w-full text-left">
                             {ev.time ? `[${ev.time}] ` : ""}{ev.title}
                           </div>
                         ))}
                         {dateEvents.length > 2 && (
                           <div className="text-[9px] text-stone-500 font-medium pl-1 text-left">+{dateEvents.length - 2} more</div>
                         )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            
          </div>

        </div>
      ) : (
        /* Full Day View */
        <div className="max-w-xl mx-auto space-y-4">
           <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-3xs flex items-center justify-between">
              <div>
                 <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider font-mono mb-0.5">Day View</p>
                 <h3 className="m-0 text-lg font-black text-slate-800">
                   {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                 </h3>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) { setSelectedDate(e.target.value); setCurrentMonthDate(new Date(e.target.value + "T00:00:00")); }
                }}
                className="bg-stone-50 border border-stone-200 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-bold text-slate-800 py-1.5 px-3 rounded-xl cursor-pointer transition"
              />
           </div>

           <div className="bg-white border border-purple-200 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-black text-purple-900 m-0">
                {editingEventId ? "✏️ Edit Event" : "➕ Add New Event"}
              </h4>
              <form onSubmit={handleSaveEvent} className="space-y-3">
                 <div>
                   <label className="text-xs font-bold text-stone-500 mb-1 block">Event Title</label>
                   <input required autoFocus type="text" placeholder="e.g. RHON: Dentist appointment" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" />
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="text-xs font-bold text-stone-500 mb-1 block">Time (Optional)</label>
                     <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-stone-500 mb-1 block">Date</label>
                     <input type="date" value={selectedDate} onChange={e => {
                       if (e.target.value) {
                         setSelectedDate(e.target.value);
                         setCurrentMonthDate(new Date(e.target.value + "T00:00:00"));
                       }
                     }} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400" />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-stone-500 mb-1 block">Notes (Optional)</label>
                   <textarea rows={3} placeholder="Any details..." value={newEvent.notes} onChange={e => setNewEvent({...newEvent, notes: e.target.value})} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-purple-400" />
                 </div>
                 <div className="flex justify-end gap-2 pt-2">
                   {editingEventId && (
                     <button type="button" onClick={cancelEditEvent} className="px-4 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100">Cancel Edit</button>
                   )}
                   <button type="submit" className="px-5 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-700">
                     {editingEventId ? "Save Changes" : "Save Event"}
                   </button>
                 </div>
              </form>
           </div>

           <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-12 bg-stone-50 border border-stone-200 border-dashed rounded-2xl text-stone-400">
                  <p className="text-sm font-medium">Your schedule is clear for this day.</p>
                </div>
              ) : (
                selectedDateEvents.map((ev) => (
                  <div key={ev.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative group flex flex-col md:flex-row md:items-start justify-between gap-4">
                     <div className="space-y-1 overflow-hidden">
                        <h4 className="font-bold text-slate-900 m-0 leading-tight">{ev.title}</h4>
                        {ev.time && <div className="text-[10px] text-purple-600 font-bold flex items-center gap-1 uppercase tracking-wider"><Clock className="w-3 h-3"/>{ev.time}</div>}
                        {ev.notes && <p className="text-sm text-stone-600 mt-2 leading-relaxed m-0 whitespace-pre-wrap">{ev.notes}</p>}
                     </div>
                     <div className="flex items-center gap-1 self-end md:self-start shrink-0">
                       <button onClick={() => startEditEvent(ev)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center hover:bg-purple-100 hover:text-purple-600 transition" title="Edit">
                         <Edit2 className="w-3.5 h-3.5" />
                       </button>
                       <button onClick={() => handleDeleteEvent(ev.id)} className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition" title="Delete">
                         <Trash2 className="w-3.5 h-3.5" />
                       </button>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      )}

      {/* Centered Popup/Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden border border-stone-150">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between shrink-0 bg-purple-900 text-white">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider font-mono">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <h3 className="m-0 text-sm font-black text-white">Scheduled Events</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  cancelEditEvent();
                }}
                className="w-8 h-8 rounded-full bg-purple-850 hover:bg-purple-800 flex items-center justify-center text-white transition cursor-pointer border border-purple-800/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* Event List */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">Current Events</h4>
                {selectedDateEvents.length === 0 ? (
                  <div className="text-center py-6 bg-stone-50 border border-stone-150 border-dashed rounded-2xl text-stone-400">
                    <CalendarIcon className="w-8 h-8 opacity-20 mx-auto mb-2" />
                    <p className="text-xs font-semibold">No events scheduled for this day.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedDateEvents.map((ev) => (
                      <div key={ev.id} className="bg-white p-3 rounded-xl border border-stone-200 shadow-3xs relative group flex items-start justify-between gap-3">
                        <div className="space-y-1 overflow-hidden flex-1">
                          <h5 className="font-bold text-slate-900 text-sm m-0 leading-snug">{ev.title}</h5>
                          {ev.time && (
                            <div className="text-[10px] text-purple-600 font-bold flex items-center gap-1 uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              {ev.time}
                            </div>
                          )}
                          {ev.notes && (
                            <p className="text-xs text-stone-600 mt-1 leading-relaxed whitespace-pre-wrap m-0">
                              {ev.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditEvent(ev)}
                            className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-purple-50 text-stone-500 hover:text-purple-600 flex items-center justify-center transition border border-stone-200"
                            title="Edit Event"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-rose-50 text-stone-400 hover:text-rose-600 flex items-center justify-center transition border border-stone-200"
                            title="Delete Event"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add/Edit Event Form */}
              <div className="bg-purple-50/40 border border-purple-100 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-purple-900 uppercase tracking-wider font-mono">
                  {editingEventId ? "✏️ Edit Event Details" : "➕ Add Event"}
                </h4>
                <form onSubmit={handleSaveEvent} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-black text-stone-500 mb-1 block uppercase font-mono">Event Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Doctor Appointment"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full bg-white border border-stone-250 focus:border-purple-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-black text-stone-500 mb-1 block uppercase font-mono">Time (Optional)</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full bg-white border border-stone-250 focus:border-purple-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 shadow-3xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-stone-500 mb-1 block uppercase font-mono">Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedDate(e.target.value);
                            setCurrentMonthDate(new Date(e.target.value + "T00:00:00"));
                          }
                        }}
                        className="w-full bg-white border border-stone-250 focus:border-purple-400 focus:outline-none rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 shadow-3xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-stone-500 mb-1 block uppercase font-mono">Notes (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="Any notes or directions..."
                      value={newEvent.notes}
                      onChange={(e) => setNewEvent({ ...newEvent, notes: e.target.value })}
                      className="w-full bg-white border border-stone-250 focus:border-purple-400 focus:outline-none rounded-xl p-3 text-xs font-semibold text-slate-800 shadow-3xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1.5">
                    {editingEventId && (
                      <button
                        type="button"
                        onClick={cancelEditEvent}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-500 hover:bg-stone-100 border border-transparent transition"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm cursor-pointer"
                    >
                      {editingEventId ? "Save Changes" : "Save Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 flex justify-end shrink-0 bg-stone-50">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  cancelEditEvent();
                }}
                className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-stone-50 transition shadow-3xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
