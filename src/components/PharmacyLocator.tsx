import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  ShieldCheck, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Building2, 
  Compass, 
  ExternalLink, 
  Info,
  ChevronRight,
  Filter,
  X,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  LocateFixed,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MockPharmacy } from '../types';

interface PharmacyLocatorProps {
  pharmacies: MockPharmacy[];
  currentPharmacy: MockPharmacy;
  onSelectPharmacyForDispense: (pharmacy: MockPharmacy) => void;
  onNavigateToCounter: (pharmacyId?: string) => void;
  initialSelectedPharmacyId?: string;
}

// Exact Haversine formula for spherical distance in kilometers
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

const NIGERIAN_CITY_PRESETS = [
  { name: 'Lagos (Ikeja)', lat: 6.6018, lng: 3.3515 },
  { name: 'Lagos (Island / VI)', lat: 6.4281, lng: 3.4219 },
  { name: 'Abuja (FCT Central)', lat: 9.0579, lng: 7.4951 },
  { name: 'Ibadan (Oyo)', lat: 7.3775, lng: 3.8722 },
  { name: 'Port Harcourt (Rivers)', lat: 4.8156, lng: 7.0498 },
];

export const PharmacyLocator: React.FC<PharmacyLocatorProps> = ({
  pharmacies,
  currentPharmacy,
  onSelectPharmacyForDispense,
  onNavigateToCounter,
  initialSelectedPharmacyId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRadius, setSelectedRadius] = useState<number>(25); // in km
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN_NOW' | 'OPEN_24_7'>('ALL');
  const [selectedPharmacy, setSelectedPharmacy] = useState<MockPharmacy | null>(null);
  const [detailsModalPharmacy, setDetailsModalPharmacy] = useState<MockPharmacy | null>(null);

  // User Geolocation State
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompt' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('prompt');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 6.5244, lng: 3.3792 }); // Default Nigeria center

  // Google Maps instances
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsLoadError, setMapsLoadError] = useState<string | null>(null);

  // Request real device geolocation
  const requestDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setLocationErrorMsg('Geolocation is not supported by your current browser.');
      return;
    }

    setLocationStatus('requesting');
    setLocationErrorMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setMapCenter(coords);
        setLocationStatus('granted');

        if (googleMapRef.current) {
          googleMapRef.current.panTo(coords);
          googleMapRef.current.setZoom(13);
        }
      },
      (error) => {
        console.warn('Geolocation access error:', error);
        setLocationStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationErrorMsg('Location access permission was denied. You can search by area or pick a preset city below.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationErrorMsg('Location information is currently unavailable from your device.');
        } else {
          setLocationErrorMsg('Timed out retrieving device location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Attempt initial device location on mount
  useEffect(() => {
    requestDeviceLocation();
  }, []);

  // Filter ONLY VERIFIED pharmacies as per strict regulatory requirement
  const verifiedPharmacies = useMemo(() => {
    return pharmacies.filter(p => p.verificationStatus === 'VERIFIED');
  }, [pharmacies]);

  // Calculate actual distances from user's current location to each verified pharmacy
  const pharmaciesWithDistances = useMemo(() => {
    return verifiedPharmacies.map(pharm => {
      let distanceKm = pharm.distanceKm ?? 0;
      if (userLocation) {
        distanceKm = calculateHaversineDistanceKm(
          userLocation.lat,
          userLocation.lng,
          pharm.lat,
          pharm.lng
        );
      }
      return {
        ...pharm,
        distanceKm,
      };
    });
  }, [verifiedPharmacies, userLocation]);

  // Filter & sort by distance
  const filteredPharmacies = useMemo(() => {
    return pharmaciesWithDistances
      .filter(pharm => {
        // Query match
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery = !q || (
          pharm.name.toLowerCase().includes(q) ||
          pharm.address.toLowerCase().includes(q) ||
          pharm.city.toLowerCase().includes(q) ||
          pharm.state.toLowerCase().includes(q) ||
          (pharm.supervisingPharmacist && pharm.supervisingPharmacist.toLowerCase().includes(q))
        );

        // Radius filter
        const matchesRadius = selectedRadius === 0 || pharm.distanceKm <= selectedRadius;

        // Status filter
        const matchesStatus = 
          statusFilter === 'ALL' ||
          (statusFilter === 'OPEN_24_7' && pharm.operatingStatus === 'OPEN_24_7') ||
          (statusFilter === 'OPEN_NOW' && (pharm.operatingStatus === 'OPEN' || pharm.operatingStatus === 'OPEN_24_7'));

        return matchesQuery && matchesRadius && matchesStatus;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [pharmaciesWithDistances, searchQuery, selectedRadius, statusFilter]);

  // Set initial selected pharmacy
  useEffect(() => {
    if (initialSelectedPharmacyId) {
      const found = verifiedPharmacies.find(p => p.id === initialSelectedPharmacyId);
      if (found) setSelectedPharmacy(found);
    } else if (filteredPharmacies.length > 0 && !selectedPharmacy) {
      setSelectedPharmacy(filteredPharmacies[0]);
    }
  }, [initialSelectedPharmacyId, filteredPharmacies, verifiedPharmacies]);

  // Initialize Google Maps Platform
  useEffect(() => {
    let isMounted = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBN_RAQQtCamxNzZTlK66mCp9zh6an9DSE';

    try {
      setOptions({
        key: apiKey,
        v: 'weekly',
      });

      Promise.all([
        importLibrary('maps'),
        importLibrary('marker'),
      ]).then(([mapsLib]) => {
        if (!isMounted || !mapContainerRef.current) return;

        const initialCenter = userLocation || mapCenter;

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: userLocation ? 13 : 11,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
          styles: [
            {
              featureType: 'poi.medical',
              elementType: 'geometry',
              stylers: [{ color: '#e8f5e9' }],
            },
            {
              featureType: 'poi.medical',
              elementType: 'labels.icon',
              stylers: [{ visibility: 'on' }],
            },
          ],
        });

        googleMapRef.current = map;
        infoWindowRef.current = new mapsLib.InfoWindow();
        setMapsLoaded(true);
      }).catch((err) => {
        if (!isMounted) return;
        console.error('Failed to load Google Maps SDK:', err);
        setMapsLoadError('Failed to load Google Maps Platform. Please verify internet connectivity.');
      });
    } catch (err) {
      if (!isMounted) return;
      console.error('Google Maps initialization error:', err);
      setMapsLoadError('Failed to initialize Google Maps Platform.');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Update User Location Marker on Google Maps
  useEffect(() => {
    if (!googleMapRef.current || !mapsLoaded) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
      userMarkerRef.current = null;
    }

    if (userLocation) {
      // Create distinctive "Your Location" marker with pulsating design
      const userMarker = new google.maps.Marker({
        position: userLocation,
        map: googleMapRef.current,
        title: 'Your Current Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#2563EB',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3,
        },
        zIndex: 9999,
      });

      const userLabel = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; padding: 4px 8px; text-align: center;">
            <div style="font-weight: bold; color: #1e3a8a; font-size: 12px;">📍 Your Location</div>
            <div style="font-size: 10px; color: #64748b;">GPS coordinates verified</div>
          </div>
        `,
      });

      userMarker.addListener('click', () => {
        userLabel.open(googleMapRef.current, userMarker);
      });

      userMarkerRef.current = userMarker;
    }
  }, [userLocation, mapsLoaded]);

  // Render Markers for VERIFIED pharmacies on Google Map
  useEffect(() => {
    if (!googleMapRef.current || !mapsLoaded) return;

    // Clear existing pharmacy markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    if (userLocation) {
      bounds.extend(userLocation);
      hasPoints = true;
    }

    filteredPharmacies.forEach((pharm) => {
      const position = { lat: pharm.lat, lng: pharm.lng };
      bounds.extend(position);
      hasPoints = true;

      // Custom Green Shield Marker for verified pharmacies
      const marker = new google.maps.Marker({
        position,
        map: googleMapRef.current,
        title: `${pharm.name} (PCN Verified)`,
        icon: {
          path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 Z',
          fillColor: '#1B4332',
          fillOpacity: 1,
          strokeColor: '#B5D99B',
          strokeWeight: 2,
          scale: 1,
        },
      });

      marker.addListener('click', () => {
        setSelectedPharmacy(pharm);

        if (infoWindowRef.current && googleMapRef.current) {
          const contentString = `
            <div style="font-family: sans-serif; max-width: 250px; padding: 6px 2px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <span style="background: #1B4332; color: #B5D99B; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 9999px;">
                  ✓ PCN VERIFIED
                </span>
                <span style="font-size: 11px; font-weight: bold; color: #166534;">
                  ${pharm.distanceKm} km away
                </span>
              </div>
              <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #0f172a;">${pharm.name}</h4>
              <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; line-height: 1.3;">${pharm.address}</p>
              <div style="font-size: 10px; color: #334155; margin-bottom: 6px;">
                <strong>Premises:</strong> ${pharm.pcnPremisesNumber || pharm.pcn}
              </div>
              <div style="display: flex; gap: 6px; margin-top: 6px;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${pharm.lat},${pharm.lng}" target="_blank" rel="noopener noreferrer" style="background: #1B4332; color: white; text-decoration: none; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;">
                  Get Directions ↗
                </a>
              </div>
            </div>
          `;
          infoWindowRef.current.setContent(contentString);
          infoWindowRef.current.open(googleMapRef.current, marker);
        }
      });

      markersRef.current.push(marker);
    });

    if (hasPoints && filteredPharmacies.length > 0 && googleMapRef.current) {
      if (filteredPharmacies.length === 1 && !userLocation) {
        googleMapRef.current.setCenter({ lat: filteredPharmacies[0].lat, lng: filteredPharmacies[0].lng });
        googleMapRef.current.setZoom(14);
      } else {
        googleMapRef.current.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
      }
    }
  }, [filteredPharmacies, userLocation, mapsLoaded]);

  // Center map on specific pharmacy
  const handleFocusPharmacyOnMap = (pharm: MockPharmacy) => {
    setSelectedPharmacy(pharm);
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: pharm.lat, lng: pharm.lng });
      googleMapRef.current.setZoom(15);
    }
  };

  // Center map on city preset
  const handleSelectCityPreset = (city: typeof NIGERIAN_CITY_PRESETS[0]) => {
    setMapCenter({ lat: city.lat, lng: city.lng });
    if (googleMapRef.current) {
      googleMapRef.current.panTo({ lat: city.lat, lng: city.lng });
      googleMapRef.current.setZoom(12);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5">
      {/* Header Banner */}
      <div className="bg-[#1B4332] text-white rounded-3xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#B5D99B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#B5D99B]/20 text-[#B5D99B] text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Pharmacy Locator &bull; Google Maps Platform
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold text-white tracking-tight">
              Locate Verified Controlled-Drug Pharmacies
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              Find PCN-accredited community pharmacies with authorized narcotics vaults. All displayed facilities are actively licensed and compliant with Nigerian national anti-diversion protocols.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              type="button"
              onClick={requestDeviceLocation}
              className="px-4 py-2 bg-[#B5D99B] hover:bg-[#a3cc85] text-[#1B4332] font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <LocateFixed className="w-4 h-4" />
              <span>{locationStatus === 'requesting' ? 'Locating...' : 'Use My Exact Location'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Notice Banner */}
      {locationStatus === 'denied' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Device Geolocation Disabled: </span>
              <span>{locationErrorMsg}</span>
              <span className="block text-[11px] text-amber-700 mt-0.5">
                Tip: Select a preset city below or search your local street name to locate verified dispensers.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            {NIGERIAN_CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleSelectCityPreset(city)}
                className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg text-[11px] font-semibold text-amber-900 transition-colors cursor-pointer"
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {locationStatus === 'granted' && userLocation && (
        <div className="bg-[#EBF7E5] border border-emerald-200 rounded-2xl px-4 py-2.5 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold">Real Device Geolocation Active:</span>
            <span>Distances calculated from your coordinates ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})</span>
          </div>
          <button
            type="button"
            onClick={requestDeviceLocation}
            className="text-[11px] font-bold text-[#1B4332] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Refresh GPS
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-emerald-100 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search verified pharmacies by name, street, area, or city (e.g. Allen Avenue, Ikeja, VI, Abuja)..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#F7FAF6] border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Operating Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="py-2.5 px-3 bg-[#F7FAF6] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value="ALL">All Operating Hours</option>
              <option value="OPEN_NOW">Open Now</option>
              <option value="OPEN_24_7">Open 24/7 (Emergency)</option>
            </select>

            {/* Radius Filter */}
            <select
              value={selectedRadius}
              onChange={(e) => setSelectedRadius(Number(e.target.value))}
              className="py-2.5 px-3 bg-[#F7FAF6] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1B4332]"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={0}>Any Distance</option>
            </select>
          </div>
        </div>

        {/* City Presets Quick Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-slate-400 font-medium text-[11px] shrink-0">Quick Regions:</span>
          {NIGERIAN_CITY_PRESETS.map((city) => (
            <button
              key={city.name}
              type="button"
              onClick={() => handleSelectCityPreset(city)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#1B4332] text-slate-600 text-[11px] font-medium shrink-0 transition-colors cursor-pointer"
            >
              {city.name}
            </button>
          ))}
          <span className="ml-auto text-slate-400 text-[11px] shrink-0">
            Showing <strong className="text-slate-700">{filteredPharmacies.length}</strong> PCN Verified Pharmacies
          </span>
        </div>
      </div>

      {/* Main Map & Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Verified Pharmacy Directory List */}
        <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
          {filteredPharmacies.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">No Verified Pharmacies Found</h3>
              <p className="text-slate-500 text-xs max-w-xs mx-auto">
                No accredited pharmacies match your current filters. Try expanding the radius or clearing the search.
              </p>
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setSelectedRadius(0); setStatusFilter('ALL'); }}
                className="px-3.5 py-1.5 bg-[#1B4332] text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredPharmacies.map((pharm) => {
              const isSelected = selectedPharmacy?.id === pharm.id;
              return (
                <div
                  key={pharm.id}
                  onClick={() => handleFocusPharmacyOnMap(pharm)}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-[#1B4332] ring-2 ring-[#1B4332]/20 bg-[#FBFDFB]'
                      : 'border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF7E5] text-[#1B4332] text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PCN VERIFIED
                        </span>
                        {pharm.operatingStatus === 'OPEN_24_7' ? (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                            24/7 EMERGENCY
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            OPEN NOW
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                        {pharm.name}
                      </h3>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{pharm.address}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-[#1B4332] bg-[#EBF7E5] px-2.5 py-1 rounded-xl">
                        {pharm.distanceKm} km
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {userLocation ? 'from you' : 'estimated'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{pharm.hoursText || 'Licensed Dispenser'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.lat},${pharm.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-slate-600" />
                        <span>Directions</span>
                      </a>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPharmacyForDispense(pharm);
                        }}
                        className="px-3 py-1 bg-[#1B4332] hover:bg-[#143427] text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                      >
                        <span>Select</span>
                        <ChevronRight className="w-3 h-3 text-[#B5D99B]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Interactive Google Map */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-emerald-100 p-2 shadow-xs overflow-hidden">
          <div className="relative w-full h-[580px] rounded-2xl overflow-hidden bg-slate-100">
            {/* Google Map Div */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Loading / Error Overlays */}
            {!mapsLoaded && !mapsLoadError && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <RefreshCw className="w-8 h-8 text-[#1B4332] animate-spin mb-3" />
                <h4 className="font-heading font-bold text-slate-900 text-sm">Loading Google Maps Platform...</h4>
                <p className="text-slate-500 text-xs mt-1">Initializing verified pharmacy geospatial markers</p>
              </div>
            )}

            {mapsLoadError && (
              <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center space-y-3">
                <AlertTriangle className="w-10 h-10 text-amber-500" />
                <h4 className="font-heading font-bold text-slate-900 text-sm">Google Maps Initialization</h4>
                <p className="text-slate-600 text-xs max-w-sm">{mapsLoadError}</p>
                <div className="text-[11px] text-slate-400">
                  Google Maps API Key: <code className="bg-slate-100 px-1 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code>
                </div>
              </div>
            )}

            {/* Selected Pharmacy Floating Card (Mobile / Desktop Map Overlay) */}
            {selectedPharmacy && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-emerald-100 z-10 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF7E5] text-[#1B4332] text-[9px] font-extrabold uppercase">
                        ✓ PCN ACCREDITED
                      </span>
                      <span className="text-emerald-700 font-bold text-xs">
                        {selectedPharmacy.distanceKm} km away
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug">
                      {selectedPharmacy.name}
                    </h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {selectedPharmacy.address}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedPharmacy(null)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-[#F7FAF6] rounded-xl p-2.5 text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Superintendent Pharmacist:</span>
                    <span className="font-semibold text-slate-900">{selectedPharmacy.supervisingPharmacist.split(',')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">PCN Premises Number:</span>
                    <span className="font-mono font-bold text-[#1B4332]">{selectedPharmacy.pcnPremisesNumber || selectedPharmacy.pcn}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPharmacy.lat},${selectedPharmacy.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5 text-slate-600" />
                    <span>Google Directions</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectPharmacyForDispense(selectedPharmacy)}
                    className="flex-1 py-2 bg-[#1B4332] hover:bg-[#143427] text-white text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <span>Dispense Here</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#B5D99B]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
