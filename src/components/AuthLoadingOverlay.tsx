import { ShieldCheck } from 'lucide-react';

interface AuthLoadingOverlayProps {
  message: string;
}

export default function AuthLoadingOverlay({ message }: AuthLoadingOverlayProps) {
  return (
    <div className="auth-loading-overlay" role="status" aria-live="polite">
      <div className="auth-loading-card">
        <span className="auth-loading-icon">
          <ShieldCheck size={28} />
        </span>
        <span className="auth-loading-spinner" aria-hidden="true" />
        <strong>{message}</strong>
        <p>Please wait while Zovex finishes this step.</p>
      </div>
    </div>
  );
}
