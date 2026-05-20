import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Kanban,
  FileBox,
  Users,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react'

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  const reduced = useReducedMotion()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  const rotate = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 540])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const rotateInner = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -360])

  return (
    <div ref={containerRef} className="relative isolate min-h-screen overflow-x-hidden">
      <AuroraBackdrop />
      <BrandHeader />

      {/* HERO */}
      <section className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-24 pt-10 sm:px-8 md:grid-cols-2 md:items-center md:pt-16 lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="relative z-10 space-y-8"
        >
          <div className="space-y-3">
            {eyebrow && (
              <span className="pill inline-flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-500" />
                {eyebrow}
              </span>
            )}
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl">
              <span className="text-gradient">{title}</span>
            </h1>
            {subtitle && <p className="max-w-md text-base text-ink-500">{subtitle}</p>}
          </div>

          <div className="surface-strong noise relative p-6 sm:p-8">{children}</div>

          {footer && <p className="text-sm text-ink-500">{footer}</p>}
        </motion.div>

        {/* ROTATING ORB */}
        <div className="relative hidden h-[520px] md:block">
          <div className="absolute inset-0 grid place-items-center">
            <motion.div
              style={{ rotate, scale }}
              className="relative aspect-square w-[420px] max-w-full"
            >
              <Orb />
            </motion.div>
            <motion.div
              style={{ rotate: rotateInner }}
              className="pointer-events-none absolute aspect-square w-[300px]"
            >
              <InnerRing />
            </motion.div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="surface-strong absolute left-[-2rem] top-[6rem] flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Kanban size={14} className="text-brand-500" /> Tâche déplacée → Terminé
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              className="surface-strong absolute right-[-1rem] top-[2rem] flex items-center gap-2 px-3 py-2 text-xs"
            >
              <FileBox size={14} className="text-accent-coral" /> Livrable v2.pdf déposé
            </motion.div>
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="surface-strong absolute bottom-[3rem] right-[3rem] flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Users size={14} className="text-brand-600" /> 3 étudiants ajoutés
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <Section
        eyebrow="Pourquoi Campus"
        title="Une plateforme conçue pour les équipes étudiantes."
        description="Le suivi pédagogique mérite mieux qu'un fichier partagé. Voici comment Campus simplifie chaque étape."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Feature
            icon={Kanban}
            title="Kanban temps réel"
            text="Glissez les cartes, vos coéquipiers voient l'avancement sans rafraîchir la page."
            gradient="from-brand-400 to-accent-coral"
          />
          <Feature
            icon={FileBox}
            title="Livrables centralisés"
            text="Upload sécurisé via Supabase Storage. Téléchargeable par toute l'équipe et l'encadrant."
            gradient="from-accent-aqua to-brand-500"
          />
          <Feature
            icon={ShieldCheck}
            title="Sécurité par rôles"
            text="Row Level Security PostgreSQL : chaque utilisateur n'accède qu'à ses projets."
            gradient="from-accent-peach to-accent-coral"
          />
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section
        eyebrow="Workflow"
        title="De l'inscription à la livraison, sans friction."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] }}
              className="surface p-5"
            >
              <p className="font-display text-2xl font-semibold text-brand-500">0{i + 1}</p>
              <p className="mt-2 font-semibold text-ink-900">{s.title}</p>
              <p className="mt-1 text-sm text-ink-500">{s.text}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 via-accent-coral to-accent-peach p-10 text-white shadow-glow"
        >
          <div className="relative z-10 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Prêt à démarrer
              </p>
              <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">
                Lancez votre premier projet en moins de 5 minutes.
              </h3>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-brand-600 shadow-soft transition hover:scale-[1.03]"
            >
              Créer un compte <ArrowRight size={16} />
            </Link>
          </div>
          <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -left-8 bottom-[-3rem] h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        </motion.div>
      </section>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-center text-xs text-ink-400 sm:px-8">
        © {new Date().getFullYear()} Campus · Plateforme pour projets étudiants
      </footer>
    </div>
  )
}

function Section({ eyebrow, title, description, children }) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="mb-8 max-w-2xl"
      >
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-600">{eyebrow}</p>
        )}
        <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
          {title}
        </h2>
        {description && <p className="mt-3 text-sm text-ink-500">{description}</p>}
      </motion.div>
      {children}
    </section>
  )
}

function Feature({ icon: Icon, title, text, gradient }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="surface p-6"
    >
      <div
        className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-glow`}
      >
        <Icon size={18} />
      </div>
      <p className="mt-4 font-semibold text-ink-900">{title}</p>
      <p className="mt-1 text-sm text-ink-500">{text}</p>
    </motion.div>
  )
}

const STEPS = [
  { title: 'Créez un compte', text: 'Étudiant ou encadrant en un clic — le rôle adapte vos écrans.' },
  { title: 'Composez votre équipe', text: 'L\'encadrant invite des étudiants par nom, rôle et permissions.' },
  { title: 'Suivez l\'avancement', text: 'Kanban en temps réel, badges de statut, alertes deadlines.' },
  { title: 'Livrez & validez', text: 'Déposez vos livrables, l\'encadrant valide et donne un retour.' },
]

function BrandHeader() {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
      <Link to="/" className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 via-accent-coral to-accent-peach text-white shadow-glow">
          <Sparkles size={17} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold tracking-tight">Campus</p>
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-400">Projets étudiants</p>
        </div>
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link to="/login" className="text-ink-600 hover:text-ink-900">
          Connexion
        </Link>
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 rounded-2xl bg-ink-900 px-3.5 py-2 text-xs font-semibold text-white shadow-soft transition hover:scale-[1.03]"
        >
          <Zap size={13} /> S'inscrire
        </Link>
      </nav>
    </header>
  )
}

function AuroraBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-[-10rem] top-[-8rem] h-[40rem] w-[40rem] rounded-full bg-gradient-to-br from-accent-coral/45 to-brand-400/50 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[-12rem] top-[10rem] h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-accent-aqua/45 to-brand-300/45 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, 30, -10, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-15rem] left-[20%] h-[36rem] w-[36rem] rounded-full bg-gradient-to-br from-brand-300/50 to-accent-peach/45 blur-3xl"
      />
    </div>
  )
}

function Orb() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      <defs>
        <linearGradient id="orb-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c44ff" />
          <stop offset="55%" stopColor="#ff6f91" />
          <stop offset="100%" stopColor="#ffb38a" />
        </linearGradient>
        <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#orb-g)" />
      <circle cx="200" cy="200" r="190" fill="url(#orb-glow)" opacity="0.6" />
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2
        const x = 200 + Math.cos(a) * 158
        const y = 200 + Math.sin(a) * 158
        return <circle key={i} cx={x} cy={y} r="8" fill="white" opacity={0.55 + (i % 3) * 0.1} />
      })}
      <circle cx="200" cy="200" r="98" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" strokeDasharray="4 6" />
      <circle cx="200" cy="200" r="60" fill="rgba(255,255,255,0.18)" />
      <path d="M170 200 L195 220 L235 180" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function InnerRing() {
  return (
    <svg viewBox="0 0 300 300" className="h-full w-full">
      <defs>
        <linearGradient id="ring-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="140" fill="none" stroke="url(#ring-g)" strokeWidth="1.5" strokeDasharray="2 14" />
      {[0, 90, 180, 270].map((deg) => (
        <g key={deg} transform={`rotate(${deg} 150 150)`}>
          <circle cx="150" cy="10" r="4" fill="white" />
        </g>
      ))}
    </svg>
  )
}
