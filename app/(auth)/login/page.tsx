'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function Login() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [signup, setSignup] = useState(false);
const [msg, setMsg] = useState('');
const router = useRouter();

async function submit(e: React.FormEvent) {
e.preventDefault();

```
const s = createClient();
const result = signup
  ? await s.auth.signUp({ email, password })
  : await s.auth.signInWithPassword({ email, password });

if (result.error) {
  setMsg(result.error.message);
} else {
  setMsg(
    signup
      ? 'Check your email to confirm your account.'
      : 'Signed in.'
  );

  if (!signup) router.push('/dashboard');
}
```

}

return ( <main className="section">
<div className="container" style={{ maxWidth: 500 }}> <div className="card"> <h1>{signup ? 'Create your account' : 'Welcome back'}</h1> <p className="muted">
{signup
? 'Start your Courskills learning journey.'
: 'Sign in to continue learning.'} </p>

```
      <form onSubmit={submit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn" type="submit">
          {signup ? 'Create account' : 'Sign in'}
        </button>
      </form>

      {msg && <p className="muted">{msg}</p>}

      <button
        className="btn secondary"
        style={{ marginTop: 10 }}
        onClick={() => setSignup(!signup)}
      >
        {signup ? 'I already have an account' : 'Create an account'}
      </button>
    </div>
  </div>
</main>
```

);
}
