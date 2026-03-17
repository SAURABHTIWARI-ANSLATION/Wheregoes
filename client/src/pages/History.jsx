import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Link2, ChevronRight, RefreshCw, Inbox, AlertTriangle } from 'lucide-react';
import { getHistory, isConfigured } from '../services/firebase';
import { cn } from '../lib/utils';

function formatTime(timestamp) {
  if (!timestamp) return '—';
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-card border rounded-xl p-5 animate-pulse flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    const items = await getHistory(50);
    setHistory(items);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchHistory();
      setLoading(false);
    })();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  const handleView = (item) => {
    navigate('/result', { state: { result: item.result, url: item.url } });
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-6 text-[13px] font-medium text-muted-foreground">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors group"
            >
              <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
              New Trace
            </button>
            <span className="text-border">/</span>
            <span className="text-foreground">History</span>
          </div>

          <div className="flex items-end justify-between flex-wrap gap-4 border-b border-border pb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Trace History</h1>
              <p className="text-muted-foreground text-[15px] mt-1.5">Past redirect analyses & reports</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || !isConfigured}
              className="btn-secondary h-10 px-4 text-[13px] gap-2"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin text-primary' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </motion.div>

        {/* Firebase Notice */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-4"
          >
            <AlertTriangle size={18} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-semibold text-[14px] mb-1">Database not configured</p>
              <p className="text-amber-700/80 dark:text-amber-400/80 text-[13px] leading-relaxed">
                Add your Firebase credentials to <code className="font-mono bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200">.env</code> to persist your trace history across sessions.
              </p>
            </div>
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <HistorySkeleton />
        ) : history.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 gap-5 text-center border rounded-2xl border-dashed bg-muted/30"
          >
            <div className="w-16 h-16 rounded-2xl bg-card border shadow-sm flex items-center justify-center">
              <Inbox size={24} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-foreground font-semibold text-lg mb-1">No Trace History</p>
              <p className="text-muted-foreground text-[15px]">Results will appear here automatically.</p>
            </div>
            <button onClick={() => navigate('/')} className="btn-primary h-10 px-5 mt-2">
              Trace a URL
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="space-y-3"
          >
            {history.map((item) => (
              <motion.button
                key={item.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                onClick={() => handleView(item)}
                className="w-full text-left bg-card border shadow-sm hover:shadow-md hover:border-primary/30 rounded-xl p-4 sm:p-5 flex items-center gap-4 group transition-all duration-200"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground text-primary transition-colors">
                  <Link2 size={16} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-mono font-medium text-foreground truncate">{item.url}</p>
                  
                  <div className="flex items-center gap-x-4 gap-y-2 mt-2 flex-wrap">
                    <span className="text-[12px] text-muted-foreground font-medium flex items-center gap-1.5 bg-muted px-2 py-0.5 rounded">
                      <Clock size={11} className="text-primary/60" />
                      {formatTime(item.timestamp)}
                    </span>
                    
                    {item.result?.chain && (
                      <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                        <span className="font-semibold text-foreground/80">{item.result.chain.length}</span> hop{item.result.chain.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {item.result?.warnings?.length > 0 && (
                      <span className="text-[12px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                        <AlertTriangle size={11} />
                        {item.result.warnings.length} warning{item.result.warnings.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted/50 group-hover:bg-primary/10 flex-shrink-0 transition-colors">
                  <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
