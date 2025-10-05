import { useEffect, useRef, useState } from "react";
// @ts-ignore
import spaceBackground from "../assets/space-background.jpg";
import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";
// @ts-ignore
interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  label: string;
  topic: string;
  files?: string[];
  radius: number;
  isTopic: boolean;
  orbitAngle?: number;
  orbitRadius?: number;
  pulse?: number;
  cluster?: string;
  dataPoints: number[];
  symbol: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
}

interface NetworkVisualizationProps {
  onNodeClick: (node: Node) => void;
  onSearchResultClick: (result: SearchResult) => void;
}

interface SearchResult {
  id: string;
  title: string;
  topic: string;
  content?: string;
  relevance?: number;
  summary?: string;
  documentId?: string;
}

const TOPICS = [
  { name: "EXOPLANET DISCOVERY", files: ["Kepler-186f Analysis", "HD 209458b Study", "TRAPPIST-1 System"], color: "#60A5FA" },
  { name: "DARK MATTER", files: ["Galaxy Cluster Study", "Cosmic Microwave Background", "WIMPs Detection"], color: "#A78BFA" },
  { name: "MARS ROVER LOGS", files: ["Sol 3000-3100", "Terrain Analysis", "Sample Collection Data"], color: "#F87171" },
  { name: "GRAVITATIONAL WAVES", files: ["LIGO Detection Report", "Binary Merger Analysis", "Waveform Patterns"], color: "#34D399" },
];

// Cosmic symbols based on astronomy and space exploration
const COSMIC_SYMBOLS = [
  "★", "✦", "✧", "❂", "♁", "♃", "♆", "☄", "⦿", "⟁", "⌬", "⏣", "⬯", "⬰", "⍟", "⌗"
];

// Enhanced constellation patterns for better star layouts
const CONSTELLATION_PATTERNS = {
  LEO: [
    [0, 0], [120, -80], [200, 20], [160, 150], [60, 200], [-40, 120], [-80, 40]
  ],
  TAURUS: [
    [0, 0], [140, 40], [220, 20], [280, -40], [320, 20], [240, 120], [160, 160], [80, 120]
  ],
  ORION: [
    [0, 0], [80, -100], [160, -160], [240, -120], [180, 40], [100, 80], [40, 60], [-40, 20]
  ],
  URSA: [
    [0, 0], [60, -80], [140, -120], [220, -80], [180, 20], [100, 60], [20, 40], [-40, -20]
  ],
  CYGNUS: [
    [0, 0], [100, -60], [180, -40], [220, 20], [180, 80], [100, 100], [40, 80], [-20, 40]
  ],
  DRACO: [
    [0, 0], [80, -40], [140, -20], [180, 30], [140, 90], [80, 110], [20, 90], [-30, 50]
  ]
};

// Safe area boundaries to avoid navbar and search section
const SAFE_AREA = {
  top: 150,    // Space for navbar and search section
  bottom: 100, // Space at bottom
  left: 50,    // Space on sides
  right: 50
};

