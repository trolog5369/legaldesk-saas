import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, RefreshCw, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import api from '../../services/api';

const CATEGORIES = ['All', 'Supreme Court', 'High Court', 'Legislation'];

const CATEGORY_STYLES = {
  'Supreme Court': { bg: 'rgba(29, 78, 216, 0.1)', text: '#1D4ED8' },
  'High Court': { bg: 'rgba(124, 58, 237, 0.1)', text: '#7C3AED' },
  'Legislation': { bg: 'rgba(5, 150, 105, 0.1)', text: '#059669' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function LegalNews() {
  const [newsItems, setNewsItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/news');
      setNewsItems(res.data.data || res.data.news || res.data || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch news:', err.message);
      setError('Failed to load legal news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredItems = activeCategory === 'All'
    ? newsItems
    : newsItems.filter(item => item.category === activeCategory);

  const formatPublishedDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Newspaper size={22} className="text-[#1D4ED8]" />
            <h1 className="text-2xl font-bold text-[#0F172A]">Legal News Feed</h1>
          </div>
          <p className="text-sm text-[#64748B]">
            Stay updated with the latest from Indian courts and legislation
          </p>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8] mt-1">
            <Clock size={12} />
            <span>Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              activeCategory === cat
                ? 'bg-[#1D4ED8] text-white shadow-sm shadow-blue-200'
                : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-5 space-y-3 animate-pulse">
              <div className="h-5 w-24 bg-[#E2E8F0] rounded-full" />
              <div className="h-5 w-full bg-[#E2E8F0] rounded" />
              <div className="h-4 w-3/4 bg-[#F1F5F9] rounded" />
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-[#F1F5F9] rounded" />
                <div className="h-3 w-5/6 bg-[#F1F5F9] rounded" />
                <div className="h-3 w-2/3 bg-[#F1F5F9] rounded" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-3 w-20 bg-[#F1F5F9] rounded" />
                <div className="h-3 w-16 bg-[#F1F5F9] rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <Newspaper size={32} className="text-red-300" />
          </div>
          <p className="text-sm text-red-600 font-medium mb-4">{error}</p>
          <Button onClick={fetchNews} className="gap-2">
            <RefreshCw size={14} />
            Retry
          </Button>
        </div>
      )}

      {/* Results Grid with AnimatePresence */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {filteredItems.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
                  <Newspaper size={48} className="text-[#CBD5E1]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                  No news found for this category
                </h3>
                <p className="text-sm text-[#94A3B8]">
                  Try selecting a different category above
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {filteredItems.map((item, index) => {
                  const catStyle = CATEGORY_STYLES[item.category] || { bg: 'rgba(100, 116, 139, 0.1)', text: '#64748B' };
                  return (
                    <motion.a
                      key={item._id || item.url || index}
                      variants={cardVariants}
                      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.10)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white border border-[#E2E8F0] rounded-xl p-5 flex flex-col cursor-pointer no-underline block"
                    >
                      {/* Category Badge */}
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit mb-3"
                        style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
                      >
                        {item.category}
                      </span>

                      {/* Headline */}
                      <h3
                        className="text-[15px] font-semibold text-[#0F172A] leading-snug mb-2 line-clamp-2"
                        title={item.title}
                      >
                        {item.title}
                      </h3>

                      {/* Snippet */}
                      {item.snippet && (
                        <p className="text-[13px] text-[#64748B] leading-relaxed line-clamp-3 mt-1 flex-1">
                          {item.snippet}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#F1F5F9]">
                        <span className="text-xs text-[#94A3B8]">{item.source}</span>
                        <span className="text-xs text-[#94A3B8]">{formatPublishedDate(item.publishedAt)}</span>
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
