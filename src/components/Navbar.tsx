import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
// @ts-ignore
import nasaLogo from "../assets/nasa-logo.png";

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
    <nav className="sticky top-0 z-50 border-b border-white/20 backdrop-blur-xl bg-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
  <div className="container mx-auto px-6 py-3 flex items-center justify-between">
    {/* NASA Logo */}
    <a href="/" className="flex items-center gap-3 flex-shrink-0">
      <img src={nasaLogo} alt="NASA" className="h-14 w-auto" />
      <h1 className="text-xl font-bold text-white hidden sm:block tracking-wide drop-shadow-lg">
        Bio Nebula For NASA
      </h1>
    </a>

    {/* Search Input */}
    <div className="flex-1 flex justify-end">
      <div className="relative w-full max-w-2xl">
       

        {/* Search Results Dropdown */}
        {showResults && filteredResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl shadow-xl overflow-hidden z-50">
            {filteredResults.map((result) => (
              <button
                key={result.id}
                onMouseDown={() => handleResultClick(result)}
                className="w-full px-6 py-3 text-left hover:bg-white/30 transition-colors border-b border-white/20 last:border-0 text-white"
              >
                <div className="font-semibold">{result.title}</div>
                <div className="text-sm text-[#FC3D21] mt-1">{result.topic}</div>
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