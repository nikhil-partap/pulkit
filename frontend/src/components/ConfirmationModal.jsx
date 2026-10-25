import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Withdraw Application',
  message = 'Are you sure you want to withdraw your application?',
  subMessage,
  confirmText = 'Withdraw application',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="kairos-modal-overlay" onClick={isLoading ? undefined : onCancel}>
      <div
        className="kairos-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div className="kairos-modal-header">
          <div className="kairos-modal-icon-badge">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            className="kairos-modal-close-btn"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="kairos-modal-body">
          <h2 id="confirm-modal-title">{message}</h2>
          {subMessage && <p className="kairos-modal-submessage">{subMessage}</p>}
        </div>

        <div className="kairos-modal-actions">
          <button
            type="button"
            className="kairos-modal-cancel-btn"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="kairos-modal-confirm-btn"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Withdrawing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
