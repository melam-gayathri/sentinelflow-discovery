import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import ProjectCard from "@/components/ProjectCard";
import AIAssistancePanel from "@/components/AIAssistancePanel";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";

const projects = [
  {
    title: "Intelligent Traffic Flow Optimization using Deep Learning",
    year: "2024",
    branch: "Computer Science",
    tags: ["#DeepLearning", "#IoT", "#SmartCity"],
    description: "A comprehensive system that uses neural networks to predict and optimize traffic patterns in urban environments for reduced congestion.",
  },
  {
    title: "Blockchain-Based Supply Chain Transparency Platform",
    year: "2024",
    branch: "Information Tech",
    tags: ["#Blockchain", "#Logistics", "#Web3"],
    description: "Decentralized application enabling end-to-end tracking and verification of products through the supply chain lifecycle.",
  },
  {
    title: "NLP-Powered Academic Document Analyzer",
    year: "2023",
    branch: "Computer Science",
    tags: ["#NLP", "#ML", "#Python"],
    description: "Natural language processing tool for extracting insights, summarizing content, and detecting plagiarism in academic documents.",
  },
  {
    title: "IoT-Enabled Smart Agriculture Monitoring",
    year: "2023",
    branch: "Electronics",
    tags: ["#IoT", "#Sensors", "#Agriculture"],
    description: "Real-time crop health monitoring system using wireless sensors and machine learning for precision agriculture.",
  },
  {
    title: "Augmented Reality Campus Navigation App",
    year: "2024",
    branch: "Computer Science",
    tags: ["#AR", "#Mobile", "#Unity"],
    description: "Mobile application providing interactive AR-based navigation and information overlay for university campus visitors.",
  },
  {
    title: "Predictive Maintenance for Industrial Equipment",
    year: "2023",
    branch: "Mechanical",
    tags: ["#ML", "#Industry4.0", "#Analytics"],
    description: "Machine learning model that predicts equipment failures before they occur, reducing downtime and maintenance costs.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FilterBar />
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8" id="explore">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  year={project.year}
                  branch={project.branch}
                  tags={project.tags}
                  description={project.description}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* AI Assistance Panel */}
          <div className="w-full lg:w-80 xl:w-96">
            <AIAssistancePanel />
          </div>
        </div>
      </main>

      <Footer />
      <FloatingAIButton />
    </div>
  );
};

export default Index;
