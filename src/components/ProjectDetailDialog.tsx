import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, BookOpen, Tag, FileText } from "lucide-react";

interface Project {
  title: string;
  year: string;
  branch: string;
  tags: string[];
  description: string;
  fullDescription?: string;
  methodology?: string;
  outcomes?: string;
}

interface ProjectDetailDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProjectDetailDialog = ({ project, open, onOpenChange }: ProjectDetailDialogProps) => {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground leading-tight pr-6">
            {project.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of the project
          </DialogDescription>
        </DialogHeader>

        {/* Metadata Section */}
        <div className="flex flex-wrap gap-3 mt-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium text-foreground">{project.year}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium text-foreground">{project.branch}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {project.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Description */}
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <FileText className="h-4 w-4" />
              Project Overview
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.fullDescription || project.description}
            </p>
          </div>

          {project.methodology && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Methodology
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.methodology}
              </p>
            </div>
          )}

          {project.outcomes && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Key Outcomes
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.outcomes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog;
