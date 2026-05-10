// app/(volunteer)/scan/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
  const supabase = createClient();
  const [result, setResult] = useState<{ success: boolean; message: string; hours?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrReaderRef = useRef<Html5Qrcode | null>(null);

  // Get cameras on mount
  useEffect(() => {
    async function getCameras() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === "videoinput");
        setCameras(videoDevices);
        
        const backCam = videoDevices.find(d => 
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("trasera") ||
          d.label.toLowerCase().includes("environment")
        );
        setSelectedCameraId(backCam?.deviceId || videoDevices[0]?.deviceId || "");
      } catch (err) {
        console.error("Camera error:", err);
        setCameraError("Activa los permisos de cámara");
      }
    }
    getCameras();
  }, []);

  // Start scanner when camera is selected
  useEffect(() => {
    if (selectedCameraId && !result && !loading) {
      startCamera();
    }
    
    return () => {
      // Cleanup function - make it synchronous
      if (qrReaderRef.current && scanning) {
        qrReaderRef.current.stop().catch(() => {});
      }
    };
  }, [selectedCameraId, result, loading]);

  async function startCamera() {
    if (scanning) return;
    
    try {
      setCameraError(null);
      setScanning(true);
      qrReaderRef.current = new Html5Qrcode("qr-reader");
      
      await qrReaderRef.current.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 280, height: 280 }
        },
        async (text) => {
          await validateActivity(text);
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Start camera error:", err);
      setCameraError("Error al iniciar cámara");
      setScanning(false);
    }
  }

  async function stopCamera() {
    if (qrReaderRef.current && scanning) {
      try {
        await qrReaderRef.current.stop();
      } catch {}
      setScanning(false);
    }
  }

  function handleCameraChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newId = e.target.value;
    setSelectedCameraId(newId);
    stopCamera();
  }

  async function validateActivity(scannedValue: string) {
    if (loading) return;
    
    await stopCamera();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setResult({ success: false, message: "Sesión no válida" });
        setLoading(false);
        return;
      }

      const activityId = scannedValue.trim();

      const { data: activity } = await supabase
        .from("activities")
        .select("id, title, start_time, end_time, status")
        .eq("id", activityId)
        .single();

      if (!activity) {
        setResult({ success: false, message: "Código QR inválido" });
        setLoading(false);
        return;
      }

      if (activity.status !== "completed") {
        setResult({ success: false, message: "La actividad no está completada" });
        setLoading(false);
        return;
      }

      const { data: existing } = await supabase
        .from("attendance_logs")
        .select("id")
        .eq("activity_id", activityId)
        .eq("volunteer_id", session.user.id)
        .single();

      if (existing) {
        setResult({ success: false, message: "Ya acreditaste esta actividad" });
        setLoading(false);
        return;
      }

      const hours = Math.round(
        (new Date(activity.end_time).getTime() - new Date(activity.start_time).getTime()) 
        / (1000 * 60 * 60) * 10
      ) / 10;

      const { error } = await supabase
        .from("attendance_logs")
        .insert({
          activity_id: activityId,
          volunteer_id: session.user.id,
          hours_credited: hours,
          is_walk_in: false,
          scanned_at: new Date().toISOString()
        });

      if (error) {
        setResult({ success: false, message: error.message });
        setLoading(false);
        return;
      }

      setResult({ success: true, message: "¡Asistencia registrada!", hours: hours.toString() });

    } catch (err) {
      console.error(err);
      setResult({ success: false, message: "Error al procesar" });
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const qr = new Html5Qrcode("qr-reader");
      const scanResult = await qr.scanFileV2(file, true);
      const text = typeof scanResult === "string" ? scanResult : (scanResult as unknown as { text?: string })?.text;
      if (text) await validateActivity(text);
    } catch {
      setResult({ success: false, message: "No se leyó el código QR" });
    } finally {
      setLoading(false);
    }
  }

  function tryAgain() {
    setResult(null);
  }

  // Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className={`bg-[#111] rounded-2xl border p-8 max-w-sm w-full text-center ${
          result.success ? "border-[#22c55e]" : "border-red-500"
        }`}>
          <div className="mb-4">
            {result.success ? (
              <svg className="w-12 h-12 text-[#22c55e] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <h2 className={`text-2xl font-bold ${result.success ? "text-[#22c55e]" : "text-red-400"}`}>
            {result.success ? "¡Listo!" : "Error"}
          </h2>
          <p className="text-[#555] mt-3">{result.message}</p>
          
          {result.success && result.hours && (
            <div className="mt-4 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] rounded-lg p-3">
              <span className="text-[#22c55e] font-bold">+{result.hours} horas</span>
            </div>
          )}
          
          <button
            onClick={tryAgain}
            className="mt-8 w-full py-3 bg-[#22c55e] text-black rounded-lg font-bold hover:bg-[#16a34a]"
          >
            Escanear otro
          </button>
        </div>
      </div>
    );
  }

  // Main Scan Screen
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-white mt-2">Escanear QR</h1>
          <p className="text-[#555] mt-1">Apunta al código QR</p>
        </div>

        {cameraError && (
          <div className="mb-4 bg-[rgba(239,68,68,0.08)] text-red-400 p-3 rounded-lg text-center border border-[rgba(239,68,68,0.2)]">
            {cameraError}
          </div>
        )}

        {cameras.length > 1 && (
          <div className="mb-4">
            <select
              value={selectedCameraId}
              onChange={handleCameraChange}
              className="w-full p-2 border border-[#1f1f1f] rounded-lg bg-[#111] text-white"
            >
              {cameras.map(cam => (
                <option key={cam.deviceId} value={cam.deviceId}>
                  {cam.label || "Cámara " + cam.deviceId.slice(0, 6)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="bg-[#111] rounded-xl border border-[#1f1f1f] overflow-hidden mb-4">
          <div id="qr-reader" className="w-full"></div>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="w-10 h-10 border-4 border-[#22c55e] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-[#555]">Procesando...</p>
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-[#1f1f1f] rounded-xl text-[#444] font-medium hover:border-[#22c55e] hover:text-[#22c55e]"
        >
          Subir imagen del QR
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <div className="mt-6 bg-[#111] rounded-lg border border-[#1f1f1f] p-4 text-sm">
          <p className="font-medium text-white mb-2">Instrucciones:</p>
          <ol className="space-y-1 text-[#555] list-decimal list-inside">
            <li>La ONG te da el QR al terminar</li>
            <li>Apunta la cámara al código</li>
            <li>¡Las horas se acreditan!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}