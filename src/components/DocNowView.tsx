import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Star, 
  Video, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Filter, 
  ArrowRight, 
  HeartPulse, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Stethoscope, 
  Info,
  MapPin,
  Flame,
  UserCheck
} from 'lucide-react';
import { DocNowDoctor, DocNowAppointment, DocNowTriageResult } from '../types';
import { DOCNOW_DOCTORS, DOCNOW_SPECIALTIES, DOCNOW_QUICK_SYMPTOMS } from '../data/docNowData';
import { runDocNowSymptomTriage } from '../utils/docNowAi';
import { DocNowBookingModal } from './DocNowBookingModal';

interface DocNowViewProps {
  onSelectAppointmentTab: () => void;
  onAppointmentBooked: (newAppt: DocNowAppointment) => void;
  activeAppointmentsCount: number;
  onNavigateToCounter?: () => void;
  onNavigateToPrescriber?: () => void;
}

export const DocNowView: React.FC<DocNowViewProps> = ({
  onSelectAppointmentTab,
  onAppointmentBooked,
  activeAppointmentsCount,
  onNavigateToCounter,
  onNavigateToPrescriber,
}) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [filterTodayOnly, setFilterTodayOnly] = useState(false);
  const [filterVideoOnly, setFilterVideoOnly] = useState(false);
  const [filterTopRated, setFilterTopRated] = useState(false);

  // AI Triage state
  const [activeTriageQuery, setActiveTriageQuery] = useState<string | null>(null);
  const [triageResult, setTriageResult] = useState<DocNowTriageResult | null>(null);
  const [isAnalyzingSymptom, setIsAnalyzingSymptom] = useState(false);

  // Booking Modal State
  const [bookingDoctor, setBookingDoctor] = useState<DocNowDoctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [symptomForBooking, setSymptomForBooking] = useState('');

  // Run AI Triage on a symptom chip or custom input
  const handleTriggerTriage = (symptomQuery: string) => {
    setActiveTriageQuery(symptomQuery);
    setIsAnalyzingSymptom(true);
    setTimeout(() => {
      const result = runDocNowSymptomTriage(symptomQuery);
      setTriageResult(result);
      setIsAnalyzingSymptom(false);
    }, 450);
  };

  const handleApplyMatchedSpecialty = (specialty: string) => {
    const matched = DOCNOW_SPECIALTIES.find(s => 
      s.name.toLowerCase().includes(specialty.toLowerCase()) || 
      specialty.toLowerCase().includes(s.id)
    );
    if (matched) {
      setSelectedSpecialty(matched.id);
    } else {
      setSearchQuery(specialty);
    }
    // Scroll smoothly to doctor results
    const el = document.getElementById('docnow-doctors-list');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Filter doctors based on current criteria
  const filteredDoctors = useMemo(() => {
    return DOCNOW_DOCTORS.filter(doc => {
      // Specialty filter
      if (selectedSpecialty !== 'all') {
        const specObj = DOCNOW_SPECIALTIES.find(s => s.id === selectedSpecialty);
        if (specObj && !doc.specialty.toLowerCase().includes(specObj.name.toLowerCase().replace('specialties', ''))) {
          // Check if sub-specialty or general matching
          if (!doc.subSpecialty?.toLowerCase().includes(specObj.name.toLowerCase())) {
            return false;
          }
        }
      }

      // Search query (doctor name, specialty, hospital, or city)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesSpecialty = doc.specialty.toLowerCase().includes(q);
        const matchesHospital = doc.hospital.toLowerCase().includes(q);
        const matchesCity = doc.city.toLowerCase().includes(q);
        if (!matchesName && !matchesSpecialty && !matchesHospital && !matchesCity) {
          return false;
        }
      }

      // Quick filter: Today only
      if (filterTodayOnly && !doc.availableToday) {
        return false;
      }

      // Quick filter: Video only
      if (filterVideoOnly && !doc.consultationModes.includes('Video')) {
        return false;
      }

      // Quick filter: Top Rated (4.9+)
      if (filterTopRated && doc.rating < 4.93) {
        return false;
      }

      return true;
    });
  }, [selectedSpecialty, searchQuery, filterTodayOnly, filterVideoOnly, filterTopRated]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-7">
      
      {/* DocNow Hero & Patient Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#245741] to-[#123124] text-white p-6 sm:p-8 shadow-xl border border-[#2D6A4F]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#B5D99B] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>DocNow &bull; AI-Powered Doctor Booking</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-extrabold tracking-tight leading-tight">
              Hello, Welcome to DocNow 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Check symptoms with clinical AI, discover accredited Nigerian specialists, and book instant virtual consultations or in-clinic visits.
            </p>
          </div>

          {/* Quick Active Consultations Pill */}
          {activeAppointmentsCount > 0 && (
            <button
              onClick={onSelectAppointmentTab}
              className="self-start md:self-auto px-4 py-2.5 rounded-2xl bg-[#B5D99B] hover:bg-[#a6cf8a] text-[#1B4332] font-heading font-bold text-xs flex items-center gap-2 shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              <Video className="w-4 h-4 text-[#1B4332]" />
              <span>{activeAppointmentsCount} Active Consultation{activeAppointmentsCount > 1 ? 's' : ''}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Bar Embedded in Hero */}
        <div className="relative z-10 mt-6 max-w-2xl">
          <div className="relative flex items-center bg-white rounded-2xl shadow-lg p-1.5 border border-emerald-100">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, symptoms, clinics or specialties..."
              className="w-full px-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (searchQuery.trim()) {
                  handleTriggerTriage(searchQuery);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#133225] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B5D99B]" />
              <span className="hidden sm:inline">AI Triage</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Background Shapes */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#B5D99B]/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
      </div>

      {/* DocNow AI Symptom Triage Section */}
      <div className="rounded-3xl bg-white p-5 sm:p-6 border border-emerald-100/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F4F9F1] border border-[#B5D99B] flex items-center justify-center text-emerald-800">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                DocNow AI Symptom Checker & Triage
              </h2>
              <p className="text-[11px] text-slate-500">
                Tap a common symptom below or type above to receive clinical guidance and doctor matching.
              </p>
            </div>
          </div>

          {triageResult && (
            <button
              onClick={() => {
                setTriageResult(null);
                setActiveTriageQuery(null);
              }}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:underline"
            >
              Reset Assessment
            </button>
          )}
        </div>

        {/* Symptom Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DOCNOW_QUICK_SYMPTOMS.map((symp) => {
            const isActive = activeTriageQuery === symp.query;
            return (
              <button
                key={symp.id}
                onClick={() => handleTriggerTriage(symp.query)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border shrink-0 ${
                  isActive
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                    : 'bg-[#F7FAF6] text-slate-700 border-slate-200/80 hover:border-[#B5D99B] hover:bg-[#F0F7ED]'
                }`}
              >
                <span>{symp.label}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isAnalyzingSymptom && (
          <div className="p-4 rounded-2xl bg-[#F7FAF6] border border-emerald-100 flex items-center justify-center gap-2 text-xs text-emerald-800 animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
            <span className="font-semibold">DocNow Clinical AI is analyzing symptom presentation...</span>
          </div>
        )}

        {/* Render AI Triage Result Panel */}
        {triageResult && !isAnalyzingSymptom && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#F4F9F1] via-[#F8FAF7] to-white border border-[#B5D99B] space-y-4 animate-fadeIn">
            
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Analyzed Symptom
                </span>
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  "{triageResult.symptomQuery}"
                </h4>
              </div>

              {/* Urgency Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                triageResult.urgencyLevel === 'Urgent'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : triageResult.urgencyLevel === 'Moderate'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {triageResult.urgencyLevel === 'Urgent' ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <Activity className="w-3.5 h-3.5 text-amber-600" />
                )}
                <span>{triageResult.urgencyLevel} Priority Triage</span>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {triageResult.clinicalSummary}
            </p>

            {/* Potential Causes and Care Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Differential Indications
                </span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {triageResult.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Immediate Home Comfort Tips
                </span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {triageResult.homeCareTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Matched Specialist Callout */}
            <div className="p-4 rounded-xl bg-[#1B4332] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#B5D99B] tracking-wider">
                  DocNow Recommended Specialist
                </span>
                <h5 className="font-heading font-extrabold text-sm sm:text-base">
                  {triageResult.recommendedSpecialty} Specialists
                </h5>
                <p className="text-[11px] text-emerald-100">
                  {triageResult.matchedDoctorIds.length} verified doctors ready for instant consultation.
                </p>
              </div>

              <button
                onClick={() => handleApplyMatchedSpecialty(triageResult.recommendedSpecialty)}
                className="px-4 py-2 rounded-xl bg-[#B5D99B] hover:bg-[#a6cf8a] text-[#1B4332] font-heading font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                <span>Filter Matched Doctors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Specialty Filter Category Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-bold text-base text-slate-900">
            Find Doctors by Specialty
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {filteredDoctors.length} available
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {DOCNOW_SPECIALTIES.map((spec) => {
            const isSelected = selectedSpecialty === spec.id;
            return (
              <button
                key={spec.id}
                onClick={() => setSelectedSpecialty(spec.id)}
                className={`py-2 px-3.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                  isSelected
                    ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-200 hover:bg-[#F7FAF6]'
                }`}
              >
                <span>{spec.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Filter Toggles Row */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200/80">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filter:
          </span>

          <button
            onClick={() => setFilterTodayOnly(!filterTodayOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterTodayOnly
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ⚡ Available Today
          </button>

          <button
            onClick={() => setFilterVideoOnly(!filterVideoOnly)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterVideoOnly
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            🎥 Video Consult
          </button>

          <button
            onClick={() => setFilterTopRated(!filterTopRated)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filterTopRated
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            ★ 4.9+ Top Rated
          </button>
        </div>

        {(filterTodayOnly || filterVideoOnly || filterTopRated || selectedSpecialty !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setFilterTodayOnly(false);
              setFilterVideoOnly(false);
              setFilterTopRated(false);
              setSelectedSpecialty('all');
              setSearchQuery('');
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Doctors Discovery Cards Grid */}
      <div id="docnow-doctors-list" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-extrabold text-lg text-slate-900">
            Top Accredited Doctors & Specialists
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredDoctors.length} doctors
          </span>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Stethoscope className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-heading font-bold text-base text-slate-800">
              No doctors match your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or resetting filters to view all available medical specialists.
            </p>
            <button
              onClick={() => {
                setSelectedSpecialty('all');
                setSearchQuery('');
                setFilterTodayOnly(false);
                setFilterVideoOnly(false);
                setFilterTopRated(false);
              }}
              className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#133225] transition-colors"
            >
              Show All Doctors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              return (
                <div
                  key={doc.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-[#B5D99B] hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                >
                  {/* Top Doctor Row */}
                  <div className="flex items-start gap-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.name}
                        className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                      />
                      {doc.availableToday && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Online & Available Today" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900 leading-tight">
                          {doc.name}
                        </h3>
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          MDCN
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                        {doc.specialty}
                      </p>

                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </p>

                      <div className="flex items-center gap-2.5 mt-2 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-amber-600">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {doc.rating}
                          <span className="text-slate-400 font-normal">({doc.reviewCount})</span>
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-600 font-medium">
                          {doc.experienceYears}y exp
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <span className="text-slate-600 font-medium">
                          {doc.patientCount}+ patients
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Bio Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {doc.bio}
                  </p>

                  {/* Modes & Next Slot Pill */}
                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-medium text-slate-700">Next Slot:</span>
                      <span className="font-semibold text-emerald-800">{doc.nextAvailableSlot}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {doc.consultationModes.map((m) => (
                        <span key={m} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium">
                          {m === 'Video' ? '🎥 Video' : m === 'Audio' ? '📞 Audio' : '🏥 Clinic'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Consultation Fee</span>
                      <span className="font-heading font-extrabold text-base text-slate-900">
                        ₦{doc.consultationFee.toLocaleString()}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setBookingDoctor(doc);
                        setSymptomForBooking(activeTriageQuery || '');
                        setIsBookingOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#133225] text-white font-heading font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#B5D99B]" />
                      <span>Book Appointment</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Booking Modal */}
      <DocNowBookingModal
        doctor={bookingDoctor}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        prefilledSymptoms={symptomForBooking}
        onConfirmBooking={(appointment) => {
          onAppointmentBooked(appointment);
        }}
      />

    </div>
  );
};
