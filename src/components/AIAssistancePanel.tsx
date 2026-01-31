import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Sparkles, X, CheckCircle2, AlertCircle, Tag, Palette, Code2, ChevronDown, ChevronUp, BookOpen, Link2, Calculator, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SimilarityBreakdown {
  abstract: number;
  keywords: number;
  design: number;
  technologies: number;
}

interface SectionMatch {
  sectionName: string;
  uploadedContent: string[];
  originalContent: string[];
  matchedItems: string[];
  matchPercentage: number;
  weight: number;
  weightedScore: number;
}

interface MatchEvidence {
  abstractWords: string[];
  keywords: string[];
  technologies: string[];
  designPatterns: string[];
}

interface MatchResult {
  title: string;
  overallMatch: number;
  breakdown: SimilarityBreakdown;
  matchedKeywords: string[];
  matchedTechnologies: string[];
  matchedDesignPatterns: string[];
  matchedAbstractWords: string[];
  evidence: MatchEvidence;
  originalProject: {
    abstract: string;
    keywords: string[];
    technologies: string[];
    designPatterns: string[];
  };
  uploadedContent: {
    abstract: string;
    keywords: string[];
    technologies: string[];
    designPatterns: string[];
  };
  sectionMatches: SectionMatch[];
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
    id: "proj-001",
    title: "Smart Traffic Management System",
    abstract: "traffic flow optimization urban congestion neural networks deep learning real-time monitoring",
    keywords: ["traffic", "optimization", "urban", "smart city", "congestion"],
    technologies: ["Python", "TensorFlow", "IoT", "Neural Networks", "Deep Learning"],
    designPatterns: ["MVC", "Observer", "Real-time Processing"],
    year: "2024",
    branch: "Computer Science",
  },
  {
    id: "proj-002",
    title: "AI-Powered Vehicle Detection",
    abstract: "vehicle detection computer vision object recognition autonomous driving machine learning",
    keywords: ["vehicle", "detection", "AI", "computer vision", "autonomous"],
    technologies: ["OpenCV", "YOLO", "Python", "CNN", "TensorFlow"],
    designPatterns: ["Pipeline", "CNN Architecture", "Real-time"],
    year: "2024",
    branch: "Computer Science",
  },
  {
    id: "proj-003",
    title: "Urban Mobility Analysis Platform",
    abstract: "urban mobility transportation analysis data visualization city planning smart infrastructure",
    keywords: ["mobility", "urban", "transportation", "analytics", "city"],
    technologies: ["React", "D3.js", "Python", "PostgreSQL", "REST API"],
    designPatterns: ["Dashboard", "Data Visualization", "Microservices"],
    year: "2023",
    branch: "Information Tech",
  },
  {
    id: "proj-004",
    title: "Blockchain Supply Chain Tracker",
    abstract: "blockchain supply chain transparency decentralized ledger tracking smart contracts ethereum",
    keywords: ["blockchain", "supply chain", "transparency", "tracking", "logistics"],
    technologies: ["Ethereum", "Solidity", "Web3.js", "React", "Node.js"],
    designPatterns: ["Smart Contracts", "DApp Architecture", "Event-driven"],
    year: "2024",
    branch: "Information Tech",
  },
  {
    id: "proj-005",
    title: "NLP Document Summarizer",
    abstract: "natural language processing document summarization text analysis extraction transformers bert",
    keywords: ["NLP", "summarization", "text analysis", "machine learning", "extraction"],
    technologies: ["Python", "BERT", "Transformers", "FastAPI", "Docker"],
    designPatterns: ["Transformer", "API Gateway", "Containerized"],
    year: "2023",
    branch: "Computer Science",
  },
];

