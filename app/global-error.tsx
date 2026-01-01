'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f3f4f6',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '28rem',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            {/* Error Icon */}
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              ⚠️
            </div>

            {/* Heading */}
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '1rem'
            }}>
              Application Error
            </h2>

            {/* Description */}
            <p style={{
              color: '#6b7280',
              marginBottom: '2rem',
              lineHeight: '1.5'
            }}>
              We're sorry, but something went wrong. The application encountered an unexpected error and needs to be refreshed.
            </p>

            {/* Error Details */}
            {error.message && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <p style={{
                  color: '#7f1d1d',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  overflowWrap: 'break-word'
                }}>
                  {error.message}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              justifyContent: 'center'
            }}>
              <button
                onClick={reset}
                style={{
                  backgroundColor: '#1e40af',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1e3a8a')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1e40af')}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  backgroundColor: 'white',
                  color: '#1e40af',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #1e40af',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
              >
                Go Home
              </a>
            </div>

            {/* Support Info */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <p style={{
                color: '#6b7280',
                fontSize: '0.875rem'
              }}>
                If this problem persists, please contact{' '}
                <a
                  href="mailto:support@landforsaleinabuja.ng"
                  style={{
                    color: '#1e40af',
                    textDecoration: 'underline'
                  }}
                >
                  support@landforsaleinabuja.ng
                </a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
