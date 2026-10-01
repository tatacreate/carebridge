import React, { useState } from 'react';
import { Camera, Sparkles, Upload, CheckCircle2, Clock, Pill, AlertCircle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { Language, PatientProfile, PrescriptionRequest } from '../types';

interface PrescriptionScannerViewProps {
  currentLang: Language;
  patient: PatientProfile;
  prescriptionRequests: PrescriptionRequest[];
  onAddPrescriptionRequest: (req: PrescriptionRequest) => void;
}

export const PrescriptionScannerView: React.FC<PrescriptionScannerViewProps> = ({
  currentLang,
  patient,
  prescriptionRequests,
  onAddPrescriptionRequest,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    name: string;
    dosage: string;
    times: string[];
    instructions: string;
    notes: string;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setAnalysisResult(null);
      setSuccessMsg(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeWithAi = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const base64Data = selectedImage.split(',')[1];
      const response = await fetch('/api/gemini/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze prescription image with AI.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitToDoctor = () => {
    if (!analysisResult) return;

    const newReq: PrescriptionRequest = {
      id: `rx-req-${Date.now()}`,
      medicineName: analysisResult.name,
      dosage: analysisResult.dosage,
      times: analysisResult.times,
      instructions: analysisResult.instructions,
      notes: analysisResult.notes,
      status: 'pending',
      prescriptionImageUrl: selectedImage || undefined,
      requestedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onAddPrescriptionRequest(newReq);
    setSuccessMsg('Prescription successfully sent to your doctor! Your doctor has been notified to review and approve the addition.');
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const patientRequests = prescriptionRequests;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200 text-xs font-extrabold">
            <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
            <span>AI Prescription Scanner & Doctor Bridge</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Scan & Request Prescription
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 font-medium max-w-xl">
            Take a picture or upload your prescription paper. Our Gemini AI will instantly extract the medicine details and submit them directly to your attending physician for approval.
          </p>
        </div>

        <div className="bg-white/10 border border-white/20 p-4 rounded-2xl text-center shrink-0">
          <span className="text-[10px] uppercase font-bold text-teal-300 block">Connected Doctor</span>
          <span className="font-black text-sm sm:text-base text-white block mt-0.5">
            {patient.doctorName || 'Dr. Sarah Al-Mansoor'}
          </span>
          <span className="text-[10px] text-teal-200 block font-medium">King Faisal Specialist Hospital</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Scanner Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-black">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Prescription Image Upload</h3>
            <p className="text-xs text-slate-500 font-medium">Upload a clear photo of the prescription paper</p>
          </div>
        </div>

        {!selectedImage ? (
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 sm:p-12 text-center transition bg-slate-50/50 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
              <Upload className="w-8 h-8 text-teal-600" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h4 className="font-extrabold text-slate-800 text-sm">Upload Prescription Photo</h4>
              <p className="text-xs text-slate-500 font-medium">
                Supports JPEG, PNG, or camera capture from your phone/computer
              </p>
            </div>
            <label className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold rounded-2xl shadow-xs cursor-pointer transition text-xs sm:text-sm">
              <Camera className="w-4 h-4" />
              <span>Choose Photo or Take Picture</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-80 flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Uploaded Prescription"
                className="max-h-80 object-contain w-full"
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setAnalysisResult(null);
                }}
                className="absolute top-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                Change Image
              </button>
            </div>

            {!analysisResult && (
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyzeWithAi}
                  disabled={isAnalyzing}
                  className="px-6 py-3.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-black rounded-2xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>{isAnalyzing ? 'Analyzing with Gemini AI...' : 'Analyze Prescription with AI'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis Results Preview */}
        {analysisResult && (
          <div className="p-6 rounded-3xl bg-teal-50/70 border border-teal-200 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-teal-200 pb-3">
              <div className="flex items-center gap-2 text-teal-900">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h4 className="font-extrabold text-sm sm:text-base">AI Extraction Results</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-teal-200/80 text-teal-900 text-[10px] font-extrabold">
                Ready for Doctor Review
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-white p-3.5 rounded-2xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Medication Name</span>
                <strong className="text-slate-900 text-base font-black">{analysisResult.name}</strong>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dosage</span>
                <strong className="text-slate-900 text-base font-black">{analysisResult.dosage}</strong>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Times</span>
                <strong className="text-teal-800 text-sm font-mono font-bold">{analysisResult.times.join(', ')}</strong>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-teal-100 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Instructions</span>
                <strong className="text-slate-800 text-xs font-semibold">{analysisResult.instructions || 'Standard'}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitToDoctor}
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-md transition flex items-center gap-2 text-xs sm:text-sm"
              >
                <span>Submit Prescription Request to Doctor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Previously Submitted Requests Status */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Your Submitted Prescription Requests</h3>
            <p className="text-xs text-slate-500 font-medium">Track your doctor's approval status for added medicines</p>
          </div>
        </div>

        {patientRequests.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            No prescription requests submitted yet. Use the scanner above to scan and request a new prescription.
          </div>
        ) : (
          <div className="space-y-3">
            {patientRequests.map((req) => {
              const isPending = req.status === 'pending';
              const isApproved = req.status === 'approved';
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4 text-teal-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 font-black text-sm">{req.medicineName}</strong>
                        <span className="text-slate-500">({req.dosage})</span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-medium mt-0.5">
                        Times: {req.times.join(', ')} • Requested: {req.requestedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`px-3 py-1 rounded-full font-extrabold text-[11px] border ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      {isApproved ? '✓ Approved & Added' : isPending ? '⏳ Pending Doctor Review' : '✕ Disapproved'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
