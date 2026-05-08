// app/(volunteer)/scan/page.tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Html5Qrcode } from 'html5-qrcode';

export default function ScanPage() {
  const supabase = createClient();
  const [result, setResult] = useState<{ success: boolean; message: string; hours?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<string>('environment');
  const [availableCameras, setAvailableCameras] = useState<{id: string, label: string}[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);
  const scannerActiveRef = useRef(false);

  // Get available cameras
  useEffect(() => {
    async function getCameras() {
      try {
        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices
          .filter(d => d.kind === 'videoinput')
          .map(d => ({
            id: d.deviceId,
            label: d.label || `Cámara ${d.deviceId.slice(0, 8)}`
          }));
        
        setAvailableCameras(videoDevices);
        
        // Default to back camera (usually "environment")
        const backCamera = videoDevices.find(d => 
          d.label.toLowerCase().includes('back') || 
          d.label.toLowerCase().includes('trasera') ||
          d.label.toLowerCase().includes('environment')
        );
        if (backCamera) {
          setSelectedCamera(backCamera.id);
        }
      } catch (error) {
        console.error('Error getting cameras:', error);
        setCameraError('No se pudo acceder a las cámaras');
      }
    }
    getCameras();
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (!result && selectedCamera && !scannerActiveRef.current) {
      startScanner();
    }
    return () => {
      stopScanner();
    };
  }, [selectedCamera, result]);

  async function startScanner() {
    if (scannerActiveRef.current) return;
    
    try {
      setCameraError(null);
      scannerActiveRef.current = true;
      
      if (!qrReaderRef.current) {
        qrReaderRef.current = new Html5Qrcode('qr-reader');
      }

      await qrReaderRef.current.start(
        selectedCamera,
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // QR code detected - validate it
          await validateActivity(decodedText);
        },
        () => {
          // QR code not detected - ignore
        }
      );
    } catch (error: any) {
      console.error('Scanner error:', error);
      setCameraError('No se pudo iniciar la cámara');
      scannerActiveRef.current = false;
    }
  }

  async function stopScanner() {
    if (qrReaderRef.current && scannerActiveRef.current) {
      try {
        await qrReaderRef.current.stop();
        scannerActiveRef.current = false;
      } catch (e) {
        // Ignore
      }
    }
  }

  async function switchCamera(cameraId: string) {
    setSelectedCamera(cameraId);
    setShowCameraMenu(false);
    await stopScanner();
  }

  async function validateActivity(scannedValue: string) {
    if (loading) return;
    
    // Stop scanner first
    await stopScanner();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult({ success: false, message: 'Sesión no válida' });
        setLoading(false);
        return;
      }

      const activityId = scannedValue.trim();
      console.log('Scanning:', activityId);

      // 1. Find the activity
      const { data: activity } = await supabase
        .from('activities')
        .select('id, title, start_time, end_time, status')
        .eq('id', activityId)
        .single();

      if (!activity) {
        setResult({ success: false, message: 'Código QR inválido. No existe actividad.' });
        setLoading(false);
        return;
      }

      // 2. Check if activity is completed
      if (activity.status !== 'completed') {
        setResult({ success: false, message: 'La actividad aún no está completada.' });
        setLoading(false);
        return;
      }

      // 3. Check if already scanned
      const { data: existingScan } = await supabase
        .from('attendance_logs')
        .select('id, hours_credited')
        .eq('activity_id', activityId)
        .eq('volunteer_id', session.user.id)
        .single();

      if (existingScan) {
        setResult({ 
          success: false, 
          message: 'Ya acreditaste esta actividad.',
          hours: existingScan.hours_credited?.toString()
        });
        setLoading(false);
        return;
      }

      // 4. Calculate hours
      const start = new Date(activity.start_time);
      const end = new Date(activity.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const hoursRounded = Math.round(hours * 10) / 10;

      // 5. Record attendance
      const { error: insertError } = await supabase
        .from('attendance_logs')
        .insert({
          activity_id: activityId,
          volunteer_id: session.user.id,
          hours_credited: hoursRounded,
          is_walk_in: false,
          scanned_at: new Date().toISOString()
        });

      if (insertError) {
        setResult({ success: false, message: insertError.message });
        setLoading(false);
        return;
      }

      setResult({ 
        success: true, 
        message: `¡Asistencia registrada en "${activity.title}"!`,
        hours: hoursRounded.toString()
      });

    } catch (error) {
      console.error('Error:', error);
      setResult({ success: false, message: 'Error al procesar. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !qrReaderRef.current) return;

    setLoading(true);
    try {
      if (!qrReaderRef.current) {
        qrReaderRef.current = new Html5Qrcode('qr-reader');
      }
      
      const scanResult = await qrReaderRef.current.scanFileV2(file, true) as unknown;
      const decodedText = typeof scanResult === 'string' ? scanResult : (scanResult as { text?: string })?.text;
      if (decodedText) {
        await validateActivity(decodedText);
      }
    } catch (error) {
      console.error('Image scan error:', error);
      setResult({ success: false, message: 'No se pudo leer el código QR de la imagen.' });
    } finally {
      setLoading(false);
    }
  }

  function resetScanner() {
    setResult(null);
  }

  // Success/Error Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className={`bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center ${
          result.success ? 'border-4 border-green-400' : 'border-4 border-red-400'
        }`}>
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
            result.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.success ? (
              <span className="text-4xl">✅</span>
            ) : (
              <span className="text-4xl">❌</span>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mt-6 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? '¡Listo!' : 'Ops...'}
          </h2>
          <p className="text-[--tribu-gray] mt-3 text-lg">{result.message}</p>
          
          {result.success && result.hours && (
            <div className="mt-4 bg-green-50 rounded-xl p-4">
              <p className="text-green-600 font-medium">+{result.hours} horas acreditadas</p>
            </div>
          )}
          
          <button
            onClick={resetScanner}
            className="mt-8 w-full py-4 bg-[--tribu-blue] text-white rounded-xl font-bold text-lg hover:bg-[--tribu-navy] transition-colors"
          >
            Escanear otro código
          </button>
        </div>
      </div>
    );
  }

  // Main Scan Screen
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">📷</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[--tribu-navy]">
            Escanear QR
          </h1>
          <p className="text-[--tribu-gray] mt-2">
            Apunta la cámara al código QR
          </p>
        </div>

        {/* Camera Selector */}
        {availableCameras.length > 1 && (
          <div className="mb-4">
            <button
              onClick={() => setShowCameraMenu(!showCameraMenu)}
              className="w-full py-2 bg-white border border-gray-200 rounded-lg text-[--tribu-gray] text-sm flex items-center justify-center"
            >
              <span className="mr-2">📹</span>
              Cambiar cámara
              <span className="ml-2">{showCameraMenu ? '▲' : '▼'}</span>
            </button>
            
            {showCameraMenu && (
              <div className="mt-2 bg-white rounded-lg shadow-md overflow-hidden">
                {availableCameras.map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => switchCamera(cam.id)}
                    className={`w-full py-3 px-4 text-left text-sm flex items-center ${
                      selectedCamera === cam.id 
                        ? 'bg-[--tribu-blue] text-white' 
                        : 'text-[--tribu-gray] hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">📹</span>
                    {cam.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Camera Scanner Area */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6 relative">
          {cameraError && (
            <div className="bg-red-50 p-4 text-center text-red-600">
              {cameraError}
            </div>
          )}
          <div id="qr-reader" className="w-full"></div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[--tribu-blue] border-t-transparent mx-auto"></div>
            <p className="mt-3 text-lg text-[--tribu-gray]">Procesando...</p>
          </div>
        )}

        {/* Option to upload image */}
        <div className="mb-6">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl text-[--tribu-gray] font-medium hover:border-[--tribu-blue] hover:text-[--tribu-blue] transition-colors flex items-center justify-center"
          >
            <span className="text-2xl mr-3">📁</span>
            O sube una imagen del QR
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-[--tribu-navy] mb-3 flex items-center">
            <span className="text-xl mr-2">💡</span> ¿Cómo funciona?
          </h3>
          <ol className="space-y-2 text-[--tribu-gray]">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-[--tribu-blue] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">1</span>
              <span>La ONG te comparte el QR al terminar</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-[--tribu-blue] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">2</span>
              <span>Apunta la cámara al código</span>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-[--tribu-blue] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 flex-shrink-0">3</span>
              <span>¡Las horas se acreditan!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}