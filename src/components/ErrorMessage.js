import React from 'react';
import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry, retryLabel = 'Try Again' }) {
  return (
    <div className="error-container">
      <div className="error-icon">🍰</div>
      <h2 className="error-title">Oops, something went wrong</h2>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn-primary error-btn" onClick={onRetry}>
          {retryLabel}
        </button>
      )}
    </div>
  );
}
