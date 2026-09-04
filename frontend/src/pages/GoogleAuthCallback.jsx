import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function GoogleAuthCallback() {
  const nav = useNavigate();
  const location = useLocation();
  const { loginWithGoogle } = useAuth();
  const [statusText, setStatusText] = useState('Connecting to Google Accounts...');

  useEffect(() => {
    const processGoogleAuth = async () => {
      try {
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        const params = new URLSearchParams(hash || search);

        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
          toast.error('Google Sign-In cancelled or error: ' + error);
          nav('/login');
          return;
        }

        let email = '';
        let name = 'Google User';
        let avatar = '';

        if (idToken) {
          try {
            const base64Url = idToken.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            const payload = JSON.parse(jsonPayload);
            email = payload.email;
            name = payload.name || payload.given_name || 'Google User';
            avatar = payload.picture || '';
          } catch (e) {
            console.warn('Could not parse Google ID Token locally:', e);
          }
        }

        if (accessToken && (!email || !avatar)) {
          setStatusText('Retrieving your Google profile...');
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: 'Bearer ' + accessToken },
            });
            if (res.ok) {
              const profile = await res.json();
              email = profile.email || email;
              name = profile.name || profile.given_name || name;
              avatar = profile.picture || avatar;
            }
          } catch (e) {
            console.warn('Could not fetch userinfo from Google API:', e);
          }
        }

        if (!email) {
          toast.error('Could not retrieve email from Google. Please try signing in again.');
          nav('/login');
          return;
        }

        setStatusText('Signing in as ' + email + '...');
        const loginRes = await loginWithGoogle({
          email,
          name,
          avatar,
          idToken: idToken || accessToken,
        });

        if (loginRes.ok) {
          toast.success('Welcome, ' + name + '! Successfully signed in via Google.');
          const userObj = loginRes.user;
          const hasSub = userObj?.is_admin || (userObj?.subscription && userObj?.subscription.status === 'active');
          nav(hasSub ? '/app' : '/subscribe');
        } else {
          toast.error(loginRes.error || 'Failed to complete Google authentication.');
          nav('/login');
        }
      } catch (err) {
        console.error('Google Auth Callback Error:', err);
        toast.error('An error occurred while signing in with Google.');
        nav('/login');
      }
    };

    processGoogleAuth();
  }, [location, loginWithGoogle, nav]);

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center'>
      <div className='bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-sm w-full space-y-4'>
        <div className='w-14 h-14 mx-auto rounded-2xl bg-slate-50 border border-slate-200 grid place-items-center shadow-xs'>
          <svg width='28' height='28' viewBox='0 0 24 24'>
            <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
            <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
            <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z' />
            <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z' />
          </svg>
        </div>
        <div className='space-y-1'>
          <h2 className='font-bold text-slate-900 text-lg'>Google Accounts</h2>
          <p className='text-xs text-slate-500 font-medium'>{statusText}</p>
        </div>
        <div className='pt-2'>
          <div className='w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto' />
        </div>
      </div>
    </div>
  );
}
