import React, { useState } from 'react';
import { 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  FileText, 
  QrCode, 
  Download, 
  ExternalLink,
  ChevronRight,
  Share2,
  Stethoscope,
  Sparkles,
  Plus
} from 'lucide-react';
import { DocNowAppointment, Prescription } from '../types';

interface DocNowAppointmentsViewProps {
  appointments: DocNowAppointment[];
  onBookNewAppointment: () => void;
  onIssuePrescriptionFromAppointment: (appointmentId: string, prescription: Prescription) => void;
  onViewPrescriptionAtCounter?: (rxCode: string) => void;
}

export const DocNowAppointmentsView: React.FC<DocNowAppointmentsViewProps> = ({
  appointments,
  onBookNewAppointment,
  onIssuePrescriptionFromAppointment,
  onViewPrescriptionAtCounter,
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
  
  // Live Telehealth Room State
  const [inCallAppointment, setInCallAppointment] = useState<DocNowAppointment | null>(null);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'System', text: 'Secure encrypted clinical consultation initialized. Dr. has joined the room.', time: '14:30' },
    { sender: 'Doctor', text: 'Hello! I have reviewed your symptom intake notes. How is the discomfort progressing right now?', time: '14:31' },
  ]);
  const [newChatInput, setNewChatInput] = useState('');

  // Doctor in-call prescription modal state
  const [isWritingRx, setIsWritingRx] = useState(false);
  const [rxDrugName, setRxDrugName] = useState('Tramadol HCl');
  const [rxStrength, setRxStrength] = useState('50mg');
  const [rxDosage, setRxDosage] = useState('1 capsule orally every 8 hours as needed for severe breakthrough pain (max 3 days).');
  const [rxQuantity, setRxQuantity] = useState('10 capsules');
  const [issuedRxSuccess, setIssuedRxSuccess] = useState<Prescription | null>(null);

  // Timer simulation for active call
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (inCallAppointment) {
      interval = setInterval(() => {
        setCallDurationSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [inCallAppointment]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages(prev => [...prev, { sender: 'Patient', text: newChatInput, time: timeStr }]);
    setNewChatInput('');

    // Simulated doctor reply
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev, 
        { 
          sender: 'Doctor', 
          text: 'Understood. Based on clinical guidelines, I will formulate an electronic prescription for targeted relief. You can redeem it immediately at any accredited partner pharmacy.', 
          time: timeStr 
        }
      ]);
    }, 1500);
  };

  const handleIssueRxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inCallAppointment) return;

    const rxCode = `RX-DN-${Math.floor(1000 + Math.random() * 9000)}`;
    const issueDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(issueDate.getDate() + 3);

    const newRx: Prescription = {
      id: `rx-dn-${Date.now()}`,
      code: rxCode,
      patientName: inCallAppointment.patientName,
      patientPhone: inCallAppointment.patientPhone,
      patientAge: inCallAppointment.patientAge,
      patientGender: inCallAppointment.patientGender,
      drugName: rxDrugName,
      activeIngredient: rxDrugName.split(' ')[0],
      strength: rxStrength,
      dosageInstructions: rxDosage,
      quantity: rxQuantity,
      scheduleCategory: 'Schedule II (High Control)',
      clinicalIndication: inCallAppointment.symptoms || 'Severe acute pain / clinical presentation',
      doctorName: inCallAppointment.doctorName,
      doctorMDCN: inCallAppointment.doctorMdcn,
      doctorHospital: inCallAppointment.doctorHospital,
      doctorPhone: '+234 800 000 0000',
      issueDate: issueDate.toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: 'VALID_UNFILLED',
      maxRefills: 0,
      refillsRemaining: 0,
      qrPayload: `RX_VERIFY_NG|${rxCode}|${inCallAppointment.patientName}|${rxDrugName}|${inCallAppointment.doctorMdcn}|${issueDate.toISOString().split('T')[0]}`,
    };

    onIssuePrescriptionFromAppointment(inCallAppointment.id, newRx);
    setIssuedRxSuccess(newRx);
    setIsWritingRx(false);
  };

  const upcomingAppointments = appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF7E5] text-[#1B4332] text-xs font-semibold mb-1">
            <Video className="w-3 h-3 text-emerald-600" />
            <span>DocNow Telehealth Hub</span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900">
            My Consultations & Care History
          </h1>
          <p className="text-xs text-slate-500">
            Manage your booked doctor consultations, join live virtual rooms, and access issued e-prescriptions.
          </p>
        </div>

        <button
          onClick={onBookNewAppointment}
          className="px-4 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#133225] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[#B5D99B]" />
          <span>Book New Specialist</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'upcoming'
              ? 'text-[#1B4332]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Upcoming & Active ({upcomingAppointments.length})</span>
          {activeTab === 'upcoming' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332] rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
            activeTab === 'completed'
              ? 'text-[#1B4332]'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span>Completed Consultations ({completedAppointments.length})</span>
          {activeTab === 'completed' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1B4332] rounded-full" />
          )}
        </button>
      </div>

      {/* Active Consultations List */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-heading font-bold text-base text-slate-800">
                No upcoming consultations scheduled
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore our accredited medical specialists and schedule your consultation in a few simple taps.
              </p>
              <button
                onClick={onBookNewAppointment}
                className="px-4 py-2 rounded-xl bg-[#1B4332] text-white text-xs font-semibold hover:bg-[#133225] transition-colors"
              >
                Find a Doctor
              </button>
            </div>
          ) : (
            upcomingAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-[#B5D99B] transition-all space-y-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-start gap-3.5">
                    <img
                      src={appt.doctorAvatar}
                      alt={appt.doctorName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-heading font-bold text-base text-slate-900">
                          {appt.doctorName}
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-100">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          MDCN Verified
                        </span>
                      </div>
                      <p className="text-xs font-medium text-emerald-700">
                        {appt.doctorSpecialty}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {appt.doctorHospital}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Confirmed &bull; {appt.id}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-1 font-medium">
                      Fee Paid: ₦{appt.fee.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Date, Time, Mode Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#F8FAF7] border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Date</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      {appt.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Time Slot</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      {appt.timeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mode</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      {appt.mode === 'Video' ? <Video className="w-3.5 h-3.5 text-emerald-600" /> : <Phone className="w-3.5 h-3.5 text-emerald-600" />}
                      {appt.mode} Call
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Patient</span>
                    <span className="font-bold text-slate-900 truncate block mt-0.5">
                      {appt.patientName}
                    </span>
                  </div>
                </div>

                {/* Symptoms Description */}
                {appt.symptoms && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-700">Intake Reason: </strong>
                    <span>{appt.symptoms}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Telehealth room ready
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setInCallAppointment(appt)}
                      className="px-4 py-2 rounded-xl bg-[#1B4332] hover:bg-[#133225] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5 text-[#B5D99B]" />
                      <span>Join Virtual Room</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Completed Consultations List */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedAppointments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                You have no past completed consultations yet.
              </p>
            </div>
          ) : (
            completedAppointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900">
                      {appt.doctorName}
                    </h4>
                    <p className="text-xs text-slate-500">{appt.doctorSpecialty} &bull; {appt.date}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                    Completed
                  </span>
                </div>

                {appt.prescriptionIssued && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between flex-wrap gap-2 text-xs">
                    <div>
                      <span className="font-bold text-emerald-950 block">
                        Prescription Issued: {appt.prescriptionIssued.drugName} ({appt.prescriptionIssued.strength})
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Code: {appt.prescriptionIssued.code}
                      </span>
                    </div>
                    {onViewPrescriptionAtCounter && (
                      <button
                        onClick={() => onViewPrescriptionAtCounter(appt.prescriptionIssued!.code)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
                      >
                        Verify at Counter
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Interactive Live Telehealth Room Modal */}
      {inCallAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[90vh]">
            
            {/* Top Room Bar */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <div>
                  <h3 className="font-heading font-bold text-xs sm:text-sm flex items-center gap-2">
                    <span>{inCallAppointment.doctorName}</span>
                    <span className="text-slate-400 font-normal">&bull;</span>
                    <span className="text-[#B5D99B] font-mono">{formatTimer(callDurationSeconds)}</span>
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    MDCN Licensed Virtual Room &bull; End-to-End Encrypted Telehealth
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsWritingRx(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Issue E-Prescription</span>
                </button>
                <button
                  onClick={() => setInCallAppointment(null)}
                  className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors"
                >
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>Leave</span>
                </button>
              </div>
            </div>

            {/* Main Stage Grid: Video Feed + Chat / Clinical Notes */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden bg-slate-900">
              
              {/* Video Area (2 cols on large) */}
              <div className="lg:col-span-2 relative bg-slate-950 flex items-center justify-center p-4">
                {/* Doctor Feed Simulation */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
                  <img
                    src={inCallAppointment.doctorAvatar}
                    alt={inCallAppointment.doctorName}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Doctor Overlay Label */}
                  <div className="absolute bottom-4 left-4 text-white space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm">
                        {inCallAppointment.doctorName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-600/80 text-[10px] font-semibold">
                        Clinician
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {inCallAppointment.doctorHospital}
                    </p>
                  </div>

                  {/* Patient Self-View Picture-in-Picture */}
                  <div className="absolute top-4 right-4 w-28 sm:w-36 h-20 sm:h-24 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                    {isVideoOff ? (
                      <div className="text-center text-slate-400 text-[10px]">Camera Off</div>
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center text-slate-300">
                        <span className="text-xs font-bold">{inCallAppointment.patientName.split(' ')[0]}</span>
                        <span className="text-[10px] text-emerald-400">You (HD)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Media Controls Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700 shadow-xl">
                  <button
                    onClick={() => setIsMicMuted(!isMicMuted)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isMicMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isMicMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isVideoOff ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                    title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
                  >
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => setInCallAppointment(null)}
                    className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors"
                    title="End Call"
                  >
                    <PhoneOff className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat & Clinical Intake Drawer */}
              <div className="bg-slate-900 border-l border-slate-800 flex flex-col h-full">
                
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Clinical Chat & Notes
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Active</span>
                </div>

                {/* Messages Box */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-2xl ${
                        msg.sender === 'Patient'
                          ? 'bg-emerald-950/60 text-emerald-100 border border-emerald-800/60 ml-4'
                          : msg.sender === 'Doctor'
                            ? 'bg-slate-800 text-slate-200 border border-slate-700 mr-4'
                            : 'bg-slate-800/40 text-slate-400 text-[10px] text-center border border-slate-800'
                      }`}
                    >
                      {msg.sender !== 'System' && (
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold text-emerald-400">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}

                  {/* Prescription notification bubble if issued */}
                  {issuedRxSuccess && (
                    <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-500 text-emerald-100 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Prescription Generated!</span>
                      </div>
                      <p className="text-[11px]">
                        <strong>{issuedRxSuccess.drugName} ({issuedRxSuccess.strength})</strong> has been registered with code <code className="bg-black/40 px-1 py-0.5 rounded text-emerald-300 font-mono">{issuedRxSuccess.code}</code>.
                      </p>
                      <button
                        onClick={() => {
                          setInCallAppointment(null);
                          if (onViewPrescriptionAtCounter) {
                            onViewPrescriptionAtCounter(issuedRxSuccess.code);
                          }
                        }}
                        className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-colors"
                      >
                        Open Dispensing Verification
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder="Type message to doctor..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 text-white placeholder-slate-500 border border-slate-700 focus:outline-hidden focus:border-emerald-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors"
                  >
                    Send
                  </button>
                </form>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Doctor Issue E-Prescription Modal */}
      {isWritingRx && inCallAppointment && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-emerald-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#1B4332] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B5D99B]" />
                <h3 className="font-heading font-bold text-sm">
                  Doctor Tele-Prescription Generator
                </h3>
              </div>
              <button
                onClick={() => setIsWritingRx(false)}
                className="text-slate-300 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleIssueRxSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Patient</span>
                <p className="font-bold text-slate-900">{inCallAppointment.patientName} ({inCallAppointment.patientGender}, {inCallAppointment.patientAge}y)</p>
                <p className="text-[11px] text-slate-600">Prescriber: {inCallAppointment.doctorName} (MDCN: {inCallAppointment.doctorMdcn})</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Medication Name
                </label>
                <select
                  value={rxDrugName}
                  onChange={(e) => setRxDrugName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                >
                  <option value="Tramadol HCl">Tramadol HCl (Controlled)</option>
                  <option value="Codeine Phosphate">Codeine Phosphate Syrups</option>
                  <option value="Diazepam Tablets">Diazepam Tablets</option>
                  <option value="Co-Amoxiclav Tablets">Co-Amoxiclav 625mg</option>
                  <option value="Celecoxib Capsules">Celecoxib 200mg</option>
                  <option value="Cetirizine Tablets">Cetirizine 10mg</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Strength</label>
                  <input
                    type="text"
                    value={rxStrength}
                    onChange={(e) => setRxStrength(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="text"
                    value={rxQuantity}
                    onChange={(e) => setRxQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Clinical Dosage & Safety Instructions
                </label>
                <textarea
                  rows={2}
                  value={rxDosage}
                  onChange={(e) => setRxDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWritingRx(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1B4332] text-white font-heading font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B5D99B]" />
                  <span>Issue & Sign Prescription</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
