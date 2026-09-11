import React from 'react';
import { Sparkles, Download, X } from 'lucide-react';
import { DetectedLink } from '../types';

interface FloatingLinkBubbleProps {
  link: DetectedLink | null;
  onDownload: (link: DetectedLink) => void;
  onDismiss: () => void;
}

export const FloatingLinkBubble: React.FC<FloatingLinkBubbleProps> = ({
  link,
  onDownload,
  onDismiss,
}) => {
  if (!link) return null;

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-lg mx-auto p-3.5 rounded-2xl bg-[#18151F] border border-[#FF4F00] shadow-[0_10px_30px_rgba(255,79,0,0.3)] flex items-center justify-between dir-rtl animate-bounce">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-[#FF4F00]/20 text-[#FF4F00] shrink-0">
          <Sparkles className="w-5 h-5 animate-spin" />
        </div>
        <div className="flex flex-col text-right min-w-0">
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
            تم رصد رابط تحميل جديد من الحافظة! ⚡
          </span>
          <span className="text-[11px] text-gray-300 truncate max-w-[220px] font-mono mt-0.5">
            {link.cleanUrl}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onDownload(link)}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF4F00] to-[#FF9D00] hover:from-[#FF5D14] text-white text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تحميل</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-xl bg-[#25212E] hover:bg-[#322C3D] text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
