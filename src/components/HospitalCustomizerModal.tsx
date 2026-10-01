import React, { useState } from 'react';
import { X, Save, Plus, Trash2, UserCheck, Hospital, Stethoscope, Pill } from 'lucide-react';
import { Language, Medication, PatientProfile } from '../types';
import { getTranslation } from '../data/translations';

interface HospitalCustomizerModalProps {
  currentLang: Language;
  patient: PatientProfile;
  medications: Medication[];
  onSave: (updatedPatient: PatientProfile, updatedMeds: Medication[]) => void;
  onClose: () => void;
}

export const HospitalCustomizerModal: React.FC<HospitalCustomizerModalProps> = ({
  currentLang,
  patient,
  medications,
  onSave,
  onClose,
}) => {
  const [patientData, setPatientData] = useState<PatientProfile>({ ...patient });
  const [medsList, setMedsList] = useState<Medication[]>([...medications]);

  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTimes, setNewMedTimes] = useState('08:00, 20:00');

  const handleAddMed = () => {
    if (!newMedName.trim()) return;

    const timesArray = newMedTimes
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: newMedName,
      dosage: newMedDosage || '1 Tablet',
      frequency: 'As prescribed',
      times: timesArray.length > 0 ? timesArray : ['08:00'],
      foodInstruction: 'after_food',
      notes: 'Prescribed discharge medication',
      pillColor: '#0d9488',
      active: true,
      iconType: 'pill',
    };

    setMedsList([...medsList, newMed]);
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMed = (id: string) => {
    setMedsList(medsList.filter((m) => m.id !== id));
  };

  const handleSaveAll = () => {
    onSave(patientData, medsList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold">{getTranslation(currentLang, 'customizerTitle')}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {getTranslation(currentLang, 'customizerSubtitle')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* Patient Details */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Patient & Hospital File Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  {getTranslation(currentLang, 'patientName')}
                </label>
                <input
                  type="text"
                  value={patientData.name}
                  onChange={(e) => setPatientData({ ...patientData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">MRN File No.</label>
                <input
                  type="text"
                  value={patientData.mrn}
                  onChange={(e) => setPatientData({ ...patientData, mrn: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  {getTranslation(currentLang, 'hospitalName')}
                </label>
                <input
                  type="text"
                  value={patientData.hospitalName}
                  onChange={(e) => setPatientData({ ...patientData, hospitalName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700">
                  {getTranslation(currentLang, 'diagnosis')}
                </label>
                <input
                  type="text"
                  value={patientData.diagnosis}
                  onChange={(e) => setPatientData({ ...patientData, diagnosis: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Medications Customizer */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1.5">
              <Pill className="w-4 h-4" />
              <span>Discharge Medication Plan</span>
            </h4>

            {/* List of current meds */}
            <div className="space-y-2">
              {medsList.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2"
                >
                  <div>
                    <strong className="text-slate-900 font-bold block">{m.name}</strong>
                    <span className="text-[11px] text-slate-500">
                      {m.dosage} • Times: {m.times.join(', ')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveMed(m.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Med Inline Form */}
            <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-3">
              <span className="font-bold text-teal-900 block">
                {getTranslation(currentLang, 'addMedication')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={getTranslation(currentLang, 'medName')}
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder={getTranslation(currentLang, 'medDosage')}
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 bg-white"
                />
                <input
                  type="text"
                  placeholder="Times (e.g. 08:00, 20:00)"
                  value={newMedTimes}
                  onChange={(e) => setNewMedTimes(e.target.value)}
                  className="p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMed}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medication</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold transition hover:bg-slate-200"
          >
            {getTranslation(currentLang, 'cancel')}
          </button>
          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md transition flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{getTranslation(currentLang, 'savePlan')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
