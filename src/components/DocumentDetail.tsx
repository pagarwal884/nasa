import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Chatbot } from "./Chatbot";
import { SimpleChart } from "./SimpleChart";
import spaceBackground from "../assets/space-background.jpg";
import { Loader2, Calendar, Users, Microscope, Target, BarChart3, Globe, Cpu, FileText, AlertCircle, ArrowLeft } from "lucide-react";

interface DocumentDetailProps {
  document: any;
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
  title?: string;
  topic?: string;
  content?: string;
}

// Chart.js format graph data - REPLACED THE OLD STATIC_GRAPH_DATA
const RESEARCH_GRAPH_DATA = {
  type: "bar" as const,
  data: {
    labels: ["Q1 2023", "Q2 2023", "Q3 2023", "Q4 2023", "Q1 2024", "Q2 2024"],
    datasets: [
      {
        label: "Research Publications",
        data: [45, 52, 48, 65, 72, 88],
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1
      },
      {
        label: "Citations Received",
        data: [120, 145, 130, 180, 210, 250],
        backgroundColor: "rgba(139, 92, 246, 0.6)",
        borderColor: "rgba(139, 92, 246, 1)",
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Research Output & Impact Analysis"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count"
        }
      },
      x: {
        title: {
          display: true,
          text: "Quarter"
        }
      }
    }
  }
};

