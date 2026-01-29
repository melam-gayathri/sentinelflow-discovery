import { ChevronDown } from "lucide-react";

const filters = [
  { label: "Year", value: "All", options: ["All", "2024", "2023", "2022", "2021"] },
  { label: "Branch", value: "All", options: ["All", "Computer Science", "Electronics", "Mechanical", "Civil"] },
  { label: "Tech Stack", value: "All", options: ["All", "Python", "React", "Machine Learning", "IoT", "Blockchain"] },
];

const FilterBar = () => {
  return (
    <div className="bg-card border-b border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
          {filters.map((filter) => (
            <div key={filter.label} className="relative group">
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
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors first:rounded-t-md last:rounded-b-md"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
