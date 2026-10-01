import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, ShieldCheck, Activity, Sparkles, Pill, Users } from 'lucide-react';
import { Language } from '../types';

interface TutorialModalProps {
  currentLang: Language;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ currentLang, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to MediBridge-IoT',
      subtitle: 'Next-Generation Secure Outpatient Management & IoT Telemetry',
      icon: <Sparkles className="w-8 h-8 text-teal-600" />,
      content:
        'MediBridge-IoT bridges patients, attending physicians, and hospital administrators into a unified, secure real-time medical ecosystem with FIDO2 biometrics and Gemini AI clinical intelligence.',
    },
    {
      title: 'Smart Biometric Patch Telemetry',
      subtitle: 'Live Wearable Vitals & Instant Spikes',
      icon: <Activity className="w-8 h-8 text-rose-500 animate-pulse" />,
      content:
        'The live biometric sticker card tracks Heart Rate, Body Temperature, and ECG waveforms in real time. Judges can click "Simulate Vitals Spike" to test emergency threshold alerts across Doctor and Admin portals instantly.',
    },
    {
      title: 'Three-Tier Portal Navigation',
      subtitle: 'Seamless Role Switching',
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      content:
        'Switch effortlessly between Patient Portal (care roadmap, medications, AI companion), Doctor Portal (patient management, prescription review, AI intake), and Hospital Admin Portal (linked hospital doctors & security logs).',
    },
    {
      title: 'Live AI Prescription Scanner & Companion',
      subtitle: 'Google Gemini 2.5 Flash Integration',
      icon: <Pill className="w-8 h-8 text-teal-600" />,
      content:
        'Doctors and patients can upload discharge prescriptions for instant AI parsing and care roadmap generation. The Patient AI Companion is always ready to answer recovery questions securely.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-extrabold">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1.5 rounded-xl bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto shadow-inner">
            {steps[currentStep].icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {steps[currentStep].title}
            </h3>
            <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              {steps[currentStep].subtitle}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto pt-2">
              {steps[currentStep].content}
            </p>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep ? 'w-6 bg-teal-600' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 transition px-3 py-2"
          >
            Skip Tutorial
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-200 transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
