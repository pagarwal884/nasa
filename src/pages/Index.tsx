import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { NetworkVisualization } from "@/components/NetworkVisualization";
import { DocumentDetail } from "@/components/DocumentDetail";

const Index = () => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const handleNodeClick = (node: any) => {
    setSelectedDocument(node.label);
  };

  const handleSearchResultClick = (result: any) => {
    setSelectedDocument(result.title);
  };

  if (selectedDocument) {
    return (
      <DocumentDetail documentTitle={selectedDocument} onBack={() => setSelectedDocument(null)} />
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar onSearchResultClick={handleSearchResultClick} />
      <div className="h-[calc(100vh-88px)]">
        <NetworkVisualization onNodeClick={handleNodeClick} />
      </div>
    </div>
  );
};

export default Index;
