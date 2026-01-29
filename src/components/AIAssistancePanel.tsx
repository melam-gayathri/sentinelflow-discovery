import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Sparkles, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface MatchResult {
  title: string;
  match: number;
}

interface UploadState {
  file: File | null;
  uploading: boolean;
  progress: number;
  analyzed: boolean;
  hasMatches: boolean;
  matches: MatchResult[];
}

const ACCEPTED_FORMATS = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

const AIAssistancePanel = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    analyzed: false,
    hasMatches: false,
    matches: [],
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateAnalysis = useCallback((file: File) => {
    setUploadState((prev) => ({ ...prev, uploading: true, progress: 0 }));

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadState((prev) => {
        if (prev.progress >= 100) {
          clearInterval(progressInterval);
          return prev;
        }
        return { ...prev, progress: prev.progress + 10 };
      });
    }, 150);

    // Simulate analysis completion
    setTimeout(() => {
      clearInterval(progressInterval);
      
      // Randomly determine if matches are found (for demo purposes)
      const hasMatches = Math.random() > 0.3;
      
      const mockMatches: MatchResult[] = hasMatches
        ? [
            { title: "Smart Traffic Management System", match: Math.floor(Math.random() * 20) + 80 },
            { title: "AI-Powered Vehicle Detection", match: Math.floor(Math.random() * 15) + 65 },
            { title: "Urban Mobility Analysis Platform", match: Math.floor(Math.random() * 20) + 50 },
          ].sort((a, b) => b.match - a.match)
        : [];

      setUploadState({
        file,
        uploading: false,
        progress: 100,
        analyzed: true,
        hasMatches,
        matches: mockMatches,
      });
    }, 1800);
  }, []);

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

  const handleClick = () => {
    fileInputRef.current?.click();
  };

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
      hasMatches: false,
      matches: [],
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card-elevated p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <Sparkles className="h-4 w-4 text-accent" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">AI Assistance</h3>
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
          <p className="text-sm font-medium text-foreground mb-1">
            Drag & Drop Files
          </p>
          <p className="text-xs text-muted-foreground">
            Upload .pdf, .doc, .docx, .ppt, .pptx
          </p>
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
            <button
              onClick={resetUpload}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {uploadState.uploading && (
            <div className="space-y-2">
              <Progress value={uploadState.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Analyzing document... {uploadState.progress}%
              </p>
            </div>
          )}

          {uploadState.analyzed && !uploadState.uploading && (
            <div className="flex items-center gap-2 text-sm">
              {uploadState.hasMatches ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 dark:text-green-400">
                    Analysis complete - {uploadState.matches.length} matches found
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">
                    Analysis complete - No matches found
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Results
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Results Section */}
      <div>
        {uploadState.analyzed && !uploadState.hasMatches ? (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-medium text-foreground mb-1">
              No Matches Detected
            </h4>
            <p className="text-xs text-muted-foreground">
              Your project appears to be unique. No similar projects found in our database.
            </p>
          </div>
        ) : uploadState.analyzed && uploadState.hasMatches ? (
          <>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Similar Projects Found
            </h4>
            <div className="space-y-3">
              {uploadState.matches.map((project) => (
                <div
                  key={project.title}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {project.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold mt-1 ${
                        project.match >= 80
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : project.match >= 60
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {project.match}% Match
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Upload a Project
            </h4>
            <p className="text-xs text-muted-foreground text-center py-4">
              Upload your project file to check for similarity with existing projects
              in our database.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AIAssistancePanel;
