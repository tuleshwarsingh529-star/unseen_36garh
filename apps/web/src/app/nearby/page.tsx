"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Navigation2, 
  Search, 
  Compass, 
  Trees, 
  Map, 
  Loader2,
  AlertTriangle
} from "lucide-react";

interface Place {
  id: string;
  name: string;
  slug: string;
  district: string;
  block?: string;
  heroImage: string;
  description: string;
  distance_km: number;
}

export default function NearbyPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");

  const districts = ["Bastar", "Raipur", "Surguja", "Bilaspur", "Durg"];
  const blocks = ["Central", "North", "South", "East", "West"]; // Mock blocks for UI

  const getUserLocation = () => {
    setIsLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      () => {
        setError("Unable to retrieve your location. Please ensure location services are enabled.");
        setIsLoading(false);
      }
    );
  };

  const fetchNearbyPlaces = async () => {
    if (!location) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        lat: location.lat.toString(),
        lng: location.lng.toString(),
        radiusKm: "500", // Wide radius, sorted by distance
      });
      
      if (selectedDistrict) params.append("district", selectedDistrict);
      if (selectedBlock) params.append("block", selectedBlock);

      const res = await fetch(`http://localhost:4000/api/v1/places/nearby?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch nearby places");
      
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      setError("Failed to load nearby places. Ensure the backend server is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) {
      fetchNearbyPlaces();
    }
  }, [location, selectedDistrict, selectedBlock]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-charcoal-stone flex-1 flex flex-col gap-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-charcoal-stone/10 pb-6">
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-forest-emerald/30 bg-forest-emerald/5 text-xs font-mono font-bold text-forest-emerald w-fit uppercase">
            <Compass className="w-3.5 h-3.5" />
            Location Intelligence
          </span>
          <h1 className="text-3xl sm:text-5xl font-sans font-bold tracking-tight text-forest-emerald">
            Nearby Destinations
          </h1>
          <p className="text-sm text-charcoal-stone/60 max-w-xl leading-relaxed">
            Discover breathtaking places sorted by travel distance right from where you are standing. Apply district and block filters to narrow down your local exploration.
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-xl border border-white/60 flex flex-col lg:flex-row gap-6 items-end">
        
        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">District Filter</label>
            <select 
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-forest-emerald/50"
            >
              <option value="">All Districts</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-mono font-bold text-tribal-terracotta uppercase">Block Filter</label>
            <select 
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-charcoal-stone/10 bg-white/50 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-forest-emerald/50"
            >
              <option value="">All Blocks</option>
              {blocks.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={getUserLocation}
          className="w-full lg:w-auto px-8 py-3.5 rounded-xl bg-forest-emerald hover:bg-tribal-terracotta text-white font-bold text-sm font-sans tracking-wide shadow-lg shadow-forest-emerald/20 transition-all duration-300 inline-flex justify-center items-center gap-2 shrink-0"
        >
          {isLoading && !location ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation2 className="w-4 h-4" />}
          Locate Me & Find Places
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Results Grid */}
      {!location && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed border-charcoal-stone/10 rounded-3xl bg-white/30">
          <Map className="w-12 h-12 text-charcoal-stone/20" />
          <p className="text-charcoal-stone/50 text-sm">Click "Locate Me" to allow GPS access and discover places near you.</p>
        </div>
      )}

      {isLoading && location && places.length === 0 && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-forest-emerald animate-spin" />
        </div>
      )}

      {location && !isLoading && places.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed border-charcoal-stone/10 rounded-3xl bg-white/30">
          <Trees className="w-12 h-12 text-charcoal-stone/20" />
          <p className="text-charcoal-stone/50 text-sm">No places found matching your local criteria.</p>
        </div>
      )}

      {places.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((place, index) => (
            <Link key={place.id} href={`/destination/${place.slug}`} className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-charcoal-stone/5 flex flex-col h-full">
              
              {/* Image Header */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={place.heroImage} 
                  alt={place.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1542224566-6e85f2e10715?q=80&w=1000&auto=format&fit=crop"; }}
                />
                
                {/* Distance Badge */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                  <Navigation2 className="w-3.5 h-3.5 text-tribal-terracotta" />
                  <span className="font-mono font-bold text-xs text-forest-emerald">
                    {place.distance_km < 1 ? "Under 1 km" : `${place.distance_km.toFixed(1)} km`}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-1 gap-3">
                
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-river-blue/10 text-river-blue uppercase">
                    <MapPin className="w-3 h-3" />
                    {place.district} {place.block ? `• ${place.block}` : ''}
                  </span>
                </div>

                <h3 className="font-sans font-bold text-lg text-forest-emerald group-hover:text-tribal-terracotta transition-colors leading-tight">
                  {place.name}
                </h3>
                
                <p className="text-xs text-charcoal-stone/60 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>

              </div>
            </Link>
          ))}
        </div>
      )}

    </div>
  );
}
