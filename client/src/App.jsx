import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const BulkChecker = lazy(() => import('./pages/BulkChecker'));
const ApiTester = lazy(() => import('./pages/ApiTester'));
const Result = lazy(() => import('./pages/Result'));
const History = lazy(() => import('./pages/History'));

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  duration: 0.25,
  ease: 'easeInOut',
};

function AnimatedRoute({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route
                path="/"
                element={
                  <AnimatedRoute>
                    <Home />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/result"
                element={
                  <AnimatedRoute>
                    <Result />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/bulk"
                element={
                  <AnimatedRoute>
                    <BulkChecker />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/tester"
                element={
                  <AnimatedRoute>
                    <ApiTester />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <AnimatedRoute>
                    <History />
                  </AnimatedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <p className="text-6xl font-black text-slate-700">404</p>
                    <p className="text-slate-400">Page not found</p>
                    <a href="/" className="btn-primary mt-2">Go Home</a>
                  </div>
                }
              />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 px-4 text-center">
          <p className="text-xs text-slate-600">
            WhereGoes — Redirect Trace Tool · Built with ❤️ using React + Express
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
