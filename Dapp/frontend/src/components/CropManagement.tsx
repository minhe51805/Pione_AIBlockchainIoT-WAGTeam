'use client';

import { useState, useEffect } from 'react';

interface CropData {
  cropName: string;
  plantedDate: string;
  harvestDate: string;
  notes?: string;
}

interface CropManagementProps {
  onCropUpdate: (crop: CropData | null) => void;
}

export default function CropManagement({ onCropUpdate }: CropManagementProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCrop, setCurrentCrop] = useState<CropData | null>(null);
  const [formData, setFormData] = useState<CropData>({
    cropName: '',
    plantedDate: '',
    harvestDate: '',
    notes: ''
  });

  // Load crop from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('current_crop');
    if (saved) {
      const crop = JSON.parse(saved);
      setCurrentCrop(crop);
      onCropUpdate(crop);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    localStorage.setItem('current_crop', JSON.stringify(formData));
    setCurrentCrop(formData);
    onCropUpdate(formData);
    setIsOpen(false);
    
    // Reset form
    setFormData({
      cropName: '',
      plantedDate: '',
      harvestDate: '',
      notes: ''
    });
  };

  const handleDelete = () => {
    if (confirm('Bạn có chắc muốn xóa thông tin cây trồng hiện tại?')) {
      localStorage.removeItem('current_crop');
      setCurrentCrop(null);
      onCropUpdate(null);
    }
  };

  const calculateDaysPlanted = () => {
    if (!currentCrop?.plantedDate) return 0;
    const planted = new Date(currentCrop.plantedDate);
    const today = new Date();
    const diff = today.getTime() - planted.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const calculateDaysToHarvest = () => {
    if (!currentCrop?.harvestDate) return null;
    const harvest = new Date(currentCrop.harvestDate);
    const today = new Date();
    const diff = harvest.getTime() - today.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="relative">
      {/* Current Crop Display or Add Button */}
      {currentCrop ? (
        <div className="bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-4 border-2 border-violet-200 dark:border-violet-700 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentCrop.cropName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Đã trồng {calculateDaysPlanted()} ngày
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFormData(currentCrop);
                  setIsOpen(true);
                }}
                className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors flex items-center justify-center border-2 border-violet-300 dark:border-violet-700 shadow-md"
                title="Chỉnh sửa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-violet-700 dark:text-violet-300" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors flex items-center justify-center border-2 border-red-300 dark:border-red-700 shadow-md"
                title="Xóa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-700 dark:text-red-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Ngày trồng</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {new Date(currentCrop.plantedDate).toLocaleDateString('vi-VN')}
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Thu hoạch</span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {currentCrop.harvestDate ? (
                  <>
                    {new Date(currentCrop.harvestDate).toLocaleDateString('vi-VN')}
                    {calculateDaysToHarvest() !== null && (
                      <span className="block text-xs text-green-600 dark:text-green-400">
                        (còn {calculateDaysToHarvest()} ngày)
                      </span>
                    )}
                  </>
                ) : (
                  'Chưa xác định'
                )}
              </p>
            </div>
          </div>

          {currentCrop.notes && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentCrop.notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 border-2 border-dashed border-violet-300 dark:border-violet-700 hover:border-violet-500 dark:hover:border-violet-500 hover:bg-violet-50/50 dark:hover:bg-violet-900/20 transition-all shadow-lg group"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/50 dark:to-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Thêm cây trồng
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Để AI theo dõi và tư vấn tự động
              </p>
            </div>
          </div>
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0f0e17] rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1 min-w-0 truncate">
                  {currentCrop ? 'Chỉnh sửa cây trồng' : 'Thêm cây trồng'}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-shrink-0 w-10 h-10 rounded-lg bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex items-center justify-center shadow-lg border-2 border-gray-300 dark:border-slate-600 hover:border-red-400 dark:hover:border-red-500 relative z-10 group"
                  aria-label="Đóng"
                >
                  <span className="text-2xl font-normal text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-all duration-200 group-hover:rotate-90 inline-flex items-center justify-center w-full h-full">
                    ×
                  </span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Tên cây trồng *
                </label>
                <input
                  type="text"
                  required
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  placeholder="Ví dụ: Cà phê, Lúa, ..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ngày gieo trồng *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plantedDate}
                    onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Ngày thu hoạch
                  </label>
                  <input
                    type="date"
                    value={formData.harvestDate}
                    onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Thông tin thêm về cây trồng..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-violet-500 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold hover:from-violet-500 hover:to-purple-500 transition-all shadow-lg hover:shadow-xl"
              >
                {currentCrop ? 'Cập nhật' : 'Thêm cây trồng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

