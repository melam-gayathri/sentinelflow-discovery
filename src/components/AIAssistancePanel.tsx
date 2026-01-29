import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Sparkles, X, CheckCircle2, AlertCircle, Tag, Palette, Code2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SimilarityBreakdown {
  abstract: number;
  keywords: number;
  design: number;
  technologies: number;
}

interface MatchResult {
  title: string;
  overallMatch: number;
  breakdown: SimilarityBreakdown;
  matchedKeywords: string[];
  matchedTechnologies: string[];
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  analyzed: boolean;
  hasAbstractMatch: boolean;
  matches: MatchResult[];
}

const ACCEPTED_FORMATS = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

// Mock project database for similarity checking
const projectDatabase = [
  {
    title: "Smart Traffic Management System",
    abstract: "traffic flow optimization urban congestion neural networks deep learning",
    keywords: ["traffic", "optimization", "urban", "smart city", "congestion"],
    technologies: ["Python", "TensorFlow", "IoT", "Neural Networks", "Deep Learning"],
    designPatterns: ["MVC", "Observer", "Real-time Processing"],
  },
  {
    title: "AI-Powered Vehicle Detection",
    abstract: "vehicle detection computer vision object recognition autonomous driving",
    keywords: ["vehicle", "detection", "AI", "computer vision", "autonomous"],
    technologies: ["OpenCV", "YOLO", "Python", "CNN", "TensorFlow"],
    designPatterns: ["Pipeline", "CNN Architecture", "Real-time"],
  },
  {
    title: "Urban Mobility Analysis Platform",
    abstract: "urban mobility transportation analysis data visualization city planning",
    keywords: ["mobility", "urban", "transportation", "analytics", "city"],
    technologies: ["React", "D3.js", "Python", "PostgreSQL", "REST API"],
    designPatterns: ["Dashboard", "Data Visualization", "Microservices"],
  },
  {
    title: "Blockchain Supply Chain Tracker",
    abstract: "blockchain supply chain transparency decentralized ledger tracking",
    keywords: ["blockchain", "supply chain", "transparency", "tracking", "logistics"],
    technologies: ["Ethereum", "Solidity", "Web3.js", "React", "Node.js"],
    designPatterns: ["Smart Contracts", "DApp Architecture", "Event-driven"],
  },
  {
    title: "NLP Document Summarizer",
    abstract: "natural language processing document summarization text analysis extraction",
    keywords: ["NLP", "summarization", "text analysis", "machine learning", "extraction"],
    technologies: ["Python", "BERT", "Transformers", "FastAPI", "Docker"],
    designPatterns: ["Transformer", "API Gateway", "Containerized"],
  },
];

// Simulated keywords extracted from uploaded documents
const getSimulatedDocumentContent = (fileName: string) => {
  const name = fileName.toLowerCase();
  
  if (name.includes("traffic") || name.includes("transport") || name.includes("vehicle")) {
    return {
      abstract: "traffic management vehicle detection urban transportation optimization",
      keywords: ["traffic", "vehicle", "urban", "optimization", "smart"],
      technologies: ["Python", "TensorFlow", "IoT"],
      designPatterns: ["Real-time", "MVC"],
    };
  }
  if (name.includes("blockchain") || name.includes("supply") || name.includes("chain")) {
    return {
      abstract: "blockchain supply chain management decentralized tracking",
      keywords: ["blockchain", "supply chain", "tracking", "decentralized"],
      technologies: ["Ethereum", "Solidity", "React"],
      designPatterns: ["Smart Contracts", "DApp"],
    };
  }
  if (name.includes("nlp") || name.includes("text") || name.includes("document")) {
    return {
      abstract: "natural language processing text analysis document processing",
      keywords: ["NLP", "text", "analysis", "document", "processing"],
      technologies: ["Python", "BERT", "FastAPI"],
      designPatterns: ["Transformer", "API"],
    };
  }
  
  // Random content for other files
  const randomKeywords = ["machine learning", "data analysis", "automation", "web", "mobile"];
  const randomTech = ["Python", "React", "Node.js", "PostgreSQL"];
  return {
    abstract: "project implementation system design software development",
    keywords: randomKeywords.slice(0, 3),
    technologies: randomTech.slice(0, 2),
    designPatterns: ["MVC", "REST"],
  };
};

const calculateSimilarity = (arr1: string[], arr2: string[]): number => {
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);
  return union.size > 0 ? (intersection.length / union.size) * 100 : 0;
};

const calculateAbstractSimilarity = (abstract1: string, abstract2: string): number => {
  const words1 = abstract1.toLowerCase().split(/\s+/);
  const words2 = abstract2.toLowerCase().split(/\s+/);
  return calculateSimilarity(words1, words2);
};

