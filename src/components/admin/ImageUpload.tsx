"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [imgError, setImgError] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Formato inválido. Usa JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ficheiro demasiado grande. Máx. 5 MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(0);

    // Fake progress for UX feel while uploading
    const interval = setInterval(() => setProgress((p) => Math.min(p + 12, 85)), 150);

    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Erro no upload");
      clearInterval(interval);
      setProgress(100);
      onChange(json.url);
      setImgError(false);
    } catch (e) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Erro no upload. Tenta novamente.");
    } finally {
      setTimeout(() => { setUploading(false); setProgress(0); }, 400);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const hasImage = value && !imgError;

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 select-none"
        style={{
          aspectRatio: "16/9",
          background: dragging ? "rgba(230,168,30,0.06)" : "#1a1916",
          border: dragging
            ? "2px dashed rgba(230,168,30,0.5)"
            : hasImage
            ? "2px solid transparent"
            : "2px dashed rgba(255,255,255,0.08)",
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !hasImage && !uploading && inputRef.current?.click()}
      >
        {hasImage ? (
          <>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              unoptimized
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2.5"
              style={{ background: "rgba(0,0,0,0.55)" }}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
                style={{ background: "#e6a81e", color: "#1a1916" }}
              >
                <Upload className="w-4 h-4" />
                Alterar foto
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(""); setImgError(false); }}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                style={{ background: "rgba(0,0,0,0.6)", color: "#e8e8e0", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#e6a81e" }} />
                <div className="w-32">
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%`, background: "#e6a81e" }}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#626250]">A fazer upload…</p>
              </div>
            ) : (
              <>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: dragging ? "rgba(230,168,30,0.15)" : "rgba(255,255,255,0.05)" }}
                >
                  {dragging
                    ? <Upload className="w-6 h-6" style={{ color: "#e6a81e" }} />
                    : <ImageIcon className="w-6 h-6" style={{ color: "#484640" }} />
                  }
                </div>
                <div className="text-center px-4">
                  <p className="text-sm font-medium" style={{ color: dragging ? "#e6a81e" : "#626250" }}>
                    {dragging ? "Larga para fazer upload" : "Clica ou arrasta uma imagem"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#3a3830" }}>
                    JPEG · PNG · WebP · máx. 5 MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* URL fallback */}
      <div className="flex items-center gap-2">
        <div
          className="flex-1 flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="text-[10px] font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: "#3a3830" }}>URL</span>
          <input
            type="url"
            value={value}
            onChange={(e) => { onChange(e.target.value); setImgError(false); }}
            placeholder="Ou cola um link de imagem…"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "#626250" }}
          />
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all active:scale-95 hover:brightness-110"
          style={{ background: "rgba(230,168,30,0.12)", color: "#e6a81e", border: "1px solid rgba(230,168,30,0.2)" }}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload
        </button>
      </div>

      {error && (
        <p className="text-xs rounded-lg px-2.5 py-1.5" style={{ background: "rgba(230,126,75,0.1)", color: "#e67e4b" }}>
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
