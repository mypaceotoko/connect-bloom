import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import { enableDemoMode, clearDemoMode } from '../lib/demoSession';
import { getSafeErrorLog } from '../lib/errorMessage';
import { validateInviteCode } from '../lib/inviteCodeApi';
import { clearPendingInviteCode, normalizeInviteCodeInput, setPendingInviteCode } from '../lib/inviteSession';

export function LoginPage() {
  const navigate = useNavigate();
  const { isSupabaseMode, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [inviteCodeStatus, setInviteCodeStatus] = useState<'empty' | 'checking' | 'confirmed' | 'invalid'>('empty');
  const [submitting, setSubmitting] = useState(false);

  function handleInviteCodeChange(value: string) {
    setInviteCode(normalizeInviteCodeInput(value));
    setError('');
    setStatusMessage('');
    setInviteCodeStatus('empty');
  }

  async function handleGoogleLogin() {
    setError('');
    setStatusMessage('');
    const normalizedInviteCode = normalizeInviteCodeInput(inviteCode);

    if (!isSupabaseMode) {
      if (normalizedInviteCode) setPendingInviteCode(normalizedInviteCode);
      clearDemoMode();
      navigate('/onboarding');
      return;
    }

    setSubmitting(true);
    try {
      if (normalizedInviteCode) {
        setInviteCodeStatus('checking');
        setStatusMessage(t('login.status.checkingInvite'));
        const inviteValidation = await validateInviteCode(normalizedInviteCode);
        if (!inviteValidation.ok) {
          console.warn('[Login] invite code validation failed', { success: false, inviteCodeExists: true, normalizedCode: normalizedInviteCode });
          setInviteCodeStatus('invalid');
          setError(t('login.inviteCode.status.invalid'));
          setSubmitting(false);
          setStatusMessage('');
          return;
        }
        setPendingInviteCode(inviteValidation.inviteCode.code);
        clearDemoMode();
        setInviteCodeStatus('confirmed');
        setStatusMessage(t('login.status.inviteConfirmed'));
      } else {
        clearPendingInviteCode();
        clearDemoMode();
        setInviteCodeStatus('empty');
        setStatusMessage(t('login.status.googleWithoutInvite'));
      }
      await signInWithGoogle();
    } catch (caughtError) {
      console.error('[Login] Google login start failed', getSafeErrorLog(caughtError, 'google_login_start'));
      setSubmitting(false);
      setError(t('login.error.googleStart'));
    }
  }

  return (
    <section className="flex min-h-screen items-center px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Link className="inline-flex" to="/">
          <BrandLogo />
        </Link>
        <Card className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-link">
                <span aria-hidden className="inline-block size-1.5 rounded-full bg-theme-yellow ring-1 ring-theme-main-dark/10" />
                Invite-only beta
              </p>
              {!isSupabaseMode ? <span className="rounded-full bg-theme-accent-soft/70 px-2.5 py-1 text-[11px] font-semibold text-theme-main-dark">{t('login.demo')}</span> : null}
            </div>
            <h1 className="text-xl font-bold tracking-[-0.01em]">{t('login.title')}</h1>
            <div className="space-y-1 text-[13px] leading-6 text-theme-muted">
              <p>{t('login.description1')}</p>
              <p>{t('login.description2')}</p>
              <p>{t('login.description3')}</p>
              <p>{t('login.description4')}</p>
            </div>
          </div>
          {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</div> : null}
          {statusMessage ? <div className="rounded-2xl bg-theme-accent-soft/60 p-3 text-xs font-medium leading-5 text-theme-main-dark">{statusMessage}</div> : null}
          <div className="grid gap-1.5 rounded-2xl bg-theme-background/70 p-3.5 text-xs font-medium leading-5 text-theme-muted">
            <p>{t('login.step1')}</p>
            <p>{t('login.step2')}</p>
            <p>{t('login.step3')}</p>
            <p>{t('login.step4')}</p>
          </div>
          <Input
            helperText={t('login.inviteCode.helper')}
            label={t('login.inviteCode.label')}
            autoCapitalize="characters"
            autoCorrect="off"
            inputMode="text"
            name="inviteCode"
            onChange={(event) => handleInviteCodeChange(event.target.value)}
            placeholder={t('login.inviteCode.placeholder')}
            spellCheck={false}
            value={inviteCode}
          />
          <div className={`rounded-2xl p-3 text-xs font-medium leading-5 ${inviteCodeStatus === 'invalid' ? 'bg-red-50 font-semibold text-red-600' : inviteCodeStatus === 'confirmed' ? 'bg-theme-accent-soft/70 font-semibold text-theme-main-dark' : 'bg-theme-background/75 text-theme-muted'}`} role="status">
            {inviteCodeStatus === 'checking'
              ? t('login.inviteCode.status.checking')
              : inviteCodeStatus === 'confirmed'
                ? t('login.inviteCode.status.confirmed')
                : inviteCodeStatus === 'invalid'
                  ? t('login.inviteCode.status.invalid')
                  : inviteCode
                    ? t('login.inviteCode.selected')
                    : t('login.inviteCode.status.empty')}
          </div>
          <div className="space-y-1 rounded-2xl bg-theme-background/60 p-3.5 text-xs font-medium leading-5 text-theme-muted">
            <p>{t('login.google.note1')}</p>
            <p>{t('login.google.note2')}</p>
          </div>
          <Button className="min-h-12 w-full" disabled={submitting} onClick={handleGoogleLogin}>
            <span className="flex size-5 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-theme-link">G</span>
            {submitting ? t('login.google.submitting') : t('login.google')}
          </Button>
          <Link className="block" onClick={enableDemoMode} to="/home">
            <Button className="w-full" variant="secondary">
              {t('login.demoPreview')}
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-medium text-theme-main-dark">
            <Link className="rounded-full border border-theme-border bg-theme-card px-3 py-2 transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40" to="/safety">{t('login.safety')}</Link>
            <Link className="rounded-full border border-theme-border bg-theme-card px-3 py-2 transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40" to="/test-guide">{t('login.testGuide')}</Link>
            <Link className="rounded-full border border-theme-border bg-theme-card px-3 py-2 transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40" to="/terms">{t('login.terms')}</Link>
            <Link className="rounded-full border border-theme-border bg-theme-card px-3 py-2 transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/40" to="/privacy">{t('login.privacy')}</Link>
          </div>
        </Card>
      </div>
    </section>
  );
}
