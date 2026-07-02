import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Flower2,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserCheck,
  UsersRound,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useLanguage } from '../hooks/useLanguage';
import { enableDemoMode } from '../lib/demoSession';

const aboutCards = [
  { icon: Compass, titleKey: 'landing.about.card1.title', bodyKey: 'landing.about.card1.body' },
  { icon: MessageCircle, titleKey: 'landing.about.card2.title', bodyKey: 'landing.about.card2.body' },
  { icon: ClipboardCheck, titleKey: 'landing.about.card3.title', bodyKey: 'landing.about.card3.body' },
] as const;

const featureCards = [
  { icon: UsersRound, titleKey: 'landing.features.find.title', bodyKey: 'landing.features.find.body' },
  { icon: ClipboardCheck, titleKey: 'landing.features.post.title', bodyKey: 'landing.features.post.body' },
  { icon: MessagesSquare, titleKey: 'landing.features.room.title', bodyKey: 'landing.features.room.body' },
  { icon: UserCheck, titleKey: 'landing.features.dm.title', bodyKey: 'landing.features.dm.body' },
] as const;

const fitKeys = [
  'landing.fit.item1',
  'landing.fit.item2',
  'landing.fit.item3',
  'landing.fit.item4',
  'landing.fit.item5',
] as const;

const heroPreviewCards = [
  { titleKey: 'landing.point1', bodyKey: 'landing.heroPreview.item1' },
  { titleKey: 'landing.point2', bodyKey: 'landing.heroPreview.item2' },
  { titleKey: 'landing.point3', bodyKey: 'landing.heroPreview.item3' },
] as const;

const safetyCards = [
  { icon: LockKeyhole, titleKey: 'landing.safety.block.title', bodyKey: 'landing.safety.block.body' },
  { icon: ShieldCheck, titleKey: 'landing.safety.report.title', bodyKey: 'landing.safety.report.body' },
  { icon: MessageCircle, titleKey: 'landing.safety.policy.title', bodyKey: 'landing.safety.policy.body' },
] as const;

type LandingSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

