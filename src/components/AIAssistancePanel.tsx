import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Sparkles, X, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, BookOpen, FileWarning, Copy, Eye, Layers } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  checkPlagiarism,
  getPlagiarismLevel,
  PlagiarismReport,
  SourceReference,
  PLAGIARISM_THRESHOLDS,
  SectionScore
} from "@/lib/plagiarismChecker";

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  analyzed: boolean;
  report: PlagiarismReport | null;
}

const ACCEPTED_FORMATS = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

// Mock project database with full content and metadata for section-based comparison
const projectDatabase = [
  {
    title: "Intelligent Traffic Flow Optimization using Deep Learning",
    description: "A comprehensive system that uses neural networks to predict and optimize traffic patterns in urban environments for reduced congestion.",
    fullText: `A comprehensive system that uses neural networks to predict and optimize traffic patterns in urban environments. The system employs CNN and RNN to analyze real-time traffic data from IoT sensors. It implements deep learning algorithms for congestion prediction and signal timing optimization. The architecture uses a hybrid CNN-LSTM model for temporal pattern recognition. Real-time data processing enables dynamic adjustment of traffic signals. The system integrates with existing smart city infrastructure through REST APIs. Machine learning models are trained on historical traffic data to improve prediction accuracy. The solution reduces average commute times by optimizing traffic flow. IoT sensors collect vehicle count and speed data at major intersections. The dashboard provides real-time visualization of traffic conditions across the city.`,
    tags: ["#DeepLearning", "#IoT", "#SmartCity", "#Python", "#TensorFlow", "#CNN", "#RNN"],
    methodology: "Experimental quantitative research using real-time data collection, CNN-LSTM hybrid architecture, supervised learning with historical traffic patterns"
  },
  {
    title: "Blockchain-Based Supply Chain Transparency Platform",
    description: "Decentralized application enabling end-to-end tracking and verification of products through the supply chain lifecycle.",
    fullText: `A decentralized application built on Ethereum for supply chain transparency and product tracking. The platform uses smart contracts to record every transaction and movement of goods. IPFS is utilized for storing product documentation and certificates. Manufacturers, distributors, retailers, and consumers can verify product authenticity. The system implements cryptographic verification for tamper-proof record keeping. Web3.js enables seamless interaction between the frontend and blockchain. Each product receives a unique digital identity stored on the distributed ledger. QR codes link physical products to their blockchain records. The solution eliminates counterfeit products through transparent tracking. Real-time visibility improves supply chain efficiency and trust.`,
    tags: ["#Blockchain", "#Ethereum", "#Web3", "#Solidity", "#IPFS", "#SmartContracts"],
    methodology: "Prototype development using decentralized architecture, smart contract implementation, distributed ledger for immutable records"
  },
  {
    title: "NLP-Powered Academic Document Analyzer",
    description: "Natural language processing tool for extracting insights, summarizing content, and detecting plagiarism in academic documents.",
    fullText: `A natural language processing system for academic document analysis and summarization. The platform implements BERT and GPT models for semantic understanding of research papers. Automatic summarization condenses lengthy documents into key insights. Plagiarism detection identifies copied content through text comparison algorithms. The system uses transformer architecture for contextual embeddings. Document classification organizes papers by research domain and methodology. Citation analysis maps relationships between academic works. Named entity recognition extracts key concepts and terminology. The API provides integration with research management tools. Semantic search enables finding relevant papers based on meaning rather than keywords.`,
    tags: ["#NLP", "#BERT", "#GPT", "#Python", "#Transformers", "#MachineLearning"],
    methodology: "Transfer learning with pre-trained transformer models, fine-tuning on academic corpus, semantic embedding analysis"
  },
  {
    title: "IoT-Enabled Smart Agriculture Monitoring",
    description: "Real-time crop health monitoring system using wireless sensors and machine learning for precision agriculture.",
    fullText: `A precision farming system using IoT sensors for crop health monitoring and irrigation control. Wireless sensors measure soil moisture, nutrients, and temperature across agricultural fields. Machine learning models predict optimal irrigation and fertilization schedules. ESP32 microcontrollers collect and transmit sensor data via LoRaWAN. Random Forest and Gradient Boosting algorithms analyze environmental conditions. The dashboard displays real-time crop health metrics and alerts. Automated irrigation systems respond to sensor data to optimize water usage. Historical data analysis identifies patterns in crop growth and yield. Weather integration improves prediction accuracy for farming decisions. The solution reduces water consumption while maximizing crop productivity.`,
    tags: ["#IoT", "#MachineLearning", "#ESP32", "#LoRaWAN", "#Arduino", "#Sensors"],
    methodology: "Experimental field deployment, quantitative sensor data analysis, supervised learning with environmental features"
  },
  {
    title: "Augmented Reality Campus Navigation App",
    description: "Mobile application providing interactive AR-based navigation and information overlay for university campus visitors.",
    fullText: `A mobile application using augmented reality for indoor campus navigation and wayfinding. ARFoundation and Unity provide the core AR experience on iOS and Android. BLE beacons enable precise indoor positioning where GPS is unavailable. Visual landmark recognition helps users orient themselves in complex buildings. The app overlays directional arrows and building information on the camera feed. Node.js backend manages building maps and point of interest data. MongoDB stores user preferences and navigation history. Cross-platform React Native components share code between mobile platforms. Accessibility features support users with visual or mobility impairments. Integration with class schedules provides contextual navigation to upcoming lectures.`,
    tags: ["#AR", "#Unity", "#Mobile", "#ReactNative", "#NodeJS", "#MongoDB", "#BLE"],
    methodology: "Prototype development, indoor positioning using BLE beacons, visual landmark recognition, cross-platform mobile development"
  },
  {
    title: "Predictive Maintenance for Industrial Equipment",
    description: "Machine learning model that predicts equipment failures before they occur, reducing downtime and maintenance costs.",
    fullText: `A machine learning system for predicting equipment failures in manufacturing environments. Vibration analysis and thermal imaging detect early signs of mechanical wear. XGBoost and neural networks process sensor data to identify failure patterns. FFT analysis transforms vibration signals into frequency domain features. The system integrates with Industry 4.0 infrastructure for real-time monitoring. Predictive models reduce unplanned downtime through proactive maintenance scheduling. CI/CD pipelines enable continuous improvement of machine learning models. Historical failure data trains algorithms to recognize pre-failure signatures. Alert systems notify maintenance teams of potential equipment issues. The dashboard provides equipment health scores and maintenance recommendations.`,
    tags: ["#MachineLearning", "#Industry40", "#XGBoost", "#Python", "#IoT", "#Analytics"],
    methodology: "Supervised learning with historical failure data, FFT signal processing, ensemble methods for classification"
  }
];