const AIAssistancePanel = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    analyzed: false,
    hasAbstractMatch: false,
    matches: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"abstract" | "detailed">("abstract");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeDocument = useCallback((file: File) => {
    const docContent = getSimulatedDocumentContent(file.name);
    
    const matches: MatchResult[] = projectDatabase.map(project => {
      const abstractMatch = calculateAbstractSimilarity(docContent.abstract, project.abstract);
      const keywordMatch = calculateSimilarity(docContent.keywords, project.keywords);
      const techMatch = calculateSimilarity(docContent.technologies, project.technologies);
      const designMatch = calculateSimilarity(docContent.designPatterns, project.designPatterns);
      
      const overallMatch = Math.round(
        abstractMatch * 0.4 + keywordMatch * 0.25 + techMatch * 0.2 + designMatch * 0.15
      );
      
      const matchedKeywords = docContent.keywords.filter(k => 
        project.keywords.some(pk => pk.toLowerCase() === k.toLowerCase())
      );
      const matchedTechnologies = docContent.technologies.filter(t =>
        project.technologies.some(pt => pt.toLowerCase() === t.toLowerCase())
      );
      
      return {
        title: project.title,
        overallMatch,
        breakdown: {
          abstract: Math.round(abstractMatch),
          keywords: Math.round(keywordMatch),
          design: Math.round(designMatch),
          technologies: Math.round(techMatch),
        },
        matchedKeywords,
        matchedTechnologies,
      };
    }).filter(m => m.overallMatch > 20).sort((a, b) => b.overallMatch - a.overallMatch);
    
    const hasAbstractMatch = matches.some(m => m.breakdown.abstract >= 50);
    
    return { matches, hasAbstractMatch };
  }, []);

  const simulateAnalysis = useCallback((file: File) => {
    setUploadState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    const progressInterval = setInterval(() => {
      setUploadState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 8 };
      });
    }, 120);

    setTimeout(() => {
      clearInterval(progressInterval);
      const { matches, hasAbstractMatch } = analyzeDocument(file);

      setUploadState({
        file,
        uploading: false,
        progress: 100,
        analyzed: true,
        hasAbstractMatch,
        matches,
      });
      
      setActiveTab(hasAbstractMatch ? "abstract" : "detailed");
    }, 1500);
  }, [analyzeDocument]);

  const handleFileSelect = useCallback(
    (file: File) => {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED_FORMATS.includes(extension)) {
        alert(`Invalid file format. Please upload: ${ACCEPTED_FORMATS.join(", ")}`);
        return;
      }
      simulateAnalysis(file);
    },
    [simulateAnalysis]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const resetUpload = () => {
    setUploadState({
      file: null,
      uploading: false,
      progress: 0,
      analyzed: false,
      hasAbstractMatch: false,
      matches: [],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 70) return "bg-destructive/10 text-destructive";
    if (percent >= 40) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  return (
    <div className="card-elevated p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">AI Similarity Check</h3>
      </div>

      {/* Upload Zone */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={ACCEPTED_FORMATS.join(",")}
        className="hidden"
      />

      {!uploadState.file ? (
        <div
          className={`upload-zone mb-6 cursor-pointer transition-all ${
            isDragging ? "border-primary bg-primary/5 scale-[1.02]" : ""
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Drag & Drop Files</p>
          <p className="text-xs text-muted-foreground">Upload .pdf, .doc, .docx, .ppt, .pptx</p>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                {uploadState.file.name}
              </span>
            </div>
            <button onClick={resetUpload} className="p-1 rounded-md hover:bg-muted transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {uploadState.uploading && (
            <div className="space-y-2">
              <Progress value={uploadState.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {uploadState.progress < 40 ? "Extracting abstract..." : 
                 uploadState.progress < 70 ? "Analyzing keywords & technologies..." :
                 "Comparing with database..."}
              </p>
            </div>
          )}

          {uploadState.analyzed && !uploadState.uploading && (
            <div className="flex items-center gap-2 text-sm">
              {uploadState.matches.length > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-primary">
                    {uploadState.hasAbstractMatch ? "Abstract matches found" : "Similar projects detected"}
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">No matches - Your project is unique!</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {uploadState.analyzed && uploadState.matches.length === 0 ? (
        <div className="text-center py-6">
          <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
          <h4 className="text-sm font-medium text-foreground mb-1">No Matches Detected</h4>
          <p className="text-xs text-muted-foreground">
            Your project appears to be unique. No similar projects found in our database.
          </p>
        </div>
      ) : uploadState.analyzed && uploadState.matches.length > 0 ? (
        <>
          {/* Tab Switcher */}
          <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("abstract")}
              className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                activeTab === "abstract" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Abstract Match
            </button>
            <button
              onClick={() => setActiveTab("detailed")}
              className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                activeTab === "detailed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Detailed Report
            </button>
          </div>

          {activeTab === "abstract" ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Abstract Similarity</h4>
              {uploadState.matches.filter(m => m.breakdown.abstract > 0).length > 0 ? (
                uploadState.matches.map((project) => (
                  <div key={project.title} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground">{project.title}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getMatchColor(project.breakdown.abstract)}`}>
                        {project.breakdown.abstract}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {project.breakdown.abstract >= 50 ? "High abstract similarity detected" :
                       project.breakdown.abstract >= 30 ? "Moderate content overlap" : "Low similarity"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No direct abstract matches. Check the Detailed Report for other similarities.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Detailed Similarity Report</h4>
              {uploadState.matches.map((project) => (
                <div key={project.title} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <p className="text-sm font-semibold text-foreground">{project.title}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${getMatchColor(project.overallMatch)}`}>
                      {project.overallMatch}% Overall
                    </span>
                  </div>
                  
                  {/* Breakdown */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">Abstract</span>
                      <span className="text-xs font-medium">{project.breakdown.abstract}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">Keywords</span>
                      <span className="text-xs font-medium">{project.breakdown.keywords}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">Design</span>
                      <span className="text-xs font-medium">{project.breakdown.design}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground flex-1">Technologies</span>
                      <span className="text-xs font-medium">{project.breakdown.technologies}%</span>
                    </div>
                  </div>

                  {/* Matched Items */}
                  {(project.matchedKeywords.length > 0 || project.matchedTechnologies.length > 0) && (
                    <div className="pt-2 border-t border-border">
                      {project.matchedKeywords.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Matched Keywords:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.matchedKeywords.map(k => (
                              <span key={k} className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {k}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.matchedTechnologies.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Matched Technologies:</p>
                          <div className="flex flex-wrap gap-1">
                            {project.matchedTechnologies.map(t => (
                              <span key={t} className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">How it works</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Upload your project document</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>AI extracts abstract & analyzes content</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Get similarity report with breakdown</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistancePanel;
