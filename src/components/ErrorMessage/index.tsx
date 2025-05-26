import "./ErrorMessage.css";

interface ErrorMessageProps {
  error: string;
  onDismiss: () => void;
}

export function ErrorMessage({ error, onDismiss }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <div className="error-text">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
        <button
          className="error-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ×
        </button>
      </div>
    </div>
  );
}