// Markdown parser utility functions
const parseMarkdown = (markdown: string): string => {
  if (!markdown) return "";
  
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-white mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic text-white/90">$1</em>')
    .replace(/\[([^\[]+)\]\(([^\)]+)\)/g, '<a href="$2" class="text-cyan-400 hover:text-cyan-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\s*[\-\*] (.*$)/gim, '<li class="flex items-start gap-2 text-white/60 text-sm mb-1"><span class="w-1 h-1 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>$1</li>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-cyan-300 px-1 py-0.5 rounded text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br />')
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
    
    if (trimmedLine.startsWith('# ')) {
      if (currentSection && sectionContent) {
        if (currentSection === 'summary') {
          result.summary = sectionContent.trim();
        } else if (currentSection === 'key points' || currentSection === 'keypoints') {
          result.keyPoints = parseMarkdownList(sectionContent);
        } else if (currentSection === 'methodology') {
          result.methodology = sectionContent.trim();
        }
      }
      
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

export const DocumentDetail = ({ document, onBack }: DocumentDetailProps) => {
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
        // If we already have document data from search results, use it directly
        if (document && (document.summary || document.content)) {
          console.log("Using direct document data from search results:", document);
          
          const processedData: SummaryData = {
            title: document.title,
            topic: document.topic,
            summary: document.summary || document.content,
            content: document.content,
            keyPoints: document.keyFindings || [],
            authors: document.authors || ["Research Team"],
            publishedDate: document.publicationDate || "2024-01-15",
            methodology: document.methodology || "Advanced computational analysis",
            confidence: document.relevance || document.confidence || 0.89,
            tags: document.tags || [document.topic || "Research"]
          };
          
          setSummaryData(processedData);
          setIsLoading(false);
          return;
        }

        // Fetch detailed data using the document title
        const documentTitle = document?.title || document;
        console.log("Fetching detailed data for:", documentTitle);
        
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

        const apiResponse = await summaryResponse.json();
        console.log("API Response data:", apiResponse);
        
        // Process API response - handle both array and object formats
        let processedData: SummaryData;
        
        if (Array.isArray(apiResponse) && apiResponse.length > 0) {
          // Take the first result from array
          const firstResult = apiResponse[0];
          processedData = {
            title: firstResult.title || documentTitle,
            topic: firstResult.topic || firstResult.category || "Cosmic Research",
            summary: firstResult.summary || firstResult.content || firstResult.description || `Detailed analysis of ${documentTitle}`,
            content: firstResult.content || firstResult.description || firstResult.abstract,
            keyPoints: firstResult.keyPoints || firstResult.keyFindings || [
              "Comprehensive data analysis",
              "Advanced research methodology",
              "Scientific validation"
            ],
            authors: firstResult.authors || ["NASA Research Team"],
            publishedDate: firstResult.publishedDate || firstResult.date || "2024-01-15",
            methodology: firstResult.methodology || "Multi-spectral analysis and computational modeling",
            confidence: firstResult.confidence || firstResult.relevance || 0.85,
            tags: firstResult.tags || [firstResult.topic || "Research", "Space Exploration"]
          };
        } else if (apiResponse.results && Array.isArray(apiResponse.results)) {
          // Handle { results: [...] } format
          const firstResult = apiResponse.results[0];
          processedData = {
            title: firstResult.title || documentTitle,
            topic: firstResult.topic || "Cosmic Research",
            summary: firstResult.summary || firstResult.content || `Research analysis of ${documentTitle}`,
            content: firstResult.content,
            keyPoints: firstResult.keyPoints || ["Research findings", "Data analysis"],
            authors: firstResult.authors || ["Research Team"],
            publishedDate: firstResult.publishedDate || "2024-01-15",
            methodology: firstResult.methodology || "Scientific research methods",
            confidence: firstResult.confidence || 0.82,
            tags: firstResult.tags || ["Research"]
          };
        } else if (apiResponse.summary || apiResponse.content) {
          // Handle single object response
          processedData = {
            title: apiResponse.title || documentTitle,
            topic: apiResponse.topic || "Cosmic Research",
            summary: apiResponse.summary || apiResponse.content,
            content: apiResponse.content,
            keyPoints: apiResponse.keyPoints || ["Key research findings"],
            authors: apiResponse.authors || ["Research Team"],
            publishedDate: apiResponse.publishedDate || "2024-01-15",
            methodology: apiResponse.methodology || "Advanced analysis techniques",
            confidence: apiResponse.confidence || 0.88,
            tags: apiResponse.tags || ["Research", "Analysis"]
          };
        } else {
          // Fallback if API response structure is unexpected
          throw new Error("Unexpected API response structure");
        }

        setSummaryData(processedData);
        setApiSource(true);

      } catch (err) {
        console.error("Error fetching document data:", err);
        setError(err instanceof Error ? err.message : "Failed to load document data from API");
        setApiSource(false);
        
        // Enhanced fallback data
        const fallbackMarkdown = `# ${document?.title || document}

## Summary
This comprehensive research paper provides detailed analysis and findings related to ${document?.title || document}. The study incorporates advanced methodologies and data analysis techniques to uncover significant insights in cosmic research.

## Key Findings
- Advanced data analysis revealing new patterns
- Innovative research methodologies applied
- Significant correlations discovered in cosmic data
- Enhanced understanding of spatial phenomena

## Research Team
- Dr. Research Scientist
- Prof. Data Analyst
- Dr. Cosmic Explorer

## Methodology
Combined computational analysis, machine learning algorithms, and statistical validation methods to ensure research accuracy and reliability.

## Tags
- Cosmic Research
- Data Analysis
- Space Exploration
- Scientific Study`;

        const parsedFallback = parseMarkdownContent(fallbackMarkdown);
        
        setSummaryData({
          title: document?.title || document,
          topic: document?.topic || "COSMIC RESEARCH",
          summary: parsedFallback.summary || `Detailed research analysis of ${document?.title || document} containing comprehensive scientific findings.`,
          content: document?.content,
          keyPoints: parsedFallback.keyPoints || [
            "Advanced research methodology applied",
            "Comprehensive data analysis completed",
            "Significant scientific findings documented"
          ],
          authors: parsedFallback.authors || document?.authors || ["Dr. Research Scientist", "Prof. Data Analyst", "Dr. Cosmic Explorer"],
          publishedDate: document?.publicationDate || "2024-01-15",
          methodology: parsedFallback.methodology || "Advanced computational analysis and machine learning validation",
          confidence: document?.relevance || 0.92,
          tags: parsedFallback.tags || document?.tags || ["Cosmic Research", "Data Analysis", "Space Exploration"]
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentData();
  }, [document]);

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
                  <p className="text-white/60">Analyzing: {document?.title || document}</p>
                  <p className="text-white/40 text-sm mt-2">Processing API response...</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">{summaryData?.title || document?.title || document}</h1>
            {summaryData?.topic && (
              <div className="flex items-center gap-4">
                <span className="text-sm bg-purple-500/10 text-purple-300 px-3 py-1 rounded-full border border-purple-500/20">
                  {summaryData.topic}
                </span>
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
            )}
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

            {/* Full Content Section (if available) */}
            {summaryData?.content && (
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-semibold text-white">Full Content</h2>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/10 max-h-96 overflow-y-auto">
                  <div className="markdown-content">
                    <SafeHTML html={parseMarkdown(summaryData.content)} />
                  </div>
                </div>
              </div>
            )}

            {/* Graph Section - UPDATED TO USE RESEARCH_GRAPH_DATA */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-1">Research Analytics</h2>
                  <p className="text-white/50 text-sm">Performance metrics and publication trends</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30 hover:bg-blue-500/30 transition-colors">
                    Quarterly
                  </button>
                  <button className="px-3 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-lg border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                    Yearly
                  </button>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                {/* CHANGED FROM STATIC_GRAPH_DATA TO RESEARCH_GRAPH_DATA */}
                <SimpleChart data={RESEARCH_GRAPH_DATA} />
              </div>
              
              {/* Additional metrics summary */}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                  <div className="text-blue-300 text-sm">Total Publications</div>
                  <div className="text-white text-xl font-bold">370</div>
                  <div className="text-green-400 text-xs">↑ 15% growth</div>
                </div>
                <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                  <div className="text-purple-300 text-sm">Citation Impact</div>
                  <div className="text-white text-xl font-bold">1,035</div>
                  <div className="text-green-400 text-xs">↑ 22% increase</div>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                  <div className="text-green-300 text-sm">Collaborations</div>
                  <div className="text-white text-xl font-bold">28</div>
                  <div className="text-green-400 text-xs">↑ 8 new partners</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chatbot Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6">
              <Chatbot documentTitle={summaryData?.title || document?.title || document} />
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS for markdown styling */}
      <style jsx>{`
        .markdown-content {
          color: white;
        }
        .markdown-content h1, 
        .markdown-content h2, 
        .markdown-content h3,
        .markdown-content h4,
        .markdown-content h5,
        .markdown-content h6 {
          color: white;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          color: white;
          margin-bottom: 0.75rem;
        }
        .markdown-content ul {
          color: white;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content ol {
          color: white;
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .markdown-content li {
          color: white;
          margin-bottom: 0.25rem;
        }
        .markdown-content code {
          color: #93c5fd;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        .markdown-content a {
          color: #7dd3fc;
        }
        .markdown-content a:hover {
          color: #38bdf8;
          text-decoration: underline;
        }
        .markdown-content strong {
          color: white;
          font-weight: 600;
        }
        .markdown-content em {
          color: white;
          font-style: italic;
        }
        .markdown-content blockquote {
          color: #cbd5e1;
          border-left: 4px solid #3b82f6;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};