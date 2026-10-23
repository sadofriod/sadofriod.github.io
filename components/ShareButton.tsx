'use client';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

interface ShareButtonProps {
  title: string;
  url: string;
  text?: string;
}

const menuItemStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  border: 0,
  background: 'transparent',
  padding: '9px 10px',
  fontFamily: 'var(--brutal-mono)',
  fontSize: '0.82rem',
  color: 'var(--ink)',
  cursor: 'pointer',
};

const ShareButton: React.FC<ShareButtonProps> = ({ title, url, text }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [showWeChatDialog, setShowWeChatDialog] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Auto-dismiss the "copied" toast, same 3s window the snackbar used.
  useEffect(() => {
    if (!showCopyAlert) return;
    const timer = setTimeout(() => setShowCopyAlert(false), 3000);
    return () => clearTimeout(timer);
  }, [showCopyAlert]);

  // Close the fallback menu on outside click / Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleClick = async () => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || title,
          url,
        });
        return;
      } catch (err) {
        // User cancelled or error occurred, fall back to menu
      }
    }

    // Fallback to custom share menu
    setMenuOpen(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setShowCopyAlert(true);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyAlert(true);
    }
    setMenuOpen(false);
  };

  const handleWeChatShare = () => {
    setShowWeChatDialog(true);
    setMenuOpen(false);
  };

  const generateQRCodeUrl = (value: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
  };

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  };

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="brutal-btn"
        onClick={handleClick}
        title="Share this post"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        style={{ cursor: 'pointer' }}
      >
        Share
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="brutal-card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            zIndex: 60,
            minWidth: '190px',
            padding: '8px',
            boxShadow: '6px 6px 0 var(--ink)',
          }}
        >
          <button
            type="button"
            role="menuitem"
            style={menuItemStyle}
            onClick={() => { window.open(shareUrls.twitter, '_blank'); setMenuOpen(false); }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--yellow)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
          >
            Share on Twitter
          </button>
          <button
            type="button"
            role="menuitem"
            style={menuItemStyle}
            onClick={() => { window.open(shareUrls.facebook, '_blank'); setMenuOpen(false); }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--yellow)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
          >
            Share on Facebook
          </button>
          <button
            type="button"
            role="menuitem"
            style={menuItemStyle}
            onClick={() => { window.open(shareUrls.linkedin, '_blank'); setMenuOpen(false); }}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--yellow)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
          >
            Share on LinkedIn
          </button>
          <button
            type="button"
            role="menuitem"
            style={menuItemStyle}
            onClick={handleWeChatShare}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--yellow)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
          >
            Share to WeChat
          </button>
          <button
            type="button"
            role="menuitem"
            style={menuItemStyle}
            onClick={handleCopyLink}
            onMouseEnter={(event) => { event.currentTarget.style.background = 'var(--yellow)'; }}
            onMouseLeave={(event) => { event.currentTarget.style.background = 'transparent'; }}
          >
            Copy link
          </button>
        </div>
      )}

      {/* WeChat Share Dialog */}
      {showWeChatDialog && (
        <div
          className="brutal-dialog"
          role="dialog"
          aria-modal="true"
          aria-label="Share to WeChat"
          onClick={() => setShowWeChatDialog(false)}
        >
          <div
            className="brutal-dialog__panel"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="brutal-dialog__title">Share to WeChat</h2>
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <img
                src={generateQRCodeUrl(url)}
                alt="QR Code for WeChat sharing"
                style={{ maxWidth: '180px', width: '100%', height: 'auto', border: '2px solid var(--ink)' }}
              />
              <p style={{ margin: '16px 0 0', fontSize: '0.85rem', opacity: 0.75 }}>
                Scan this QR code with WeChat to share
              </p>
              <p style={{ margin: '8px 0 0', fontWeight: 700, fontSize: '0.9rem' }}>
                {title}
              </p>
            </div>
            <div className="brutal-dialog__actions">
              <button type="button" className="brutal-btn" onClick={handleCopyLink} style={{ cursor: 'pointer' }}>
                Copy Link
              </button>
              <button
                type="button"
                className="brutal-btn brutal-btn--ink"
                onClick={() => setShowWeChatDialog(false)}
                style={{ cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCopyAlert && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1500,
            border: '3px solid var(--ink)',
            background: 'var(--mint)',
            boxShadow: '5px 5px 0 var(--ink)',
            padding: '10px 16px',
            fontFamily: 'var(--brutal-mono)',
            fontSize: '0.85rem',
          }}
        >
          Link copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default ShareButton;
