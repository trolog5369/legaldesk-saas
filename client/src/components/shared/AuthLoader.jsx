import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../services/api';
import { restoreSession } from '../../store/slices/authSlice';

/**
 * AuthLoader wraps the entire app.
 * On mount it attempts a silent token refresh using the httpOnly refresh
 * cookie. If the cookie is valid the new access token + user are written
 * into Redux state so ProtectedRoute finds them immediately.
 * While the check is in flight a full-screen loader is shown so the router
 * never sees an empty accessToken and bounces the user to /login.
 *
 * NOTE: The api.js interceptor has a guard to skip retry logic when the
 * failing request is the refresh endpoint itself, so this call is safe.
 */
export default function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const tryRestoreSession = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data?.accessToken) {
          dispatch(restoreSession({
            accessToken: res.data.accessToken,
            user: res.data.user ?? null,
          }));
        }
      } catch {
        // No valid refresh cookie — user stays logged out, nothing to do
      } finally {
        setChecking(false);
      }
    };

    tryRestoreSession();
  }, [dispatch]);

  if (checking) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0F172A',
        }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return children;
}
