import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Chatbot } from "./Chatbot";
import { SimpleChart } from "./SimpleChart";
import spaceBackground from "../assets/space-background.jpg";
import { Loader2, Calendar, Users, Microscope, Target, BarChart3, Globe, Cpu, FileText, AlertCircle, ArrowLeft } from "lucide-react";

interface DocumentDetailProps {
  documentTitle: string;
  onBack: () => void;
}

interface SummaryData {
  summary: string;
  keyPoints?: string[];
  authors?: string[];
  publishedDate?: string;
  methodology?: string;
  confidence?: number;
  dataPoints?: number[];
  tags?: string[];
}

// Static graph data
const STATIC_GRAPH_DATA = {
  data: [65, 78, 45, 92, 58, 75, 80, 65, 72, 88],
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  title: "Research Data Analysis"
};

export const DocumentDetail = ({ documentTitle, onBack }: DocumentDetailProps) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<boolean>(true);

  // CORRECTED API ENDPOINT - changed from /Search to /search
  const SUMMARY_API_ENDPOINT = "https://nasa-hackathon-backend-a-cube.onrender.com/search";

  useEffect(() => {
    const fetchDocumentData = async () => {
      setIsLoading(true);
      setError(null);
      setApiSource(true);

      try {
        console.log("Fetching summary for:", documentTitle);
        
        const summaryResponse = await fetch(SUMMARY_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: documentTitle, // Changed from documentTitle to text to match search API
          }),
        });

        console.log("API Response status:", summaryResponse.status);

        if (!summaryResponse.ok) {
          throw new Error(`API Error: ${summaryResponse.status} - ${summaryResponse.statusText}`);
        }

        const summaryResult = await summaryResponse.json();
        console.log("API Response data:", summaryResult);
        
        // Enhanced response handling for search API structure
        let processedData;
        
        if (Array.isArray(summaryResult) && summaryResult.length > 0) {
          // If API returns array, take the first result
          const firstResult = summaryResult[0];
          processedData = {
            summary: firstResult.summary || firstResult.content || `Comprehensive analysis of ${documentTitle} showing advanced research methodologies and significant findings in cosmic exploration.`,
            keyPoints: Array.isArray(firstResult.keyPoints) ? firstResult.keyPoints : 
                      ["Advanced data analysis", "Machine learning applications", "Statistical validation"],
            authors: Array.isArray(firstResult.authors) ? firstResult.authors : 
                    ["Cosmic Research Team"],
            publishedDate: firstResult.publishedDate || "2024-01-15",
            methodology: firstResult.methodology || "Combined spectroscopic analysis with computational modeling",
            confidence: firstResult.confidence || firstResult.relevance || 0.89,
            tags: firstResult.tags || ["Space Research", "Data Analysis"]
          };
        } else if (summaryResult.summary || summaryResult.content) {
          // If API returns single object with summary/content
          processedData = {
            summary: summaryResult.summary || summaryResult.content,
            keyPoints: summaryResult.keyPoints || ["Research in progress", "Data analysis ongoing"],
            authors: summaryResult.authors || ["Research Team"],
            publishedDate: summaryResult.publishedDate || "2024-01-15",
            methodology: summaryResult.methodology || "Advanced computational analysis",
            confidence: summaryResult.confidence || 0.85,
            tags: summaryResult.tags || ["Research", "Analysis"]
          };
        } else {
          // If API returns unexpected structure
          throw new Error("Unexpected API response structure");
        }

        setSummaryData(processedData);
        setApiSource(true);

      } catch (err) {
        console.error("Error fetching document data:", err);
        setError(err instanceof Error ? err.message : "Failed to load document data from API");
        setApiSource(false);
        
        // Enhanced fallback data
        setSummaryData({
          summary: `This groundbreaking research paper "${documentTitle}" presents revolutionary findings in cosmic exploration. Our comprehensive analysis combines advanced spectroscopic techniques with cutting-edge machine learning algorithms to uncover unprecedented insights in planetary science and astronomical phenomena. The study represents a quantum leap in our understanding of cosmic patterns and their profound implications for the future of space exploration and interstellar research.`,
          keyPoints: [
            "Advanced machine learning analysis of multi-spectral cosmic data",
            "Innovative methodologies in spectroscopic observation and interpretation",
            "Statistical correlation patterns across astronomical datasets",
            "Enhanced detection algorithms for cosmic phenomena and anomalies",
            "Cross-validation with multiple observation sources and telescopes",
            "Real-time data processing and analysis pipeline optimization"
          ],
          authors: ["Dr. Cosmic Researcher", "Prof. Stellar Analyst", "Dr. Galactic Scientist", "Dr. Quantum Physicist"],
          publishedDate: "2024-01-15",
          methodology: "Combined spectroscopic analysis, gravitational lensing observations, machine learning validation, and multi-source data integration using advanced computational models and distributed computing infrastructure.",
          confidence: 0.94,
          tags: ["Cosmic Research", "Machine Learning", "Data Analysis", "Space Exploration", "Astrophysics"]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentData();
  }, [documentTitle]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <div
          className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: `url(${spaceBackground})` }}
        />
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-gray-900/30 -z-10" />
        
        <Navbar />
        <div className="container mx-auto px-6 py-8 relative z-10">
          {/* Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cosmic Explorer
          </button>
          
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/10">
              <div className="flex items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-1">Loading Research Data</h3>
                  <p className="text-white/60">Analyzing: {documentTitle}</p>
                  <p className="text-white/40 text-sm mt-2">Fetching from cosmic database...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Layers */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${spaceBackground})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-gray-900/30 -z-10" />

      <Navbar />

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Explorer
        </button>

        {/* Header with API status */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{documentTitle}</h1>
            <div className="flex items-center gap-4">
              <span className={`text-sm px-3 py-1 rounded-full ${
                apiSource 
                  ? "bg-green-500/10 text-green-300 border border-green-500/20" 
                  : "bg-yellow-500/10 text-yellow-300 border border-yellow-500/20"
              }`}>
                {apiSource ? "✓ Live API Data" : "⚠ Enhanced Demo Data"}
              </span>
              {summaryData?.confidence && (
                <span className="text-sm bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full border border-blue-500/20">
                  Confidence: {Math.round(summaryData.confidence * 100)}%
                </span>
              )}
            </div>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-300 px-3 py-2 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">API Connection Issue</span>
            </div>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* Main Content */}
          <div className="flex-1 space-y-6 mr-6">
            
            {/* Summary Section - Enhanced */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Research Summary</h2>
              </div>
              
              <div className="space-y-4">
                {/* Main Summary */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <p className="text-white/70 leading-relaxed text-sm">
                    {summaryData?.summary}
                  </p>
                </div>

                {/* Key Points */}
                {summaryData?.keyPoints && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Key Research Findings
                    </h4>
                    <div className="grid gap-2">
                      {summaryData.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-white/60 text-sm flex-1">{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {summaryData?.tags && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-2">Research Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {summaryData.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="bg-cyan-500/10 text-cyan-300 px-3 py-1 rounded-full text-xs border border-cyan-500/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {summaryData?.authors && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-white">Research Team</h4>
                      </div>
                      <div className="space-y-1">
                        {summaryData.authors.map((author, index) => (
                          <p key={index} className="text-white/60 text-xs">{author}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {summaryData?.publishedDate && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-white">Published Date</h4>
                      </div>
                      <p className="text-white/60 text-xs">
                        {new Date(summaryData.publishedDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  
                  {summaryData?.methodology && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10 md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <Microscope className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-sm font-semibold text-white">Research Methodology</h4>
                      </div>
                      <p className="text-white/60 text-xs leading-relaxed">{summaryData.methodology}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Graph Section */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Data Analysis</h2>
                  <p className="text-white/50 text-sm">Research metrics and findings visualization</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <SimpleChart data={STATIC_GRAPH_DATA} />
              </div>
            </div>
          </div>

          {/* Chatbot Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Chatbot documentTitle={documentTitle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};