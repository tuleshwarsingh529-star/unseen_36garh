"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  MapPin, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  Leaf, 
  ArrowRight,
  CheckCircle,
  Clock,
  Compass,
  FileText,
  AlertTriangle
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export default function CreatorStudio() {
  const { user, token } = useAuthStore();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Verification states
  const [isVerified, setIsVerified] = useState(false);
  const [creatorType, setCreatorType] = useState("influencer");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [socialHandle, setSocialHandle] = useState("");
  const [bio, setBio] = useState("");

  // Place form states
  const [placeName, setPlaceName] = useState("");
  const [tagline, setTagline] = useState("");
  const [district, setDistrict] = useState("Bastar");
  const [category, setCategory] = useState("waterfalls");
  const [description, setDescription] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  
  // Coordinates
  const [mapX, setMapX] = useState("50");
  const [mapY, setMapY] = useState("50");
  
  // Tourism & Safety info
  const [respectRule, setRespectRule] = useState("");
  const [safetyAlert, setSafetyAlert] = useState("");
  const [requiredGear, setRequiredGear] = useState("");
  
  // Cultural lore
  const [folklore, setFolklore] = useState("");
  const [tribalRelevance, setTribalRelevance] = useState("");

  // Media upload states
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // ── Strict TypeScript interfaces (replaces `any`) ──────────────────────────
  interface SubmittedPlace {
    id: string;
    name: string;
    tagline: string;
    district: string;
    category: string;
    story: string;
    rating: number;
    biodiversityScore: number;
    bestTime: string;
    safety: string;
    localInsights: string;
    rules: string[];
    status?: string;
    coordinates?: {
      x: number;
      y: number;
      mapX: number;
      mapY: number;
    };
  }

  interface Category {
    id: string;
    name: string;
    slug: string;
  }

  interface PlaceResponse {
    id: string;
    name: string;
    description?: string;
    district: string;
    category?: { slug: string };
    history?: string;
    bestSeason?: string;
    safetyInfo?: string;
    rules?: string;
    verified?: boolean;
    longitude?: number;
    latitude?: number;
  }

  interface ApiError {
    message?: string;
  }

  const [submittedPlaces, setSubmittedPlaces] = useState<SubmittedPlace[]>([]);
  const [formSuccess, setFormSuccess] = useState(false);

  // Categories & Staging loads
  const [categories, setCategories] = useState<Category[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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
          if (catData.length > 0) {
            setCategory(catData[0].slug);
          }
        }

        // 2. Fetch Profile details to discover Registry upgrades
        const profileRes = await fetch(`${API}/users/me`, {
          headers: {
            "x-user-id": user?.id || ""
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

        // 3. Fetch Places submissions (including unverified staged coordinates)
        const placesRes = await fetch(`${API}/places?includeUnverified=true`);
        if (placesRes.ok && active) {
          const placesData = await placesRes.json();
          
          const mapped = placesData.map((p: PlaceResponse) => ({
            id: p.id,
            name: p.name,
            tagline: p.description || "A hidden marvel of nature",
            district: p.district,
            category: p.category?.slug || "waterfalls",
            story: p.history || p.description,
            rating: 4.8,
            biodiversityScore: 85,
            bestTime: p.bestSeason || "October to March",
            safety: p.safetyInfo || "Standard forest rules apply.",
            localInsights: p.history || "Oral tradition preservation stage.",
            rules: p.rules ? [p.rules] : ["Respect local guidelines"],
            status: p.verified ? "approved" : "pending",
            coordinates: {
              x: p.longitude || 81.5,
              y: p.latitude || 19.5,
              mapX: p.longitude ? Math.round(((p.longitude - 80.25) / (84.40 - 80.25)) * 100) : 50,
              mapY: p.latitude ? Math.round(((24.08 - p.latitude) / (24.08 - 17.78)) * 100) : 50
            }
          }));
          setSubmittedPlaces(mapped);
        }
      } catch (err: unknown) {
        const e = err as ApiError;
        console.error("Failed to load contributor dashboard:", e?.message || err);
      } finally {
        if (active) {
          setProfileLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [user]);

  // Handle Cover image file upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setCoverUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/storage/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to upload cover image.");
      }

      const data = await res.json();
      const finalUrl = data.url.startsWith("/") ? `http://localhost:4000${data.url}` : data.url;
      setCoverUrl(finalUrl);
    } catch (err: unknown) {
      const e = err as ApiError;
      alert(e?.message || "Error uploading cover image.");
    } finally {
      setCoverUploading(false);
    }
  };

  // Handle Showcase gallery file uploads
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !token) return;

    setGalleryUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);

        const res = await fetch(`${API}/storage/upload`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          },
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          const finalUrl = data.url.startsWith("/") ? `http://localhost:4000${data.url}` : data.url;
          uploadedUrls.push(finalUrl);
        }
      }

      setGalleryUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err: unknown) {
      void err;
      alert("Error uploading gallery media.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const removeGalleryUrl = (urlToRemove: string) => {
    setGalleryUrls((prev) => prev.filter(url => url !== urlToRemove));
  };

  // Handle Registry upgrading via POST API
  const handleRealVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialHandle || !user) return;

    setIsVerifying(true);
    setVerificationProgress(10);
    setErrorMsg("");

    // Graphical loading progress ticks
    const progressInterval = setInterval(() => {
      setVerificationProgress((prev) => Math.min(prev + 18, 90));
    }, 120);

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
          "x-user-id": user?.id || ""
        },
        body: JSON.stringify(payload)
      });

      clearInterval(progressInterval);
      setVerificationProgress(100);

      if (!res.ok) {
        const errData: ApiError = await res.json();
        throw new Error(errData.message || "Credential linkage rejected.");
      }

      setIsVerified(true);
    } catch (err: unknown) {
      const e = err as ApiError;
      setErrorMsg(e?.message || "Registry request rejected. Ensure bio is 10-300 characters.");
      setVerificationProgress(0);
    } finally {
      setIsVerifying(false);
    }
  };

  // Submit new Place to NestJS backend moderation pipeline
  const handlePlaceSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName || !description) return;

    const selectedCategory = categories.find(c => c.slug === category);
    const categoryId = selectedCategory ? selectedCategory.id : (categories[0]?.id || "waterfalls");

    const parsedX = parseFloat(mapX) || 50;
    const parsedY = parseFloat(mapY) || 50;
    
    // Geographical bounds translation: 17.78° N to 24.08° N, 80.25° E to 84.40° E
    const longitude = 80.25 + (parsedX / 100) * (84.40 - 80.25);
    const latitude = 24.08 - (parsedY / 100) * (24.08 - 17.78);

    let fallbackImage = "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80";
    if (category === "waterfalls") {
      fallbackImage = "https://images.unsplash.com/photo-1432405972618-c60002a157c5?auto=format&fit=crop&w=600&q=80";
    } else if (category === "temples") {
      fallbackImage = "https://images.unsplash.com/photo-1582555172866-1c863b4a2e55?auto=format&fit=crop&w=600&q=80";
    } else if (category === "villages") {
      fallbackImage = "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=600&q=80";
    }

    try {
      const payload = {
        name: placeName,
        description: tagline || description.slice(0, 100),
        district: district,
        categoryId: categoryId,
        latitude: latitude,
        longitude: longitude,
        heroImage: coverUrl || fallbackImage,
        bestSeason: bestSeason || "October to March",
        history: folklore || description,
        safetyInfo: safetyAlert || "Respect standard coordinates guidelines.",
        rules: respectRule || "Littering is strictly prohibited.",
        mediaUrls: galleryUrls
      };

      const res = await fetch(`${API}/places`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData: ApiError = await res.json();
        throw new Error(errData.message || "Coordinate submission failed.");
      }

      const created: PlaceResponse = await res.json();

      const newPlace: SubmittedPlace = {
        id: created.id,
        name: created.name,
        tagline: created.description || "A hidden marvel of nature",
        district: created.district,
        category: category,
        story: created.history || created.description || "",
        rating: 4.8,
        biodiversityScore: 88,
        bestTime: created.bestSeason || "October to March",
        safety: created.safetyInfo || "Precautions recommended.",
        localInsights: created.history || "Tribal relevance oral tradition.",
        rules: created.rules ? [created.rules] : ["Respect custom guidelines"],
        status: "pending",
        coordinates: {
          x: longitude,
          y: latitude,
          mapX: parsedX,
          mapY: parsedY
        }
      };

      setSubmittedPlaces((prev) => [newPlace, ...prev]);
      setFormSuccess(true);

      // Reset coordinates form states
      setPlaceName("");
      setTagline("");
      setDescription("");
      setBestSeason("");
      setFolklore("");
      setTribalRelevance("");
      setRespectRule("");
      setSafetyAlert("");
      setRequiredGear("");
      setCoverUrl("");
      setGalleryUrls([]);

      setTimeout(() => setFormSuccess(false), 4000);
    } catch (err: unknown) {
      const e = err as ApiError;
      alert(e?.message || "Coordinate submission error.");
    }
  };

  // Render Premium Login Prompter for Unauthenticated entries
  if (!user) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full glass-panel p-10 rounded-3xl border border-white/60 shadow-2xl bg-white/70 flex flex-col gap-6 text-center">
          <span className="w-16 h-16 mx-auto rounded-2xl bg-tribal-terracotta/10 text-tribal-terracotta flex items-center justify-center shadow-inner">
            <Compass className="w-10 h-10 text-tribal-terracotta animate-pulse" />
          </span>
          <h2 className="text-2xl font-sans font-bold text-forest-emerald mt-2">Sovereign Intelligence</h2>
          <p className="text-sm text-charcoal-stone/70 leading-relaxed">
            The Verified Contributor Studio is a secure registry reserved for local regional experts, photographers, and certified guides to contribute coordinates directly to the State Administrative Moderation Queue.
          </p>
          <div className="flex flex-col gap-3 mt-4">
            <Link
              href="/login?redirect=/creator"
              className="w-full py-3.5 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-colors text-center block"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/register?redirect=/creator"
              className="w-full py-3.5 rounded-xl bg-white/80 hover:bg-white border border-charcoal-stone/15 text-charcoal-stone font-bold text-sm shadow-sm transition-colors text-center block"
            >
              Register as a Traveler
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Loader spinner while profile loads
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8 text-charcoal-stone bg-sand-beige/20 min-h-[85vh]">
      
      {/* Cinematic Studio Header */}
      <div className="flex flex-col gap-2 border-b border-charcoal-stone/10 pb-6">
        <span className="text-xs font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
          Cooperative Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald flex items-center gap-2.5">
          <Compass className="w-9 h-9 text-tribal-terracotta animate-pulse" />
          Verified Contributor Studio
        </h1>
        <p className="text-sm text-charcoal-stone/75 leading-relaxed max-w-2xl">
          Empowering local communities, photographers, and forest experts to expand the platform&apos;s geographic footprint organically while respecting tribal sovereignty.
        </p>
      </div>

      {!isVerified ? (
        /* STEP 1: SOCIAL NETWORK VERIFICATION SCREEN */
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
                    key={type.id}
                    type="button"
                    onClick={() => setCreatorType(type.id)}
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
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. wanderer_bastar or CG_G0284"
                  value={socialHandle}
                  onChange={(e) => setSocialHandle(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-white border border-charcoal-stone/15 text-sm focus:outline-none focus:border-forest-emerald font-sans text-charcoal-stone font-semibold"
                  required
                />
                <div className="absolute right-3.5 top-3.5 flex gap-2.5 text-charcoal-stone/40">
                  {/* Instagram Inline SVG */}
                  <svg className="w-4 h-4 hover:text-pink-600 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  {/* Youtube Inline SVG */}
                  <svg className="w-4 h-4 hover:text-red-600 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  {/* Twitter Inline SVG */}
                  <svg className="w-4 h-4 hover:text-sky-500 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-mono font-bold text-charcoal-stone/60 uppercase">Professional Statement / Bio</label>
                <span className="text-[9px] font-mono text-charcoal-stone/45">{bio.length}/300 chars</span>
              </div>
              <textarea
                placeholder="Share your regional credentials and local area knowledge (10-300 characters)..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                minLength={10}
                maxLength={300}
                className="w-full px-4 py-3 rounded-xl bg-white border border-charcoal-stone/15 text-sm focus:outline-none focus:border-forest-emerald font-sans text-charcoal-stone font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-tribal-terracotta hover:bg-warm-orange text-white text-sm font-bold font-sans transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Social Registry..." : "Verify Identity"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {isVerifying && (
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="w-full h-2 rounded-full bg-charcoal-stone/10 overflow-hidden">
                <div 
                  className="h-full bg-forest-emerald transition-all duration-300"
                  style={{ width: `${verificationProgress}%` }}
                ></div>
              </div>
              <span className="text-[9px] font-mono text-charcoal-stone/50 text-right">API Check: {verificationProgress}%</span>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: VERIFIED PLACE CONTRIBUTION WIZARD */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PLACE SUBMISSION FORM CARD */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 shadow-xl bg-white/70 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-charcoal-stone/5 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-forest-emerald/10 text-forest-emerald flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div className="flex flex-col">
                  <h2 className="text-lg font-sans font-bold text-forest-emerald">Add New Coordinates</h2>
                  <span className="text-[10px] font-mono text-charcoal-stone/50 uppercase">Creator: @{socialHandle} ({creatorType})</span>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Verifications Active
              </span>
            </div>

            {formSuccess && (
              <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3 text-green-800 text-xs font-sans animate-fade-in shadow-inner">
                <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                <div className="flex flex-col">
                  <span className="font-bold">Place Dispatch Complete!</span>
                  <span>Sent directly to the State Administrative Moderation Queue. Review status below.</span>
                </div>
              </div>
            )}

            <form onSubmit={handlePlaceSubmission} className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              
              {/* Part 1: Basic Info */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Location Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kawardha Gorge Viewpoint"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">One-line Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Pristine green gap between peaks"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                >
                  <option value="Bastar">Bastar District</option>
                  <option value="Kabirdham">Kabirdham District</option>
                  <option value="Sarguja">Sarguja District</option>
                  <option value="Dhamtari">Dhamtari District</option>
                  <option value="Raipur">Raipur District</option>
                  <option value="Kawardha">Kawardha District</option>
                  <option value="Sakti">Sakti District</option>
                  <option value="Bilaspur">Bilaspur District</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Experience Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="waterfalls">Waterfalls</option>
                      <option value="forests">Forest Canopy</option>
                      <option value="temples">Temples & Ruins</option>
                      <option value="villages">Tribal Villages</option>
                    </>
                  )}
                </select>
              </div>

              {/* Coordinates Mapping */}
              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Vector Map X Coordinate (0-100%)</label>
                <input
                  type="number"
                  placeholder="e.g. 52"
                  value={mapX}
                  onChange={(e) => setMapX(e.target.value)}
                  min="0"
                  max="100"
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Vector Map Y Coordinate (0-100%)</label>
                <input
                  type="number"
                  placeholder="e.g. 38"
                  value={mapY}
                  onChange={(e) => setMapY(e.target.value)}
                  min="0"
                  max="100"
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="font-bold text-charcoal-stone/75">Story overview / description</label>
                <textarea
                  placeholder="Describe the site overview, travel access path, and geographic relevance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-sans font-medium text-charcoal-stone focus:outline-none"
                  required
                />
              </div>

              {/* Premium Media Hub */}
              <div className="flex flex-col gap-1 sm:col-span-2 border-t border-charcoal-stone/5 pt-4">
                <span className="text-[10px] font-mono text-tribal-terracotta font-bold uppercase tracking-wider mb-2">Premium Media Hub</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cover Upload Dropzone Card */}
                  <div className="flex flex-col gap-2">
                    <div 
                      onClick={() => coverInputRef.current?.click()}
                      className="p-6 rounded-2xl border border-dashed border-forest-emerald/30 hover:border-forest-emerald/60 bg-white/40 hover:bg-white/60 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center shadow-sm"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform select-none">📸</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-charcoal-stone text-xs">Primary Location Cover</span>
                        <span className="text-[9px] text-charcoal-stone/50 font-medium">Click to select hero cover image</span>
                      </div>
                      <input 
                        type="file" 
                        ref={coverInputRef}
                        accept="image/*" 
                        onChange={handleCoverUpload}
                        disabled={coverUploading}
                        className="hidden" 
                      />
                    </div>
                    
                    {coverUploading && (
                      <span className="text-[10px] text-forest-emerald font-mono animate-pulse">Uploading cover media...</span>
                    )}

                    {coverUrl && (
                      <div className="relative w-full h-32 rounded-xl overflow-hidden border border-charcoal-stone/10 mt-1 shadow-sm bg-black">
                        <img 
                          src={coverUrl} 
                          alt="Cover Preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverUrl("")}
                          className="absolute top-2 right-2 px-2.5 py-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-[9px] font-bold transition-all shadow-md cursor-pointer"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gallery Multi-Upload Dropzone Card */}
                  <div className="flex flex-col gap-2">
                    <div 
                      onClick={() => galleryInputRef.current?.click()}
                      className="p-6 rounded-2xl border border-dashed border-tribal-terracotta/30 hover:border-tribal-terracotta/60 bg-white/40 hover:bg-white/60 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group text-center shadow-sm"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform select-none">🎥</span>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-charcoal-stone text-xs">Showcase Gallery</span>
                        <span className="text-[9px] text-charcoal-stone/50 font-medium">Click to select multiple images & videos</span>
                      </div>
                      <input 
                        type="file" 
                        ref={galleryInputRef}
                        accept="image/*,video/*" 
                        multiple 
                        onChange={handleGalleryUpload}
                        disabled={galleryUploading}
                        className="hidden" 
                      />
                    </div>

                    {galleryUploading && (
                      <span className="text-[10px] text-tribal-terracotta font-mono animate-pulse">Uploading gallery files...</span>
                    )}

                    {galleryUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-1 max-h-32 overflow-y-auto pr-1">
                        {galleryUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-charcoal-stone/10 shadow-sm bg-black">
                            {url.toLowerCase().match(/\.(mp4|webm|ogg)$/) ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="Gallery Preview" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeGalleryUrl(url)}
                              className="absolute top-1 right-1 p-1 bg-red-600/80 text-white rounded-full hover:bg-red-700 text-[8px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Peak Visiting Months / Season</label>
                <input
                  type="text"
                  placeholder="e.g. October to February"
                  value={bestSeason}
                  onChange={(e) => setBestSeason(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              {/* Part 2: Rules & Lore */}
              <div className="flex flex-col gap-1 sm:col-span-2 border-t border-charcoal-stone/5 pt-4">
                <span className="text-[10px] font-mono text-tribal-terracotta font-bold uppercase tracking-wider mb-2">Rules & Tribal Reverence Protocols</span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Respect & Eco Rule</label>
                <input
                  type="text"
                  placeholder="e.g. Ask permission before photographing the clan head"
                  value={respectRule}
                  onChange={(e) => setRespectRule(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Live Safety Warnings</label>
                <input
                  type="text"
                  placeholder="e.g. Strict flash flood slip hazards in heavy monsoon rain"
                  value={safetyAlert}
                  onChange={(e) => setSafetyAlert(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Folklore Story Narrative (If Any)</label>
                <input
                  type="text"
                  placeholder="e.g. Gond clan folklore of the green water nymph"
                  value={folklore}
                  onChange={(e) => setFolklore(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-charcoal-stone/75">Gear Checklists (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Trekking shoes, Water canister, Rain cover"
                  value={requiredGear}
                  onChange={(e) => setRequiredGear(e.target.value)}
                  className="p-3 rounded-xl bg-white border border-charcoal-stone/15 font-semibold text-charcoal-stone focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 pt-4 border-t border-charcoal-stone/5 flex items-center justify-between">
                <div className="flex gap-2 items-center text-charcoal-stone/50">
                  <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
                  <span>Submissions are checked via AI parser prior to admin reviews.</span>
                </div>
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-xl bg-forest-emerald hover:bg-emerald-800 text-sand-beige font-bold shadow-md cursor-pointer transition-colors"
                >
                  Submit Coordinates
                </button>
              </div>

            </form>
          </div>

          {/* CREATOR SUBMISSIONS TELEMETRY STATUS SHEET */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl bg-white/70 flex flex-col gap-4">
              <h3 className="font-sans font-bold text-base text-forest-emerald flex items-center gap-2">
                <FileText className="w-5 h-5 text-tribal-terracotta" />
                Submitted Coordinates ({submittedPlaces.length})
              </h3>
              
              <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
                {submittedPlaces.map((place) => (
                  <div 
                    key={place.id}
                    className="p-4 rounded-xl bg-white border border-charcoal-stone/10 flex flex-col gap-2 relative shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-forest-emerald">{place.name}</span>
                      <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        place.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {place.status || "pending"}
                      </span>
                    </div>

                    <p className="text-[10px] text-charcoal-stone/60 leading-relaxed line-clamp-2">
                      {place.story}
                    </p>

                    <div className="flex justify-between items-center text-[9px] font-mono text-charcoal-stone/40 border-t border-charcoal-stone/5 pt-2">
                      <span>MAP PIN: X {place.coordinates?.mapX || 50}% / Y {place.coordinates?.mapY || 50}%</span>
                      {place.status !== "approved" && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <Clock className="w-3 h-3" /> Moderating
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {submittedPlaces.length === 0 && (
                  <div className="text-center py-10 border border-dashed border-charcoal-stone/20 rounded-xl bg-white/30 text-charcoal-stone/40 flex flex-col items-center justify-center gap-2">
                    <Clock className="w-8 h-8 text-charcoal-stone/30" />
                    <span>No submissions filed yet</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
