"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, MapPin, Image as ImageIcon,
  Search, ShieldCheck, Compass, Info, CheckCircle2, Loader2, Plus, Trash2,
  FileText, Upload, AlertCircle, Clock, Eye
} from "lucide-react";
import { useAuthStore } from "../../../../store/auth-store";

interface Category { id: string; name: string; slug: string; }
interface District { id: string; name: string; }

type FieldErrors = Record<string, string>;

const DRAFT_KEY = "cg-tourism-place-draft";

export default function NewPlacePage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'draft'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [blockId, setBlockId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [history, setHistory] = useState("");
  const [significance, setSignificance] = useState("");
  const [thingsToDo, setThingsToDo] = useState("");
  const [travelTips, setTravelTips] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [googleMapUrl, setGoogleMapUrl] = useState("");
  const [altitude, setAltitude] = useState("");
  const [address, setAddress] = useState("");
  const [nearestCity, setNearestCity] = useState("");
  const [nearestRailway, setNearestRailway] = useState("");
  const [nearestAirport, setNearestAirport] = useState("");
  const [distanceFromCity, setDistanceFromCity] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");
  const [entryFee, setEntryFee] = useState("");

  // Checklist parameters
  const [parkingAvailable, setParkingAvailable] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(false);
  const [guideAvailable, setGuideAvailable] = useState(false);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [washroomAvailable, setWashroomAvailable] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [photographyAllowed, setPhotographyAllowed] = useState(false);

  const [contactNumber, setContactNumber] = useState("");
  const [website, setWebsite] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");

  // Media Array structures
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [panoramaUrls, setPanoramaUrls] = useState<string[]>([]);
  const [newPanoramaUrl, setNewPanoramaUrl] = useState("");

  // SEO & Status
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [status, setStatus] = useState("PUBLISHED");

  // Active form tab selection
  const [activeFormTab, setActiveFormTab] = useState<"basic" | "desc" | "loc" | "tourist" | "media" | "seo">("basic");

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  // ── Load saved draft on mount ──────────────────────────────────────────────
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const d = JSON.parse(saved);
        if (d.name) setName(d.name);
        if (d.categoryId) setCategoryId(d.categoryId);
        if (d.districtId) setDistrictId(d.districtId);
        if (d.blockId) setBlockId(d.blockId);
        if (d.subcategory) setSubcategory(d.subcategory);
        if (d.priority) setPriority(d.priority);
        if (d.shortDescription) setShortDescription(d.shortDescription);
        if (d.fullDescription) setFullDescription(d.fullDescription);
        if (d.history) setHistory(d.history);
        if (d.significance) setSignificance(d.significance);
        if (d.thingsToDo) setThingsToDo(d.thingsToDo);
        if (d.travelTips) setTravelTips(d.travelTips);
        if (d.latitude) setLatitude(d.latitude);
        if (d.longitude) setLongitude(d.longitude);
        if (d.googleMapUrl) setGoogleMapUrl(d.googleMapUrl);
        if (d.altitude) setAltitude(d.altitude);
        if (d.address) setAddress(d.address);
        if (d.nearestCity) setNearestCity(d.nearestCity);
        if (d.nearestRailway) setNearestRailway(d.nearestRailway);
        if (d.nearestAirport) setNearestAirport(d.nearestAirport);
        if (d.distanceFromCity) setDistanceFromCity(d.distanceFromCity);
        if (d.bestSeason) setBestSeason(d.bestSeason);
        if (d.openingTime) setOpeningTime(d.openingTime);
        if (d.closingTime) setClosingTime(d.closingTime);
        if (d.entryFee) setEntryFee(d.entryFee);
        if (d.contactNumber) setContactNumber(d.contactNumber);
        if (d.website) setWebsite(d.website);
        if (d.featuredImage) setFeaturedImage(d.featuredImage);
        if (d.imageUrls) setImageUrls(d.imageUrls);
        if (d.videoUrls) setVideoUrls(d.videoUrls);
        if (d.panoramaUrls) setPanoramaUrls(d.panoramaUrls);
        if (d.metaTitle) setMetaTitle(d.metaTitle);
        if (d.metaDescription) setMetaDescription(d.metaDescription);
        if (d.metaKeywords) setMetaKeywords(d.metaKeywords);
        if (d.parkingAvailable !== undefined) setParkingAvailable(d.parkingAvailable);
        if (d.foodAvailable !== undefined) setFoodAvailable(d.foodAvailable);
        if (d.guideAvailable !== undefined) setGuideAvailable(d.guideAvailable);
        if (d.wheelchairAccessible !== undefined) setWheelchairAccessible(d.wheelchairAccessible);
        if (d.washroomAvailable !== undefined) setWashroomAvailable(d.washroomAvailable);
        if (d.petFriendly !== undefined) setPetFriendly(d.petFriendly);
        if (d.photographyAllowed !== undefined) setPhotographyAllowed(d.photographyAllowed);
      }
    } catch (_) {}
  }, []);

  // ── Fetch categories and districts ────────────────────────────────────────
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await fetch(`${API}/places/categories`);
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);

        const distRes = await fetch(`${API}/places/districts`);
        const distData = await distRes.json();
        setDistricts(Array.isArray(distData) ? distData : []);
      } catch (err) {
        console.error("Error loading categories or districts", err);
      }
    };
    fetchMetadata();
  }, [API]);

  // ── Build current form state snapshot ─────────────────────────────────────
  const getSnapshot = useCallback(() => ({
    name, categoryId, districtId, blockId, subcategory, priority,
    shortDescription, fullDescription, history, significance, thingsToDo,
    travelTips, latitude, longitude, googleMapUrl, altitude, address,
    nearestCity, nearestRailway, nearestAirport, distanceFromCity,
    bestSeason, openingTime, closingTime, entryFee, contactNumber,
    website, featuredImage, imageUrls, videoUrls, panoramaUrls, metaTitle,
    metaDescription, metaKeywords, parkingAvailable, foodAvailable,
    guideAvailable, wheelchairAccessible, washroomAvailable, petFriendly,
    photographyAllowed,
  }), [name, categoryId, districtId, blockId, subcategory, priority,
    shortDescription, fullDescription, history, significance, thingsToDo,
    travelTips, latitude, longitude, googleMapUrl, altitude, address,
    nearestCity, nearestRailway, nearestAirport, distanceFromCity,
    bestSeason, openingTime, closingTime, entryFee, contactNumber,
    website, featuredImage, imageUrls, videoUrls, panoramaUrls, metaTitle,
    metaDescription, metaKeywords, parkingAvailable, foodAvailable,
    guideAvailable, wheelchairAccessible, washroomAvailable, petFriendly,
    photographyAllowed]);

  // Mark dirty on any field change
  useEffect(() => {
    if (name || categoryId || districtId || shortDescription || latitude) {
      setIsDirty(true);
    }
  }, [name, categoryId, districtId, shortDescription, latitude, longitude, featuredImage]);

  // ── Slug preview ──────────────────────────────────────────────────────────
  const getSlugPreview = () => {
    return name
      .toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // ── Gallery helpers ───────────────────────────────────────────────────────
  const handleAddImage = () => {
    if (newImageUrl && !imageUrls.includes(newImageUrl)) {
      setImageUrls([...imageUrls, newImageUrl]);
      setNewImageUrl("");
    }
  };
  const handleRemoveImage = (index: number) => setImageUrls(imageUrls.filter((_, i) => i !== index));
  const handleAddVideo = () => {
    if (newVideoUrl && !videoUrls.includes(newVideoUrl)) {
      setVideoUrls([...videoUrls, newVideoUrl]);
      setNewVideoUrl("");
    }
  };
  const handleRemoveVideo = (index: number) => setVideoUrls(videoUrls.filter((_, i) => i !== index));

  const handleAddPanorama = () => {
    if (newPanoramaUrl && !panoramaUrls.includes(newPanoramaUrl)) {
      setPanoramaUrls([...panoramaUrls, newPanoramaUrl]);
      setNewPanoramaUrl("");
    }
  };
  const handleRemovePanorama = (index: number) => setPanoramaUrls(panoramaUrls.filter((_, i) => i !== index));

  // ── GPS auto-fill ─────────────────────────────────────────────────────────
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLatitude(pos.coords.latitude.toString());
        setLongitude(pos.coords.longitude.toString());
      });
    }
  };

  // ── File upload helper ────────────────────────────────────────────────────
  const handleFileUpload = async (file: File, folder: string = "places"): Promise<string | null> => {
    let currentToken = useAuthStore.getState().token;

    // If token is missing, try to refresh first
    if (!currentToken) {
      const refreshed = await useAuthStore.getState().refreshAccessToken();
      if (refreshed) {
        currentToken = useAuthStore.getState().token;
      }
    }

    const performUpload = async (authToken: string | null) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const headers: HeadersInit = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      return fetch(`${API}/storage/upload`, {
        method: "POST",
        headers,
        body: formData,
      });
    };

    try {
      let res = await performUpload(currentToken);

      // If unauthorized (e.g. token expired), try to refresh token and retry once
      if (res.status === 401) {
        const refreshed = await useAuthStore.getState().refreshAccessToken();
        if (refreshed) {
          const newToken = useAuthStore.getState().token;
          res = await performUpload(newToken);
        }
      }

      const data = await res.json();
      if (res.ok && data.success) return data.url;
      console.error("Upload failed", data.message);
      setStatusMessage({ type: 'error', text: data.message || "Upload failed. Make sure you are logged in." });
      return null;
    } catch (e) {
      setStatusMessage({ type: 'error', text: "Network error during file upload." });
      return null;
    }
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validateForPublish = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "Destination name is required.";
    if (!districtId) errors.districtId = "Please select a district.";
    if (!categoryId) errors.categoryId = "Please select a category.";
    if (!latitude.trim() || isNaN(parseFloat(latitude))) errors.latitude = "Valid latitude is required for publishing.";
    if (!longitude.trim() || isNaN(parseFloat(longitude))) errors.longitude = "Valid longitude is required for publishing.";
    return errors;
  };

  const validateForDraft = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = "A name is required even for drafts.";
    return errors;
  };

  // ── Build payload ──────────────────────────────────────────────────────────
  const buildPayload = (overrideStatus: string) => ({
    name: name.trim(),
    categoryId: categoryId || undefined,
    districtId: districtId || undefined,
    blockId: blockId || undefined,
    shortDescription: shortDescription || undefined,
    fullDescription: fullDescription || undefined,
    history: history || undefined,
    significance: significance || undefined,
    latitude: latitude ? parseFloat(latitude) : undefined,
    longitude: longitude ? parseFloat(longitude) : undefined,
    googleMapUrl: googleMapUrl || undefined,
    altitude: altitude ? parseFloat(altitude) : undefined,
    address: address || undefined,
    nearestCity: nearestCity || undefined,
    distanceFromCity: distanceFromCity ? parseInt(distanceFromCity) : undefined,
    bestSeason: bestSeason || undefined,
    openingTime: openingTime || undefined,
    closingTime: closingTime || undefined,
    entryFee: entryFee ? parseFloat(entryFee) : undefined,
    parkingAvailable,
    foodAvailable,
    guideAvailable,
    wheelchairAccessible,
    washroomAvailable,
    petFriendly,
    photographyAllowed,
    contactNumber: contactNumber || undefined,
    website: website || undefined,
    featuredImage: featuredImage || undefined,
    imageUrls,
    videoUrls,
    panoramaUrls,
    metaTitle: metaTitle || undefined,
    metaDescription: metaDescription || undefined,
    metaKeywords: metaKeywords || undefined,
    status: overrideStatus,
  });

  // ── Save Draft ─────────────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    const errors = validateForDraft();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setActiveFormTab("basic");
      return;
    }
    setFieldErrors({});
    setIsSavingDraft(true);
    setStatusMessage(null);

    // Always save to localStorage first (local draft)
    localStorage.setItem(DRAFT_KEY, JSON.stringify(getSnapshot()));

    try {
      const res = await fetch(`${API}/places`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(buildPayload("DRAFT")),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Failed to save draft"));

      localStorage.removeItem(DRAFT_KEY);
      setIsDirty(false);
      setStatusMessage({ type: 'draft', text: `✅ Draft "${name}" saved successfully! You can continue editing or publish later.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || "Error saving draft." });
    } finally {
      setIsSavingDraft(false);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForPublish();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Navigate to the tab that contains the first error
      if (errors.name || errors.districtId || errors.categoryId) setActiveFormTab("basic");
      else if (errors.latitude || errors.longitude) setActiveFormTab("loc");
      return;
    }
    setFieldErrors({});
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API}/places`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(buildPayload(status)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Failed to create place"));

      localStorage.removeItem(DRAFT_KEY);
      setIsDirty(false);
      setStatusMessage({ type: 'success', text: `🎉 "${name}" published successfully!` });
      setTimeout(() => router.push("/admin"), 2000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || "Error publishing destination." });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Field helper ───────────────────────────────────────────────────────────
  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/50 transition-colors ${
      fieldErrors[field]
        ? "border-red-400 bg-red-50/50"
        : "border-charcoal-stone/10 bg-white/70"
    }`;

  const FieldError = ({ field }: { field: string }) =>
    fieldErrors[field] ? (
      <p className="text-xs text-red-500 flex items-center gap-1 mt-0.5">
        <AlertCircle className="w-3 h-3" /> {fieldErrors[field]}
      </p>
    ) : null;

  // ── Auth guard ─────────────────────────────────────────────────────────────
  if (!user || !['ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(user.role)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0D0F]">
        <h2 className="text-2xl font-sans font-bold text-red-500">Access Denied</h2>
        <p className="text-charcoal-stone/60 mt-2 text-sm">You must be an admin to access this page.</p>
        <Link href="/login" className="mt-4 px-6 py-3 rounded-xl bg-forest-emerald text-white text-sm font-bold">
          Go to Login
        </Link>
      </div>
    );
  }

  // ── Tab configuration ──────────────────────────────────────────────────────
  const tabs = [
    { id: "basic", label: "1. Basic Info", hasError: !!(fieldErrors.name || fieldErrors.districtId || fieldErrors.categoryId) },
    { id: "desc",  label: "2. Description", hasError: false },
    { id: "loc",   label: "3. Location",    hasError: !!(fieldErrors.latitude || fieldErrors.longitude) },
    { id: "tourist", label: "4. Logistics", hasError: false },
    { id: "media", label: "5. Media",       hasError: false },
    { id: "seo",   label: "6. SEO",         hasError: false },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-forest-emerald hover:text-tribal-terracotta uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl sm:text-4xl font-sans font-bold text-forest-emerald tracking-tight">
            Add New Tourism Destination
          </h1>
          <p className="text-xs text-charcoal-stone/60">
            Create a rich, metadata-complete destination record for the CMS. Save as draft anytime, publish when ready.
          </p>
        </div>
        {isDirty && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl animate-pulse">
            <Clock className="w-3.5 h-3.5" /> Unsaved changes
          </div>
        )}
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
          statusMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-800' :
          statusMessage.type === 'draft'   ? 'bg-blue-500/10 border-blue-500/20 text-blue-800' :
                                             'bg-red-500/10 border-red-500/20 text-red-800'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600 mt-0.5" />}
          {statusMessage.type === 'draft'   && <FileText    className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />}
          {statusMessage.type === 'error'   && <AlertCircle  className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />}
          <p>{statusMessage.text}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-charcoal-stone/10 overflow-x-auto gap-1 text-xs font-mono uppercase tracking-wider pb-0 shrink-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFormTab(tab.id as any)}
            className={`relative px-4 py-2.5 rounded-t-xl border-t border-x transition-all font-bold whitespace-nowrap ${
              activeFormTab === tab.id
                ? "bg-white border-charcoal-stone/15 text-forest-emerald shadow-sm -mb-[1px]"
                : "border-transparent text-charcoal-stone/40 hover:text-charcoal-stone"
            }`}
          >
            {tab.label}
            {tab.hasError && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
            )}
          </button>
        ))}
      </div>

      {/* Main Form */}
      <form onSubmit={handlePublish} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column - Form Inputs */}
        <div className="lg:col-span-2 flex flex-col gap-8">

          {/* TAB 1: Basic Information */}
          {activeFormTab === "basic" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2">
                1. Basic Information
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                  Destination Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" value={name} onChange={(e) => { setName(e.target.value); setFieldErrors(p => ({...p, name: ""})); }}
                  placeholder="e.g. Tamra Gumar Waterfall"
                  className={inputClass("name")}
                />
                <FieldError field="name" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setFieldErrors(p => ({...p, categoryId: ""})); }}
                    className={inputClass("categoryId")}
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <FieldError field="categoryId" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={districtId} onChange={(e) => { setDistrictId(e.target.value); setFieldErrors(p => ({...p, districtId: ""})); }}
                    className={inputClass("districtId")}
                  >
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <FieldError field="districtId" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Block / Tehsil</label>
                  <input
                    type="text" value={blockId} onChange={(e) => setBlockId(e.target.value)}
                    placeholder="e.g. Lohandiguda block"
                    className={inputClass("")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Subcategory / Tags</label>
                  <input
                    type="text" value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="e.g. Trekking, Eco-tourism"
                    className={inputClass("")}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Priority Rating</label>
                <select
                  value={priority} onChange={(e) => setPriority(e.target.value)}
                  className={inputClass("")}
                >
                  <option value="high">High (Featured Spot)</option>
                  <option value="medium">Medium (Regular Listing)</option>
                  <option value="low">Low (Hidden Gem)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 2: Description */}
          {activeFormTab === "desc" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2">
                2. Descriptions & Travel Lore
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Short Catchy Tagline</label>
                <input
                  type="text" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. The pristine eco-paradise of Jagdalpur valleys"
                  className={inputClass("")}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Detailed Story & Significance</label>
                <textarea
                  rows={5} value={fullDescription} onChange={(e) => setFullDescription(e.target.value)}
                  placeholder="Narrate the historical significance, tribal myths, and geographical background..."
                  className={`${inputClass("")} resize-y`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Historical Background</label>
                  <textarea rows={3} value={history} onChange={(e) => setHistory(e.target.value)}
                    placeholder="Enter dynasty records, tribal lore, or historical notes..."
                    className={`${inputClass("")} resize-y`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Significance & Importance</label>
                  <textarea rows={3} value={significance} onChange={(e) => setSignificance(e.target.value)}
                    placeholder="Describe ecological limits or religious significance..."
                    className={`${inputClass("")} resize-y`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Things to Do / Activities</label>
                  <textarea rows={3} value={thingsToDo} onChange={(e) => setThingsToDo(e.target.value)}
                    placeholder="Trekking trails, photography spots, local shopping guide..."
                    className={`${inputClass("")} resize-y`} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Travel Tips & Guidelines</label>
                  <textarea rows={3} value={travelTips} onChange={(e) => setTravelTips(e.target.value)}
                    placeholder="Safe swimming areas, local customs, monkey warnings, etc..."
                    className={`${inputClass("")} resize-y`} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Location */}
          {activeFormTab === "loc" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2">
                3. Geographic & Location Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                    Latitude <span className="text-amber-500 text-[10px] font-normal">(required to publish)</span>
                  </label>
                  <input
                    type="number" step="any" value={latitude}
                    onChange={(e) => { setLatitude(e.target.value); setFieldErrors(p => ({...p, latitude: ""})); }}
                    placeholder="e.g. 19.2006"
                    className={inputClass("latitude")}
                  />
                  <FieldError field="latitude" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                    Longitude <span className="text-amber-500 text-[10px] font-normal">(required to publish)</span>
                  </label>
                  <input
                    type="number" step="any" value={longitude}
                    onChange={(e) => { setLongitude(e.target.value); setFieldErrors(p => ({...p, longitude: ""})); }}
                    placeholder="e.g. 81.6961"
                    className={inputClass("longitude")}
                  />
                  <FieldError field="longitude" />
                </div>
                <div className="flex flex-col gap-1.5 justify-end">
                  <button
                    type="button" onClick={handleGetLocation}
                    className="w-full py-3.5 bg-forest-emerald text-white rounded-xl text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:bg-tribal-terracotta transition-colors"
                  >
                    <MapPin className="w-4 h-4" /> Get GPS Location
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Altitude (meters)</label>
                  <input type="number" value={altitude} onChange={(e) => setAltitude(e.target.value)}
                    placeholder="e.g. 450" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Google Maps URL</label>
                  <input type="url" value={googleMapUrl} onChange={(e) => setGoogleMapUrl(e.target.value)}
                    placeholder="e.g. https://goo.gl/maps/..." className={inputClass("")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Nearest City Hub</label>
                  <input type="text" value={nearestCity} onChange={(e) => setNearestCity(e.target.value)}
                    placeholder="e.g. Jagdalpur" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Nearest Railway Station</label>
                  <input type="text" value={nearestRailway} onChange={(e) => setNearestRailway(e.target.value)}
                    placeholder="e.g. Jagdalpur Station" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Nearest Airport</label>
                  <input type="text" value={nearestAirport} onChange={(e) => setNearestAirport(e.target.value)}
                    placeholder="e.g. Raipur Airport (RPR)" className={inputClass("")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Distance from City (km)</label>
                  <input type="number" value={distanceFromCity} onChange={(e) => setDistanceFromCity(e.target.value)}
                    placeholder="e.g. 38" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Full Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Lohandiguda block, Bastar district" className={inputClass("")} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Logistics */}
          {activeFormTab === "tourist" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2">
                4. Tourism & Logistics Parameters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Opening Hours</label>
                  <input type="text" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)}
                    placeholder="e.g. 08:00 AM" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Closing Hours</label>
                  <input type="text" value={closingTime} onChange={(e) => setClosingTime(e.target.value)}
                    placeholder="e.g. 06:00 PM" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Entry Fee (INR)</label>
                  <input type="number" value={entryFee} onChange={(e) => setEntryFee(e.target.value)}
                    placeholder="e.g. 20" className={inputClass("")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Best Season to Visit</label>
                  <input type="text" value={bestSeason} onChange={(e) => setBestSeason(e.target.value)}
                    placeholder="e.g. August to October (Monsoon high)" className={inputClass("")} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Official Website</label>
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                    placeholder="e.g. https://bastar.gov.in" className={inputClass("")} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {[
                  { state: parkingAvailable,     setter: setParkingAvailable,     label: "Parking Available",         desc: "Dedicated vehicle stands and safe zones" },
                  { state: wheelchairAccessible, setter: setWheelchairAccessible, label: "Wheelchair Accessible",     desc: "Fitted with access ramps and guardrails" },
                  { state: washroomAvailable,    setter: setWashroomAvailable,    label: "Washrooms Available",       desc: "Restrooms and sanitization blocks" },
                  { state: foodAvailable,        setter: setFoodAvailable,        label: "Food & Cafeterias",         desc: "Local dhabas or cafeterias nearby" },
                  { state: guideAvailable,       setter: setGuideAvailable,       label: "Local Guides Available",    desc: "Government-verified tourism guides" },
                  { state: petFriendly,          setter: setPetFriendly,          label: "Pet Friendly",              desc: "Allows pets inside public tourist paths" },
                ].map(({ state, setter, label, desc }) => (
                  <label key={label} className="flex items-center gap-3 p-4 bg-white/50 border border-charcoal-stone/10 rounded-2xl cursor-pointer hover:bg-white transition-colors">
                    <input type="checkbox" checked={state} onChange={(e) => setter(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-emerald focus:ring-forest-emerald" />
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-sans font-bold">{label}</span>
                      <span className="text-[10px] text-charcoal-stone/50">{desc}</span>
                    </div>
                  </label>
                ))}
                <label className="flex items-center gap-3 p-4 bg-white/50 border border-charcoal-stone/10 rounded-2xl cursor-pointer hover:bg-white transition-colors col-span-1 sm:col-span-2">
                  <input type="checkbox" checked={photographyAllowed} onChange={(e) => setPhotographyAllowed(e.target.checked)}
                    className="w-4 h-4 rounded text-forest-emerald focus:ring-forest-emerald" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-sans font-bold">Photography & Drone Allowed</span>
                    <span className="text-[10px] text-charcoal-stone/50">Allows recreational photo shoots and video recordings</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: Media */}
          {activeFormTab === "media" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-tribal-terracotta" />
                5. Media & Uploads Repository
              </h3>

              {/* Featured Image */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">
                  Cover / Featured Image <span className="text-charcoal-stone/40 font-normal">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)}
                    placeholder="e.g. /uploads/places/cover.webp or paste URL"
                    className="flex-1 px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/50"
                  />
                  <label className="px-5 py-3 rounded-xl bg-forest-emerald text-white text-xs font-bold hover:bg-tribal-terracotta transition-colors flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                    <Upload className="w-4 h-4" /> Upload
                    <input type="file" accept="image/*" className="hidden"
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
                {featuredImage && (
                  <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-charcoal-stone/10">
                    <img src={featuredImage} alt="Cover preview" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Featured Image Preview
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-charcoal-stone/40">Select a local file to upload, or paste a relative/absolute URL. Not required to save a draft.</span>
              </div>

              {/* Gallery Images */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Additional Gallery Images</label>
                <div className="flex gap-2">
                  <input type="text" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    placeholder="Paste image URL or upload below..."
                    className="flex-1 px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/50" />
                  <button type="button" onClick={handleAddImage}
                    className="px-5 py-3 rounded-xl bg-forest-emerald text-white text-xs font-bold hover:bg-tribal-terracotta transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <label className="px-4 py-3 rounded-xl bg-sand-beige text-charcoal-stone border border-charcoal-stone/15 text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" /> Files
                    <input type="file" accept="image/*" multiple className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const urls: string[] = [];
                        for (const file of files) {
                          const url = await handleFileUpload(file, "places");
                          if (url) urls.push(url);
                        }
                        if (urls.length > 0) setImageUrls([...imageUrls, ...urls]);
                      }}
                    />
                  </label>
                </div>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-sand-beige/20 border border-charcoal-stone/5 rounded-2xl">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative h-20 group rounded-xl overflow-hidden border border-charcoal-stone/10">
                        <img src={url} alt="Gallery item" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div className="flex flex-col gap-3 border-t border-charcoal-stone/5 pt-4">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Promotional / Drone Videos</label>
                <div className="flex gap-2">
                  <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVideo())}
                    placeholder="Paste MP4 or YouTube URL..."
                    className="flex-1 px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/50" />
                  <button type="button" onClick={handleAddVideo}
                    className="px-5 py-3 rounded-xl bg-forest-emerald text-white text-xs font-bold hover:bg-tribal-terracotta transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <label className="px-4 py-3 rounded-xl bg-sand-beige text-charcoal-stone border border-charcoal-stone/15 text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="video/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, "places");
                          if (url) setVideoUrls([...videoUrls, url]);
                        }
                      }}
                    />
                  </label>
                </div>

                {videoUrls.length > 0 && (
                  <div className="flex flex-col gap-2 p-4 bg-sand-beige/20 border border-charcoal-stone/5 rounded-2xl text-xs">
                    {videoUrls.map((url, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-charcoal-stone/10 gap-3">
                        <span className="truncate font-mono text-charcoal-stone/70 flex-1">{url}</span>
                        <button type="button" onClick={() => handleRemoveVideo(idx)} className="text-red-600 hover:text-red-800 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 360° Panorama Views */}
              <div className="flex flex-col gap-3 border-t border-charcoal-stone/5 pt-4">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">360° Panorama Views (Equirectangular)</label>
                <div className="flex gap-2">
                  <input type="text" value={newPanoramaUrl} onChange={(e) => setNewPanoramaUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPanorama())}
                    placeholder="Paste equirectangular image URL or upload below..."
                    className="flex-1 px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-forest-emerald/50" />
                  <button type="button" onClick={handleAddPanorama}
                    className="px-5 py-3 rounded-xl bg-forest-emerald text-white text-xs font-bold hover:bg-tribal-terracotta transition-colors flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <label className="px-4 py-3 rounded-xl bg-sand-beige text-charcoal-stone border border-charcoal-stone/15 text-xs font-bold hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap">
                    <Upload className="w-3.5 h-3.5" /> Upload
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file, "places");
                          if (url) setPanoramaUrls([...panoramaUrls, url]);
                        }
                      }}
                    />
                  </label>
                </div>

                {panoramaUrls.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-sand-beige/20 border border-charcoal-stone/5 rounded-2xl">
                    {panoramaUrls.map((url, idx) => (
                      <div key={idx} className="relative h-20 group rounded-xl overflow-hidden border border-charcoal-stone/10">
                        <img src={url} alt="Panorama item" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleRemovePanorama(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SEO */}
          {activeFormTab === "seo" && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/60 bg-white/50 flex flex-col gap-6">
              <h3 className="text-base font-sans font-bold text-forest-emerald border-b border-charcoal-stone/15 pb-2">
                6. SEO & Index Parameters
              </h3>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Canonical URL Slug Preview</label>
                <div className="p-3 bg-charcoal-stone/5 border border-charcoal-stone/10 rounded-xl font-mono text-[10px] text-charcoal-stone/60">
                  /destination/{getSlugPreview() || "slug-placeholder"}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Meta Title Override</label>
                <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Override browser tab title..." className={inputClass("")} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Meta Description</label>
                <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Snippet displayed on search engine listings..."
                  className={`${inputClass("")} resize-y`} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Meta Keywords (comma-separated)</label>
                <input type="text" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
                  placeholder="e.g. chhattisgarh, waterfall, bastar, ecotourism" className={inputClass("")} />
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-6">

          {/* Publish Panel */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 bg-white/50 flex flex-col gap-4 shadow-lg sticky top-6">
            <h3 className="text-sm font-sans font-bold text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <ShieldCheck className="w-4 h-4 text-tribal-terracotta" />
              Save & Publish
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Visibility State</label>
              <select
                value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white text-xs font-bold text-forest-emerald focus:outline-none focus:ring-2 focus:ring-forest-emerald/50"
              >
                <option value="PUBLISHED">Published — Live</option>
                <option value="FEATURED">Featured — Homepage</option>
                <option value="DRAFT">Draft — Hidden</option>
              </select>
            </div>

            {/* Save Draft Button */}
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isLoading}
              className="w-full py-3.5 rounded-xl bg-white border-2 border-forest-emerald text-forest-emerald hover:bg-forest-emerald/5 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Save as Draft
            </button>

            {/* Publish Button */}
            <button
              type="submit"
              disabled={isLoading || isSavingDraft}
              className="w-full py-4 rounded-xl bg-forest-emerald hover:bg-tribal-terracotta disabled:bg-forest-emerald/45 disabled:cursor-not-allowed text-white font-bold text-xs tracking-wider shadow-lg shadow-forest-emerald/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {status === "PUBLISHED" ? "Publish Destination" : status === "FEATURED" ? "Feature & Publish" : "Save Changes"}
            </button>

            <div className="flex flex-col gap-1 pt-1 text-[10px] text-charcoal-stone/50 border-t border-charcoal-stone/5">
              <p className="flex items-start gap-1.5"><span className="text-forest-emerald font-bold">Draft</span> — saves without validating GPS or image. Continue editing later.</p>
              <p className="flex items-start gap-1.5"><span className="text-tribal-terracotta font-bold">Publish</span> — requires Name, District, Category, and GPS coordinates.</p>
            </div>
          </div>

          {/* SEO Sidebar */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 bg-white/50 flex flex-col gap-4 shadow-sm">
            <h3 className="text-sm font-sans font-bold text-forest-emerald flex items-center gap-2 border-b border-charcoal-stone/10 pb-2">
              <Compass className="w-4 h-4 text-tribal-terracotta" />
              SEO Parameters
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Slug Preview</label>
              <div className="p-3 bg-charcoal-stone/5 border border-charcoal-stone/10 rounded-xl font-mono text-[10px] text-charcoal-stone/60 truncate">
                /destination/{getSlugPreview() || "slug-placeholder"}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Meta Title</label>
              <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Override browser tab title..."
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-stone/10 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/50" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Meta Description</label>
              <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Google search listing description..."
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-stone/10 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/50 resize-y" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono font-bold text-charcoal-stone/60 uppercase">Keywords</label>
              <input type="text" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)}
                placeholder="chhattisgarh, waterfall, bastar..."
                className="w-full px-3 py-2.5 rounded-xl border border-charcoal-stone/10 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-emerald/50" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-forest-emerald/5 border border-forest-emerald/10 flex items-start gap-2 text-xs leading-normal">
            <Info className="w-4 h-4 text-forest-emerald shrink-0 mt-0.5" />
            <p className="text-charcoal-stone/70">
              Draft data is also saved to your browser so you won't lose progress if you refresh.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
