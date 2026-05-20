import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import TopNav from './TopNav'
import AuroraBg from './AuroraBg'

export default function AppLayout() {
  const location = useLocation()
  return (
    <div className="relative isolate min-h-screen overflow-x-hidden">
      <AuroraBg />
      <TopNav />
      <main className="relative px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="mx-auto max-w-6xl"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
