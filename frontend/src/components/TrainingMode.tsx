import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, BarChart3, CheckCircle, XCircle } from 'lucide-react';

interface TrainingStats {
  total: number;
  byCategory: Record<string, number>;
}

interface Category {
  id: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: 'pill-organizer-full', label: 'Pill Organizer (Full)' },
  { id: 'pill-organizer-empty', label: 'Pill Organizer (Empty)' },
  { id: 'loose-pills', label: 'Loose Pills' },
  { id: 'human-face', label: 'Human Face' },
  { id: 'human-hand', label: 'Human Hand' },
  { id: 'table-empty', label: 'Empty Table' },
  { id: 'table-objects', label: 'Table with Objects' },
  { id: 'wall', label: 'Wall/Background' },
  { id: 'blur', label: 'Blurry Image' },
  { id: 'glare', label: 'Glare/Reflection' },
  { id: 'other', label: 'Other Object' },
];

const TrainingMode: React.FC = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stats, setStats] = useState<TrainingStats>({ total: 0, byCategory: {} });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<'success' | 'error' | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  // Initialize camera
  useEffect(() => {
    if (isCapturing) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [isCapturing]);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('❌ Camera error:', err);
      alert('Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setIsCapturing(false);
  };

  const saveTrainingData = async () => {
    if (!capturedImage || !selectedCategory) {
      alert('Please select a category');
      return;
    }

    setIsSaving(true);
    setLastSaveStatus(null);

    try {
      // Convert base64 to blob
      const base64Data = capturedImage.split(',')[1];
      const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob());
      
      const formData = new FormData();
      formData.append('image', blob, 'training.jpg');
      formData.append('category', selectedCategory);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`${API_URL}/api/training/submit`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save');

      const result = await response.json();
      console.log('✅ Training data saved:', result);
      
      setLastSaveStatus('success');
      
      // Reset form
      setCapturedImage(null);
      setSelectedCategory('');
      setDescription('');
      
      // Reload stats
      await loadStats();
      
      setTimeout(() => setLastSaveStatus(null), 3000);
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setLastSaveStatus('error');
      setTimeout(() => setLastSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/training/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('❌ Stats error:', error);
    }
  };

  const discardImage = () => {
    setCapturedImage(null);
    setSelectedCategory('');
    setDescription('');
    setLastSaveStatus(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-4xl">🎓</span>
            <img src="/geni-logo.png" alt="GENI" className="h-12 w-auto object-contain" />
            <h1 className="text-4xl font-bold text-white">Training Mode</h1>
          </div>
          <p className="text-purple-200">
            Teach GENI to recognize objects
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-purple-300" />
            <h2 className="text-xl font-semibold text-white">Training Dataset</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-purple-200">Total Images</div>
            </div>
            
            {CATEGORIES.slice(0, 3).map(cat => (
              <div key={cat.id} className="bg-white/5 rounded-lg p-4">
                <div className="text-2xl font-bold text-white">
                  {stats.byCategory[cat.id] || 0}
                </div>
                <div className="text-sm text-purple-200">{cat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera/Preview */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">
              {capturedImage ? 'Preview' : 'Camera'}
            </h2>
            
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
              {isCapturing ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : capturedImage ? (
                <img 
                  src={capturedImage} 
                  alt="Captured" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white/50">
                  <Camera className="w-12 h-12" />
                </div>
              )}
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Camera Controls */}
            <div className="flex gap-3">
              {!capturedImage && !isCapturing && (
                <button
                  onClick={() => setIsCapturing(true)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
              )}
              
              {isCapturing && (
                <>
                  <button
                    onClick={captureImage}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Capture
                  </button>
                  <button
                    onClick={() => setIsCapturing(false)}
                    className="px-6 bg-red-600/20 hover:bg-red-600/30 text-red-300 py-3 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {capturedImage && (
                <>
                  <button
                    onClick={() => setIsCapturing(true)}
                    className="px-6 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 py-3 rounded-lg font-semibold transition"
                  >
                    Retake
                  </button>
                  <button
                    onClick={discardImage}
                    className="px-6 bg-red-600/20 hover:bg-red-600/30 text-red-300 py-3 rounded-lg font-semibold transition"
                  >
                    Discard
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Labeling Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Label Image</h2>
            
            {!capturedImage ? (
              <div className="text-purple-200 text-center py-12">
                Capture an image to label it
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category Selector */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="" className="bg-gray-900">Select category...</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-gray-900">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., 'Weekly organizer, Monday has 3 white pills'"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    rows={3}
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={saveTrainingData}
                  disabled={!selectedCategory || isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Training Data
                    </>
                  )}
                </button>

                {/* Status Message */}
                {lastSaveStatus === 'success' && (
                  <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-3 flex items-center gap-2 text-green-300">
                    <CheckCircle className="w-5 h-5" />
                    Training data saved successfully!
                  </div>
                )}
                
                {lastSaveStatus === 'error' && (
                  <div className="bg-red-600/20 border border-red-500/50 rounded-lg p-3 flex items-center gap-2 text-red-300">
                    <XCircle className="w-5 h-5" />
                    Failed to save. Please try again.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {CATEGORIES.map(cat => {
              const count = stats.byCategory[cat.id] || 0;
              const progress = Math.min((count / 20) * 100, 100); // 20 images per category target
              
              return (
                <div key={cat.id} className="bg-white/5 rounded-lg p-3">
                  <div className="text-lg font-bold text-white">{count}</div>
                  <div className="text-xs text-purple-200 mb-2">{cat.label}</div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingMode;
