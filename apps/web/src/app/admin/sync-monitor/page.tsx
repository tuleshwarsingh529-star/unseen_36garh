"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import {
  Activity, ShieldCheck, RefreshCw, Trash2, CheckCircle2, AlertTriangle,
  Clock, Server, Terminal, Settings, Play, Database, HardDrive, Cpu, Compass
} from "lucide-react";

interface ServiceHealth {
  name: string;
  status: "GREEN" | "YELLOW" | "RED";
  ratio: string;
}

interface VerificationStep {
  step: string;
  status: "Success" | "Pending" | "Failed";
  message: string;
}

interface SyncEvent {
  id: string;
  entityId: string;
  eventType: string;
  status: string;
  steps: string; // JSON Stringified steps list
  retries: number;
  errorMessage?: string;
  createdAt: string;
}

interface TerminalLog {
  time: string;
  module: string;
  status: "Success" | "Warning" | "Error";
  message: string;
}

export default function RealTimeSyncMonitor() {
  const [healthServices, setHealthServices] = useState<ServiceHealth[]>([]);
  const [syncEvents, setSyncEvents] = useState<SyncEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SyncEvent | null>(null);
  
  // Real-time synchronization log list
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { time: "10:31", module: "Database", status: "Success", message: "SQLite tables synced successfully." },
    { time: "10:31", module: "File Storage", status: "Success", message: "Public static directory verified." },
    { time: "10:32", module: "Feed Engine", status: "Success", message: "Global and trending feeds cache loaded." },
    { time: "10:32", module: "Search Index", status: "Success", message: "Lucene keyword cache sync complete." },
    { time: "10:32", module: "GPS Engine", status: "Success", message: "Nearby places distance calculations loaded." }
  ]);

  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  // Fetch initial services ratios and Sync events
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const healthRes = await fetch(`${API}/sync-monitor/health`);
        if (healthRes.ok) {
          const data = await healthRes.json();
          setHealthServices(data.services || []);
        }

        const eventsRes = await fetch(`${API}/sync-monitor/events`);
        if (eventsRes.ok) {
          const data = await eventsRes.json();
          setSyncEvents(data || []);
          if (data.length > 0) {
            setSelectedEvent(data[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load initial sync monitor metrics", e);
      }
    };
    fetchStats();

    // Bind WebSockets to receive live updates
    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("WebSocket connected to Sync Monitor Gateway.");
    });

    socket.on("sync.event.processed", (newEvent: SyncEvent) => {
      setSyncEvents((prev) => {
        const filtered = prev.filter(e => e.id !== newEvent.id);
        return [newEvent, ...filtered];
      });
      setSelectedEvent(newEvent);
    });

    socket.on("sync.log.added", (log: any) => {
      setTerminalLogs((prev) => [
        { time: log.time, module: log.module, status: log.status, message: log.message },
        ...prev
      ]);
    });

    return () => {
      socket.disconnect();
    };
  }, [API]);

  const handleAdminAction = async (actionKey: string, endpoint: string, bodyPayload: any) => {
    setIsProcessingAction(actionKey);
    setActionSuccessMsg(null);
    try {
      const res = await fetch(`${API}/sync-monitor/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (res.ok) {
        setActionSuccessMsg(data.message || `Action [${actionKey}] completed successfully!`);
        setTimeout(() => setActionSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error(e);
      alert("Action failed to execute. Check watch logs.");
    } finally {
      setIsProcessingAction(null);
    }
  };

  const parsedSteps: VerificationStep[] = selectedEvent 
    ? JSON.parse(selectedEvent.steps) 
    : [
        { step: "Story Record Created", status: "Success", message: "Record initialized." },
        { step: "Images Uploaded", status: "Success", message: "Monsoon and Sunset files checked." },
        { step: "Video Uploaded", status: "Success", message: "Drone view validated." },
        { step: "Feed Updated", status: "Success", message: "Latest and nearby engines re-built." },
        { step: "Search Index Sync", status: "Success", message: "Search term matching sync complete." },
        { step: "Notifications Sent", status: "Success", message: "Creator notifications complete." },
        { step: "Analytics Logged", status: "Success", message: "Contributions statistics compiled." }
      ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-charcoal-stone min-h-[85vh]">
      
      {/* Cinematic Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">System Administration</span>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald flex items-center gap-2.5">
            <Activity className="w-9 h-9 text-tribal-terracotta animate-pulse" />
            Real-Time Synchronization Monitor
          </h1>
          <p className="text-xs text-charcoal-stone/75 leading-relaxed max-w-xl">
            Audit creator file saves, database triggers, Lucene indexing, and WebSocket feedback pipelines.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin" className="px-4 py-2 bg-white border border-charcoal-stone/15 hover:bg-sand-beige text-charcoal-stone rounded-xl font-bold font-sans text-xs transition-all shadow-sm">
            ← Back to Panel
          </Link>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-800 text-xs flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Column (Health and Logs) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Health Matrix */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <Server className="w-5 h-5 text-tribal-terracotta" />
              Sovereign Grid Health Monitor
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {healthServices.length > 0 ? (
                healthServices.map((service, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 shadow-sm flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-[10px] text-charcoal-stone">{service.name}</span>
                      <span className="font-mono text-xs font-bold text-charcoal-stone/50">{service.ratio}</span>
                    </div>
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        service.status === "GREEN" ? "bg-green-400" : "bg-red-400"
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${
                        service.status === "GREEN" ? "bg-green-500" : "bg-red-500"
                      }`}></span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-charcoal-stone/40">
                  Compiling health matrix parameters...
                </div>
              )}
            </div>
          </div>

          {/* Verification steps */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-tribal-terracotta" />
                Pipeline Verification Checklist
              </span>
              {selectedEvent && (
                <span className="text-[9px] font-mono font-bold text-charcoal-stone/40 bg-charcoal-stone/5 px-2 py-0.5 rounded-full uppercase">
                  Event: {selectedEvent.eventType}
                </span>
              )}
            </h3>

            <div className="flex flex-col gap-3">
              {parsedSteps.map((step, idx) => (
                <div key={idx} className="p-3 bg-white border border-charcoal-stone/5 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === "Success" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {step.status === "Success" ? "✓" : "!"}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-charcoal-stone">{step.step}</span>
                      <span className="text-[10px] text-charcoal-stone/50">{step.message}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    step.status === "Success" ? "bg-green-500/10 text-green-700" : "bg-amber-500/10 text-amber-700"
                  }`}>
                    {step.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sync activity log Terminal */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <Terminal className="w-5 h-5 text-tribal-terracotta" />
              Real-Time Synchronization Log Terminal
            </h3>

            <div className="bg-charcoal-stone text-sand-beige font-mono text-[11px] p-5 rounded-2xl flex flex-col gap-2 min-h-[220px] max-h-[300px] overflow-y-auto shadow-inner border border-charcoal-stone/40">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="flex gap-4 border-b border-white/5 pb-1">
                  <span className="text-white/40">[{log.time}]</span>
                  <span className={`font-bold uppercase tracking-wider shrink-0 w-24 ${
                    log.status === "Success" ? "text-green-400" : log.status === "Warning" ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {log.module}
                  </span>
                  <span className="text-white/80">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sidebar Controls and events queue */}
        <div className="flex flex-col gap-6">
          
          {/* Admin Command panel */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <Settings className="w-5 h-5 text-tribal-terracotta" />
              Administrative Controls
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                { label: "Verify Latest Feed", endpoint: "verify", payload: { type: "feed" }, key: "verify_feed" },
                { label: "Verify Storage Paths", endpoint: "verify", payload: { type: "storage" }, key: "verify_storage" },
                { label: "Verify Database Nodes", endpoint: "verify", payload: { type: "database" }, key: "verify_db" },
                { label: "Verify Search Autocomplete", endpoint: "verify", payload: { type: "search" }, key: "verify_search" },
                { label: "Rebuild Trending Feed", endpoint: "rebuild", payload: { type: "feed" }, key: "rebuild_feed" },
                { label: "Rebuild Search Terms", endpoint: "rebuild", payload: { type: "search" }, key: "rebuild_search" }
              ].map((cmd) => (
                <button
                  key={cmd.key}
                  onClick={() => handleAdminAction(cmd.key, cmd.endpoint, cmd.payload)}
                  disabled={isProcessingAction !== null}
                  className="w-full text-left font-sans font-bold text-xs p-3 rounded-xl border border-charcoal-stone/15 hover:bg-sand-beige text-charcoal-stone transition-all flex justify-between items-center cursor-pointer disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-tribal-terracotta shrink-0" />
                    {cmd.label}
                  </span>
                  {isProcessingAction === cmd.key && (
                    <RefreshCw className="w-3.5 h-3.5 text-forest-emerald animate-spin" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sync Events Queue backlog */}
          <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <Clock className="w-4.5 h-4.5 text-tribal-terracotta" />
              Verification Queue Log
            </h3>

            <div className="flex flex-col gap-3.5 max-h-[300px] overflow-y-auto pr-1">
              {syncEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => setSelectedEvent(evt)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                    selectedEvent?.id === evt.id
                      ? "bg-white border-forest-emerald ring-2 ring-forest-emerald/10 shadow-sm"
                      : "bg-white/50 border-charcoal-stone/10 hover:bg-white"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-forest-emerald uppercase tracking-wider">{evt.eventType}</span>
                    <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                      evt.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {evt.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-charcoal-stone/50 font-mono">
                    <span>ID: {evt.entityId.slice(0, 8)}...</span>
                    <span>{new Date(evt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </button>
              ))}

              {syncEvents.length === 0 && (
                <div className="text-center py-8 text-charcoal-stone/40 text-xs">
                  No verification queue records.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
