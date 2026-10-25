'use client';
import React from 'react';
import { useToast } from '../lib/toast-context';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import '../styles/toast.css';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => {
        let IconComponent = Info;
        if (toast.type === 'success') IconComponent = CheckCircle2;
        if (toast.type === 'error') IconComponent = AlertCircle;
        if (toast.type === 'warning') IconComponent = AlertTriangle;

        return (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div className="toast-content">
              <IconComponent size={20} />
              <span>{toast.message}</span>
            </div>
            <button
              className="toast-close-btn"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
