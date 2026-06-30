"use client";

import { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Compass, 
  ShieldAlert, 
  BookOpen, 
  Trees, 
  Leaf, 
  Camera, 
  UtensilsCrossed, 
  Activity, 
  Info,
  ChevronRight,
  Eye,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";
import { getDestinationById, DESTINATIONS } from "../../data/destinations";
import { useLanguage } from "../../../context/LanguageContext";

interface PanoramaViewerProps {
  imageUrl: string;
}

export function PanoramaViewer({ imageUrl }: PanoramaViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [yaw, setYaw] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ x: 0, yaw: 0 });

  useEffect(() => {
    const canvas = canvasRef?.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let active = true;
    const img = new window.Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (!active) return;
      draw();
    };

    function draw() {
      if (!canvas || !ctx || !img.complete) return;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const offsetPct = (yaw / (2 * Math.PI)) % 1;
      const offsetPixels = offsetPct * img.width;

      ctx.drawImage(img, offsetPixels, 0, img.width - offsetPixels, img.height, 0, 0, width, height);
      if (offsetPixels > 0) {
        const destWidth = (offsetPixels / img.width) * width;
        ctx.drawImage(img, 0, 0, offsetPixels, img.height, width - destWidth, 0, destWidth, height);
      }
    }
    draw();
    return () => { active = false; };
  }, [imageUrl, yaw, canvasRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    if (dragRef) dragRef.current = { x: e.clientX, yaw };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragRef) return;
    const dx = e.clientX - dragRef.current.x;
    const sensitivity = 0.006;
    setYaw(dragRef.current.yaw - dx * sensitivity);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden border border-charcoal-stone/10 shadow bg-black select-none">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur text-white text-[10px] px-3 py-1.5 rounded-xl flex items-center gap-1.5 pointer-events-none font-mono">
        <span>↔ Drag to look around (360° Panorama View)</span>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DestinationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [destination, setDestination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"story" | "travel" | "eco" | "food" | "panorama">("story");

  useEffect(() => {
    const loadDestination = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/v1/places/${resolvedParams.id}`);
        if (res.ok) {
          const d = await res.json();
          setDestination({
            id: d.id,
            name: d.name,
            rating: 4.8,
            category: d.category?.slug || "waterfalls",
            district: d.district?.name || "Bastar",
            tagline: d.shortDescription || d.description || "",
            coordinates: { lat: d.latitude, lng: d.longitude },
            heroImage: d.heroImage || d.featuredImage || "/chitrakote.png",
            storyTitle: d.name,
            story: d.fullDescription || d.description || "",
            timings: d.openingTime && d.closingTime ? `${d.openingTime} - ${d.closingTime} (Everyday)` : "08:00 AM - 06:00 PM (Everyday)",
            routes: d.address || "Located in regional Chhattisgarh corridor.",
            bestTime: d.bestSeason || "July to February",
            seasonalAdvice: d.bestSeason || "Standard seasonal precautions apply.",
            safety: "Stay within guidelines.",
            biodiversityScore: 85,
            crowdCapacity: 600,
            localFood: "Traditional Chila, Bastar Chutney",
            photographySpots: "Main Entrance",
            localInsights: "Beautiful scenic landscape",
            audioUrl: d.audioUrl,
            audioNarrator: d.audioNarrator,
            panoramaUrls: d.panoramaUrls ? JSON.parse(d.panoramaUrls) : []
          });
        } else {
          const staticDest = getDestinationById(resolvedParams.id);
          if (staticDest) {
            setDestination({ ...staticDest, panoramaUrls: [] });
          } else {
            setDestination(null);
          }
        }
      } catch (err) {
        const staticDest = getDestinationById(resolvedParams.id);
        if (staticDest) {
          setDestination({ ...staticDest, panoramaUrls: [] });
        } else {
          setDestination(null);
        }
      } finally {
        setLoading(false);
      }
    };
    loadDestination();
  }, [resolvedParams.id]);

  const {
    lang, t, speakText, stopSpeaking, isSpeaking, tDynamic,
    isPlayingAudio, audioProgress, audioDuration, audioNarrator,
    playAudioFile, pauseAudioFile, stopAudioFile,
  } = useLanguage();

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopAudioFile();
    };
  }, [stopSpeaking, stopAudioFile]);

  useEffect(() => {
    stopSpeaking();
    stopAudioFile();
  }, [activeTab, stopSpeaking, stopAudioFile]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

  if (loading) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6">
        <Loader2 className="w-10 h-10 text-forest-emerald animate-spin" />
        <p className="text-sm font-mono text-forest-emerald/60">Decoding telemetry archive...</p>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center gap-4 bg-sand-beige text-charcoal-stone p-6">
        <ShieldAlert className="w-16 h-16 text-red-600 animate-bounce" />
        <h2 className="text-2xl font-sans font-bold">Destination Archive Not Found</h2>
        <p className="text-sm text-charcoal-stone/60 max-w-sm text-center">
          The requested coordinate profile does not exist in the local smart directory index.
        </p>
        <Link 
          href="/explore" 
          className="px-6 py-3 rounded-xl bg-forest-emerald text-sand-beige font-bold text-sm shadow hover:bg-tribal-terracotta transition-colors"
        >
          Return to Discovery Map
        </Link>
      </div>
    );
  }

  const getLocalizedVal = (entityId: string, field: string, en: string, hi?: string, cg?: string) => {
    const dbVal = tDynamic(entityId, field, "");
    if (dbVal) return dbVal;
    if (lang === "hi" && hi) return hi;
    if (lang === "cg" && cg) return cg;
    return en;
  };

  const localizedName = getLocalizedVal(destination.id, "name", destination.name, destination.name_hi, destination.name_cg);
  const localizedTagline = getLocalizedVal(destination.id, "tagline", destination.tagline, destination.tagline_hi, destination.tagline_cg);
  const localizedStoryTitle = getLocalizedVal(destination.id, "storyTitle", destination.storyTitle, destination.storyTitle_hi, destination.storyTitle_cg);
  const localizedStory = getLocalizedVal(destination.id, "story", destination.story, destination.story_hi, destination.story_cg);
  const localizedTimings = getLocalizedVal(destination.id, "timings", destination.timings, destination.timings_hi, destination.timings_cg);
  const localizedRoutes = getLocalizedVal(destination.id, "routes", destination.routes, destination.routes_hi, destination.routes_cg);
  const localizedBestTime = getLocalizedVal(destination.id, "bestTime", destination.bestTime, destination.bestTime_hi, destination.bestTime_cg);
  const localizedSeasonalAdvice = getLocalizedVal(destination.id, "seasonalAdvice", destination.seasonalAdvice, destination.seasonalAdvice_hi, destination.seasonalAdvice_cg);
  const localizedSafety = getLocalizedVal(destination.id, "safety", destination.safety, destination.safety_hi, destination.safety_cg);
  const localizedEcoGuidance = getLocalizedVal(destination.id, "ecoGuidance", destination.ecoGuidance, destination.ecoGuidance_hi, destination.ecoGuidance_cg);
  const localizedLocalInsights = getLocalizedVal(destination.id, "localInsights", destination.localInsights, destination.localInsights_hi, destination.localInsights_cg);
  const localizedLocalFood = getLocalizedVal(destination.id, "localFood", destination.localFood, destination.localFood_hi, destination.localFood_cg);
  const localizedPhotographySpots = getLocalizedVal(destination.id, "photographySpots", destination.photographySpots, destination.photographySpots_hi, destination.photographySpots_cg);

  // Get same-category destinations first for smarter "Nearby" experience
  const sameCategoryDests = DESTINATIONS.filter(d => d.id !== destination.id && d.category === destination.category);
  const otherDests = DESTINATIONS.filter(d => d.id !== destination.id && d.category !== destination.category);
  const relatedDestinations = [...sameCategoryDests, ...otherDests].slice(0, 3);

  return (
    <div className="w-full flex flex-col bg-sand-beige text-charcoal-stone">
      
      {/* 1. CINEMATIC HERO HEADER */}
      <section className="relative w-full h-[60vh] sm:h-[65vh] flex items-end overflow-hidden bg-charcoal-stone border-b-8 border-tribal-terracotta">
        <div className="absolute inset-0 z-0">
          <Image
            src={destination.heroImage || "/chitrakote.png"}
            alt={localizedName}
            fill
            priority
            className="object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-stone via-charcoal-stone/40 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-emerald/30 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 flex flex-col gap-4 text-white">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur w-fit border border-white/10 transition-all text-white mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {t("detail.back")}
          </Link>

          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-warm-orange/40 bg-warm-orange/15 text-xs font-mono font-bold tracking-widest text-warm-orange w-fit uppercase">
            ★ {destination.rating} {t("detail.rating")} • {t("detail.certified")}
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-sans font-bold tracking-tight text-white drop-shadow-md">
            {localizedName}
          </h1>

          <p className="text-sm sm:text-lg text-sand-beige/85 italic max-w-2xl font-sans drop-shadow leading-relaxed">
            &quot;{localizedTagline}&quot;
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <MapPin className="w-4 h-4 text-warm-orange" />
              <span>Lat: {destination.coordinates?.lat?.toFixed(4) || "0.0000"}° N</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-green-400" />
              <span>{t("detail.open")}: {localizedTimings.split(" ")[0]}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Trees className="w-4 h-4 text-blue-400" />
              <span>{t("detail.bio_score")}: {destination.biodiversityScore}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TABBED CONTENT SECTION */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Comprehensive Tabs and Core Readout */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Tab Navigation header */}
          <div className="flex border-b border-charcoal-stone/10 gap-2 overflow-x-auto pb-1">
            {[
              { id: "story", label: t("detail.tab_story"), icon: BookOpen },
              { id: "travel", label: t("detail.tab_travel"), icon: Compass },
              { id: "eco", label: t("detail.tab_eco"), icon: Leaf },
              { id: "food", label: t("detail.tab_food"), icon: UtensilsCrossed },
              ...(destination.panoramaUrls && destination.panoramaUrls.length > 0 ? [{ id: "panorama", label: "360° Panorama", icon: Camera }] : [])
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "story" | "travel" | "eco" | "food" | "panorama")}
                  className={`flex items-center gap-2 text-sm font-sans font-bold px-4 py-3.5 border-b-2 cursor-pointer transition-all shrink-0 ${
                    activeTab === tab.id
                      ? "border-tribal-terracotta text-tribal-terracotta"
                      : "border-transparent text-charcoal-stone/60 hover:text-forest-emerald"
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Stories & Lore */}
          {activeTab === "story" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              <div className="flex justify-between items-start border-b border-charcoal-stone/10 pb-4 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.story_subtitle")}</span>
                  <h3 className="text-xl font-sans font-bold text-forest-emerald">
                    {localizedStoryTitle}
                  </h3>
                </div>

                {/* Inclusive Audio Narration Readout Toggle Button */}
                <button
                  onClick={() => {
                    if (isSpeaking) {
                      stopSpeaking();
                    } else {
                      speakText(`${localizedStoryTitle}. ${localizedStory}`);
                    }
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow border cursor-pointer shrink-0 ${
                    isSpeaking
                      ? "bg-red-600 text-white border-red-700 animate-pulse"
                      : "bg-forest-emerald hover:bg-tribal-terracotta text-sand-beige border-forest-emerald/20"
                  }`}
                  aria-label={isSpeaking ? "Stop Narration" : "Listen Narration"}
                  id="tts-narration-trigger"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? t("detail.stop_listen") : t("detail.listen")}</span>
                </button>
              </div>

              {/* ── Pre-Recorded Audio Guide Player ── */}
              {destination.audioUrl && (
                <div className="flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br from-[#0b3a22]/5 to-[#0b3a22]/10 border border-[#0b3a22]/15 mt-1">
                  {/* Guide Label + Narrator */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-forest-emerald text-sand-beige flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow">
                        {(audioNarrator || destination.audioNarrator || "A").charAt(0)}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-forest-emerald/70 uppercase font-bold">Audio Guide</span>
                        <span className="text-xs font-sans font-bold text-charcoal-stone leading-tight">
                          {lang === "cg"
                            ? `${audioNarrator || destination.audioNarrator} के सुरीली आवाज म`
                            : lang === "hi"
                            ? `${audioNarrator || destination.audioNarrator} की आवाज़ में`
                            : `Narrated by ${audioNarrator || destination.audioNarrator}`
                          }
                        </span>
                      </div>
                    </div>

                    {/* Play / Pause / Stop controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Stop */}
                      <button
                        onClick={() => stopAudioFile()}
                        className="w-8 h-8 rounded-lg bg-charcoal-stone/5 hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-charcoal-stone/50 transition-all cursor-pointer border border-charcoal-stone/10"
                        aria-label="Stop audio guide"
                        title="Stop"
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 12 12"><rect width="12" height="12" rx="2"/></svg>
                      </button>

                      {/* Play / Pause */}
                      <button
                        onClick={() => {
                          if (isPlayingAudio) {
                            pauseAudioFile();
                          } else {
                            playAudioFile(
                              destination.audioUrl!,
                              destination.audioNarrator,
                            );
                          }
                        }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-[1.06] cursor-pointer ${
                          isPlayingAudio
                            ? "bg-tribal-terracotta shadow-tribal-terracotta/25"
                            : "bg-forest-emerald shadow-forest-emerald/25"
                        }`}
                        aria-label={isPlayingAudio ? "Pause audio guide" : "Play audio guide"}
                        id="audio-guide-play-btn"
                      >
                        {isPlayingAudio
                          ? <VolumeX className="w-4 h-4 text-white" />
                          : <Volume2 className="w-4 h-4 text-white" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {audioDuration > 0 && (
                    <div className="flex flex-col gap-1">
                      <div className="w-full h-1.5 bg-forest-emerald/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-forest-emerald rounded-full transition-all duration-300"
                          style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-charcoal-stone/40">
                        <span>{formatTime(audioProgress)}</span>
                        <span>{formatTime(audioDuration)}</span>
                      </div>
                    </div>
                  )}

                  {isPlayingAudio && (
                    <div className="text-[10px] font-mono text-forest-emerald/70 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-emerald animate-pulse inline-block" />
                      {lang === "cg" ? "ऑडियो बजत हे..." : lang === "hi" ? "ऑडियो चल रहा है..." : "Playing audio guide..."}
                    </div>
                  )}
                </div>
              )}

              <p className="text-sm text-charcoal-stone/85 leading-relaxed font-sans first-letter:text-4xl first-letter:font-bold first-letter:text-tribal-terracotta first-letter:mr-2 first-letter:float-left">
                {localizedStory}
              </p>
              
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3 mt-2">
                <span className="w-9 h-9 rounded bg-purple-600 text-white flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  ★
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-purple-700 font-bold uppercase">{t("detail.story_note_title")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    {t("detail.story_note_desc")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Travel & Logistics */}
          {activeTab === "travel" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.operating_timings")}</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-forest-emerald" />
                      {t("detail.access_gate")}
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{localizedTimings}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.best_season")}</span>
                  <div className="p-4 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                    <span className="text-sm text-charcoal-stone font-bold flex items-center gap-1.5">
                      <Trees className="w-4 h-4 text-forest-emerald" />
                      {t("detail.seasonal_range")}
                    </span>
                    <span className="text-xs text-charcoal-stone/60 leading-relaxed">{localizedBestTime}</span>
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[9px] font-mono text-tribal-terracotta font-bold uppercase">{t("detail.route_ingress")}</span>
                <p className="text-xs text-charcoal-stone/80 leading-relaxed bg-white p-4 rounded-2xl border border-charcoal-stone/10 font-sans">
                  {localizedRoutes}
                </p>
              </div>

              <div className="p-4.5 rounded-2xl bg-forest-emerald/5 border border-forest-emerald/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">{t("detail.patrol_precaution")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed">
                    {localizedSeasonalAdvice}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Ecology & Safety */}
          {activeTab === "eco" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="p-4 rounded-2xl bg-red-600/5 border border-red-600/15 flex gap-3.5">
                <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-red-700 uppercase">{t("detail.safety_warning")}</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{localizedSafety}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-green-600/5 border border-green-600/15 flex gap-3.5 mt-2">
                <Leaf className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono font-bold text-green-700 uppercase">{t("detail.eco_mandate")}</span>
                  <span className="text-xs text-charcoal-stone leading-relaxed">{localizedEcoGuidance}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("detail.eco_stress")}</span>
                  <span className="text-sm font-sans font-bold text-forest-emerald flex items-center gap-1">
                    <Activity className="w-4 h-4 text-green-500 animate-pulse" />
                    {t("detail.low_stress")}
                  </span>
                </div>
                <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex flex-col gap-1">
                  <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">{t("detail.carrying_capacity")}</span>
                  <span className="text-sm font-sans font-bold text-tribal-terracotta">
                    {destination.crowdCapacity} {t("detail.carrying_capacity_value")}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Gastronomy & Secrets */}
          {activeTab === "food" && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              
              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-charcoal-stone/10">
                <span className="w-10 h-10 rounded-xl bg-tribal-terracotta flex items-center justify-center text-white shrink-0 shadow-sm">
                  <UtensilsCrossed className="w-5 h-5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-tribal-terracotta uppercase">{t("detail.gastronomy_hub")}</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    {t("detail.gastronomy_hub")}: <strong>{localizedLocalFood}</strong>
                  </span>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-charcoal-stone/10 mt-2">
                <span className="w-10 h-10 rounded-xl bg-forest-emerald flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Camera className="w-5 h-5" />
                </span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t("detail.photography_coordinates")}</span>
                  <span className="text-xs text-charcoal-stone/85 leading-relaxed font-sans">
                    {t("detail.photography_coordinates")}: <strong>{localizedPhotographySpots}</strong>
                  </span>
                </div>
              </div>

              <div className="p-4.5 rounded-2xl bg-white border border-charcoal-stone/10 flex items-start gap-3 mt-2">
                <Info className="w-5 h-5 text-forest-emerald shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-mono text-forest-emerald font-bold uppercase">{t("detail.secret_insights")}</span>
                  <span className="text-xs text-charcoal-stone/75 leading-relaxed font-sans">
                    {localizedLocalInsights}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: 360° Panorama Views */}
          {activeTab === "panorama" && destination.panoramaUrls && destination.panoramaUrls.length > 0 && (
            <div className="flex flex-col gap-6 bg-white/50 p-6 sm:p-8 rounded-3xl border border-white/60 shadow-md">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2 flex items-center gap-2">
                <Camera className="w-5 h-5 text-tribal-terracotta" />
                360° Panoramic Virtual Tour
              </h3>
              <p className="text-xs text-charcoal-stone/60 leading-relaxed font-sans -mt-2">
                Drag on the image viewport below to rotate the view and explore the landmark in full 360-degree high definition.
              </p>
              
              <div className="flex flex-col gap-8">
                {destination.panoramaUrls.map((url: string, index: number) => (
                  <div key={index} className="flex flex-col gap-3">
                    <span className="text-xs font-mono font-bold text-tribal-terracotta uppercase">View #{index + 1}</span>
                    <PanoramaViewer imageUrl={url} />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Geographic Side Info Panel & Nearby Related Nodes */}
        <div className="flex flex-col gap-8">
          
          {/* Quick Metrics Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta" />
              {t("detail.geo_telemetry")}
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.category")}</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t(`categories.${destination.category}`)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.biodiversity_index")}</span>
                <span className="text-xs font-mono font-bold text-green-700">{destination.biodiversityScore}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-charcoal-stone/10 pb-2">
                <span className="text-xs text-charcoal-stone/60">{t("detail.security_level")}</span>
                <span className="text-xs font-mono font-bold text-forest-emerald uppercase">{t("detail.security_low_risk")}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-charcoal-stone/60">{t("detail.daily_limits")}</span>
                <span className="text-xs font-mono font-bold text-tribal-terracotta">{destination.crowdCapacity} {t("detail.max")}</span>
              </div>
            </div>
          </div>

          {/* NEARBY RELATED NODES PANEL */}
          <div className="flex flex-col gap-4">
            <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
              <Compass className="w-5 h-5 text-tribal-terracotta animate-spin-slow" />
              {sameCategoryDests.length > 0
                ? (lang === "hi" ? `और ${t(`categories.${destination.category}`)} स्थल` : lang === "cg" ? `अउ ${t(`categories.${destination.category}`)} जगह` : `More ${t(`categories.${destination.category}`)}`)
                : t("detail.nearby_nodes")}
            </h3>

            <div className="flex flex-col gap-4">
              {relatedDestinations.map(rel => {
                const relName = getLocalizedVal(rel.id, "name", rel.name, rel.name_hi, rel.name_cg);
                const relTagline = getLocalizedVal(rel.id, "tagline", rel.tagline, rel.tagline_hi, rel.tagline_cg);
                return (
                  <Link
                    key={rel.id}
                    href={`/destination/${rel.id}`}
                    className="glass-panel p-4 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center gap-4 border border-white/60 text-left group"
                  >
                    <Image
                      src={rel.heroImage || "/chitrakote.png"}
                      alt={relName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 bg-charcoal-stone"
                    />
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <span className="font-sans font-bold text-sm text-forest-emerald truncate group-hover:text-tribal-terracotta transition-colors">
                        {relName}
                      </span>
                      <span className="text-[10px] text-charcoal-stone/50 truncate font-sans">
                        {relTagline}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-tribal-terracotta shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
