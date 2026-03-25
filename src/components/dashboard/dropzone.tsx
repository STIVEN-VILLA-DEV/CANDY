"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { UploadCloud, FileText, AlertCircle } from "lucide-react";
import { validateFile } from "@/lib/utils";

interface Props {
  onFile: (file: File) => void;
  error: string | null;
}

export default function Dropzone({ onFile, error }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted[0]) return;
      const err = validateFile(accepted[0]);
      if (!err) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  const hasError = error || fileRejections.length > 0;
  const rootProps = getRootProps();

  return (
    <div>
      <motion.div
        {...(rootProps as object)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-16 text-center transition-all duration-300 ${
          isDragActive
            ? "border-esmerald-400 bg-esmerald-500/10 glow-esmerald"
            : hasError
            ? "border-red-500/50 bg-red-500/5"
            : "border-slate-700 hover:border-esmerald-500/50 hover:bg-esmerald-500/5 bg-surface/40"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <FileText className="w-12 h-12 text-white-400 animate-bounce" />
          ) : (
            <UploadCloud className={`w-12 h-12 ${hasError ? "text-red-400" : "text-slate-500"}`} />
          )}
          <div>
            <p className="font-medium text-slate-200 mb-1">
              {isDragActive ? "Suelta tu CV aquí" : "Arrastra tu CV o haz clic para seleccionar"}
            </p>
            <p className="text-xs text-slate-500">Solo PDF · Máximo 5MB</p>
          </div>
        </div>
      </motion.div>

      {hasError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mt-3 text-red-400 text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error || "Archivo inválido. Solo se aceptan PDFs de hasta 5MB."}
        </motion.div>
      )}
    </div>
  );
}
