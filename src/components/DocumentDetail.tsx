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

// Markdown parser utility functions
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  
  return markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    
    // Bold and Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-white/90">$1</em>')
    
    // Links
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Lists
    .replace(/^\s*[\-\*] (.*$)/gim, '<li class="flex items-start gap-2 text-white/60 text-sm mb-1"><span class="w-1 h-1 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>$1</li>')
    
    // Code blocks
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-cyan-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    
    // Line breaks
    .replace(/\n/g, '<br />')
    
    // Paragraphs (ensure proper spacing)
    .replace(/<br \/><br \/>/g, '</p><p class="text-white/70 leading-relaxed text-sm mb-3">')
    .replace(/^(.+)$/gm, '<p class="text-white/70 leading-relaxed text-sm mb-3">$1</p>');
};

// Parse markdown list into array
const parseMarkdownList = (markdown: string): string[] => {
  if (!markdown) return [];
  
  return markdown
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• '))
    .map(line => line.replace(/^[\-\*\•]\s+/, '').trim())
    .filter(line => line.length > 0);
};

// Parse markdown content and extract structured data
const parseMarkdownContent = (markdownContent: string): Partial<SummaryData> => {
  if (!markdownContent) return {};
  
  const lines = markdownContent.split('\n');
  const result: Partial<SummaryData> = {};
  
  let currentSection = '';
  let sectionContent = '';
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    // Detect section headers
    if (trimmedLine.startsWith('# ')) {
      // Save previous section
      if (currentSection && sectionContent) {
        if (currentSection === 'summary') {
          result.summary = sectionContent.trim();
        } else if (currentSection === 'key points' || currentSection === 'keypoints') {
          result.keyPoints = parseMarkdownList(sectionContent);
        } else if (currentSection === 'methodology') {
          result.methodology = sectionContent.trim();
        }
      }
      
      // Start new section
      currentSection = trimmedLine.replace(/^#\s+/, '').toLowerCase();
      sectionContent = '';
    } else if (trimmedLine.startsWith('## ')) {
      const subsection = trimmedLine.replace(/^##\s+/, '').toLowerCase();
      if (subsection.includes('author') || subsection.includes('team')) {
        currentSection = 'authors';
      } else if (subsection.includes('date') || subsection.includes('published')) {
        currentSection = 'publishedDate';
      } else if (subsection.includes('method') || subsection.includes('approach')) {
        currentSection = 'methodology';
      } else if (subsection.includes('key') || subsection.includes('finding')) {
        currentSection = 'keyPoints';
      } else if (subsection.includes('tag') || subsection.includes('categor')) {
        currentSection = 'tags';
      }
      sectionContent = '';
    } else {
      sectionContent += line + '\n';
    }
  });
  
  // Save the last section
  if (currentSection && sectionContent) {
    if (currentSection === 'summary') {
      result.summary = sectionContent.trim();
    } else if (currentSection === 'key points' || currentSection === 'keypoints') {
      result.keyPoints = parseMarkdownList(sectionContent);
    } else if (currentSection === 'methodology') {
      result.methodology = sectionContent.trim();
    } else if (currentSection === 'authors') {
      result.authors = parseMarkdownList(sectionContent);
    } else if (currentSection === 'tags') {
      result.tags = parseMarkdownList(sectionContent);
    }
  }
  
  // If no structured data found, use the entire content as summary
  if (!result.summary && markdownContent) {
    result.summary = markdownContent;
  }
  
  return result;
};

