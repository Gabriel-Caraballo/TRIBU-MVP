// app/(volunteer)/scan/page.tsx
"use client";

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScanPage() {
  const supabase = createClient();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [result, setResult] = useState<{ success: boolean; message: string; hours?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!showManual) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [showManual]);

  function initializeScanner() {
    setCameraError(null);
    
    try {
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText: string) => {
          validateActivity(decodedText);
          if (scannerRef.current) {
            scannerRef.current.clear();
          }
        },
        (error: any) => {
          // Scan error - ignore
        }
      );
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError('No se pudo acceder a la cámara. Usa el ingreso manual.');
      setShowManual(true);
    }
  }

  async function validateActivity(scannedValue: string) {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult({ success: false, message: 'Sesión no válida' });
        setLoading(false);
        return;
      }

      // The QR contains the activity_id directly
      const activityId = scannedValue.trim();

      // 1. Find the activity
      const { data: activity } = await supabase
        .from('activities')
        .select('id, title, start_time, end_time, status, organizations(name)')
        .eq('id', activityId)
        .single();

      if (!activity) {
        setResult({ success: false, message: 'Código QR inválido. No existe actividad.' });
        setLoading(false);
        return;
      }

      // 2. Check if activity is completed
      if (activity.status !== 'completed') {
        setResult({ success: false, message: `La actividad aún no está completada. Estado: ${activity.status}` });
        setLoading(false);
        return;
      }

      // 3. Check if volunteer already scanned this activity
      const { data: existingScan } = await supabase
        .from('attendance_logs')
        .select('id, hours_credited')
        .eq('activity_id', activityId)
        .eq('volunteer_id', session.user.id)
        .single();

      if (existingScan) {
        setResult({ 
          success: false, 
          message: 'Ya escaneaste esta actividad.',
          hours: existingScan.hours_credited?.toString() || '0'
        });
        setLoading(false);
        return;
      }

      // 5. Calculate hours from activity duration
      const start = new Date(activity.start_time);
      const end = new Date(activity.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      const hoursRounded = Math.round(hours * 10) / 10;

      // 6. Record attendance with hours credited
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
        console.error('Error recording attendance:', insertError);
        setResult({ success: false, message: 'Error al registrar asistencia.' });
        setLoading(false);
        return;
      }

      setResult({ 
        success: true, 
        message: `¡Asistencia registrada en "${activity.title}"!`,
        hours: hoursRounded.toString()
      });

    } catch (error) {
      console.error('Error validating:', error);
      setResult({ success: false, message: 'Error al validar el código. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tokenInput.trim()) {
      validateActivity(tokenInput.trim());
    }
  }

  function switchToManual() {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (e) {}
    }
    setShowManual(true);
  }

  function switchToCamera() {
    setShowManual(false);
    setCameraError(null);
  }

  function resetScanner() {
    setResult(null);
    setTokenInput('');
    setShowManual(false);
  }

  if (result) {
    return (
      <div className="max-w-md mx-auto space-y-6 pb-20">
        <div className={`bg-white rounded-lg shadow-md p-6 text-center ${
          result.success ? 'border-2 border-green-500' : 'border-2 border-red-500'
        }`}>
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
            result.success ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {result.success ? (
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          
          <h2 className={`text-xl font-bold mt-4 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
            {result.success ? '¡Registrado!' : 'Error'}
          </h2>
          <p className="text-[--tribu-gray] mt-2 text-sm">{result.message}</p>
          
          {result.success && result.hours && (
            <p className="text-2xl font-bold text-[--tribu-navy] mt-2">
              {result.hours} horas acreditadas
            </p>
          )}
          
          <button
            onClick={resetScanner}
            className="mt-6 px-6 py-2 bg-[--tribu-blue] text-white rounded-lg hover:bg-[--tribu-navy]"
          >
            Escanear otro código
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-[--tribu-navy] text-center">Escanear QR</h1>
      
      <p className="text-center text-[--tribu-gray]">
        Escanea el código QR de la organización para registrar tu asistencia.
      </p>

      <div className="flex gap-2">
        <button
          onClick={switchToCamera}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            !showManual 
              ? 'bg-[--tribu-blue] text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          📷 Cámara
        </button>
        <button
          onClick={switchToManual}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            showManual 
              ? 'bg-[--tribu-blue] text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          ⌨️ Manual
        </button>
      </div>

      {!showManual ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {cameraError && (
            <div className="bg-yellow-50 p-4 text-center text-yellow-700 text-sm">
              {cameraError}
            </div>
          )}
          <div id="qr-reader" className="w-full"></div>
        </div>
      ) : (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-lg shadow-md p-6">
          <label className="block text-sm font-medium text-[--tribu-gray] mb-2">
            Ingresa el código manualmente
          </label>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Activity ID..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 font-mono text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="w-full py-3 bg-[--tribu-blue] text-white rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Validando...' : 'Validar código'}
          </button>
        </form>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[--tribu-blue] mx-auto"></div>
          <p className="mt-2 text-[--tribu-gray]">Validando...</p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-[--tribu-navy] text-sm">¿Cómo funciona?</h3>
        <ol className="mt-2 text-sm text-[--tribu-gray] list-decimal list-inside space-y-1">
          <li>La ONG te comparte el código QR al finalizar la actividad</li>
          <li>Escanea el código una sola vez</li>
          <li>Las horas se acreditan automáticamente</li>
        </ol>
      </div>
    </div>
  );
}