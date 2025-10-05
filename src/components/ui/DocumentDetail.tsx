import { Navbar } from "./Navbar";
import { Chatbot } from "./Chatbot";
import { SimpleChart } from "./SimpleChart";

interface DocumentDetailProps {
  documentTitle: string;
  onBack: () => void;
}

// Dummy API data
const DUMMY_SUMMARY = "This is summary: This is summary research paper document, dynamically generated from API_DOCUMENT_SUMMARY. It provides overview int findings, and scienlories, and This partcular document focuses on the splanetollology and celestial mechanics.";

export const DocumentDetail = ({ documentTitle, onBack }: DocumentDetailProps) => {
  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Summary Section */}
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
              <h2 className="text-2xl font-bold mb-6 text-card-foreground">Summary Section</h2>
              <p className="text-card-foreground/80 leading-relaxed">{DUMMY_SUMMARY}</p>
            </div>

            {/* Graph Section */}
            <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
              <h2 className="text-2xl font-bold mb-6 text-card-foreground">Graph Section</h2>
              <div className="mb-4">
                <span className="text-sm font-mono text-muted-foreground">API_GRAPH_DATA</span>
              </div>
              <div className="bg-blue-50/50 rounded-2xl p-6">
                <SimpleChart />
              </div>
            </div>
          </div>

          {/* Chatbot Sidebar */}
          <Chatbot documentTitle={documentTitle} />
        </div>
      </div>
    </div>
  );
};