// Simulated document content extraction based on filename
const getSimulatedDocumentContent = (fileName: string): { 
  text: string; 
  tags: string[];
  title: string;
  methodology?: string;
} => {
  const name = fileName.toLowerCase();
  
  // Keyword triggers for exact matches
  const triggers: Record<string, number> = {
    "intelligent": 0, "traffic-flow": 0, "traffic_flow": 0, "trafficflow": 0,
    "blockchain": 1, "supply-chain": 1, "supplychain": 1,
    "nlp": 2, "document-analyzer": 2, "academic-analyzer": 2,
    "smart-agriculture": 3, "agriculture-monitoring": 3, "smart-farming": 3,
    "ar-navigation": 4, "campus-navigation": 4, "augmented-reality": 4, "ar-campus": 4,
    "predictive-maintenance": 5, "industrial-equipment": 5, "equipment-maintenance": 5
  };
  
  for (const [keyword, index] of Object.entries(triggers)) {
    if (name.includes(keyword.replace(/-/g, "")) || name.includes(keyword)) {
      const project = projectDatabase[index];
      return {
        text: project.fullText,
        tags: project.tags,
        title: project.title,
        methodology: project.methodology
      };
    }
  }
  
  // Check for partial word matches in project titles
  for (const project of projectDatabase) {
    const titleWords = project.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const matchCount = titleWords.filter(word => name.includes(word)).length;
    if (matchCount >= 2) {
      return {
        text: project.fullText,
        tags: project.tags,
        title: project.title,
        methodology: project.methodology
      };
    }
  }
  
  // Return unique content for unknown files
  return {
    text: `This is a unique research project focusing on novel approaches and methodologies. The implementation uses custom algorithms developed specifically for this application. Original data collection methods ensure the authenticity of results. The system architecture was designed from scratch without referencing existing solutions. All code and documentation are original works created for this submission.`,
    tags: ["#Novel", "#Original", "#Research"],
    title: fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
  };
};

