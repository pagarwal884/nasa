import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import nasaLogo from "@/assets/nasa-logo.png";

interface SearchResult {
  id: string;
  title: string;
  topic: string;
}

const DUMMY_SEARCH_RESULTS: SearchResult[] = [
  { id: "1", title: "Exoplanet Discovery in Kepler-186 System", topic: "Exoplanet Discovery" },
  { id: "2", title: "Dark Matter Distribution in Galaxy Clusters", topic: "Dark Matter" },
  { id: "3", title: "Mars Rover Mission Logs: Sol 3000-3100", topic: "Mars Rover Logs" },
  { id: "4", title: "Gravitational Wave Detection Methods", topic: "Gravitational Waves" },
  { id: "5", title: "Exoplanet Atmospheric Composition Analysis", topic: "Exoplanet Discovery" },
];

interface NavbarProps {
  onSearchResultClick?: (result: SearchResult) => void;
}

export const Navbar = ({ onSearchResultClick }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);

  const filteredResults = searchQuery.trim()
    ? DUMMY_SEARCH_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.topic.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleResultClick = (result: SearchResult) => {
    setSearchQuery("");
    setShowResults(false);
    onSearchResultClick?.(result);
  };

  return (
    <nav className="bg-primary sticky top-0 z-50 border-b border-primary/20 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* NASA Logo */}
          <a href="/" className="flex-shrink-0">
            <img src={nasaLogo} alt="NASA" className="h-16 w-auto" />
          </a>

          {/* API Search Label */}
          <div className="hidden md:flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-primary-foreground/30 bg-primary-foreground/5 backdrop-blur-sm">
            <Search className="w-5 h-5 text-primary-foreground/70" />
            <span className="text-primary-foreground/90 font-mono text-sm tracking-wide">
              API_SEARCH_BAR
            </span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
              <Input
                type="text"
                placeholder="Search research papers..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                className="w-full pl-12 pr-4 py-6 bg-cosmic-white border-4 border-accent rounded-2xl text-foreground placeholder:text-muted-foreground focus:ring-4 focus:ring-accent/30 focus:border-accent shadow-lg"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && filteredResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-accent/50 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-lg">
                {filteredResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-6 py-4 text-left hover:bg-accent/10 transition-colors border-b border-border/30 last:border-0"
                  >
                    <div className="font-semibold text-card-foreground">{result.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{result.topic}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
