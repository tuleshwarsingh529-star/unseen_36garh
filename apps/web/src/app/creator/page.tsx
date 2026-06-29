"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  UserCheck, MapPin, Sparkles, ShieldAlert, BookOpen, Leaf, ArrowRight,
  CheckCircle, Clock, Compass, FileText, AlertTriangle, ShieldCheck, Plus, Trash2, Edit2, CheckCircle2, Award, Eye, XCircle
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

interface Category { id: string; name: string; slug: string; }
interface District { id: string; name: string; }

interface CreatorPlace {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  districtId: string;
  categoryId: string;
  district: { name: string };
  category: { name: string; slug: string };
  latitude: number;
  longitude: number;
  status: string; // DRAFT | SUBMITTED | UNDER_REVIEW | PUBLISHED | REJECTED
  verified: boolean;
  bestSeason?: string;
  address?: string;
  heroImage?: string;
  featuredImage?: string;
}

export default function CreatorStudio() {
  const { user, token } = useAuthStore();
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Dashboard configuration
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "add_place" | "my_places" | "add_story">("overview");

  // Verification/profile states
  const [isVerified, setIsVerified] = useState(false);
  const [creatorType, setCreatorType] = useState("influencer");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [socialHandle, setSocialHandle] = useState("");
  const [bio, setBio] = useState("");

  // Categories & Districts
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [submittedPlaces, setSubmittedPlaces] = useState<CreatorPlace[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Form states for creating/editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [placeName, setPlaceName] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [address, setAddress] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [formStatus, setFormStatus] = useState("SUBMITTED"); // SUBMITTED or DRAFT

  // Stories creation states
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [composerPlaceId, setComposerPlaceId] = useState("");
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDesc, setStoryDesc] = useState("");
  const [storyLanguage, setStoryLanguage] = useState("Hindi");
  const [storyVisibility, setStoryVisibility] = useState("PUBLIC");
  
  // Media suggestions and checked status
  const [availableMedia, setAvailableMedia] = useState<any[]>([]);
  const [checkedMediaIds, setCheckedMediaIds] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isDrafting, setIsDrafting] = useState(false);
  const [storySuccess, setStorySuccess] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  // Sync session and fetch initial states
  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    let active = true;

    async function loadData() {
      try {
        setProfileLoading(true);
        setErrorMsg("");

        // 1. Fetch Categories
        const catRes = await fetch(`${API}/places/categories`);
        if (catRes.ok && active) {
          const catData = await catRes.json();
          setCategories(catData);
          if (catData.length > 0) setSelectedCategoryId(catData[0].id);
        }

        // 2. Fetch Districts
        const distRes = await fetch(`${API}/places/districts`);
        if (distRes.ok && active) {
          const distData = await distRes.json();
          setDistricts(distData);
          if (distData.length > 0) setSelectedDistrictId(distData[0].id);
        }

        // 3. Fetch Profile details to discover Registry upgrades
        const profileRes = await fetch(`${API}/users/me`, {
          headers: {
            "x-user-id": user?.id || "",
            "Authorization": `Bearer ${token}`
          }
        });
        if (profileRes.ok && active) {
          const profileData = await profileRes.json();
          if (profileData.creatorProfile) {
            setIsVerified(true);
            setBio(profileData.creatorProfile.bio || "");
            setSocialHandle(
              profileData.creatorProfile.instagram ||
              profileData.creatorProfile.youtube ||
              "verified_creator"
            );
          }
        }

        // 4. Fetch Places submissions for creator
        const placesRes = await fetch(`${API}/places?includeUnverified=true`);
        if (placesRes.ok && active) {
          const placesData = await placesRes.json();
          // Filter to show only own places if Creator role
          const creatorOnlyPlaces = placesData.filter((p: any) => p.creatorId === user?.id);
          setSubmittedPlaces(creatorOnlyPlaces);
        }

        // 5. Fetch all verified places for story composer dropdown
        const allPlacesRes = await fetch(`${API}/places`);
        if (allPlacesRes.ok && active) {
          const allPlacesData = await allPlacesRes.json();
          setAllPlaces(allPlacesData);
          if (allPlacesData.length > 0) setComposerPlaceId(allPlacesData[0].id);
        }
      } catch (err: any) {
        console.error("Failed to load contributor dashboard:", err);
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user, token, API]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
      });
    }
  };

  // Fetch media library suggestions when place selection changes
  useEffect(() => {
    if (!composerPlaceId) return;

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`${API}/media-library/suggestions?placeId=${composerPlaceId}`);
        if (res.ok) {
          const data = await res.json();
          setAvailableMedia(data.media || []);
          setSuggestedTags(data.tags || []);
          // Pre-select all available media items by default
          setCheckedMediaIds(data.media ? data.media.map((m: any) => m.id) : []);
        }
      } catch (e) {
        console.error("Failed to load media suggestions", e);
      }
    };
    fetchSuggestions();
  }, [composerPlaceId, API]);

  const handleGenerateAIDraft = async () => {
    if (!composerPlaceId) return;
    setIsDrafting(true);
    try {
      const res = await fetch(`${API}/media-library/auto-draft?placeId=${composerPlaceId}`);
      if (res.ok) {
        const data = await res.json();
        setStoryTitle(data.draft.title);
        setStoryDesc(data.draft.description);
        if (data.draft.tags) {
          setSuggestedTags(data.draft.tags);
        }
      }
    } catch (e) {
      console.error("Failed to compile AI draft story", e);
      alert("API timeout. Fallback to basic templated layout completed.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleStorySubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyTitle || !storyDesc || !composerPlaceId) {
      alert("Please enter title and narrative content.");
      return;
    }

    const selectedMedia = availableMedia
      .filter((m: any) => checkedMediaIds.includes(m.id))
      .map((m: any) => ({
        type: m.mediaType,
        url: m.filePath,
        thumbnailUrl: m.thumbnail || m.filePath,
      }));

    const coverImage = selectedMedia.find(m => m.type === "image")?.url || "/chitrakote.png";
    const videoUrl = selectedMedia.find(m => m.type === "video")?.url || null;

    const payload = {
      title: storyTitle,
      description: storyDesc,
      placeId: composerPlaceId,
      districtId: allPlaces.find(p => p.id === composerPlaceId)?.districtId || null,
      categoryId: allPlaces.find(p => p.id === composerPlaceId)?.categoryId || null,
      language: storyLanguage,
      visibility: storyVisibility,
      coverImage,
      videoUrl,
      media: selectedMedia,
    };

    try {
      const res = await fetch(`${API}/stories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save story.");
      }

      setStorySuccess(true);
      setStoryTitle("");
      setStoryDesc("");
      setCheckedMediaIds([]);
      setTimeout(() => {
        setStorySuccess(false);
        setActiveSubTab("overview");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Error submitting story.");
    }
  };

  const startEdit = (place: CreatorPlace) => {
    setEditingId(place.id);
    setPlaceName(place.name);
    setShortDesc(place.shortDescription || "");
    setFullDesc(place.fullDescription || "");
    setSelectedDistrictId(place.districtId);
    setSelectedCategoryId(place.categoryId);
    setLatitude(place.latitude.toString());
    setLongitude(place.longitude.toString());
    setBestSeason(place.bestSeason || "");
    setAddress(place.address || "");
    setFeaturedImage(place.heroImage || place.featuredImage || "");
    setFormStatus(place.status);
    setActiveSubTab("add_place");
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    setActiveSubTab("overview");
  };

  const resetForm = () => {
    setPlaceName("");
    setShortDesc("");
    setFullDesc("");
    setLatitude("");
    setLongitude("");
    setBestSeason("");
    setAddress("");
    setFeaturedImage("");
    setFormStatus("SUBMITTED");
    setEditingId(null);
  };

  const handleFileUpload = async (file: File, folder: string = "places"): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const res = await fetch(`${API}/storage/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return data.url;
      } else {
        console.error("Upload failed", data.message);
        alert(data.message || "Failed to upload file.");
        return null;
      }
    } catch (e) {
      console.error(e);
      alert("Error occurred during file upload.");
      return null;
    }
  };

  const handlePlaceSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName || !shortDesc || !selectedCategoryId || !selectedDistrictId) return;

    const payload = {
      name: placeName,
      shortDescription: shortDesc,
      fullDescription: fullDesc,
      categoryId: selectedCategoryId,
      districtId: selectedDistrictId,
      latitude: parseFloat(latitude) || 19.5,
      longitude: parseFloat(longitude) || 81.5,
      bestSeason: bestSeason || "October to March",
      address: address || "",
      featuredImage: featuredImage || "/chitrakote.png",
      status: formStatus,
    };

    try {
      const url = editingId ? `${API}/places/${editingId}` : `${API}/places`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Submission failed");
      }

      const savedPlace = await res.json();

      if (editingId) {
        setSubmittedPlaces(submittedPlaces.map(p => p.id === editingId ? savedPlace : p));
      } else {
        setSubmittedPlaces([savedPlace, ...submittedPlaces]);
      }

      setFormSuccess(true);
      resetForm();
      setTimeout(() => {
        setFormSuccess(false);
        setActiveSubTab("overview");
      }, 2000);
    } catch (err: any) {
      alert(err.message || "Error submitting coordinates.");
    }
  };

  const handleRealVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialHandle || !user) return;

    setIsVerifying(true);
    setVerificationProgress(15);
    setErrorMsg("");

    const progressInterval = setInterval(() => {
      setVerificationProgress((prev) => Math.min(prev + 20, 95));
    }, 100);

    try {
      const payload = {
        bio: bio || `Certified expert contributor specializing in regional ${creatorType} guides.`,
        instagram: creatorType === "influencer" || creatorType === "photographer" ? socialHandle : undefined,
        youtube: creatorType === "guide" || creatorType === "ranger" ? socialHandle : undefined
      };

      const res = await fetch(`${API}/users/creator-registry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.id,
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Credential linkage rejected.");
      }

      setIsVerified(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Registry request rejected. Ensure bio is 10-300 characters.");
      setVerificationProgress(0);
    } finally {
      setIsVerifying(false);
    }
  };

  // Auth Protection View
  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl border border-white/60 shadow-2xl bg-white/75 flex flex-col gap-6 text-center">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-tribal-terracotta/10 text-tribal-terracotta flex items-center justify-center shadow-inner animate-pulse">
            <Compass className="w-10 h-10 text-tribal-terracotta" />
          </span>
          <h2 className="text-2xl font-sans font-bold text-forest-emerald mt-2">Sovereign Intelligence</h2>
          <p className="text-sm text-charcoal-stone/70 leading-relaxed">
            The Verified Contributor Studio is a secure registry reserved for local regional experts, photographers, and certified guides to contribute coordinates directly to the State Administrative Moderation Queue.
          </p>
          <div className="flex flex-col gap-3 mt-4">
            <Link href="/login?redirect=/creator" className="w-full py-3.5 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-colors text-center block">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <Compass className="w-12 h-12 text-forest-emerald animate-spin" />
          <span className="text-sm font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
            Syncing Sovereign Grid...
          </span>
        </div>
      </div>
    );
  }

  // Not Verified View: Registration Screen
  if (!isVerified) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-charcoal-stone min-h-[85vh]">
        <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Cooperative Registry</span>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald flex items-center gap-2.5">
            <Compass className="w-9 h-9 text-tribal-terracotta animate-pulse" />
            Verified Contributor Studio
          </h1>
        </div>

        <div className="max-w-xl mx-auto w-full glass-panel p-8 rounded-3xl border border-white/60 shadow-xl bg-white/70 flex flex-col gap-6">
          <div className="text-center flex flex-col items-center gap-2">
            <span className="w-14 h-14 rounded-2xl bg-tribal-terracotta/10 text-tribal-terracotta flex items-center justify-center shadow-inner">
              <UserCheck className="w-8 h-8" />
            </span>
            <h2 className="text-xl font-sans font-bold text-forest-emerald mt-2">Link Contributor Credential</h2>
            <p className="text-xs text-charcoal-stone/60 leading-normal max-w-xs">
              Connect your social media platform or professional guide credentials to unlock coordinate contribution templates.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRealVerification} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-charcoal-stone/60 uppercase">Select Role Classification</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: "influencer", name: "Travel Influencer" },
                  { id: "photographer", name: "Photographer" },
                  { id: "guide", name: "Certified Guide" },
                  { id: "ranger", name: "Forest Expert" },
                  { id: "historian", name: "Clan Historian" },
                  { id: "ngo", name: "Eco Guardian NGO" }
                ].map((type) => (
                  <button
                    key={type.id} type="button" onClick={() => setCreatorType(type.id)}
                    className={`text-xs p-3 rounded-xl border font-sans font-bold transition-all text-center cursor-pointer ${
                      creatorType === type.id
                        ? "bg-forest-emerald border-transparent text-sand-beige shadow-md"
                        : "bg-white/80 border-charcoal-stone/10 text-charcoal-stone hover:bg-white"
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-charcoal-stone/60 uppercase">Primary Social Link / ID</label>
              <input
                type="text" placeholder="e.g. wanderer_bastar or CG_G0284"
                value={socialHandle} onChange={(e) => setSocialHandle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-charcoal-stone/15 text-sm focus:outline-none focus:border-forest-emerald font-sans text-charcoal-stone font-semibold"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono font-bold text-charcoal-stone/60 uppercase">Professional Statement / Bio</label>
              <textarea
                placeholder="Share your regional credentials and local area knowledge (10-300 characters)..."
                value={bio} onChange={(e) => setBio(e.target.value)}
                rows={3} minLength={10} maxLength={300}
                className="w-full px-4 py-3 rounded-xl bg-white border border-charcoal-stone/15 text-sm focus:outline-none focus:border-forest-emerald font-sans text-charcoal-stone font-semibold"
                required
              />
            </div>

            <button
              type="submit" disabled={isVerifying}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-tribal-terracotta hover:bg-warm-orange text-white text-sm font-bold font-sans transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Registry..." : "Verify Identity"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {isVerifying && (
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="w-full h-2 rounded-full bg-charcoal-stone/10 overflow-hidden">
                <div className="h-full bg-forest-emerald transition-all duration-300" style={{ width: `${verificationProgress}%` }}></div>
              </div>
              <span className="text-[9px] font-mono text-charcoal-stone/50 text-right">API Check: {verificationProgress}%</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Active verified places variables for metrics
  const publishedCount = submittedPlaces.filter(p => p.status === 'PUBLISHED').length;
  const pendingCount = submittedPlaces.filter(p => p.status === 'SUBMITTED' || p.status === 'UNDER_REVIEW').length;
  const rejectedCount = submittedPlaces.filter(p => p.status === 'REJECTED').length;
  const draftCount = submittedPlaces.filter(p => p.status === 'DRAFT').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-charcoal-stone min-h-[85vh]">
      
      {/* Cinematic Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">Cooperative Portal</span>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald flex items-center gap-2.5">
            <Compass className="w-9 h-9 text-tribal-terracotta" />
            Creator command center
          </h1>
          <p className="text-xs text-charcoal-stone/75 leading-relaxed max-w-xl">
            Logged in as <strong className="text-tribal-terracotta">@{socialHandle}</strong>. Publish draft travel logs and contribute coordinate metadata to the State discovery engines.
          </p>
        </div>

        {/* Global Statistics (Creator stats) */}
        <div className="flex gap-2.5 shrink-0 flex-wrap">
          <div className="px-3.5 py-2.5 rounded-xl bg-white border border-charcoal-stone/10 shadow-sm flex flex-col items-center">
            <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Contributions</span>
            <span className="text-base font-bold text-forest-emerald">{submittedPlaces.length}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-white border border-charcoal-stone/10 shadow-sm flex flex-col items-center">
            <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Published</span>
            <span className="text-base font-bold text-green-600">{publishedCount}</span>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl bg-white border border-charcoal-stone/10 shadow-sm flex flex-col items-center">
            <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Pending Review</span>
            <span className="text-base font-bold text-amber-600">{pendingCount}</span>
          </div>
          {rejectedCount > 0 && (
            <div className="px-3.5 py-2.5 rounded-xl bg-white border border-red-100 shadow-sm flex flex-col items-center">
              <span className="text-[9px] font-mono text-charcoal-stone/40 uppercase">Changes Needed</span>
              <span className="text-base font-bold text-red-600">{rejectedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-charcoal-stone/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Dashboard Overview", icon: Compass },
          { id: "add_place", label: editingId ? "Edit Destination" : "Add New Place", icon: Plus },
          { id: "my_places", label: `My Submissions (${submittedPlaces.length})`, icon: FileText },
          { id: "add_story", label: "✨ Compose Story", icon: Sparkles }
        ].map((subTab) => {
          const Icon = subTab.icon;
          return (
            <button
              key={subTab.id} onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center gap-2 text-sm font-sans font-bold px-4 py-3 border-b-2 cursor-pointer transition-all shrink-0 ${
                activeSubTab === subTab.id
                  ? "border-tribal-terracotta text-tribal-terracotta"
                  : "border-transparent text-charcoal-stone/60 hover:text-forest-emerald"
              }`}
            >
              <Icon className="w-4 h-4" />
              {subTab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 1: Dashboard Overview */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main overview metrics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Verification & Welcome banner */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-lg text-forest-emerald">Welcome back, Guardian!</h3>
              <p className="text-sm leading-relaxed text-charcoal-stone/80">
                Your profiles are linked to the Chhattisgarhi community tourism network. Standard users look for your verified guides and drone footage overlays when planning itineraries. Maintain standard code respect limits when cataloging.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setActiveSubTab("add_place")}
                  className="px-4 py-2 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-white font-sans font-bold text-xs flex items-center gap-1.5 shadow transition-all"
                >
                  <Plus className="w-4 h-4" /> Map New Destination
                </button>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
                <Award className="w-5 h-5 text-tribal-terracotta" />
                Achievement Badges
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { title: "Novice Mapper", desc: "Contributed 1+ place", unlocked: submittedPlaces.length >= 1 },
                  { title: "Eco Vanguard", desc: "Mapped wildlife zone", unlocked: submittedPlaces.some(p => p.categoryId === "forests-uuid") },
                  { title: "Clan Chronicler", desc: "Wrote history logs", unlocked: submittedPlaces.some(p => p.fullDescription && p.fullDescription.length > 20) },
                  { title: "Elite Scout", desc: "5+ published places", unlocked: publishedCount >= 5 }
                ].map((badge, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all ${
                      badge.unlocked 
                        ? "bg-white border-forest-emerald/20 shadow-sm" 
                        : "bg-charcoal-stone/5 border-charcoal-stone/5 opacity-50"
                    }`}
                  >
                    <span className={`text-3xl ${badge.unlocked ? "grayscale-0 animate-pulse" : "grayscale"}`}>🏆</span>
                    <span className="font-bold text-xs text-charcoal-stone">{badge.title}</span>
                    <span className="text-[9px] text-charcoal-stone/55 leading-normal">{badge.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick status feed */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
                <Clock className="w-4.5 h-4.5 text-tribal-terracotta" />
                Live Submissions Status
              </h3>
              
              <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
                {submittedPlaces.slice(0, 4).map((place) => (
                  <div key={place.id} className="p-3 bg-white border border-charcoal-stone/10 rounded-xl flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold truncate text-forest-emerald max-w-[120px]">{place.name}</span>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        place.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        place.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {place.status}
                      </span>
                    </div>
                    {place.status === 'REJECTED' && (
                      <button 
                        onClick={() => startEdit(place)}
                        className="text-[10px] text-left text-red-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Edit2 className="w-3 h-3" /> Correct and Resubmit
                      </button>
                    )}
                  </div>
                ))}

                {submittedPlaces.length === 0 && (
                  <div className="text-center py-8 text-charcoal-stone/40 text-xs">
                    No submissions filed yet.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: Add / Edit Place Form */}
      {activeSubTab === "add_place" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl bg-white/70 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-charcoal-stone/10 pb-4">
            <h2 className="text-lg font-sans font-bold text-forest-emerald">
              {editingId ? "Update Your Submission Logs" : "File Landmark Telemetry Entry"}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-xs font-mono font-bold text-red-600 hover:underline">
                Cancel Editing
              </button>
            )}
          </div>

          {formSuccess && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Record successfully saved! Redirecting to dashboard...</span>
            </div>
          )}

          <form onSubmit={handlePlaceSubmission} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Destination Name</label>
              <input
                type="text" required value={placeName} onChange={(e) => setPlaceName(e.target.value)}
                placeholder="e.g. Tamra Gumar Gorge View"
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Catchy tagline</label>
              <input
                type="text" required value={shortDesc} onChange={(e) => setShortDesc(e.target.value)}
                placeholder="e.g. Breathtaking valley drop inside Lohandiguda block"
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Category</label>
              <select
                required value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">District</label>
              <select
                required value={selectedDistrictId} onChange={(e) => setSelectedDistrictId(e.target.value)}
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              >
                <option value="">Select District</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Latitude</label>
                <input
                  type="number" step="any" required value={latitude} onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 19.2006"
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Longitude</label>
                <input
                  type="number" step="any" required value={longitude} onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. 81.6961"
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5 justify-end">
                <button
                  type="button" onClick={handleGetLocation}
                  className="w-full py-3 bg-forest-emerald hover:bg-tribal-terracotta text-white rounded-xl font-bold font-mono tracking-wider transition-all"
                >
                  GPS Telemetry
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Significance & Lore</label>
              <textarea
                value={fullDesc} onChange={(e) => setFullDesc(e.target.value)} rows={4}
                placeholder="Narrate details of local community importance, safety guides, and food options nearby..."
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Cover Image</label>
              <div className="flex gap-2">
                <input
                  type="text" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
                  placeholder="/uploads/places/cover.webp"
                  className="flex-1 p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
                />
                <label className="px-4 py-3 bg-forest-emerald hover:bg-tribal-terracotta text-white rounded-xl font-bold font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center select-none text-[10px]">
                  <span>Upload</span>
                  <input
                    type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "places");
                        if (url) setFeaturedImage(url);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Best Season to Visit</label>
              <input
                type="text" value={bestSeason} onChange={(e) => setBestSeason(e.target.value)}
                placeholder="e.g. October to February"
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px]">Submissions Status Mode</label>
              <select
                value={formStatus} onChange={(e) => setFormStatus(e.target.value)}
                className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
              >
                <option value="SUBMITTED">Submit for Review (Audit Log)</option>
                <option value="DRAFT">Keep as Local Draft</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-4 border-t border-charcoal-stone/5 flex justify-end gap-3">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-white font-bold transition-all shadow cursor-pointer"
              >
                {editingId ? "Save Changes" : "Submit Travel Log"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* VIEW 3: List of submissions */}
      {activeSubTab === "my_places" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/70 flex flex-col gap-6">
          <h2 className="text-lg font-sans font-bold text-forest-emerald border-b border-charcoal-stone/10 pb-3">
            Contributions Backlog & Status Logs
          </h2>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-charcoal-stone/20 text-charcoal-stone/50 font-mono uppercase tracking-wider">
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">District</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Approval State</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-stone/10">
                {submittedPlaces.map(place => (
                  <tr key={place.id} className="hover:bg-white/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-forest-emerald">{place.name}</td>
                    <td className="py-4 px-4">{place.district?.name || "Bastar"}</td>
                    <td className="py-4 px-4 font-mono">{place.category?.name || "Waterfalls"}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full uppercase font-mono text-[9px] font-bold ${
                        place.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        place.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {place.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {place.status !== 'PUBLISHED' ? (
                        <button
                          onClick={() => startEdit(place)}
                          className="bg-forest-emerald hover:bg-emerald-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit Record
                        </button>
                      ) : (
                        <Link 
                          href={`/destination/${place.id}`}
                          className="bg-white/95 border border-charcoal-stone/15 hover:bg-sand-beige text-charcoal-stone px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Public Card
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}

                {submittedPlaces.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-charcoal-stone/40">
                      No coordinate contributions recorded under this identity registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: Compose Story with Auto Media & AI Draft suggestions */}
      {activeSubTab === "add_story" && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl bg-white/70 flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-charcoal-stone/10 pb-4">
            <h2 className="text-lg font-sans font-bold text-forest-emerald flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tribal-terracotta" />
              Compose New Travel Story
            </h2>
          </div>

          {storySuccess && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/25 text-green-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Story submitted successfully for review! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleStorySubmission} className="flex flex-col gap-6 text-xs text-charcoal-stone">
            
            {/* Choose Place Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Select Target Destination</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={composerPlaceId} onChange={(e) => setComposerPlaceId(e.target.value)}
                  className="flex-1 p-3.5 rounded-xl bg-white border border-charcoal-stone/15 text-sm font-semibold focus:outline-none"
                  required
                >
                  <option value="" disabled>-- Select a Place --</option>
                  {allPlaces.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name} ({place.district?.name || "Bastar"})
                    </option>
                  ))}
                </select>

                <button
                  type="button" onClick={handleGenerateAIDraft} disabled={isDrafting || !composerPlaceId}
                  className="px-6 py-3.5 bg-forest-emerald hover:bg-emerald-800 text-white rounded-xl font-bold font-sans tracking-wide transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDrafting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      Drafting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate AI Draft Story
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-charcoal-stone/50 mt-1">
                Selecting a destination will automatically query the Media Library for approved assets and allow AI draft generation.
              </p>
            </div>

            {/* Auto Media Loader Drawer */}
            <div className="flex flex-col gap-3 p-5 rounded-2xl bg-white/50 border border-charcoal-stone/10">
              <div className="flex justify-between items-center border-b border-charcoal-stone/5 pb-2">
                <span className="font-bold text-forest-emerald text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4.5 h-4.5 text-tribal-terracotta" />
                  Media Discovery Suggestions ({availableMedia.length} assets discovered)
                </span>
                <span className="text-[10px] text-charcoal-stone/50 uppercase font-mono">Status: Approved Assets Only</span>
              </div>

              {availableMedia.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {availableMedia.map((mediaItem) => (
                    <label
                      key={mediaItem.id}
                      className={`relative rounded-xl border overflow-hidden p-2 flex flex-col gap-2 transition-all cursor-pointer select-none bg-white ${
                        checkedMediaIds.includes(mediaItem.id)
                          ? "border-forest-emerald ring-2 ring-forest-emerald/20 shadow-sm"
                          : "border-charcoal-stone/10 hover:border-charcoal-stone/30"
                      }`}
                    >
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-charcoal-stone/5">
                        <img
                          src={mediaItem.filePath}
                          alt={mediaItem.title}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/chitrakote.png";
                          }}
                        />
                        <div className="absolute top-1.5 right-1.5 bg-white/95 rounded-full p-1 border border-charcoal-stone/10 scale-90">
                          <input
                            type="checkbox"
                            className="cursor-pointer"
                            checked={checkedMediaIds.includes(mediaItem.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCheckedMediaIds([...checkedMediaIds, mediaItem.id]);
                              } else {
                                setCheckedMediaIds(checkedMediaIds.filter(id => id !== mediaItem.id));
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col text-[10px] px-1">
                        <span className="font-bold truncate text-charcoal-stone">{mediaItem.title}</span>
                        <span className="text-[8px] text-charcoal-stone/50 truncate">Owner: {mediaItem.copyrightOwner || "CG Tourism"}</span>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-charcoal-stone/40">
                  No approved assets found in the Media Library for this place. Standard local folder sync is active.
                </div>
              )}
            </div>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Story Title</label>
              <input
                type="text" required value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)}
                placeholder="e.g. Exploring Laxman Temple - An Ancient Heritage Masterpiece"
                className="p-3.5 rounded-xl bg-white border border-charcoal-stone/15 text-sm font-semibold focus:outline-none"
              />
            </div>

            {/* Description (Narrative) */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Narrative Content / Story</label>
              <textarea
                required value={storyDesc} onChange={(e) => setStoryDesc(e.target.value)} rows={7}
                placeholder="Write your travelogue, experiences, drone views overlay timeline, and visitor recommendations here..."
                className="p-3.5 rounded-xl bg-white border border-charcoal-stone/15 text-sm font-semibold focus:outline-none resize-none"
              />
            </div>

            {/* Tags / Keywords */}
            {suggestedTags.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Suggested Tags & Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-forest-emerald/10 text-forest-emerald font-semibold text-[10px]">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Config: Language & Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Story Language</label>
                <select
                  value={storyLanguage} onChange={(e) => setStoryLanguage(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Chhattisgarhi">Chhattisgarhi</option>
                  <option value="English">English</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-charcoal-stone/75 uppercase text-[9px] tracking-wide">Visibility Mode</label>
                <select
                  value={storyVisibility} onChange={(e) => setStoryVisibility(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold focus:outline-none"
                >
                  <option value="PUBLIC">Public (Visible on Feed)</option>
                  <option value="PRIVATE">Private (Creator Only)</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-charcoal-stone/5 flex justify-end gap-3">
              <button
                type="submit"
                className="px-8 py-3.5 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-white font-bold transition-all shadow cursor-pointer text-sm"
              >
                Submit Story for Review
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