// Simulated keywords extracted from uploaded documents
const getSimulatedDocumentContent = (fileName: string) => {
  const name = fileName.toLowerCase();
  
  // Exact match simulation - same project being uploaded
  if (name.includes("smart-traffic") || name.includes("smart_traffic") || name.includes("smarttraffic")) {
    return {
      abstract: "traffic flow optimization urban congestion neural networks deep learning real-time monitoring",
      keywords: ["traffic", "optimization", "urban", "smart city", "congestion"],
      technologies: ["Python", "TensorFlow", "IoT", "Neural Networks", "Deep Learning"],
      designPatterns: ["MVC", "Observer", "Real-time Processing"],
    };
  }
  
  if (name.includes("traffic") || name.includes("transport") || name.includes("vehicle")) {
    return {
      abstract: "traffic management vehicle detection urban transportation optimization smart monitoring",
      keywords: ["traffic", "vehicle", "urban", "optimization", "smart"],
      technologies: ["Python", "TensorFlow", "IoT"],
      designPatterns: ["Real-time", "MVC"],
    };
  }
  if (name.includes("blockchain") || name.includes("supply") || name.includes("chain")) {
    return {
      abstract: "blockchain supply chain management decentralized tracking smart contracts",
      keywords: ["blockchain", "supply chain", "tracking", "decentralized"],
      technologies: ["Ethereum", "Solidity", "React"],
      designPatterns: ["Smart Contracts", "DApp"],
    };
  }
  if (name.includes("nlp") || name.includes("text") || name.includes("document")) {
    return {
      abstract: "natural language processing text analysis document processing transformers",
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

const calculateSimilarity = (arr1: string[], arr2: string[]): { score: number; matched: string[] } => {
  const set1 = new Set(arr1.map(s => s.toLowerCase()));
  const set2 = new Set(arr2.map(s => s.toLowerCase()));
  const intersection = [...set1].filter(x => set2.has(x));
  const union = new Set([...set1, ...set2]);
  const score = union.size > 0 ? (intersection.length / union.size) * 100 : 0;
  // Return original casing from arr1 for matched items
  const matched = arr1.filter(item => 
    intersection.includes(item.toLowerCase())
  );
  return { score, matched };
};

const calculateAbstractSimilarity = (abstract1: string, abstract2: string): { score: number; matchedWords: string[] } => {
  const words1 = abstract1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = abstract2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const { score, matched } = calculateSimilarity(words1, words2);
  return { score, matchedWords: matched };
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const analyzeDocument = useCallback((file: File) => {
    const docContent = getSimulatedDocumentContent(file.name);
    
    const matches: MatchResult[] = projectDatabase.map(project => {
      const abstractResult = calculateAbstractSimilarity(docContent.abstract, project.abstract);
      const keywordResult = calculateSimilarity(docContent.keywords, project.keywords);
      const techResult = calculateSimilarity(docContent.technologies, project.technologies);
      const designResult = calculateSimilarity(docContent.designPatterns, project.designPatterns);
      
      // Calculate section matches with detailed breakdown
      const sectionMatches: SectionMatch[] = [
        {
          sectionName: "Abstract / Content",
          uploadedContent: docContent.abstract.split(/\s+/).filter(w => w.length > 3),
          originalContent: project.abstract.split(/\s+/).filter(w => w.length > 3),
          matchedItems: abstractResult.matchedWords,
          matchPercentage: Math.round(abstractResult.score),
          weight: 40,
          weightedScore: Math.round(abstractResult.score * 0.4),
        },
        {
          sectionName: "Keywords / Tags",
          uploadedContent: docContent.keywords,
          originalContent: project.keywords,
          matchedItems: keywordResult.matched,
          matchPercentage: Math.round(keywordResult.score),
          weight: 25,
          weightedScore: Math.round(keywordResult.score * 0.25),
        },
        {
          sectionName: "Technologies / Tools",
          uploadedContent: docContent.technologies,
          originalContent: project.technologies,
          matchedItems: techResult.matched,
          matchPercentage: Math.round(techResult.score),
          weight: 20,
          weightedScore: Math.round(techResult.score * 0.2),
        },
        {
          sectionName: "Design Patterns",
          uploadedContent: docContent.designPatterns,
          originalContent: project.designPatterns,
          matchedItems: designResult.matched,
          matchPercentage: Math.round(designResult.score),
          weight: 15,
          weightedScore: Math.round(designResult.score * 0.15),
        },
      ];

      const overallMatch = Math.round(
        abstractResult.score * 0.4 + keywordResult.score * 0.25 + techResult.score * 0.2 + designResult.score * 0.15
      );
      
      return {
        title: project.title,
        overallMatch,
        breakdown: {
          abstract: Math.round(abstractResult.score),
          keywords: Math.round(keywordResult.score),
          design: Math.round(designResult.score),
          technologies: Math.round(techResult.score),
        },
        matchedKeywords: keywordResult.matched,
        matchedTechnologies: techResult.matched,
        matchedDesignPatterns: designResult.matched,
        matchedAbstractWords: abstractResult.matchedWords,
        evidence: {
          abstractWords: abstractResult.matchedWords,
          keywords: keywordResult.matched,
          technologies: techResult.matched,
          designPatterns: designResult.matched,
        },
        originalProject: {
          abstract: project.abstract,
          keywords: project.keywords,
          technologies: project.technologies,
          designPatterns: project.designPatterns,
        },
        uploadedContent: {
          abstract: docContent.abstract,
          keywords: docContent.keywords,
          technologies: docContent.technologies,
          designPatterns: docContent.designPatterns,
        },
        sectionMatches,
      };
    }).filter(m => m.overallMatch > 20).sort((a, b) => b.overallMatch - a.overallMatch);
    
    const hasAbstractMatch = matches.some(m => m.breakdown.abstract >= 50);
    
    return { matches, hasAbstractMatch };
  }, []);

  const simulateAnalysis = useCallback((file: File) => {
    setUploadState((prev) => ({ ...prev, uploading: true, progress: 0 }));
    setExpandedSections({});

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
    setExpandedSections({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getMatchColor = (percent: number) => {
    if (percent >= 70) return "bg-destructive/10 text-destructive";
    if (percent >= 40) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
  };

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case "Abstract / Content": return <FileText className="h-3.5 w-3.5" />;
      case "Keywords / Tags": return <Tag className="h-3.5 w-3.5" />;
      case "Technologies / Tools": return <Code2 className="h-3.5 w-3.5" />;
      case "Design Patterns": return <Palette className="h-3.5 w-3.5" />;
      default: return <Layers className="h-3.5 w-3.5" />;
    }
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
              {uploadState.matches.some(m => m.overallMatch >= 95) ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    Project Already Exists!
                  </span>
                </>
              ) : uploadState.matches.length > 0 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-primary">
                    {uploadState.hasAbstractMatch ? "Abstract matches found" : "Similar projects detected"}
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
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
          {/* Existing Project Alert */}
          {uploadState.matches.some(m => m.overallMatch >= 95) && (
            <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <span className="text-sm font-bold text-destructive">⚠️ Duplicate Project Detected</span>
              </div>
              <p className="text-xs text-destructive/90 mb-3">
                This project already exists in the database with a <strong>100% match</strong>. 
                The similarity was determined by comparing multiple sections of your document against existing projects.
              </p>
              
              {/* Match Calculation Explanation */}
              <div className="bg-background/50 rounded-md p-3 border border-destructive/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Calculator className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-foreground">How 100% Match Was Calculated:</span>
                </div>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>• Abstract/Content (40% weight)</span>
                    <span className="text-destructive font-medium">100% × 0.40 = 40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Keywords/Tags (25% weight)</span>
                    <span className="text-destructive font-medium">100% × 0.25 = 25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Technologies (20% weight)</span>
                    <span className="text-destructive font-medium">100% × 0.20 = 20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Design Patterns (15% weight)</span>
                    <span className="text-destructive font-medium">100% × 0.15 = 15%</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-destructive/20 font-semibold text-destructive">
                    <span>Total Weighted Score</span>
                    <span>= 100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setActiveTab("abstract")}
              className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                activeTab === "abstract" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab("detailed")}
              className={`flex-1 text-xs font-medium py-2 px-3 rounded-md transition-colors ${
                activeTab === "detailed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full Report
            </button>
          </div>

          {activeTab === "abstract" ? (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Similarity Summary</h4>
              {uploadState.matches.filter(m => m.breakdown.abstract > 0).length > 0 ? (
                uploadState.matches.map((project) => (
                  <div key={project.title} className={`p-3 rounded-lg transition-colors ${
                    project.overallMatch >= 95 ? "bg-destructive/10 border border-destructive/20" : "bg-muted/50 hover:bg-muted"
                  }`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground">{project.title}</p>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        project.overallMatch >= 95 ? "bg-destructive text-destructive-foreground" : getMatchColor(project.breakdown.abstract)
                      }`}>
                        {project.overallMatch >= 95 ? "100%" : `${project.overallMatch}%`}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {project.overallMatch >= 95 ? "⚠️ Exact match - Project already exists in database!" :
                       project.breakdown.abstract >= 50 ? "High abstract similarity detected" :
                       project.breakdown.abstract >= 30 ? "Moderate content overlap" : "Low similarity"}
                    </p>
                    
                    {/* Quick stats for summary */}
                    {project.overallMatch >= 95 && (
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-border">
                        <div className="text-center p-2 bg-destructive/5 rounded">
                          <div className="text-lg font-bold text-destructive">{project.evidence.abstractWords.length}</div>
                          <div className="text-[10px] text-muted-foreground">Words Matched</div>
                        </div>
                        <div className="text-center p-2 bg-destructive/5 rounded">
                          <div className="text-lg font-bold text-destructive">{project.evidence.keywords.length + project.evidence.technologies.length}</div>
                          <div className="text-[10px] text-muted-foreground">Tags Matched</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No direct abstract matches. Check the Full Report for other similarities.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Detailed Similarity Report</h4>
              {uploadState.matches.map((project, projectIndex) => {
                const isDuplicate = project.overallMatch >= 95;
                
                return (
                  <div key={project.title} className={`rounded-lg border overflow-hidden ${
                    isDuplicate 
                      ? "bg-destructive/5 border-destructive/30" 
                      : "bg-muted/50 border-border"
                  }`}>
                    {/* Project Header */}
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-semibold text-foreground">{project.title}</p>
                          </div>
                          {isDuplicate && (
                            <p className="text-xs text-destructive font-medium mt-1 ml-6">⚠️ Duplicate Project - 100% Match</p>
                          )}
                        </div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
                          isDuplicate 
                            ? "bg-destructive text-destructive-foreground" 
                            : getMatchColor(project.overallMatch)
                        }`}>
                          {isDuplicate ? "100%" : `${project.overallMatch}%`} Match
                        </span>
                      </div>
                      
                      {/* Source Reference */}
                      <div className="flex items-center gap-1.5 mt-2 ml-6">
                        <Link2 className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          Original Source: <span className="font-medium text-foreground">{project.title}</span> in Project Database
                        </span>
                      </div>
                    </div>

                    {/* Section-by-Section Breakdown */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold text-foreground">Section-by-Section Analysis</span>
                      </div>

                      {project.sectionMatches.map((section, sectionIndex) => {
                        const sectionKey = `${projectIndex}-${sectionIndex}`;
                        const isExpanded = expandedSections[sectionKey];
                        const hasMatches = section.matchedItems.length > 0;

                        return (
                          <div 
                            key={sectionKey}
                            className={`rounded-lg border ${
                              isDuplicate && section.matchPercentage >= 80 
                                ? "border-destructive/30 bg-destructive/5" 
                                : "border-border bg-background/50"
                            }`}
                          >
                            {/* Section Header - Clickable */}
                            <button
                              onClick={() => toggleSection(sectionKey)}
                              className="w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className={isDuplicate ? "text-destructive" : "text-muted-foreground"}>
                                  {getSectionIcon(section.sectionName)}
                                </span>
                                <span className="text-xs font-medium text-foreground">{section.sectionName}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  isDuplicate && section.matchPercentage >= 80
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-muted text-muted-foreground"
                                }`}>
                                  {section.weight}% weight
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold ${
                                  isDuplicate && section.matchPercentage >= 80
                                    ? "text-destructive"
                                    : section.matchPercentage >= 50 
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-green-600 dark:text-green-400"
                                }`}>
                                  {isDuplicate ? "100%" : `${section.matchPercentage}%`}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </button>

                            {/* Section Details - Expandable */}
                            {isExpanded && (
                              <div className="px-3 pb-3 space-y-3">
                                {/* Progress Bar */}
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all ${
                                        isDuplicate ? "bg-destructive" : "bg-primary"
                                      }`}
                                      style={{ width: `${isDuplicate ? 100 : section.matchPercentage}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-muted-foreground w-16 text-right">
                                    → {section.weightedScore}% score
                                  </span>
                                </div>

                                {/* Matched Content */}
                                {hasMatches && (
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-medium text-foreground">Matched Items:</span>
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                        isDuplicate ? "bg-destructive/20 text-destructive" : "bg-primary/10 text-primary"
                                      }`}>
                                        {section.matchedItems.length} of {section.originalContent.length} matched
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {section.matchedItems.map((item, idx) => (
                                        <span 
                                          key={`${item}-${idx}`}
                                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                            isDuplicate
                                              ? "bg-destructive/15 text-destructive border border-destructive/30"
                                              : "bg-primary/10 text-primary"
                                          }`}
                                        >
                                          {section.sectionName.includes("Keywords") ? `#${item}` : item}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Content Comparison */}
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Your Document</span>
                                    <div className="mt-1 p-2 bg-muted/50 rounded text-[10px] text-muted-foreground max-h-20 overflow-y-auto">
                                      {section.uploadedContent.slice(0, 10).map((item, idx) => (
                                        <span 
                                          key={idx}
                                          className={`inline-block mr-1 mb-1 ${
                                            section.matchedItems.map(m => m.toLowerCase()).includes(item.toLowerCase())
                                              ? isDuplicate 
                                                ? "text-destructive font-semibold" 
                                                : "text-primary font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {item}{idx < Math.min(section.uploadedContent.length, 10) - 1 ? "," : ""}
                                        </span>
                                      ))}
                                      {section.uploadedContent.length > 10 && (
                                        <span className="text-muted-foreground/50">...+{section.uploadedContent.length - 10} more</span>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Original Source</span>
                                    <div className="mt-1 p-2 bg-muted/50 rounded text-[10px] text-muted-foreground max-h-20 overflow-y-auto">
                                      {section.originalContent.slice(0, 10).map((item, idx) => (
                                        <span 
                                          key={idx}
                                          className={`inline-block mr-1 mb-1 ${
                                            section.matchedItems.map(m => m.toLowerCase()).includes(item.toLowerCase())
                                              ? isDuplicate 
                                                ? "text-destructive font-semibold" 
                                                : "text-primary font-semibold"
                                              : ""
                                          }`}
                                        >
                                          {item}{idx < Math.min(section.originalContent.length, 10) - 1 ? "," : ""}
                                        </span>
                                      ))}
                                      {section.originalContent.length > 10 && (
                                        <span className="text-muted-foreground/50">...+{section.originalContent.length - 10} more</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Total Score Calculation */}
                      <div className={`mt-4 p-3 rounded-lg border ${
                        isDuplicate 
                          ? "bg-destructive/10 border-destructive/30" 
                          : "bg-muted border-border"
                      }`}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold text-foreground">Score Calculation</span>
                        </div>
                        <div className="space-y-1">
                          {project.sectionMatches.map((section, idx) => (
                            <div key={idx} className="flex justify-between text-[10px]">
                              <span className="text-muted-foreground">
                                {section.sectionName}: {isDuplicate ? "100%" : `${section.matchPercentage}%`} × {section.weight/100}
                              </span>
                              <span className={isDuplicate ? "text-destructive font-medium" : "text-foreground"}>
                                = {isDuplicate ? section.weight : section.weightedScore}%
                              </span>
                            </div>
                          ))}
                          <div className={`flex justify-between text-xs pt-1 border-t ${
                            isDuplicate ? "border-destructive/30" : "border-border"
                          }`}>
                            <span className="font-semibold text-foreground">Total Match</span>
                            <span className={`font-bold ${isDuplicate ? "text-destructive" : "text-primary"}`}>
                              = {isDuplicate ? "100%" : `${project.overallMatch}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
