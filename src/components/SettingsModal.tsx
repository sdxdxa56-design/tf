import React, { useState } from 'react';
import { AppSettings } from '../types';
import { downloadEngine } from '../services/downloadEngine';
import { Settings, X, HardDrive, Cpu, Music, Shield, Sliders, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<AppSettings>(() => downloadEngine.getSettings());
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    downloadEngine.saveSettings(settings);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0A0A0C] border border-[#FF4F00]/40 rounded-2xl shadow-2xl overflow-hidden dir-rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-[#141318] border-b border-[#24212C]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FF4F00]/15 text-[#FF4F00] border border-[#FF4F00]/30">
              <Sliders className="w-5 h-5" />
            </div>
            <h2 className="text-white font-bold text-base font-mono">
              إعدادات محرك HyperPulse ⚡
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#1F1C26] text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* RAM Buffer Threshold */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#141318] border border-[#24212C]">
            <div className="flex items-center justify-between text-gray-200">
              <span className="font-bold flex items-center gap-2 text-sm">
                <HardDrive className="w-4 h-4 text-[#FF4F00]" />
                حجم ذاكرة RAM Ring Buffer
              </span>
              <span className="font-mono text-[#FF9D00] font-bold">
                {settings.ramBufferThresholdMb} MB
              </span>
            </div>
            <p className="text-[#A0999C] text-[11px]">
              يحدد حجم التخزين المؤقت في الذاكرة العشوائية لمنع استهلاك القرص وحماية شريحة التخزين.
            </p>
            <div className="flex items-center gap-2 mt-1">
              {[16, 32, 64, 128].map((mb) => (
                <button
                  key={mb}
                  onClick={() => setSettings({ ...settings, ramBufferThresholdMb: mb })}
                  className={`flex-1 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    settings.ramBufferThresholdMb === mb
                      ? 'bg-[#FF4F00] text-white shadow-md'
                      : 'bg-[#1C1A20] text-gray-400 hover:text-white'
                  }`}
                >
                  {mb} MB
                </button>
              ))}
            </div>
          </div>

          {/* Thread Concurrency */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#141318] border border-[#24212C]">
            <div className="flex items-center justify-between text-gray-200">
              <span className="font-bold flex items-center gap-2 text-sm">
                <Cpu className="w-4 h-4 text-[#FF4F00]" />
                عدد مسارات التنزيل المتوازية
              </span>
              <span className="font-mono text-[#FF4F00] font-bold">
                {settings.threadConcurrency} مسار
              </span>
            </div>
            <p className="text-[#A0999C] text-[11px]">
              عدد الأنوية والخيوط التي تشترك في فتح تيار الاتصال بالخادم للحصول على أقصى سرعة.
            </p>
            <div className="flex items-center gap-2 mt-1">
              {[4, 8, 16, 32].map((tc) => (
                <button
                  key={tc}
                  onClick={() => setSettings({ ...settings, threadConcurrency: tc })}
                  className={`flex-1 py-1.5 rounded-lg font-mono font-bold transition-all cursor-pointer ${
                    settings.threadConcurrency === tc
                      ? 'bg-[#FF4F00] text-white shadow-md'
                      : 'bg-[#1C1A20] text-gray-400 hover:text-white'
                  }`}
                >
                  {tc} Thread
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                setSettings({ ...settings, autoExtractMp3: !settings.autoExtractMp3 })
              }
              className="flex items-center justify-between p-3 rounded-xl bg-[#141318] border border-[#24212C] text-gray-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#FF9D00]" />
                <span className="font-semibold">استخراج MP3 تلقائياً عند التنزيل</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.autoExtractMp3 ? 'bg-[#FF4F00]' : 'bg-[#2B2735]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.autoExtractMp3 ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>

            <button
              onClick={() =>
                setSettings({ ...settings, enableWatermark: !settings.enableWatermark })
              }
              className="flex items-center justify-between p-3 rounded-xl bg-[#141318] border border-[#24212C] text-gray-200 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span className="font-semibold">تفعيل شارة العلامة المائية الفائقة</span>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  settings.enableWatermark ? 'bg-[#FF4F00]' : 'bg-[#2B2735]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.enableWatermark ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] hover:to-[#FFA714] text-white font-bold text-sm shadow-xl shadow-[#FF4F00]/30 flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم حفظ التفضيلات!</span>
              </>
            ) : (
              <span>حفظ التغييرات ⚡</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
