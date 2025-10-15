
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './uploadfile.css'

// Configuration
const UPLOAD_URL = import.meta.env.REACT_APP_UPLOAD_URL || 'http://localhost:4002/upload';
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', // images
  'application/pdf',
  'text/plain',
];

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function FileUploader() {
  const [files, setFiles] = useState([]); // { id, file, preview, progress, status, controller }
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleFilesAdded(fileList) {
    const newItems = Array.from(fileList).map((file) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      return {
        id,
        file,
        preview,
        progress: 0,
        status: 'ready', // ready | uploading | done | error | cancelled
        controller: null,
        error: null,
      };
    }).filter(item => {
      // client-side validation
      if (item.file.size > MAX_FILE_SIZE_BYTES) {
        item.error = `File too large (${formatBytes(item.file.size)}). Max is ${formatBytes(MAX_FILE_SIZE_BYTES)}.`;
        item.status = 'error';
        return true; // include so user can remove/read error
      }
      if (ALLOWED_TYPES.length && !ALLOWED_TYPES.includes(item.file.type)) {
        item.error = `Invalid file type: ${item.file.type || 'unknown'}`;
        item.status = 'error';
      }
      return true;
    });

    setFiles(prev => [...prev, ...newItems]);
  }

  function onInputChange(e) {
    handleFilesAdded(e.target.files);
    e.target.value = null; // reset input
  }

  function onDrop(e) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) handleFilesAdded(e.dataTransfer.files);
  }

  function onDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    setDragActive(false);
  }

  async function uploadSingle(item) {
    // don't upload if already uploading or done
    if (item.status === 'uploading' || item.status === 'done') return;

    const controller = new AbortController();

    setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'uploading', controller, progress: 0, error: null } : f)));

    const form = new FormData();
    form.append('file', item.file);

    try {
      const res = await axios.post(UPLOAD_URL, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal: controller.signal,
        onUploadProgress: (e) => {
          const percent = e.total ? Math.round((e.loaded * 100) / e.total) : 0;
          setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, progress: percent } : f)));
        },
        timeout: 0, // allow large uploads (you may want a sensible timeout in prod)
      });

      // success
      setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: 'done', progress: 100, controller: null } : f)));
      return res.data;
    } catch (err) {
      const isAbort = axios.isCancel?.(err) || err.name === 'CanceledError' || (err.message && err.message === 'canceled');
      setFiles(prev => prev.map(f => (f.id === item.id ? { ...f, status: isAbort ? 'cancelled' : 'error', error: isAbort ? 'Upload cancelled' : (err?.response?.data?.error || err.message || 'Upload failed'), controller: null } : f)));
      return null;
    }
  }

  function uploadAll() {
    // upload all ready or error files
    const toUpload = files.filter(f => f.status === 'ready' || f.status === 'error' || f.status === 'cancelled');
    toUpload.forEach(f => uploadSingle(f));
  }

  function cancelUpload(id) {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        if (f.controller) {
          try { f.controller.abort(); } catch (e) { /* ignore */ }
        }
        return { ...f, status: 'cancelled', controller: null };
      }
      return f;
    }));
  }

  function removeFile(id) {
    setFiles(prev => {
      const toKeep = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return toKeep;
    });
  }

  function clearAll() {
    files.forEach(f => f.preview && URL.revokeObjectURL(f.preview));
    setFiles([]);
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-3">File Uploader</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white'}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={onInputChange}
          multiple
          accept={ALLOWED_TYPES.join(',')}
        />

        <div className="space-y-2">
          <p className="text-gray-700">Drag & drop files here, or click to select</p>
          <p className="text-sm text-gray-500">Allowed: {ALLOWED_TYPES.join(', ')} • Max size: {formatBytes(MAX_FILE_SIZE_BYTES)}</p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={uploadAll} className="px-4 py-2 bg-blue-600 text-black rounded hover:bg-blue-700">Upload all</button>
        <button onClick={clearAll} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Clear</button>
      </div>

      <div className="mt-6 space-y-3">
        {files.length === 0 && (
          <p className="text-sm text-gray-500">No files added yet.</p>
        )}

        {files.map((f) => (
          <div key={f.id} className="flex items-center gap-4 p-3 border rounded">
            <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
              {f.preview ? (
                <img src={f.preview} alt={f.file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-gray-500 px-2 text-center">{f.file.type || 'File'}</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium truncate">{f.file.name}</div>
                  <div className="text-sm text-gray-500">{formatBytes(f.file.size)}</div>
                </div>

                <div className="text-sm">
                  {f.status === 'done' && <span className="text-green-600">Done</span>}
                  {f.status === 'uploading' && <span className="text-blue-600">Uploading {f.progress}%</span>}
                  {f.status === 'ready' && <span className="text-gray-600">Ready</span>}
                  {f.status === 'error' && <span className="text-red-600">Error</span>}
                  {f.status === 'cancelled' && <span className="text-yellow-600">Cancelled</span>}
                </div>
              </div>

              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                  <div style={{ width: `${f.progress}%` }} className="h-full transition-all" />
                </div>
                {f.error && <div className="text-xs text-red-600 mt-1">{f.error}</div>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {(f.status === 'ready' || f.status === 'error' || f.status === 'cancelled') && (
                <button onClick={() => uploadSingle(f)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Upload</button>
              )}

              {f.status === 'uploading' && (
                <button onClick={() => cancelUpload(f.id)} className="px-3 py-1 bg-yellow-400 rounded text-sm">Cancel</button>
              )}

              <button onClick={() => removeFile(f.id)} className="px-3 py-1 bg-gray-100 rounded text-sm">Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-xs text-gray-500">
        {/* <strong>Tip:</strong> This example posts files as `multipart/form-data` to <code>{UPLOAD_URL}</code>. On the server use multer (Node), or equivalent for your backend. */}
      </div>
    </div>
  );
}
