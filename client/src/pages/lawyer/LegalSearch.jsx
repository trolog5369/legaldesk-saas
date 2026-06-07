import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Scale, BookOpen, ExternalLink, Loader2, Search, CheckCircle, AlertCircle, BookmarkPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SkeletonLoader from '../../components/ui/SkeletonLoader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import api from '../../services/api';

export default function LegalSearch() {
  // State
  const [query, setQuery] = useState('');
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [pinningIds, setPinningIds] = useState(new Set());
  const [pinnedIds, setPinnedIds] = useState(new Set());
  const [cases, setCases] = useState([]);
  const [pinnedCount, setPinnedCount] = useState(0);
  const [toastMessage, setToastMessage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch lawyer's assigned cases on mount
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/cases');
        const allCases = res.data.data || [];
        const filtered = allCases.filter(c =>
          ['active', 'urgent', 'hearing_soon'].includes(c.status)
        );
        setCases(filtered);
      } catch (err) {
        console.error('Failed to fetch cases:', err.message);
      }
    };
    fetchCases();
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Search execution
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setResults([]);

    try {
      const res = await api.get('/search', { params: { q: query.trim() } });
      setResults(res.data.docs || []);
    } catch (err) {
      console.error('Search failed:', err.message);
      setSearchError('Search failed. The legal search service may be temporarily unavailable.');
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Pin judgment to case
  const handlePin = async (doc) => {
    if (!selectedCaseId || pinningIds.has(doc.tid)) return;

    setPinningIds(prev => new Set(prev).add(doc.tid));

    try {
      await api.post('/search/save', {
        caseId: selectedCaseId,
        title: doc.title || '',
        citation: doc.citation || '',
        court: doc.docsource || '',
        judgmentDate: doc.publishdate || '',
        kanoonUrl: `https://indiankanoon.org/doc/${doc.tid}/`,
        rawText: doc.headline || doc.title || '',
        tags: [],
      });

      setPinnedIds(prev => new Set(prev).add(doc.tid));
      setPinnedCount(prev => prev + 1);
      setToastMessage({ type: 'success', text: 'Judgment pinned successfully' });
    } catch (err) {
      if (err.response?.status === 409) {
        setToastMessage({ type: 'warning', text: 'Already pinned to this case' });
        setPinnedIds(prev => new Set(prev).add(doc.tid));
      } else {
        console.error('Pin failed:', err.message);
        setToastMessage({ type: 'error', text: 'Failed to pin — please try again' });
      }
    } finally {
      setPinningIds(prev => {
        const next = new Set(prev);
        next.delete(doc.tid);
        return next;
      });
    }
  };

  // Strip HTML tags from snippets
  const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-64px)] gap-6">
      {/* Toast notification */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            toastMessage.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle size={16} />}
          {toastMessage.type === 'warning' && <AlertCircle size={16} />}
          {toastMessage.type === 'error' && <AlertCircle size={16} />}
          {toastMessage.text}
        </motion.div>
      )}

      {/* LEFT PANEL — Search Controls */}
      <div className="w-80 flex-shrink-0 space-y-5">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          {/* Heading */}
          <div className="flex items-center gap-2.5 mb-1">
            <Scale size={22} className="text-[#1D4ED8]" />
            <h1 className="text-2xl font-bold text-[#0F172A]">Legal Research</h1>
          </div>
          <p className="text-sm text-[#64748B] mb-5">
            Search Indian Kanoon · Pin precedents to cases
          </p>

          {/* Search input */}
          <div className="space-y-3">
            <Input
              placeholder="Search by case name, citation, or legal principle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full"
            />
            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <Loader2 size={16} className="animate-spin mr-2" />
              ) : (
                <Search size={16} className="mr-2" />
              )}
              {isSearching ? 'Searching...' : 'Search Judgments'}
            </Button>
          </div>

          {/* Separator */}
          <div className="border-t border-[#E2E8F0] my-5" />

          {/* Case selector */}
          <div className="space-y-2">
            <label className="text-[13px] font-medium text-[#0F172A]">Pin results to:</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a case..." />
              </SelectTrigger>
              <SelectContent>
                {cases.map(c => (
                  <SelectItem key={c._id} value={c._id}>
                    <span className="font-medium">{c.title}</span>
                    <span className="text-[#94A3B8] ml-1.5 text-xs font-mono">{c.caseNumber}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-[#94A3B8]">
              Select a case before pinning any judgment
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-[#E2E8F0] my-5" />

          {/* Pinned count */}
          <div className="flex items-center gap-2">
            <BookmarkPlus size={14} className="text-[#1D4ED8]" />
            <span className="text-sm font-medium text-[#0F172A]">
              {pinnedCount} judgment{pinnedCount !== 1 ? 's' : ''} pinned
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Results */}
      <div className="flex-1 min-w-0">
        {/* EMPTY STATE */}
        {!hasSearched && !isSearching && results.length === 0 && !searchError && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-5">
              <BookOpen size={40} className="text-[#CBD5E1]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
              Enter a legal query to begin research
            </h3>
            <p className="text-sm text-[#94A3B8] max-w-sm">
              Results from Indian Kanoon will appear here
            </p>
          </div>
        )}

        {/* LOADING STATE */}
        {isSearching && (
          <SkeletonLoader variant="list" />
        )}}
            </div>
          </div>
        )}

        {/* NO RESULTS after search */}
        {!isSearching && !searchError && hasSearched && results.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <Search size={32} className="text-[#CBD5E1]" />
            </div>
            <h3 className="text-lg font-semibold text-[#0F172A] mb-1">No results found</h3>
            <p className="text-sm text-[#94A3B8] max-w-sm">
              Try searching with different keywords or a broader legal principle
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
