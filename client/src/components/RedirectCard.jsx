import { motion } from 'framer-motion';
import { ExternalLink, Clock, AlertTriangle } from 'lucide-react';
import HeaderInspector from './HeaderInspector';
import { cn } from '../lib/utils';

function getStatusClass(status) {
  if (!status) return 'status-err';
  if (status >= 200 && status < 300) return 'status-2xx';
  if (status >= 300 && status < 400) return 'status-3xx';
  if (status >= 400 && status < 500) return 'status-4xx';
  if (status >= 500) return 'status-5xx';
  return 'status-err';
}

function getStatusLabel(status) {
  const labels = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    303: 'See Other',
    307: 'Temporary Redirect',
    308: 'Permanent Redirect',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Server Error',
    502: 'Bad Gateway',
    503: 'Unavailable',
  };
  return labels[status] || `HTTP ${status}`;
}

export default function RedirectCard({ step, index, isLast }) {
  const statusClass = getStatusClass(step.status);
  const isSuccess = step.status >= 200 && step.status < 300;
  const isRedirect = step.status >= 300 && step.status < 400;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative flex gap-4 sm:gap-6"
    >
      {/* Structural Timeline Connector */}
      <div className="relative flex-shrink-0 flex flex-col items-center">
        {/* Node */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05 + 0.1, type: 'spring', stiffness: 300 }}
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold z-10 flex-shrink-0 bg-background shadow-xs",
            isSuccess ? "border-emerald-500 text-emerald-500" :
            isRedirect ? "border-amber-500 text-amber-500" :
            step.status >= 400 ? "border-rose-500 text-rose-500" :
            "border-muted-foreground text-muted-foreground"
          )}
        >
          {index + 1}
        </motion.div>
        
        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 bg-border my-1" style={{ minHeight: '3rem' }} />
        )}
      </div>

      {/* Card Body */}
      <div className={cn(
        "flex-1 mb-8 bg-card border shadow-sm rounded-xl p-4 sm:p-5 transition-all duration-300",
        isLast && "ring-1 ring-primary/20 border-primary/30"
      )}>
        {/* Top Header Group */}
        <div className="flex items-start justify-between gap-4 flex-wrap pb-1">
          <div className="flex items-center gap-3 flex-wrap">
            {step.status && (
              <span className={statusClass}>
                {step.status} <span className="text-muted-foreground ml-1 font-sans text-[10px]">{getStatusLabel(step.status)}</span>
              </span>
            )}
            
            {isLast && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono uppercase bg-primary/10 text-primary border border-primary/20">
                Final Result
              </span>
            )}
          </div>
          
          {step.responseTime !== undefined && (
            <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md">
              <Clock size={12} className="text-primary/70" />
              <span>{step.responseTime}ms</span>
            </div>
          )}
        </div>

        {/* URL Link */}
        <div className="mt-3 flex items-start gap-2 group">
          <a
            href={step.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 font-mono text-[14px] text-foreground break-all leading-snug hover:text-primary transition-colors flex items-start gap-2"
          >
            <span className="flex-1">{step.url}</span>
            <ExternalLink size={14} className="flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
          </a>
        </div>

        {/* Errors */}
        {step.error && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 rounded-lg px-4 py-3 border border-rose-200 dark:border-rose-500/20">
            <AlertTriangle size={14} className="flex-shrink-0" />
            <span className="font-medium">{step.error}</span>
          </div>
        )}

        {/* Header Inspector */}
        <HeaderInspector headers={step.headers} />
      </div>
    </motion.div>
  );
}
