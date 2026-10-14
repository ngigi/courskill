'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      const supabase = createClient();

      if (signup) {
        if (!fullName.trim()) {
          setMsg('Please enter your full name.');
          return;
        }

        const result = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (result.error) {
          setMsg(result.error.message);
        } else {
          setMsg(
            'Account created. Please check your email to confirm your account.'
          );
        }
      } else {
        const result = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (result.error) {
          setMsg(result.error.message);
        } else {
          setMsg('Signed in successfully.');
          router.push('/dashboard');
          router.refresh();
        }
      }
    } catch {
      setMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="section">
      <div className="container" style={{ maxWidth: 500 }}>
        <div className="card">
          <h1>{signup ? 'Create your account' : 'Welcome back'}</h1>

          <p className="muted">
            {signup
              ? 'Start your Courskills learning journey.'
              : 'Sign in to continue learning.'}
          </p>

          <form onSubmit={submit}>
            {signup && (
              <div className="field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={signup ? 'new-password' : 'current-password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </div>

            <button className="btn" type="submit" disabled={loading}>
              {loading
                ? 'Please wait...'
                : signup
                  ? 'Create account'
                  : 'Sign in'}
            </button>
          </form>

          {msg && (
            <p className="muted" role="status" style={{ marginTop: 12 }}>
              {msg}
            </p>
          )}

          <button
            type="button"
            className="btn secondary"
            style={{ marginTop: 10 }}
            onClick={() => {
              setSignup(!signup);
              setMsg('');
            }}
          >
            {signup ? 'I already have an account' : 'Create an account'}
          </button>
        </div>
      </div>
    </main>
  );
}