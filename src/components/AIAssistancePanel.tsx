import { Upload, FileText, Sparkles } from "lucide-react";

const similarProjects = [
  { title: "Smart Traffic Management System", match: 92 },
  { title: "AI-Powered Vehicle Detection", match: 87 },
  { title: "Urban Mobility Analysis Platform", match: 78 },
];

const AIAssistancePanel = () => {
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
      <div className="upload-zone mb-6">
        <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">
          Drag & Drop Files
        </p>
        <p className="text-xs text-muted-foreground">
          Upload .pdf or .docx to check similarity
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Results</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Similar Projects */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-4">
          Highly Similar Projects
        </h4>
        <div className="space-y-3">
          {similarProjects.map((project) => (
            <div
              key={project.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {project.title}
                </p>
                <span className="match-badge mt-1">
                  {project.match}% Match
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistancePanel;