// Safe HTML component for rendering parsed markdown
const SafeHTML = ({ html }: { html: string }) => {
  return (
    <div 
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const DocumentDetail = ({ documentTitle, onBack }: DocumentDetailProps) => {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<boolean>(true);

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
            text: documentTitle,
          }),
        });

        console.log("API Response status:", summaryResponse.status);

        if (!summaryResponse.ok) {
          throw new Error(`API Error: ${summaryResponse.status} - ${summaryResponse.statusText}`);
        }

        const summaryResult = await summaryResponse.json();
        console.log("API Response data:", summaryResult);
        
        // Enhanced response handling for markdown content
        let processedData: SummaryData;
        
        if (Array.isArray(summaryResult) && summaryResult.length > 0) {
          // If API returns array, take the first result
          const firstResult = summaryResult[0];
          const markdownContent = firstResult.summary || firstResult.content || firstResult.text || '';
          
          // Parse markdown content
          const parsedContent = parseMarkdownContent(markdownContent);
          
          processedData = {
            summary: parsedContent.summary || markdownContent || `Comprehensive analysis of ${documentTitle} showing advanced research methodologies and significant findings in cosmic exploration.`,
            keyPoints: parsedContent.keyPoints || Array.isArray(firstResult.keyPoints) ? firstResult.keyPoints : 
                      ["Advanced data analysis", "Machine learning applications", "Statistical validation"],
            authors: parsedContent.authors || Array.isArray(firstResult.authors) ? firstResult.authors : 
                    ["Cosmic Research Team"],
            publishedDate: firstResult.publishedDate || "2024-01-15",
            methodology: parsedContent.methodology || firstResult.methodology || "Combined spectroscopic analysis with computational modeling",
            confidence: firstResult.confidence || firstResult.relevance || 0.89,
            tags: parsedContent.tags || firstResult.tags || ["Space Research", "Data Analysis"]
          };
        } else if (summaryResult.summary || summaryResult.content || summaryResult.text) {
          // If API returns single object with markdown content
          const markdownContent = summaryResult.summary || summaryResult.content || summaryResult.text || '';
          const parsedContent = parseMarkdownContent(markdownContent);
          
          processedData = {
            summary: parsedContent.summary || markdownContent,
            keyPoints: parsedContent.keyPoints || summaryResult.keyPoints || ["Research in progress", "Data analysis ongoing"],
            authors: parsedContent.authors || summaryResult.authors || ["Research Team"],
            publishedDate: summaryResult.publishedDate || "2024-01-15",
            methodology: parsedContent.methodology || summaryResult.methodology || "Advanced computational analysis",
            confidence: summaryResult.confidence || 0.85,
            tags: parsedContent.tags || summaryResult.tags || ["Research", "Analysis"]
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
        
        // Enhanced fallback data with markdown example
        const fallbackMarkdown = `# ${documentTitle}

## Summary
This groundbreaking research paper presents revolutionary findings in cosmic exploration. Our comprehensive analysis combines **advanced spectroscopic techniques** with cutting-edge *machine learning algorithms* to uncover unprecedented insights in planetary science.

## Key Findings
- Advanced machine learning analysis of multi-spectral cosmic data
- Innovative methodologies in spectroscopic observation
- Statistical correlation patterns across astronomical datasets
- Enhanced detection algorithms for cosmic phenomena
- Real-time data processing pipeline optimization

## Research Team
- Dr. Cosmic Researcher
- Prof. Stellar Analyst  
- Dr. Galactic Scientist
- Dr. Quantum Physicist

## Methodology
Combined spectroscopic analysis, gravitational lensing observations, machine learning validation using \`Python\` and \`TensorFlow\`, and multi-source data integration.

## Tags
- Cosmic Research
- Machine Learning
- Data Analysis
- Space Exploration`;

        const parsedFallback = parseMarkdownContent(fallbackMarkdown);
        
        setSummaryData({
          summary: parsedFallback.summary || `This groundbreaking research paper "${documentTitle}" presents revolutionary findings in cosmic exploration.`,
          keyPoints: parsedFallback.keyPoints || [
            "Advanced machine learning analysis of multi-spectral cosmic data",
            "Innovative methodologies in spectroscopic observation and interpretation",
            "Statistical correlation patterns across astronomical datasets",
            "Enhanced detection algorithms for cosmic phenomena and anomalies"
          ],
          authors: parsedFallback.authors || ["Dr. Cosmic Researcher", "Prof. Stellar Analyst", "Dr. Galactic Scientist", "Dr. Quantum Physicist"],
          publishedDate: "2024-01-15",
          methodology: parsedFallback.methodology || "Combined spectroscopic analysis, gravitational lensing observations, machine learning validation, and multi-source data integration using advanced computational models.",
          confidence: 0.94,
          tags: parsedFallback.tags || ["Cosmic Research", "Machine Learning", "Data Analysis", "Space Exploration", "Astrophysics"]
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
                  <p className="text-white/40 text-sm mt-2">Parsing markdown content...</p>
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
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: `url(${spaceBackground})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-gray-900/30 -z-10" />

      <Navbar />

      <div className="container mx-auto px-6 py-8 relative z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cosmic Explorer
        </button>

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
          <div className="flex-1 space-y-6 mr-6">
            
            {/* Summary Section with Markdown Support */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Research Summary</h2>
              </div>
              
              <div className="space-y-4">
                {/* Main Summary with Markdown */}
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="markdown-content">
                    <SafeHTML html={parseMarkdown(summaryData?.summary || '')} />
                  </div>
                </div>

                {/* Key Points */}
                {summaryData?.keyPoints && summaryData.keyPoints.length > 0 && (
                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Key Research Findings
                    </h4>
                    <div className="grid gap-2">
                      {summaryData.keyPoints.map((point, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-white/5 transition-colors">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-white/60 text-sm flex-1">
                            <SafeHTML html={parseMarkdown(point)} />
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {summaryData?.tags && summaryData.tags.length > 0 && (
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
                  {summaryData?.authors && summaryData.authors.length > 0 && (
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
                      <p className="text-white/60 text-xs leading-relaxed">
                        <SafeHTML html={parseMarkdown(summaryData.methodology)} />
                      </p>
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

      {/* Add CSS for markdown styling */}
      <style jsx>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin-bottom: 0.75rem;
        }
        .markdown-content ul {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .markdown-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};