const AIAssistancePanel = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    analyzed: false,
    report: null
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sections" | "sources">("overview");
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSource = (index: number) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const analyzeDocument = useCallback((file: File) => {
    const content = getSimulatedDocumentContent(file.name);
    const report = checkPlagiarism(
      content.text, 
      projectDatabase,
      {
        title: content.title,
        tags: content.tags,
        methodology: content.methodology
      }
    );
    return report;
  }, []);

  const simulateAnalysis = useCallback((file: File) => {
    setUploadState(prev => ({ ...prev, uploading: true, progress: 0 }));
    setExpandedSources(new Set());

    const progressInterval = setInterval(() => {
      setUploadState(prev => {
        if (prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 6 };
      });
    }, 100);

    setTimeout(() => {
      clearInterval(progressInterval);
      const report = analyzeDocument(file);

      setUploadState({
        file,
        uploading: false,
        progress: 100,
        analyzed: true,
        report
      });
    }, 1800);
  }, [analyzeDocument]);

  const handleFileSelect = useCallback((file: File) => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_FORMATS.includes(extension)) {
      alert(`Invalid file format. Please upload: ${ACCEPTED_FORMATS.join(", ")}`);
      return;
    }
    simulateAnalysis(file);
  }, [simulateAnalysis]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

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
      report: null
    });
    setExpandedSources(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score >= PLAGIARISM_THRESHOLDS.HIGH_SIMILARITY) return "text-destructive";
    if (score >= PLAGIARISM_THRESHOLDS.MODERATE) return "text-amber-600 dark:text-amber-400";
    return "text-green-600 dark:text-green-400";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= PLAGIARISM_THRESHOLDS.HIGH_SIMILARITY) return "bg-destructive/10";
    if (score >= PLAGIARISM_THRESHOLDS.MODERATE) return "bg-amber-100 dark:bg-amber-900/20";
    return "bg-green-100 dark:bg-green-900/20";
  };

  const getSectionLabel = (section: string) => {
    const labels: Record<string, string> = {
      title: "Title",
      abstract: "Abstract",
      technologies: "Technologies",
      keywords: "Keywords",
      methodology: "Methodology"
    };
    return labels[section] || section;
  };

  const getSectionWeight = (section: string) => {
    const weights: Record<string, string> = {
      title: "15%",
      abstract: "35%",
      technologies: "25%",
      keywords: "15%",
      methodology: "10%"
    };
    return weights[section] || "0%";
  };

  const { report } = uploadState;
  const plagiarismLevel = report ? getPlagiarismLevel(report.overallPlagiarismScore) : null;

  return (
    <div className="card-elevated p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Plagiarism Checker</h3>
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
          <p className="text-sm font-medium text-foreground mb-1">Upload Document</p>
          <p className="text-xs text-muted-foreground">Drop .pdf, .doc, .docx, .ppt, .pptx</p>
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
                {uploadState.progress < 30 ? "Extracting sections..." :
                 uploadState.progress < 60 ? "Analyzing technologies & keywords..." :
                 uploadState.progress < 85 ? "Comparing abstracts semantically..." :
                 "Calculating section scores..."}
              </p>
            </div>
          )}

          {uploadState.analyzed && report && (
            <div className="flex items-center gap-2 text-sm">
              {report.isExactDuplicate ? (
                <>
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    Duplicate Document Detected!
                  </span>
                </>
              ) : report.isDifferentTechnology ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Different technology approach
                  </span>
                </>
              ) : report.overallPlagiarismScore >= PLAGIARISM_THRESHOLDS.HIGH_SIMILARITY ? (
                <>
                  <FileWarning className="h-4 w-4 text-destructive" />
                  <span className="text-destructive font-medium">
                    High similarity detected
                  </span>
                </>
              ) : report.overallPlagiarismScore >= PLAGIARISM_THRESHOLDS.MODERATE ? (
                <>
                  <Copy className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Some matching content found
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">Original content verified</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Results Section */}
      {uploadState.analyzed && report && (
        <>
          {/* Overall Score Card */}
          <div className={`mb-4 p-4 rounded-lg border ${
            report.isExactDuplicate 
              ? "bg-destructive/10 border-destructive/30" 
              : getScoreBgColor(report.overallPlagiarismScore) + " border-border"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Similarity Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(report.overallPlagiarismScore)}`}>
                {report.overallPlagiarismScore}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full transition-all ${
                  report.overallPlagiarismScore >= PLAGIARISM_THRESHOLDS.HIGH_SIMILARITY 
                    ? "bg-destructive" 
                    : report.overallPlagiarismScore >= PLAGIARISM_THRESHOLDS.MODERATE 
                      ? "bg-amber-500" 
                      : "bg-green-500"
                }`}
                style={{ width: `${report.overallPlagiarismScore}%` }}
              />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-background/50 rounded">
                <div className="text-lg font-bold text-foreground">{report.totalWords}</div>
                <div className="text-[10px] text-muted-foreground">Words Analyzed</div>
              </div>
              <div className="p-2 bg-background/50 rounded">
                <div className={`text-lg font-bold ${getScoreColor(report.overallPlagiarismScore)}`}>
                  {report.totalWordsCopied}
                </div>
                <div className="text-[10px] text-muted-foreground">Estimated Match</div>
              </div>
              <div className="p-2 bg-background/50 rounded">
                <div className="text-lg font-bold text-foreground">{report.sourceProjects.length}</div>
                <div className="text-[10px] text-muted-foreground">Sources Found</div>
              </div>
            </div>

            {/* Technology Differentiation Notice */}
            {report.isDifferentTechnology && (
              <div className="mt-3 p-2 bg-green-100/50 dark:bg-green-900/20 rounded text-center">
                <p className="text-[11px] text-green-700 dark:text-green-400">
                  ✓ Uses different technologies than similar projects
                </p>
              </div>
            )}

            {/* Status Badge */}
            {plagiarismLevel && (
              <div className="mt-3 flex justify-center">
                <Badge 
                  variant={plagiarismLevel.level === "unique" ? "secondary" : "destructive"}
                  className={
                    plagiarismLevel.level === "unique" 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                      : plagiarismLevel.level === "moderate" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : ""
                  }
                >
                  {plagiarismLevel.label}
                </Badge>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          {(report.sourceProjects.length > 0 || report.matches.length > 0) && (
            <>
              <div className="flex gap-1 mb-4 p-1 bg-muted rounded-lg">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-colors ${
                    activeTab === "overview" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("sections")}
                  className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-colors ${
                    activeTab === "sections" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sections
                </button>
                <button
                  onClick={() => setActiveTab("sources")}
                  className={`flex-1 text-xs font-medium py-2 px-2 rounded-md transition-colors ${
                    activeTab === "sources" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sources
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Analysis Method
                  </h4>
                  
                  {/* Algorithm Explanation */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-xs font-medium text-foreground mb-2">Section-Based Comparison:</div>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-foreground">•</span>
                        <span>Compares Title, Abstract, Technologies, Keywords, Methodology</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-foreground">•</span>
                        <span>Semantic meaning over word-level matching</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-foreground">•</span>
                        <span>Different tech = different project (even if similar problem)</span>
                      </div>
                    </div>
                  </div>

                  {/* Section Weights */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-xs font-medium text-foreground mb-2">Section Weights:</div>
                    <div className="grid grid-cols-5 gap-1 text-center">
                      {["title", "abstract", "technologies", "keywords", "methodology"].map(section => (
                        <div key={section} className="p-1.5 bg-background/50 rounded">
                          <div className="text-[10px] font-medium text-foreground">{getSectionWeight(section)}</div>
                          <div className="text-[8px] text-muted-foreground capitalize">{section.slice(0, 4)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Differentiators */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="text-xs font-medium text-foreground mb-2">Key Rules:</div>
                    <div className="space-y-1 text-[11px] text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Same problem + different tech = <strong>different project</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Same tech + different abstract = <strong>different project</strong></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-destructive">✗</span>
                        <span>Same abstract + same tech = <strong>potential plagiarism</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "sections" && (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3 pr-2">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Section Breakdown
                    </h4>
                    
                    {report.sourceProjects.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No similar sections found
                      </p>
                    ) : (
                      report.sourceProjects.map((source: SourceReference, idx: number) => (
                        <div 
                          key={idx}
                          className="rounded-lg border bg-muted/30 border-border overflow-hidden"
                        >
                          <div className="p-3 border-b border-border/50">
                            <p className="text-xs font-medium text-foreground truncate mb-1">
                              vs. {source.projectTitle}
                            </p>
                            <Badge 
                              variant={source.matchPercentage >= 70 ? "destructive" : "secondary"}
                              className="text-[10px]"
                            >
                              {source.matchPercentage}% overall
                            </Badge>
                          </div>
                          
                          {source.sectionScores && (
                            <div className="p-2 space-y-1.5">
                              {source.sectionScores.map((section: SectionScore, sIdx: number) => (
                                <div key={sIdx} className="flex items-center gap-2">
                                  <span className="text-[10px] text-muted-foreground w-20 capitalize">
                                    {getSectionLabel(section.section)}
                                  </span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${
                                        section.similarity >= 70 
                                          ? "bg-destructive" 
                                          : section.similarity >= 40 
                                            ? "bg-amber-500" 
                                            : "bg-green-500"
                                      }`}
                                      style={{ width: `${section.similarity}%` }}
                                    />
                                  </div>
                                  <span className={`text-[10px] font-medium w-10 text-right ${
                                    section.similarity >= 70 
                                      ? "text-destructive" 
                                      : section.similarity >= 40 
                                        ? "text-amber-600" 
                                        : "text-green-600"
                                  }`}>
                                    {section.similarity}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}

              {activeTab === "sources" && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Source Projects ({report.sourceProjects.length})
                  </h4>
                  
                  {report.sourceProjects.length === 0 ? (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        No matching sources found in database
                      </p>
                    </div>
                  ) : (
                    report.sourceProjects.map((source: SourceReference, idx: number) => {
                      const isExpanded = expandedSources.has(idx);
                      
                      return (
                        <div 
                          key={idx}
                          className={`rounded-lg border overflow-hidden ${
                            source.matchPercentage >= 70 
                              ? "bg-destructive/5 border-destructive/30" 
                              : "bg-muted/30 border-border"
                          }`}
                        >
                          <button
                            onClick={() => toggleSource(idx)}
                            className="w-full p-3 flex items-start justify-between text-left hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {source.projectTitle}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">
                                Click to view section details
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge 
                                variant={source.matchPercentage >= 70 ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {source.matchPercentage}%
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </button>
                          
                          {isExpanded && source.sectionScores && (
                            <div className="px-3 pb-3 border-t border-border/50">
                              <div className="pt-2 space-y-2">
                                {source.sectionScores.map((section: SectionScore, sIdx: number) => (
                                  <div key={sIdx} className="p-2 bg-background/50 rounded">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[11px] font-medium text-foreground capitalize">
                                        {getSectionLabel(section.section)}
                                      </span>
                                      <span className={`text-[11px] font-bold ${
                                        section.similarity >= 70 
                                          ? "text-destructive" 
                                          : section.similarity >= 40 
                                            ? "text-amber-600" 
                                            : "text-green-600"
                                      }`}>
                                        {section.similarity}%
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                      {section.details}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </>
          )}

          {/* No matches state */}
          {report.sourceProjects.length === 0 && report.matches.length === 0 && (
            <div className="text-center py-6">
              <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
              <h4 className="text-sm font-medium text-foreground mb-1">Original Content</h4>
              <p className="text-xs text-muted-foreground">
                No similar projects detected. Your document appears to be unique.
              </p>
            </div>
          )}
        </>
      )}

      {/* How it works - shown when no file */}
      {!uploadState.file && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Method</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="space-y-3 text-xs text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">1.</span>
              <span>Compares sections: Title, Abstract, Technologies, Keywords</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">2.</span>
              <span>Semantic comparison (meaning, not word-by-word)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-foreground">3.</span>
              <span>Different tech stack = different project</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistancePanel;
