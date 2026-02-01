import { ChevronDown } from "lucide-react";

export interface Filters {
  year: string;
  branch: string;
  techStack: string;
}

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
}

const filterOptions = {
  year: ["All", "2024", "2023", "2022", "2021"],
  branch: ["All", "Computer Science", "Electronics", "Mechanical", "Civil", "Information Tech"],
  techStack: ["All", "Python", "React", "Machine Learning", "IoT", "Blockchain", "Deep Learning", "NLP", "AR", "Unity"],
};

const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const filterConfig = [
    { key: "year" as const, label: "Year", value: filters.year, options: filterOptions.year },
    { key: "branch" as const, label: "Branch", value: filters.branch, options: filterOptions.branch },
    { key: "techStack" as const, label: "Tech Stack", value: filters.techStack, options: filterOptions.techStack },
  ];

  return (
    <div className="bg-card border-b border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          {filterConfig.map((filter) => (
            <div key={filter.key} className="relative group">
              <button className="filter-dropdown">
                <span className="text-muted-foreground mr-1">{filter.label}:</span>
                <span className="text-foreground font-medium">{filter.value}</span>
                <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 min-w-[160px] bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {filter.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => onFilterChange(filter.key, option)}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors first:rounded-t-md last:rounded-b-md ${
                      filter.value === option 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          {/* Clear Filters Button */}
          {(filters.year !== "All" || filters.branch !== "All" || filters.techStack !== "All") && (
            <button
              onClick={() => {
                onFilterChange("year", "All");
                onFilterChange("branch", "All");
                onFilterChange("techStack", "All");
              }}
              className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
