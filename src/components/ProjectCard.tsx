import { ArrowRight } from "lucide-react";

interface ProjectCardProps {
  title: string;
  year: string;
  branch: string;
  tags: string[];
  description: string;
  index: number;
}

const ProjectCard = ({ title, year, branch, tags, description, index }: ProjectCardProps) => {
  return (
    <div 
      className={`card-elevated p-6 flex flex-col opacity-0 animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {year}
          </span>
          <span className="inline-flex items-center rounded-md bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
            {branch}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span key={tag} className="tag-badge">
            {tag}
          </span>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
        {description}
      </p>

      {/* CTA Button */}
      <button className="btn-primary w-full group">
        View Details
        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default ProjectCard;
