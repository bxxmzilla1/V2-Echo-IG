import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { verifyAppPassword } from '../lib/appAuth';
import { APP_NAME } from '../lib/appName';

type Props = {
  onSuccess: () => void;
};

export function PasswordPage({ onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAppPassword(value)) {
      setError(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 px-4 text-zinc-100">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-glow backdrop-blur-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ig_blue/20 text-ig_blue">
            <Lock className="h-6 w-6" aria-hidden />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">{APP_NAME}</h1>
          <p className="text-sm text-zinc-500">Enter the access password to continue.</p>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="password"
            name="app-password"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            autoComplete="off"
            placeholder="Password"
            className="w-full rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-sky-500/40 focus:ring-2 focus:ring-sky-500/20"
            autoFocus
          />
          {error && (
            <p className="text-center text-sm text-red-400" role="alert">
              Wrong password. Try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-xl bg-ig_blue py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:brightness-110"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
