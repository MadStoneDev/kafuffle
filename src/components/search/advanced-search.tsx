// components/search/AdvancedSearch.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Search,
  Filter,
  Calendar,
  User,
  Hash,
  File,
  MessageSquare,
  X,
  Clock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { DatabaseService } from "@/lib/database";
import type {
  EnhancedMessage,
  EnhancedUser,
  EnhancedProject,
  EnhancedChannel,
} from "@/types";

interface SearchResult {
  id: string;
  type: "message" | "file" | "user" | "channel" | "project";
  title: string;
  content?: string;
  preview?: string;
  metadata: {
    author?: EnhancedUser;
    channel?: EnhancedChannel;
    project?: EnhancedProject;
    timestamp?: string;
    file_type?: string;
    file_size?: number;
  };
  relevance_score: number;
  highlighted_content?: string;
}

interface SearchFilters {
  type: "all" | "messages" | "files" | "users" | "channels" | "projects";
  author_id?: string;
  channel_id?: string;
  project_id?: string;
  date_range?: {
    start: string;
    end: string;
  };
  file_type?: string;
  has_attachments?: boolean;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  filters: SearchFilters;
  loading: boolean;
  error?: string;
  total_results: number;
  search_time: number;
  suggestions: string[];
}

export const AdvancedSearch: React.FC<{
  onResultSelect?: (result: SearchResult) => void;
  defaultQuery?: string;
  compact?: boolean;
}> = ({ onResultSelect, defaultQuery = "", compact = false }) => {
  const [searchState, setSearchState] = useState<SearchState>({
    query: defaultQuery,
    results: [],
    filters: { type: "all" },
    loading: false,
    total_results: 0,
    search_time: 0,
    suggestions: [],
  });

  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Debounced search
  const performSearch = useCallback(
    async (query: string, filters: SearchFilters) => {
      if (!query.trim()) {
        setSearchState((prev) => ({
          ...prev,
          results: [],
          total_results: 0,
          suggestions: [],
        }));
        return;
      }

      setSearchState((prev) => ({ ...prev, loading: true, error: undefined }));

      try {
        const startTime = Date.now();

        // This would integrate with your search backend (Elasticsearch, Algolia, etc.)
        const searchResults = await DatabaseService.performSearch({
          query,
          filters,
          limit: 50,
        });

        const searchTime = Date.now() - startTime;

        setSearchState((prev) => ({
          ...prev,
          results: searchResults.results,
          total_results: searchResults.total,
          search_time: searchTime,
          loading: false,
          suggestions: searchResults.suggestions || [],
        }));

        // Add to recent searches
        if (query.trim()) {
          setRecentSearches((prev) => {
            const updated = [query, ...prev.filter((s) => s !== query)].slice(
              0,
              10,
            );
            localStorage.setItem(
              "kafuffle_recent_searches",
              JSON.stringify(updated),
            );
            return updated;
          });
        }
      } catch (error) {
        setSearchState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Search failed",
        }));
      }
    },
    [],
  );

  const debouncedSearch = useCallback(
    (query: string, filters: SearchFilters) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        performSearch(query, filters);
      }, 300);
    },
    [performSearch],
  );

  // Handle search input changes
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchState((prev) => ({ ...prev, query: value }));
      debouncedSearch(value, searchState.filters);
    },
    [debouncedSearch, searchState.filters],
  );

  // Handle filter changes
  const handleFilterChange = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...searchState.filters, ...newFilters };
      setSearchState((prev) => ({ ...prev, filters: updatedFilters }));

      if (searchState.query.trim()) {
        debouncedSearch(searchState.query, updatedFilters);
      }
    },
    [debouncedSearch, searchState.query, searchState.filters],
  );

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("kafuffle_recent_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load recent searches:", error);
      }
    }
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (!compact && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [compact]);

  const SearchResultItem: React.FC<{ result: SearchResult }> = ({ result }) => {
    const getResultIcon = () => {
      switch (result.type) {
        case "message":
          return <MessageSquare className="w-4 h-4" />;
        case "file":
          return <File className="w-4 h-4" />;
        case "user":
          return <User className="w-4 h-4" />;
        case "channel":
          return <Hash className="w-4 h-4" />;
        case "project":
          return <Hash className="w-4 h-4" />;
        default:
          return <Search className="w-4 h-4" />;
      }
    };

    const getResultContext = () => {
      const { metadata } = result;
      const parts = [];

      if (metadata.project) parts.push(metadata.project.name);
      if (metadata.channel) parts.push(`#${metadata.channel.name}`);
      if (metadata.author && result.type !== "user")
        parts.push(`by ${metadata.author.username}`);
      if (metadata.timestamp) {
        const date = new Date(metadata.timestamp);
        parts.push(date.toLocaleDateString());
      }

      return parts.join(" • ");
    };

    return (
      <div
        onClick={() => onResultSelect?.(result)}
        className="p-4 hover:bg-neutral-700 cursor-pointer border-b border-neutral-700 last:border-b-0 transition-colors"
      >
        <div className="flex items-start space-x-3">
          <div className="mt-1 text-neutral-400">{getResultIcon()}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-white truncate">
                {result.title}
              </h3>
              <div className="text-xs text-neutral-500 bg-neutral-600 px-2 py-0.5 rounded">
                {result.type}
              </div>
            </div>

            {result.highlighted_content && (
              <div
                className="text-sm text-neutral-300 mb-2 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: result.highlighted_content }}
              />
            )}

            {result.preview && !result.highlighted_content && (
              <p className="text-sm text-neutral-300 mb-2 line-clamp-2">
                {result.preview}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-neutral-500">{getResultContext()}</p>
              <div className="flex items-center text-xs text-neutral-500">
                <span className="mr-2">
                  Relevance: {Math.round(result.relevance_score * 100)}%
                </span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterPanel: React.FC = () => (
    <div className="bg-neutral-700 border-t border-neutral-600 p-4 space-y-4">
      <h3 className="font-medium text-white mb-3">Search Filters</h3>

      {/* Content Type Filter */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Content Type
        </label>
        <select
          value={searchState.filters.type}
          onChange={(e) => handleFilterChange({ type: e.target.value as any })}
          className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:outline-none focus:border-kafuffle-primary"
        >
          <option value="all">All Content</option>
          <option value="messages">Messages</option>
          <option value="files">Files</option>
          <option value="users">Users</option>
          <option value="channels">Channels</option>
          <option value="projects">Projects</option>
        </select>
      </div>

      {/* Date Range Filter */}
      <div>
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={searchState.filters.date_range?.start || ""}
            onChange={(e) =>
              handleFilterChange({
                date_range: {
                  start: e.target.value,
                  end: searchState.filters.date_range?.end || "",
                },
              })
            }
            className="px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:outline-none focus:border-kafuffle-primary"
          />
          <input
            type="date"
            value={searchState.filters.date_range?.end || ""}
            onChange={(e) =>
              handleFilterChange({
                date_range: {
                  start: searchState.filters.date_range?.start || "",
                  end: e.target.value,
                },
              })
            }
            className="px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:outline-none focus:border-kafuffle-primary"
          />
        </div>
      </div>

      {/* File Type Filter (when type is 'files') */}
      {searchState.filters.type === "files" && (
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-2">
            File Type
          </label>
          <select
            value={searchState.filters.file_type || ""}
            onChange={(e) =>
              handleFilterChange({ file_type: e.target.value || undefined })
            }
            className="w-full px-3 py-2 bg-neutral-600 border border-neutral-500 rounded text-white focus:outline-none focus:border-kafuffle-primary"
          >
            <option value="">All File Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="audio">Audio</option>
            <option value="document">Documents</option>
            <option value="archive">Archives</option>
          </select>
        </div>
      )}

      {/* Has Attachments Filter */}
      {searchState.filters.type === "messages" && (
        <div className="flex items-center space-x-2">
          <input
            id="has-attachments"
            type="checkbox"
            checked={searchState.filters.has_attachments || false}
            onChange={(e) =>
              handleFilterChange({
                has_attachments: e.target.checked || undefined,
              })
            }
            className="rounded border-neutral-500 text-kafuffle-primary focus:ring-kafuffle-primary"
          />
          <label htmlFor="has-attachments" className="text-sm text-neutral-300">
            Has attachments
          </label>
        </div>
      )}

      <button
        onClick={() => {
          setSearchState((prev) => ({ ...prev, filters: { type: "all" } }));
          if (searchState.query.trim()) {
            debouncedSearch(searchState.query, { type: "all" });
          }
        }}
        className="text-sm text-kafuffle-primary hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );

  if (compact) {
    return (
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchState.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary"
          />
          {searchState.loading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 animate-spin" />
          )}
        </div>

        {/* Compact Results Dropdown */}
        {(searchState.results.length > 0 || searchState.loading) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {searchState.results.slice(0, 5).map((result) => (
              <SearchResultItem key={result.id} result={result} />
            ))}

            {searchState.results.length > 5 && (
              <div className="p-2 text-center border-t border-neutral-700">
                <button className="text-sm text-kafuffle-primary hover:underline">
                  View all {searchState.total_results} results
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Header */}
      <div className="bg-neutral-800 rounded-t-lg p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchState.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search messages, files, users, and more..."
              className="w-full pl-12 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-kafuffle-primary text-lg"
            />
            {searchState.loading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 animate-spin" />
            )}
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
              showFilters
                ? "bg-kafuffle-primary text-white"
                : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
            }`}
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </button>
        </div>

        {/* Search Stats */}
        {searchState.query && !searchState.loading && (
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <span>
              {searchState.total_results} results found in{" "}
              {searchState.search_time}ms
            </span>
            {searchState.suggestions.length > 0 && (
              <div className="flex items-center space-x-2">
                <span>Did you mean:</span>
                {searchState.suggestions
                  .slice(0, 3)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchChange(suggestion)}
                      className="text-kafuffle-primary hover:underline"
                    >
                      {suggestion}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Recent Searches */}
        {!searchState.query && recentSearches.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-neutral-300 mb-2">
              Recent Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchChange(search)}
                  className="flex items-center px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-full text-sm text-neutral-300 transition-colors"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && <FilterPanel />}

      {/* Search Results */}
      <div className="bg-neutral-800 rounded-b-lg">
        {searchState.error && (
          <div className="p-4 text-red-400 text-center">
            <p>Error: {searchState.error}</p>
          </div>
        )}

        {!searchState.loading &&
          !searchState.error &&
          searchState.query &&
          searchState.results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-neutral-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}

        {searchState.results.length > 0 && (
          <div className="divide-y divide-neutral-700">
            {searchState.results.map((result) => (
              <SearchResultItem key={result.id} result={result} />
            ))}
          </div>
        )}

        {!searchState.query && !searchState.loading && (
          <div className="p-8 text-center">
            <Search className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">
              Search Kafuffle
            </h3>
            <p className="text-neutral-400 mb-4">
              Find messages, files, channels, users, and more
            </p>
            <div className="text-sm text-neutral-500">
              <p className="mb-1">Search tips:</p>
              <ul className="space-y-1">
                <li>• Use quotes for exact phrases: "project update"</li>
                <li>• Search by user: from:@username</li>
                <li>• Search in channel: in:#channel-name</li>
                <li>• Search by date: after:2024-01-01</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Search keyboard shortcut hook
export const useSearchShortcut = (onOpen: () => void) => {
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onOpen]);
};

// Quick search component for global use
export const QuickSearch: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onResultSelect: (result: SearchResult) => void;
}> = ({ isOpen, onClose, onResultSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50">
      <div className="w-full max-w-2xl bg-neutral-800 rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-neutral-700">
          <h2 className="text-lg font-semibold text-white">Quick Search</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <AdvancedSearch
            compact={true}
            onResultSelect={(result) => {
              onResultSelect(result);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
