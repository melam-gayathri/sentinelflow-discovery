import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import ProjectCard, { Project } from "@/components/ProjectCard";
import AIAssistancePanel from "@/components/AIAssistancePanel";
import FloatingAIButton from "@/components/FloatingAIButton";
import Footer from "@/components/Footer";
import ProjectDetailDialog from "@/components/ProjectDetailDialog";

const projects: Project[] = [
  {
    title: "Intelligent Traffic Flow Optimization using Deep Learning",
    year: "2024",
    branch: "Computer Science",
    tags: ["#DeepLearning", "#IoT", "#SmartCity"],
    description: "A comprehensive system that uses neural networks to predict and optimize traffic patterns in urban environments for reduced congestion.",
    fullDescription: "This project presents a comprehensive intelligent traffic flow optimization system leveraging deep learning techniques to address urban congestion challenges. The system employs convolutional neural networks (CNNs) and recurrent neural networks (RNNs) to analyze real-time traffic data from IoT sensors deployed across urban intersections. By processing historical traffic patterns alongside live data streams, the model predicts congestion hotspots and dynamically adjusts traffic signal timings to optimize vehicle flow.",
    methodology: "The research utilized a multi-phase approach: (1) Data collection from 50+ IoT sensors across major intersections, (2) Feature engineering to extract temporal and spatial patterns, (3) Development of a hybrid CNN-LSTM architecture for prediction, and (4) Integration with existing traffic management infrastructure through REST APIs.",
    outcomes: "The system achieved a 23% reduction in average commute times during peak hours and a 15% decrease in vehicle idle time at intersections. The model maintains 94% prediction accuracy for congestion events up to 30 minutes in advance.",
  },
  {
    title: "Blockchain-Based Supply Chain Transparency Platform",
    year: "2024",
    branch: "Information Tech",
    tags: ["#Blockchain", "#Logistics", "#Web3"],
    description: "Decentralized application enabling end-to-end tracking and verification of products through the supply chain lifecycle.",
    fullDescription: "A decentralized application (DApp) built on Ethereum blockchain that provides immutable tracking and verification of products throughout the entire supply chain. The platform enables manufacturers, distributors, retailers, and consumers to verify product authenticity and trace the complete journey of goods from origin to destination.",
    methodology: "Smart contracts were developed in Solidity to handle product registration, ownership transfers, and verification processes. The frontend was built using React with Web3.js integration. IPFS was utilized for storing product documentation and certificates.",
    outcomes: "Successfully deployed on Ethereum testnet with 500+ test transactions. The platform reduced product verification time from days to seconds and eliminated 90% of manual documentation processes.",
  },
  {
    title: "NLP-Powered Academic Document Analyzer",
    year: "2023",
    branch: "Computer Science",
    tags: ["#NLP", "#ML", "#Python"],
    description: "Natural language processing tool for extracting insights, summarizing content, and detecting plagiarism in academic documents.",
    fullDescription: "An advanced NLP-powered tool designed for academic institutions to analyze, summarize, and validate research documents. The system employs transformer-based models for text understanding and generation, providing automated summarization, key phrase extraction, and similarity detection across a corpus of academic papers.",
    methodology: "The project utilized BERT and GPT-based models fine-tuned on academic datasets. A custom similarity detection algorithm was developed using cosine similarity and semantic embeddings. The system was containerized using Docker for scalable deployment.",
    outcomes: "Achieved 89% accuracy in plagiarism detection compared to leading commercial solutions. The summarization feature reduces reading time by 60% while maintaining 85% information retention.",
  },
  {
    title: "IoT-Enabled Smart Agriculture Monitoring",
    year: "2023",
    branch: "Electronics",
    tags: ["#IoT", "#Sensors", "#Agriculture"],
    description: "Real-time crop health monitoring system using wireless sensors and machine learning for precision agriculture.",
    fullDescription: "A comprehensive IoT ecosystem designed for precision agriculture, featuring wireless sensor networks that monitor soil moisture, nutrient levels, temperature, and crop health indicators. Machine learning models process sensor data to provide actionable recommendations for irrigation, fertilization, and pest control.",
    methodology: "ESP32 microcontrollers with various environmental sensors were deployed across test fields. Data was transmitted via LoRaWAN to a central gateway and processed in the cloud using Random Forest and Gradient Boosting algorithms.",
    outcomes: "Field trials demonstrated 30% water savings and 25% reduction in fertilizer usage while maintaining crop yields. The system provided early disease detection with 78% accuracy, enabling preventive action.",
  },
  {
    title: "Augmented Reality Campus Navigation App",
    year: "2024",
    branch: "Computer Science",
    tags: ["#AR", "#Mobile", "#Unity"],
    description: "Mobile application providing interactive AR-based navigation and information overlay for university campus visitors.",
    fullDescription: "A cross-platform mobile application utilizing augmented reality to provide intuitive navigation and contextual information for university campus visitors. The app overlays directional guidance, building information, and points of interest directly onto the camera view, enhancing the wayfinding experience.",
    methodology: "Developed using Unity with ARFoundation for cross-platform AR support. Indoor positioning was achieved through a hybrid approach combining BLE beacons and visual landmark recognition. The backend was built with Node.js and MongoDB.",
    outcomes: "User testing with 200+ participants showed 85% reduction in navigation-related queries at information desks. Average time to find destinations decreased by 40% compared to traditional maps.",
  },
  {
    title: "Predictive Maintenance for Industrial Equipment",
    year: "2023",
    branch: "Mechanical",
    tags: ["#ML", "#Industry4.0", "#Analytics"],
    description: "Machine learning model that predicts equipment failures before they occur, reducing downtime and maintenance costs.",
    fullDescription: "An Industry 4.0 solution implementing predictive maintenance for manufacturing equipment using vibration analysis, thermal imaging, and operational data. The system employs ensemble machine learning models to predict equipment failures days or weeks before they occur, enabling proactive maintenance scheduling.",
    methodology: "Sensor data from accelerometers and thermal cameras was collected over 6 months from 15 industrial machines. Feature extraction included FFT analysis for vibration patterns. XGBoost and Neural Network models were trained and deployed using a CI/CD pipeline.",
    outcomes: "Achieved 92% accuracy in predicting failures 7+ days in advance. Implementation resulted in 45% reduction in unplanned downtime and 30% decrease in maintenance costs during the pilot phase.",
  },
];

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

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
                  {...project}
                  index={index}
                  onViewDetails={handleViewDetails}
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

      {/* Project Detail Dialog */}
      <ProjectDetailDialog
        project={selectedProject}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default Index;
