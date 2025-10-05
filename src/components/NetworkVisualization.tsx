import { useRef, useState } from "react";
// @ts-ignore
import spaceBackground from "../assets/space-background.jpg";
import { Search, Loader2, X } from "lucide-react";
import { DocumentDetail } from "./DocumentDetail";

export const NetworkVisualization = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"search" | "document">("search");
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  const SEARCH_API_ENDPOINT = "https://burhan1863-NasaApi.hf.space/api/v1/summarize/";

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);

    try {
      console.log("🔍 Sending search request to:", SEARCH_API_ENDPOINT);
      console.log("📤 Request payload:", { text: query.trim() });
      
      const response = await fetch(SEARCH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: query.trim(),
        }),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      // Get the raw response text first
      const responseText = await response.text();
      console.log("📥 Raw response text:", responseText);

      let data;
      try {
        data = responseText ? JSON.parse(responseText) : null;
        console.log("📥 Parsed JSON data:", data);
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError);
        console.log("📥 Response text that failed to parse:", responseText);
        throw new Error("Invalid JSON response from server");
      }

      // Handle different response structures
      let results: any[] = [];
      
      if (Array.isArray(data)) {
        console.log("✅ API returned array with", data.length, "items");
        results = data.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "Cosmic Research",
          content: item.content || item.description || item.abstract || `Comprehensive research findings about ${query}.`,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview || `This research provides detailed analysis of ${query}.`,
          authors: item.authors || ["Research Team"],
          publicationDate: item.publicationDate || item.date || "2024-01-15",
          methodology: item.methodology || "Advanced computational analysis",
          keyFindings: item.keyFindings || [
            "Advanced data analysis techniques",
            "Research methodology applied",
            "Scientific validation methods"
          ],
          tags: item.tags || [query.toLowerCase(), "research"],
          source: item.source || "Research Database"
        }));
      } else if (data && data.results && Array.isArray(data.results)) {
        console.log("✅ API returned object with results array");
        results = data.results.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "Cosmic Research",
          content: item.content || item.description || item.abstract || `Detailed research analysis of ${query}.`,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview || `Comprehensive study of ${query}.`,
          authors: item.authors || ["Research Team"],
          publicationDate: item.publicationDate || "2024-01-15",
          methodology: item.methodology || "Multi-spectral analysis",
          keyFindings: item.keyFindings || [
            "Research findings documented",
            "Data analysis completed"
          ],
          tags: item.tags || [query.toLowerCase(), "analysis"],
          source: item.source || "Research Database"
        }));
      } else if (data && typeof data === 'object') {
        console.log("✅ API returned single object");
        // Handle single object response
        results = [{
          id: data.id || "1",
          title: data.title || `${query} - Research Document`,
          topic: data.topic || "Space Exploration",
          content: data.content || data.description || data.abstract || `Research findings related to ${query}.`,
          relevance: data.relevance || data.score || data.confidence || 0.8,
          summary: data.summary || data.overview || `Analysis of ${query} showing research findings.`,
          authors: data.authors || ["Research Team"],
          publicationDate: data.publicationDate || "2024-01-15",
          methodology: data.methodology || "Scientific research methods",
          keyFindings: data.keyFindings || [
            "Research methodology applied",
            "Findings documented"
          ],
          tags: data.tags || [query.toLowerCase(), "research"],
          source: data.source || "Research Database"
        }];
      } else {
        console.log("⚠️ API returned unexpected format, using fallback");
        // Fallback for unexpected response format
        results = [{
          id: "1",
          title: `${query} - Research Analysis`,
          topic: "SPACE RESEARCH",
          content: `This research paper provides comprehensive findings and data analysis related to ${query}.`,
          relevance: 0.85,
          summary: `Detailed analysis of ${query} showing promising results in research.`,
          authors: ["Research Scientist", "Data Analyst"],
          publicationDate: new Date().toISOString().split('T')[0],
          methodology: "Combined analysis with validation methods",
          keyFindings: [
            "Pattern recognition in data",
            "Statistical significance in results",
            "Potential for future research"
          ],
          tags: [query.toLowerCase(), "research", "analysis"],
          source: "Research Division"
        }];
      }

      console.log("✅ Processed results:", results);
      results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      setSearchResults(results);

    } catch (error) {
      console.error("❌ Search API error:", error);
      setSearchError(`Failed to connect to search service: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Enhanced fallback results with better error context
      const mockResults = [
        {
          id: "1",
          title: `${query} - Demo Research Analysis`,
          topic: "COSMIC RESEARCH",
          content: `This is a demo research analysis for "${query}". The actual API connection failed. Please check your internet connection and try again.`,
          relevance: 0.92,
          summary: `Demo analysis of ${query} - API connection issue detected.`,
          authors: ["Demo Research Team"],
          publicationDate: new Date().toISOString().split('T')[0],
          methodology: "Demo analysis methods",
          keyFindings: [
            "API connection required for real data",
            "Demo content shown due to connection issue",
            "Please check network connection"
          ],
          tags: [query.toLowerCase(), "demo", "research"],
          source: "Demo Database - API Unavailable"
        },
      ];
      
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: any) => {
    console.log("📄 Document selected:", result);
    setSelectedDocument(result);
    setCurrentView("document");
    setShowResults(false);
  };

  const handleBackToSearch = () => {
    setCurrentView("search");
    setSelectedDocument(null);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
    }
    if (e.key === 'Escape') {
      setShowResults(false);
      searchInputRef.current?.blur();
    }
  };

  // Test API connection
  const testAPIConnection = async () => {
    console.log("🧪 Testing API connection...");
    try {
      const testResponse = await fetch(SEARCH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "test",
        }),
      });
      console.log("🧪 Test response status:", testResponse.status);
      const testText = await testResponse.text();
      console.log("🧪 Test response text:", testText);
    } catch (error) {
      console.error("🧪 Test API error:", error);
    }
  };

  // Render DocumentDetail view
  if (currentView === "document" && selectedDocument) {
    return <DocumentDetail document={selectedDocument} onBack={handleBackToSearch} />;
  }

  // Render Search view
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-10"
        style={{ backgroundImage: `url(${spaceBackground})` }}
      />
      
      {/* Gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-gray-900/30 -z-10" />

      {/* Centered Search Section */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-4xl px-6">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Cosmic Research Explorer
            </h1>
            <p className="text-white/80 text-lg">
              Discover interconnected research across the universe
            </p>
            
            {/* API Test Button - Remove in production */}
          
          </div>

          <div className="relative">
            {/* Search Icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {isSearching ? (
                <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
              ) : (
                <Search className="w-6 h-6 text-white/80" />
              )}
            </div>

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/60 hover:text-white/80 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search research papers, topics, and discoveries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={handleKeyPress}
              className="w-full pl-12 pr-10 py-4 bg-white/5 border border-white/30 rounded-xl text-white placeholder:text-white/60 focus:ring-4 focus:ring-white/20 focus:border-white/40 backdrop-blur-md shadow-lg text-lg transition-all duration-300"
            />

            {/* Search Results */}
            {showResults && (searchResults.length > 0 || isSearching || searchError) && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/15 backdrop-blur-xl border border-white/25 rounded-xl shadow-xl overflow-hidden z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center px-6 py-8 text-white">
                    <Loader2 className="w-5 h-5 animate-spin mr-3" />
                    <span>Searching cosmic database...</span>
                  </div>
                ) : searchError ? (
                  <div className="px-6 py-4 text-yellow-300 text-sm bg-yellow-500/10 border-b border-yellow-500/20">
                    <div className="font-semibold">API Connection Issue</div>
                    <div className="text-xs mt-1">{searchError}</div>
                  </div>
                ) : null}
                
                {!isSearching && searchResults.map((result) => (
                  <button
                    key={result.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleResultClick(result)}
                    className="w-full px-6 py-4 text-left hover:bg-white/20 transition-all duration-200 border-b border-white/10 last:border-0 text-white group active:bg-white/25"
                  >
                    <div className="font-semibold group-hover:text-blue-300 transition-colors line-clamp-1 text-left">
                      {result.title}
                    </div>
                    
                    <div className="text-sm text-blue-200/80 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70 flex-shrink-0" />
                      <span className="flex-shrink-0">{result.topic}</span>
                      {result.relevance && (
                        <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded ml-2 flex-shrink-0">
                          {Math.round(result.relevance * 100)}% match
                        </span>
                      )}
                    </div>

                    {/* Summary Preview */}
                    {result.summary && (
                      <div className="text-xs text-white/70 mt-2 line-clamp-2 text-left">
                        {result.summary}
                      </div>
                    )}

                    {/* Authors */}
                    {result.authors && result.authors.length > 0 && (
                      <div className="text-xs text-white/50 mt-1 flex items-center gap-1">
                        <span>By: {result.authors.slice(0, 2).join(', ')}</span>
                        {result.authors.length > 2 && (
                          <span className="text-white/40">+{result.authors.length - 2} more</span>
                        )}
                      </div>
                    )}
                  </button>
                ))}

                {/* No Results State */}
                {!isSearching && searchResults.length === 0 && !searchError && (
                  <div className="px-6 py-8 text-center text-white/70">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <div>No results found</div>
                    <div className="text-sm mt-1">Try different keywords</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Tips */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-sm">
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Enter</kbd> to search • 
              Press <kbd className="px-2 py-1 bg-white/10 rounded text-xs">Esc</kbd> to close results
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};