function LandingSection({ eyebrow, title, description, children }: LandingSectionProps) {
  return (
    <section className="scroll-mt-8 space-y-5">
      <div className="space-y-2">
        {eyebrow && (
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-link">
            <span aria-hidden className="inline-block size-1.5 rounded-full bg-theme-yellow ring-1 ring-theme-main-dark/10" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-bold tracking-[-0.02em] text-theme-text sm:text-3xl">{title}</h2>
        {description && <p className="max-w-2xl text-[15px] leading-7 text-theme-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function CtaButtons() {
  const { t } = useLanguage();

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Link className="min-w-0" to="/login">
        <Button className="min-h-12 w-full text-[15px]">
          {t('landing.start')}
          <ArrowRight size={18} />
        </Button>
      </Link>
      <Link className="min-w-0" onClick={enableDemoMode} to="/home">
        <Button className="min-h-12 w-full text-[15px]" variant="secondary">
          {t('landing.demo')}
        </Button>
      </Link>
    </div>
  );
}

export function LandingPage() {
  const { t } = useLanguage();

  return (
    <main className="landing-page relative min-h-screen overflow-x-hidden px-4 pb-[calc(env(safe-area-inset-bottom)+4rem)] pt-4 text-theme-text sm:px-6 sm:pt-5">
      <div className="pointer-events-none absolute -left-28 top-24 size-80 rounded-full bg-theme-yellow/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-4 size-96 rounded-full bg-theme-sky/20 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 sm:gap-10">
        <header className="flex items-center justify-between gap-3 pt-1">
          <span className="logo-plate inline-flex min-w-0 overflow-hidden px-2 py-1">
            <BrandLogo
              className="min-w-0"
              imageClassName="max-h-12 drop-shadow-none sm:max-h-14"
              variant="default"
            />
          </span>
          <span className="shrink-0 rounded-full border border-theme-border bg-theme-card/90 px-3.5 py-1.5 text-[11px] font-semibold text-theme-main-dark shadow-[var(--shadow-card)]">
            {t('landing.inviteOnly')}
          </span>
        </header>

        <section className="grid min-h-[calc(100dvh-9rem)] content-center gap-8 py-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-theme-border bg-theme-card/80 px-3.5 py-1.5 text-xs font-semibold text-theme-main-dark backdrop-blur">
              <Sparkles className="text-theme-link" size={14} />
              <span className="truncate">{t('landing.heroLabel')}</span>
            </div>
            <div className="space-y-4">
              <h1 className="break-words text-[2.7rem] font-bold leading-[1.14] tracking-[-0.03em] text-theme-text sm:text-6xl sm:leading-[1.12]">
                {t('landing.title').split('\n').map((line, index, lines) => (
                  <span className="block" key={line}>
                    {index === lines.length - 1 ? <span className="hero-title-underline">{line}</span> : line}
                  </span>
                ))}
              </h1>
              <p className="text-lg font-semibold leading-8 text-theme-main-dark">{t('landing.subtitle')}</p>
              <p className="max-w-xl text-[15px] leading-8 text-theme-muted sm:text-base">{t('landing.body')}</p>
            </div>
            <div className="max-w-xl">
              <CtaButtons />
            </div>
          </div>

          <Card className="relative grid gap-2.5 p-5">
            <span aria-hidden className="absolute -top-3.5 right-5 flex size-9 items-center justify-center rounded-full bg-theme-yellow text-theme-main-dark shadow-[var(--shadow-card)]">
              <Flower2 size={18} />
            </span>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-link">{t('landing.heroPreview.eyebrow')}</p>
            {heroPreviewCards.map((item, index) => (
              <div className="flex gap-3 rounded-2xl bg-theme-accent-soft/40 p-3.5" key={item.titleKey}>
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-theme-card text-xs font-bold text-theme-link shadow-[0_1px_2px_rgba(16,42,67,0.08)]">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold text-theme-text">{t(item.titleKey)}</span>
                  <span className="mt-0.5 block text-sm leading-6 text-theme-muted">{t(item.bodyKey)}</span>
                </span>
              </div>
            ))}
          </Card>
        </section>

        <LandingSection description={t('landing.about.description')} eyebrow="ABOUT" title={t('landing.about.title')}>
          <div className="grid gap-3 sm:grid-cols-3">
            {aboutCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card className="landing-card-pop" key={item.titleKey}>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-theme-accent-soft/70 text-theme-link ring-1 ring-theme-border/70">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold text-theme-text">{t(item.titleKey)}</h3>
                  <p className="mt-1 text-sm leading-6 text-theme-muted">{t(item.bodyKey)}</p>
                </Card>
              );
            })}
          </div>
        </LandingSection>

        <LandingSection description={t('landing.features.description')} eyebrow="FEATURES" title={t('landing.features.title')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {featureCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card className="landing-card-pop flex gap-3" key={item.titleKey}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-theme-accent-soft/70 text-theme-link ring-1 ring-theme-border/70">
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-theme-text">{t(item.titleKey)}</span>
                    <span className="mt-1 block text-sm leading-6 text-theme-muted">{t(item.bodyKey)}</span>
                  </span>
                </Card>
              );
            })}
          </div>
        </LandingSection>

        <LandingSection description={t('landing.fit.description')} eyebrow="FOR YOU" title={t('landing.fit.title')}>
          <Card>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {fitKeys.map((key) => (
                <div className="flex gap-2 text-[15px] leading-6 text-theme-text" key={key}>
                  <CheckCircle2 className="mt-0.5 shrink-0 text-theme-link" size={18} />
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </Card>
        </LandingSection>

        <LandingSection description={t('landing.inviteReason.description')} eyebrow="INVITE" title={t('landing.inviteReason.title')}>
          <Card className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-theme-accent-soft/70 text-theme-link ring-1 ring-theme-border/70">
              <Ticket size={22} strokeWidth={1.9} />
            </span>
            <div className="space-y-2 text-[15px] leading-7 text-theme-muted">
              <p>{t('landing.inviteReason.body1')}</p>
              <p>{t('landing.inviteReason.body2')}</p>
              <p className="font-semibold text-theme-text">{t('landing.inviteReason.body3')}</p>
            </div>
          </Card>
        </LandingSection>

        <LandingSection description={t('landing.safety.description')} eyebrow="SAFETY" title={t('landing.safety.title')}>
          <div className="grid gap-3 sm:grid-cols-3">
            {safetyCards.map((item) => {
              const Icon = item.icon;
              return (
                <Card className="landing-card-pop" key={item.titleKey}>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-theme-accent-soft/70 text-theme-link ring-1 ring-theme-border/70">
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-3 text-[15px] font-semibold text-theme-text">{t(item.titleKey)}</h3>
                  <p className="mt-1 text-sm leading-6 text-theme-muted">{t(item.bodyKey)}</p>
                </Card>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-full border border-theme-border bg-theme-card px-4 py-2 text-[13px] font-medium text-theme-main-dark transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/50" to="/safety">{t('landing.safety.linkGuide')}</Link>
            <Link className="rounded-full border border-theme-border bg-theme-card px-4 py-2 text-[13px] font-medium text-theme-main-dark transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/50" to="/terms">{t('landing.safety.linkTerms')}</Link>
            <Link className="rounded-full border border-theme-border bg-theme-card px-4 py-2 text-[13px] font-medium text-theme-main-dark transition hover:border-theme-sky/50 hover:bg-theme-accent-soft/50" to="/privacy">{t('landing.safety.linkPrivacy')}</Link>
          </div>
        </LandingSection>

        <LandingSection description={t('landing.beta.description')} eyebrow="BETA" title={t('landing.beta.title')}>
          <Card>
            <p className="text-[15px] leading-7 text-theme-muted">{t('landing.beta.body')}</p>
            <Link className="mt-4 inline-flex rounded-full border border-theme-border bg-theme-accent-soft/60 px-4 py-2 text-[13px] font-medium text-theme-main-dark transition hover:bg-theme-accent-soft" to="/test-guide">{t('landing.beta.link')}</Link>
          </Card>
        </LandingSection>

        <section className="relative mb-2 overflow-hidden rounded-[1.8rem] border border-theme-border bg-theme-card p-6 text-center shadow-[var(--shadow-card)] sm:p-10">
          <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 size-48 rounded-full bg-theme-yellow/20 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-14 size-56 rounded-full bg-theme-sky/25 blur-3xl" />
          <div className="relative">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-theme-link">
              <span aria-hidden className="inline-block size-1.5 rounded-full bg-theme-yellow ring-1 ring-theme-main-dark/10" />
              ConnectBloom
            </p>
            <h2 className="mt-3 text-2xl font-bold leading-snug tracking-[-0.02em] text-theme-text sm:text-4xl">{t('landing.final.title')}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] leading-7 text-theme-muted">{t('landing.final.body')}</p>
            <div className="mx-auto mt-6 max-w-xl">
              <CtaButtons />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