export const NetworkVisualization = ({ onNodeClick, onSearchResultClick }: NetworkVisualizationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>(0);
  const time = useRef(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const SEARCH_API_ENDPOINT = "https://nasa-hackathon-backend-a-cube.onrender.com/search";

  // Generate random data points (3-5 numbers between 0-100)
  const generateRandomData = (): number[] => {
    const count = Math.floor(Math.random() * 3) + 3; // 3-5 data points
    return Array.from({ length: count }, () => Math.floor(Math.random() * 100));
  };

  // Get cosmic symbol based on node index
  const getCosmicSymbol = (index: number): string => {
    return COSMIC_SYMBOLS[index % COSMIC_SYMBOLS.length];
  };

  // Check if position is within safe area
  const isInSafeArea = (x: number, y: number, canvasWidth: number, canvasHeight: number): boolean => {
    return x >= SAFE_AREA.left && 
           x <= canvasWidth - SAFE_AREA.right && 
           y >= SAFE_AREA.top && 
           y <= canvasHeight - SAFE_AREA.bottom;
  };

  // Check for node collisions
  const hasCollision = (x: number, y: number, radius: number, existingNodes: Node[]): boolean => {
    return existingNodes.some(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < (radius + node.radius + 20); // 20px minimum spacing
    });
  };

  // Find valid position for node
  const findValidPosition = (canvasWidth: number, canvasHeight: number, radius: number, existingNodes: Node[]): { x: number, y: number } => {
    let attempts = 0;
    const maxAttempts = 100;
    
    while (attempts < maxAttempts) {
      const x = SAFE_AREA.left + Math.random() * (canvasWidth - SAFE_AREA.left - SAFE_AREA.right);
      const y = SAFE_AREA.top + Math.random() * (canvasHeight - SAFE_AREA.top - SAFE_AREA.bottom);
      
      if (!hasCollision(x, y, radius, existingNodes) && isInSafeArea(x, y, canvasWidth, canvasHeight)) {
        return { x, y };
      }
      attempts++;
    }
    
    // Fallback: position with minimal collision
    const x = SAFE_AREA.left + Math.random() * (canvasWidth - SAFE_AREA.left - SAFE_AREA.right);
    const y = SAFE_AREA.top + Math.random() * (canvasHeight - SAFE_AREA.top - SAFE_AREA.bottom);
    return { x, y };
  };

  // Search API call
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
      console.log("Sending search request:", { text: query });
      
      const response = await fetch(SEARCH_API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: query.trim(),
        }),
      });

      console.log("Search API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Search API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Search API response data:", data);

      // Handle different response structures
      let results: SearchResult[] = [];
      
      if (Array.isArray(data)) {
        results = data.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "General Research",
          content: item.content || item.description || item.abstract,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview,
          documentId: item.documentId || item.id,
        }));
      } else if (data.results && Array.isArray(data.results)) {
        results = data.results.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "General Research",
          content: item.content || item.description || item.abstract,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview,
          documentId: item.documentId || item.id,
        }));
      } else if (data.documents && Array.isArray(data.documents)) {
        results = data.documents.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "General Research",
          content: item.content || item.description || item.abstract,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview,
          documentId: item.documentId || item.id,
        }));
      } else if (data.data && Array.isArray(data.data)) {
        results = data.data.map((item: any, index: number) => ({
          id: item.id || `result-${index}`,
          title: item.title || item.name || item.filename || "Untitled Document",
          topic: item.topic || item.category || item.type || "General Research",
          content: item.content || item.description || item.abstract,
          relevance: item.relevance || item.score || item.confidence || 0.5,
          summary: item.summary || item.overview,
          documentId: item.documentId || item.id,
        }));
      } else {
        // Fallback: create mock results based on search query
        results = [
          {
            id: "1",
            title: `${query} - Research Analysis`,
            topic: "EXOPLANET DISCOVERY",
            content: `Comprehensive research findings and data analysis related to ${query}. This study explores new methodologies and provides significant insights.`,
            relevance: 0.92,
            summary: `Detailed analysis of ${query} showing promising results in exoplanet research.`,
          },
          {
            id: "2",
            title: `${query} - Data Collection Report`,
            topic: "DARK MATTER",
            content: `Statistical analysis and observational data collection for ${query}. Includes methodology, results, and future research directions.`,
            relevance: 0.78,
            summary: `Observational data and statistical analysis of ${query} phenomena.`,
          },
          {
            id: "3",
            title: `${query} - Mission Logs`,
            topic: "MARS ROVER LOGS",
            content: `Field observations, terrain analysis, and sample collection data related to ${query}. Mission logs from Sol 2500-3100.`,
            relevance: 0.85,
            summary: `Mars rover mission logs and terrain analysis for ${query}.`,
          },
        ];
      }

      // Sort by relevance
      results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      setSearchResults(results);

    } catch (error) {
      console.error("Search API error:", error);
      setSearchError("Failed to connect to search service. Showing demo results.");
      
      // Fallback to mock results
      const mockResults: SearchResult[] = [
        {
          id: "1",
          title: `${query} - Research Analysis`,
          topic: "EXOPLANET DISCOVERY",
          content: `Comprehensive research findings and data analysis related to ${query}. This study explores new methodologies and provides significant insights.`,
          relevance: 0.92,
          summary: `Detailed analysis of ${query} showing promising results in exoplanet research.`,
        },
        {
          id: "2",
          title: `${query} - Data Collection Report`,
          topic: "DARK MATTER",
          content: `Statistical analysis and observational data collection for ${query}. Includes methodology, results, and future research directions.`,
          relevance: 0.78,
          summary: `Observational data and statistical analysis of ${query} phenomena.`,
        },
        {
          id: "3",
          title: `${query} - Mission Logs`,
          topic: "MARS ROVER LOGS",
          content: `Field observations, terrain analysis, and sample collection data related to ${query}. Mission logs from Sol 2500-3100.`,
          relevance: 0.85,
          summary: `Mars rover mission logs and terrain analysis for ${query}.`,
        },
      ];
      
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSearchError(null);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms debounce
  };

  const handleResultClick = (result: SearchResult) => {
    console.log("Search result clicked:", result);
    setSearchQuery(result.title);
    setShowResults(false);
    
    // Call the parent handler to navigate to summary page
    if (onSearchResultClick) {
      onSearchResultClick(result);
    }
    
    // Also try to find and trigger corresponding node if it exists
    const targetNode = nodes.find(node => 
      node.label === result.title || 
      node.label.includes(result.topic) ||
      result.title.includes(node.topic)
    );
    
    if (targetNode) {
      handleNodeSpread(targetNode);
    } else {
      // Create visual feedback for search result
      setRipples((prev) => [
        ...prev,
        {
          x: mousePos.current.x,
          y: mousePos.current.y,
          radius: 50,
          maxRadius: 200,
          opacity: 1,
        },
      ]);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.trim() && searchResults.length > 0) {
      setShowResults(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding results to allow for click
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      performSearch(searchQuery);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
    if (e.key === 'Escape') {
      setShowResults(false);
      if (searchInputRef.current) {
        searchInputRef.current.blur();
      }
    }
  };

  const handleNodeSpread = (clickedNode: Node) => {
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes];
      
      if (clickedNode.isTopic) {
        // When clicking a topic node, spread all its child nodes
        const childNodes = updatedNodes.filter(node => 
          node.topic === clickedNode.topic && !node.isTopic
        );

        if (childNodes.length > 0) {
          // Get constellation pattern based on number of child nodes
          const patternNames = Object.keys(CONSTELLATION_PATTERNS);
          const patternIndex = Math.floor(Math.random() * patternNames.length);
          const patternName = patternNames[patternIndex] as keyof typeof CONSTELLATION_PATTERNS;
          const pattern = CONSTELLATION_PATTERNS[patternName];
          
          // Scale pattern dynamically based on number of nodes
          const scale = Math.max(120, Math.min(250, childNodes.length * 35));
          
          childNodes.forEach((node, index) => {
            const patternIndex = index % pattern.length;
            const [px, py] = pattern[patternIndex];
            
            // Set new base position for the node
            node.baseX = clickedNode.x + (px * scale) / 100;
            node.baseY = clickedNode.y + (py * scale) / 100;
            
            // Ensure position stays in safe area
            const canvas = canvasRef.current;
            if (canvas) {
              node.baseX = Math.max(SAFE_AREA.left, Math.min(canvas.width - SAFE_AREA.right, node.baseX));
              node.baseY = Math.max(SAFE_AREA.top, Math.min(canvas.height - SAFE_AREA.bottom, node.baseY));
            }
            
            // Add velocity for smooth movement with some randomness
            const randomFactor = 0.8 + Math.random() * 0.4;
            node.vx = (node.baseX - node.x) * 0.04 * randomFactor;
            node.vy = (node.baseY - node.y) * 0.04 * randomFactor;
          });

          console.log(`Spread ${childNodes.length} nodes in ${patternName} pattern`);
        }
      } else {
        // When clicking a file node, spread related nodes within the same topic
        const relatedNodes = updatedNodes.filter(node => 
          node.topic === clickedNode.topic && node.id !== clickedNode.id
        );

        if (relatedNodes.length > 0) {
          const patternNames = Object.keys(CONSTELLATION_PATTERNS);
          const patternIndex = Math.floor(Math.random() * patternNames.length);
          const patternName = patternNames[patternIndex] as keyof typeof CONSTELLATION_PATTERNS;
          const pattern = CONSTELLATION_PATTERNS[patternName];
          
          const scale = Math.max(100, Math.min(200, relatedNodes.length * 30));
          
          relatedNodes.forEach((node, index) => {
            const patternIndex = index % pattern.length;
            const [px, py] = pattern[patternIndex];
            
            node.baseX = clickedNode.x + (px * scale) / 100;
            node.baseY = clickedNode.y + (py * scale) / 100;
            
            // Ensure position stays in safe area
            const canvas = canvasRef.current;
            if (canvas) {
              node.baseX = Math.max(SAFE_AREA.left, Math.min(canvas.width - SAFE_AREA.right, node.baseX));
              node.baseY = Math.max(SAFE_AREA.top, Math.min(canvas.height - SAFE_AREA.bottom, node.baseY));
            }
            
            const randomFactor = 0.8 + Math.random() * 0.4;
            node.vx = (node.baseX - node.x) * 0.05 * randomFactor;
            node.vy = (node.baseY - node.y) * 0.05 * randomFactor;
          });
        }
      }

      return updatedNodes;
    });

    // Create ripple effect
    setRipples((prev) => [
      ...prev,
      {
        x: clickedNode.x,
        y: clickedNode.y,
        radius: clickedNode.radius,
        maxRadius: 200,
        opacity: 1,
      },
    ]);

    onNodeClick(clickedNode);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Initialize particles
    const newParticles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      newParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.3 + 0.2,
      });
    }
    setParticles(newParticles);

    // Initialize 10 nodes with random data and cosmic symbols
    const initialNodes: Node[] = [];
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) * 0.3;

    // Create 10 nodes
    for (let i = 0; i < 10; i++) {
      const topicIndex = i % TOPICS.length;
      const topic = TOPICS[topicIndex];
      const isTopic = i < 4; // First 4 nodes are topics
      
      const nodeRadius = isTopic ? 16 : 8 + Math.random() * 4;
      const { x, y } = findValidPosition(canvas.width, canvas.height, nodeRadius, initialNodes);
      
      initialNodes.push({
        id: `node-${i}`,
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        label: isTopic ? topic.name : `${topic.name} Data ${i + 1}`,
        topic: topic.name,
        files: isTopic ? topic.files : undefined,
        radius: nodeRadius,
        isTopic,
        orbitAngle: isTopic ? undefined : (i / 10) * Math.PI * 2,
        orbitRadius: isTopic ? undefined : 60 + Math.random() * 40,
        pulse: Math.random() * Math.PI * 2,
        dataPoints: generateRandomData(),
        symbol: getCosmicSymbol(i),
      });
    }

    setNodes(initialNodes);

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  function handleClick(event: MouseEvent<HTMLCanvasElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  // Rest of your existing useEffect for animation...

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-all duration-1000 -z-10"
        style={{ backgroundImage: `url(${spaceBackground})` }}
      />
      
      {/* Gradient overlays */}
      <div className="fixed inset-0 bg-gradient-cosmic opacity-70 -z-10" />
      <div className="fixed inset-0 bg-gradient-radial from-transparent via-space-purple/30 to-space-purple/60 -z-10" />

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
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
              {isSearching ? (
                <Loader2 className="w-6 h-6 text-white/80 animate-spin" />
              ) : (
                <Search className="w-6 h-6 text-white/80" />
              )}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search research papers, topics, and discoveries..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              onKeyDown={handleKeyPress}
              className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/30 rounded-xl text-white placeholder:text-white/60 focus:ring-4 focus:ring-white/20 focus:border-white/40 backdrop-blur-md shadow-lg text-lg transition-all duration-300"
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
                    <div className="font-semibold">Note</div>
                    <div>{searchError}</div>
                  </div>
                ) : null}
                
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onMouseDown={(e) => e.preventDefault()} // Prevent input blur
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
                    {result.content && (
                      <div className="text-xs text-white/70 mt-2 line-clamp-2 text-left">
                        {result.content}
                      </div>
                    )}
                    {result.summary && (
                      <div className="text-xs text-blue-300/80 mt-1 line-clamp-1 text-left">
                        📄 {result.summary}
                      </div>
                    )}
                  </button>
                ))}
                
                {searchResults.length === 0 && !isSearching && !searchError && (
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
        </div>
      </div>

      {/* Canvas and other existing components... */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full cursor-pointer transition-all duration-300 z-10"
        onMouseMove={onmousemove}
        onClick={handleClick}
      />

      {/* Hover Tooltip */}
      {hoveredNode && (
        <div
          className="fixed pointer-events-none animate-fade-in z-50"
          style={{
            left: Math.min(mousePos.current.x + 20, window.innerWidth - 300),
            top: mousePos.current.y - 100,
          }}
        >
          <div 
            className="bg-gradient-to-br from-card/90 to-card/80 backdrop-blur-xl px-5 py-4 rounded-xl border-2 shadow-2xl min-w-[250px]"
            style={{ 
              borderColor: TOPICS.find(t => t.name === hoveredNode.topic)?.color || "#FFD700",
            }}
          >
            <div className="font-bold text-card-foreground text-sm mb-2 flex items-center gap-2">
              <span className="text-lg">{hoveredNode.symbol}</span>
              {hoveredNode.label}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2 mb-2">
              <span 
                className="inline-block w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: TOPICS.find(t => t.name === hoveredNode.topic)?.color }}
              />
              {hoveredNode.isTopic ? "Topic • Click to spread child nodes" : "Research Paper • Click to explore"}
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="font-semibold mb-1">Data Points:</div>
              <div className="flex gap-1 flex-wrap">
                {hoveredNode.dataPoints.map((point, index) => (
                  <span key={index} className="bg-white/20 px-2 py-1 rounded text-white">
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-radial from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow -z-5" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-glow -z-5" style={{ animationDelay: "1s" }} />
    </div>
  );
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 215, b: 0 };
}