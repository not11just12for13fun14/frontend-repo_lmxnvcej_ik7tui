import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Sparkles, Zap, Crown, RotateCw, ChevronRight, Star } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

const rarityGradient = {
  Common: 'from-slate-800/80 via-slate-700/60 to-slate-900/80',
  Rare: 'from-sky-600/70 via-sky-700/60 to-indigo-800/80',
  'Super Rare': 'from-emerald-600/70 via-teal-700/60 to-cyan-800/80',
  'Ultra Rare': 'from-fuchsia-600/70 via-violet-700/60 to-indigo-800/80',
  Legendary: 'from-amber-500/80 via-rose-600/70 to-violet-800/80',
}

function Shine() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-[40%] rotate-12">
        <div className="animate-pulse duration-[2500ms] bg-[conic-gradient(from_180deg_at_50%_50%,rgba(255,255,255,0.05)_0deg,rgba(255,255,255,0.2)_60deg,transparent_120deg,transparent_360deg)] blur-2xl h-full w-full" />
      </div>
    </div>
  )
}

function Foil({ rarity }) {
  const colors = {
    Common: 'to-slate-400/10',
    Rare: 'to-sky-300/20',
    'Super Rare': 'to-emerald-300/25',
    'Ultra Rare': 'to-fuchsia-300/30',
    Legendary: 'to-amber-300/40',
  }
  return (
    <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent ${colors[rarity]} mix-blend-overlay`} />
  )
}

function Card({ card, index, onReveal, revealed }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-150, 150], [12, -12])
  const rotateY = useTransform(x, [-150, 150], [-12, 12])

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - rect.left - rect.width / 2
    const dy = e.clientY - rect.top - rect.height / 2
    x.set(dx)
    y.set(dy)
  }

  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0) }}
      style={{ rotateX, rotateY }}
      className={`relative aspect-[2.5/3.5] w-[180px] sm:w-[200px] md:w-[240px] [transform-style:preserve-3d] cursor-pointer`}
      onClick={() => onReveal(index)}
      initial={{ scale: 0.8, opacity: 0, y: 40 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: index * 0.05 }}
    >
      <div className={`absolute inset-0 rounded-xl p-[6px] bg-gradient-to-br ${rarityGradient[card.rarity]} shadow-2xl`}></div>
      <div className="absolute inset-[6px] rounded-[10px] bg-gradient-to-br from-neutral-100/90 to-neutral-200/80 backdrop-blur-xl overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_30%_20%,white,transparent_45%),radial-gradient(circle_at_70%_80%,white,transparent_35%)]" />
        <img src={card.art} alt={card.name} className={`h-full w-full object-cover ${revealed ? '' : 'blur-xl scale-110'} transition-all duration-700`} />
        <Foil rarity={card.rarity} />
        <Shine />
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-white/80 uppercase tracking-widest">{card.rarity}</p>
              <h3 className="text-white font-semibold text-sm sm:text-lg drop-shadow-lg">{revealed ? card.name : 'Tap to reveal'}</h3>
            </div>
            {revealed && (
              <div className="text-right text-white/90">
                <p className="text-[10px] sm:text-xs">ATK {card.attack}</p>
                <p className="text-[10px] sm:text-xs">DEF {card.defense}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {!revealed && (
        <motion.div
          className="absolute inset-0 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.05 + 0.4 }}
        >
          <Sparkles className="text-white/70" />
        </motion.div>
      )}
    </motion.div>
  )
}

function Fireworks({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          {[...Array(14)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [0, 1.2, 0.8, 0],
                opacity: [0, 1, 1, 0],
                x: [0, (Math.random() - 0.5) * 600],
                y: [0, (Math.random() - 0.5) * 600],
                rotate: [0, 45, 0],
              }}
              transition={{ duration: 2.2, delay: i * 0.05 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <Star className="text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]" size={24 + Math.random() * 24} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [pack, setPack] = useState([])
  const [revealed, setRevealed] = useState({})
  const [celebrate, setCelebrate] = useState(false)

  const revealCard = (idx) => {
    setRevealed((r) => ({ ...r, [idx]: true }))
    const card = pack[idx]
    if (card && (card.rarity === 'Ultra Rare' || card.rarity === 'Legendary')) {
      setCelebrate(true)
      setTimeout(() => setCelebrate(false), 2400)
    }
  }

  const fetchPack = async () => {
    setLoading(true)
    setRevealed({})
    try {
      const res = await fetch(`${API_BASE}/api/open-pack?size=10`)
      const data = await res.json()
      setPack(data.pack)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPack()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,#0f172a,transparent_40%),radial-gradient(circle_at_80%_30%,#1e293b,transparent_40%),radial-gradient(circle_at_50%_80%,#0b1324,transparent_40%)] text-white">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-light.png')] opacity-[0.03]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />

      <header className="relative z-10 flex items-center justify-between p-4 sm:p-6">
        <div className="flex items-center gap-2">
          <Crown className="text-amber-400" />
          <span className="tracking-widest uppercase text-sm text-white/70">Majestic Archive</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPack}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-4 py-2 text-sm font-semibold shadow-lg shadow-fuchsia-600/20 hover:shadow-fuchsia-500/30 active:scale-[.99] disabled:opacity-60"
          >
            <RotateCw size={16} /> New Pack
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24">
        <div className="mx-auto mt-6 text-center">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-fuchsia-300 to-indigo-300 drop-shadow-[0_2px_12px_rgba(168,85,247,0.45)]">
            The Thrill of the Reveal
          </h1>
          <p className="mt-2 text-white/70 max-w-2xl mx-auto">
            A refined take on TCG pack opening. Fluid motion, luxurious foils, and grown-up vibes.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 place-items-center">
          {pack.map((card, i) => (
            <Card key={card.id + i} card={card} index={i} onReveal={revealCard} revealed={!!revealed[i]} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => setRevealed(Object.fromEntries(pack.map((_, i) => [i, true])))}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 px-4 py-2 text-sm font-medium"
          >
            Reveal All <ChevronRight size={16} />
          </button>
        </div>
      </main>

      <Fireworks show={celebrate} />

      {/* Ambient dust */}
      <div className="pointer-events-none fixed inset-0">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: [0, (Math.random()-0.5)*100], y: [0, (Math.random()-0.5)*120] }}
            transition={{ duration: 6 + Math.random() * 6, delay: Math.random() * 4, repeat: Infinity }}
            style={{ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, width: 2 + Math.random()*4, height: 2 + Math.random()*4 }}
          />
        ))}
      </div>
    </div>
  )
}
