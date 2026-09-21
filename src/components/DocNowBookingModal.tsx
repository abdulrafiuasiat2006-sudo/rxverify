import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Phone, 
  Building2, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Star, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DocNowDoctor, DocNowAppointment, ConsultationMode } from '../types';

interface DocNowBookingModalProps {
  doctor: DocNowDoctor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (appointment: DocNowAppointment) => void;
  prefilledSymptoms?: string;
  initialPatientName?: string;
  initialPatientPhone?: string;
}

export const DocNowBookingModal: React.FC<DocNowBookingModalProps> = ({
  doctor,
  isOpen,
  onClose,
  onConfirmBooking,
  prefilledSymptoms = '',
  initialPatientName = 'Chijioke Nnamdi',
  initialPatientPhone = '+234 814 550 9182',
}) => {
  if (!isOpen || !doctor) return null;

  // Booking state
  const [mode, setMode] = useState<ConsultationMode>('Video');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string>(doctor.availableSlots[0] || '10:00 AM');
  const [patientName, setPatientName] = useState(initialPatientName);
  const [patientPhone, setPatientPhone] = useState(initialPatientPhone);
  const [patientAge, setPatientAge] = useState(32);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState(prefilledSymptoms || 'Experiencing persistent discomfort and would like a clinical consultation.');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<DocNowAppointment | null>(null);

  // Generate the next 6 days starting today
  const dates = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      dayOfWeek: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayNames[d.getDay()],
      dateNumber: d.getDate(),
      month: monthNames[d.getMonth()],
      iso: d.toISOString().split('T')[0],
    };
  });

  const currentFee = mode === 'Video' 
    ? doctor.consultationFee 
    : mode === 'Audio' 
      ? (doctor.audioFee || doctor.consultationFee * 0.7) 
      : (doctor.clinicFee || doctor.consultationFee * 1.8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const appointmentId = `DN-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAppointment: DocNowAppointment = {
      id: appointmentId,
      doctorId: doctor.id,
      doctorName: doctor.name,
      doctorSpecialty: doctor.specialty,
      doctorHospital: doctor.hospital,
      doctorAvatar: doctor.avatarUrl,
      doctorMdcn: doctor.mdcnNumber,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      date: dates[selectedDateIndex].dayOfWeek + ', ' + dates[selectedDateIndex].month + ' ' + dates[selectedDateIndex].dateNumber,
      timeSlot: selectedSlot,
      mode,
      fee: currentFee,
      status: 'CONFIRMED',
      symptoms,
      createdAt: new Date().toISOString(),
    };

    setCreatedAppointment(newAppointment);
    setIsSuccess(true);
    onConfirmBooking(newAppointment);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden my-6">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border-b border-emerald-100/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              DocNow Booking Portal
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
            
            {/* Doctor Profile Banner */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F4F9F1] border border-[#B5D99B]/50">
              <img
                src={doctor.avatarUrl}
                alt={doctor.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    {doctor.name}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    MDCN Verified
                  </span>
                </div>
                <p className="text-xs font-medium text-emerald-700 mt-0.5">
                  {doctor.specialty}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {doctor.hospital}
                </p>

                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1 font-medium text-amber-600">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {doctor.rating} ({doctor.reviewCount} reviews)
                  </span>
                  <span>&bull;</span>
                  <span>{doctor.experienceYears}+ years exp</span>
                </div>
              </div>
            </div>

            {/* Step 1: Consultation Mode Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Select Consultation Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'Video' as ConsultationMode,
                    title: 'Video Call',
                    icon: Video,
                    fee: doctor.consultationFee,
                    subtitle: 'HD Video + Digital Rx',
                  },
                  {
                    id: 'Audio' as ConsultationMode,
                    title: 'Audio Call',
                    icon: Phone,
                    fee: doctor.audioFee || doctor.consultationFee * 0.7,
                    subtitle: 'Direct phone consult',
                  },
                  {
                    id: 'In-Clinic' as ConsultationMode,
                    title: 'In-Clinic',
                    icon: Building2,
                    fee: doctor.clinicFee || doctor.consultationFee * 1.8,
                    subtitle: 'Physical exam',
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-[#B5D99B] bg-[#F4F9F1] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-[#B5D99B] text-emerald-900' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </div>
                      <div className="font-heading font-bold text-xs text-slate-900 leading-tight">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {item.subtitle}
                      </div>
                      <div className="text-xs font-semibold text-emerald-700 mt-1.5">
                        ₦{item.fee.toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date Picker (Horizontal Scroll) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Select Date
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  {dates[selectedDateIndex].month} 2026
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                {dates.map((d, index) => {
                  const isSelected = selectedDateIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDateIndex(index)}
                      className={`min-w-[70px] py-2.5 px-2 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#1B4332] text-white border-[#1B4332] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span className={`text-[10px] uppercase font-semibold ${isSelected ? 'text-[#B5D99B]' : 'text-slate-400'}`}>
                        {d.dayOfWeek}
                      </span>
                      <span className="text-base font-heading font-extrabold my-0.5">
                        {d.dateNumber}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Available Time Slots */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  3. Select Time Slot
                </label>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {doctor.availableSlots.length} slots available
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {doctor.availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#B5D99B] text-[#1B4332] border-[#8CB96F] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-200'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Patient Details */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                4. Patient Details & Primary Symptoms
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Patient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                    placeholder="e.g. Chijioke Nnamdi"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Phone Number (WhatsApp / Calls)
                  </label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Primary Symptoms / Reason for Visit
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your symptoms, how long you've felt this way..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* Price Breakdown and CTA */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Consultation Fee</span>
                <span className="font-heading font-extrabold text-lg text-slate-900">
                  ₦{currentFee.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium ml-1.5">
                  &bull; Paystack Verified
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#133225] text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B5D99B]" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </div>

          </form>
        ) : (
          /* Booking Confirmation Screen */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF7E5] text-[#1B4332] flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F9F1] border border-[#B5D99B] text-emerald-900 text-xs font-semibold mb-2">
                <span>Appointment Confirmed</span> &bull; <span>Ref: {createdAppointment?.id}</span>
              </div>
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                You're Scheduled with {doctor.name}!
              </h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1">
                Your consultation details have been sent to <strong>{patientPhone}</strong>. You can join the virtual consultation room when your slot arrives.
              </p>
            </div>

            {/* Pass Ticket Card */}
            <div className="p-4 rounded-2xl bg-[#F7FAF6] border border-slate-200 text-left space-y-2.5 max-w-md mx-auto">
              <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Mode</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  {mode === 'Video' ? <Video className="w-3.5 h-3.5 text-emerald-600" /> : <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                  {mode} Consultation
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Date & Time</span>
                <span className="font-bold text-slate-900">
                  {createdAppointment?.date} at {createdAppointment?.timeSlot}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-200/80 pb-2">
                <span className="text-slate-500">Patient</span>
                <span className="font-bold text-slate-900">{patientName} ({patientGender}, {patientAge}y)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Doctor License</span>
                <span className="font-semibold text-emerald-700">{doctor.mdcnNumber}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1B4332] text-white font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#133225] transition-colors"
              >
                <span>View My Consultations</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#B5D99B]" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
