import { useState, useEffect, useRef } from 'react';
import { Search, X, User, Users, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchApi, type SearchResult } from '@/lib/api/search';
import { useDebounce } from '@/hooks/useDebounce';

export function GlobalSearch() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const data = await searchApi.search(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
        setResults(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery]);

  // Navigate and close
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
    setResults(null);
  };

  const totalResults =
    (results?.students.length || 0) +
    (results?.teachers.length || 0) +
    (results?.groups.length || 0) +
    (results?.payments.length || 0);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Search Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Qidirish...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-xs">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </button>

      {/* Search Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-12 z-50 w-full min-w-[400px] max-w-2xl rounded-xl border bg-card shadow-xl">
          {/* Search Input */}
          <div className="flex items-center gap-2 border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O'quvchi, o'qituvchi, guruh yoki to'lovni qidiring..."
              className="flex-1 bg-transparent outline-none text-sm"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults(null);
                }}
                className="rounded-md p-1 hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Qidirilmoqda...
              </div>
            ) : !query.trim() ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Qidirish uchun matn kiriting
              </div>
            ) : totalResults === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Natija topilmadi
              </div>
            ) : (
              <div className="space-y-3">
                {/* Students */}
                {results?.students && results.students.length > 0 && (
                  <div>
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                      O'QUVCHILAR
                    </div>
                    {results.students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => handleNavigate(`/dashboard/students`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{student.fullName}</p>
                          <p className="text-xs text-muted-foreground">{student.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Teachers */}
                {results?.teachers && results.teachers.length > 0 && (
                  <div>
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                      O'QITUVCHILAR
                    </div>
                    {results.teachers.map((teacher) => (
                      <button
                        key={teacher.id}
                        onClick={() => handleNavigate(`/dashboard/teachers`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors text-left"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{teacher.fullName}</p>
                          <p className="text-xs text-muted-foreground">{teacher.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Groups */}
                {results?.groups && results.groups.length > 0 && (
                  <div>
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                      GURUHLAR
                    </div>
                    {results.groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleNavigate(`/dashboard/groups`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors text-left"
                      >
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{group.name}</p>
                          <p className="text-xs text-muted-foreground">{group.subject}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Payments */}
                {results?.payments && results.payments.length > 0 && (
                  <div>
                    <div className="mb-2 px-2 text-xs font-medium text-muted-foreground">
                      TO'LOVLAR
                    </div>
                    {results.payments.map((payment) => (
                      <button
                        key={payment.id}
                        onClick={() => handleNavigate(`/dashboard/payments`)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent transition-colors text-left"
                      >
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{payment.student.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {payment.paidAmount.toLocaleString('uz-UZ')} so'm
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>Esc tugmasini bosing yopish uchun</span>
            {totalResults > 0 && <span>{totalResults} natija topildi</span>}
          </div>
        </div>
      )}
    </div>
  );
}
