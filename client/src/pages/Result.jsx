import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, RotateCcw, History } from 'lucide-react';
import RedirectTimeline from '../components/RedirectTimeline';
import { cn } from '../lib/utils';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  // If accessed directly without state, redirect home
  if (!state || !state.result) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border flex items-center justify-center">
          <ArrowLeft className="text-muted-foreground opacity-50" size={24} />
        </div>
        <div className="text-center">
          <p className="text-foreground font-semibold text-lg mb-1">No Trace Found</p>
          <p className="text-muted-foreground text-[15px]">You need to enter a URL on the home page first.</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2 h-10 px-5 mt-2">
          New Trace
        </button>
      </div>
    );
  }

  const { result, url } = state;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-6 text-[13px] font-medium text-muted-foreground">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              New Trace
            </button>
            <span className="text-border">/</span>
            <span className="text-foreground">Result</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 tracking-tight">
            Trace Report
          </h1>
          <div className="flex items-center gap-2 bg-muted/50 border rounded-lg px-4 py-3 shadow-sm inline-flex max-w-full">
            <p className="font-mono text-[14px] text-foreground break-all leading-snug">{url}</p>
          </div>
        </motion.div>

        {/* Timeline */}
        <RedirectTimeline
          chain={result.chain}
          totalTime={result.totalTime}
          finalUrl={result.finalUrl}
          warnings={result.warnings}
        />

        {/* Bottom actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center gap-4 flex-wrap border-t pt-8"
        >
          <button onClick={() => navigate('/')} className="btn-primary flex items-center gap-2 h-11 px-6 text-[14px]">
            <RotateCcw size={16} />
            Trace Another URL
          </button>
          <button onClick={() => navigate('/history')} className="btn-secondary flex items-center gap-2 h-11 px-6 text-[14px]">
            <History size={16} />
            View History
          </button>
        </motion.div>
      </div>
    </div>
  );
}
