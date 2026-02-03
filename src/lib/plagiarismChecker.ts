// Plagiarism Detection Algorithm
// Section-based semantic comparison: Title, Abstract, Technologies, Keywords, Methodology

// ============= Type Definitions =============

export interface SectionScore {
  section: "title" | "abstract" | "technologies" | "keywords" | "methodology";
  similarity: number;
  weight: number;
  weightedScore: number;
  details: string;
}

export interface PlagiarismMatch {
  matchedText: string;
  sourceProject: string;
  sourceLocation: string;
  uploadedLocation: string;
  similarity: number;
  matchType: "exact" | "paraphrase" | "partial";
}

export interface SentenceMatch {
  uploadedSentence: string;
  sourceSentence: string;
  sourceProject: string;
  similarity: number;
  lineNumber: number;
}

export interface SourceReference {
  projectTitle: string;
  matchPercentage: number;
  wordsCopied: number;
  sentencesMatched: number;
  sectionScores: SectionScore[];
}

export interface PlagiarismReport {
  overallPlagiarismScore: number;
  originalContentScore: number;
  totalWordsCopied: number;
  totalWords: number;
  matches: PlagiarismMatch[];
  sentenceBreakdown: SentenceMatch[];
  sourceProjects: SourceReference[];
  isExactDuplicate: boolean;
  isDifferentTechnology: boolean;
}

// ============= Section Weights =============
// These weights determine how much each section contributes to similarity

const SECTION_WEIGHTS = {
  title: 0.15,        // 15% - Title similarity
  abstract: 0.35,     // 35% - Abstract/description is key differentiator
  technologies: 0.25, // 25% - Different tech = different project
  keywords: 0.15,     // 15% - Domain keywords
  methodology: 0.10   // 10% - Implementation approach
};

// ============= Technology Keywords =============
// Common technology terms to extract from text

const TECHNOLOGY_KEYWORDS = new Set([
  // Programming Languages
  "python", "javascript", "typescript", "java", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "scala", "r",
  // ML/AI Frameworks
  "tensorflow", "pytorch", "keras", "scikit-learn", "sklearn", "opencv", "nltk", "spacy", "huggingface", "transformers",
  // Web Frameworks
  "react", "angular", "vue", "nextjs", "express", "django", "flask", "fastapi", "spring", "rails", "laravel",
  // Databases
  "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "firebase", "supabase", "dynamodb", "cassandra",
  // Cloud/DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "jenkins", "github", "gitlab", "ci/cd",
  // Technologies
  "blockchain", "ethereum", "solidity", "web3", "ipfs", "iot", "mqtt", "raspberry", "arduino",
  "machine-learning", "deep-learning", "neural-network", "cnn", "rnn", "lstm", "transformer", "bert", "gpt",
  "nlp", "computer-vision", "reinforcement-learning", "gan", "vae",
  "rest", "graphql", "grpc", "websocket", "mqtt",
  "unity", "unreal", "ar", "vr", "arkit", "arcore",
  // Data Science
  "pandas", "numpy", "scipy", "matplotlib", "seaborn", "tableau", "powerbi",
  // Mobile
  "android", "ios", "flutter", "react-native", "xamarin"
]);

// ============= Methodology Keywords =============

const METHODOLOGY_KEYWORDS = new Set([
  // Research Methods
  "experimental", "quantitative", "qualitative", "survey", "case-study", "prototype",
  "simulation", "modeling", "optimization", "analysis", "evaluation", "comparison",
  // Development Approaches
  "agile", "waterfall", "scrum", "tdd", "bdd", "devops", "microservices", "monolithic",
  // ML Approaches
  "supervised", "unsupervised", "semi-supervised", "transfer-learning", "fine-tuning",
  "classification", "regression", "clustering", "detection", "segmentation", "prediction",
  // Architecture
  "client-server", "peer-to-peer", "distributed", "centralized", "decentralized",
  "real-time", "batch", "streaming", "event-driven"
]);

// ============= Text Processing =============

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractWords(text: string): string[] {
  return normalizeText(text).split(" ").filter(w => w.length > 2);
}

export function extractKeyPhrases(text: string): string[] {
  // Extract meaningful phrases (2-4 word combinations) for semantic comparison
  const normalized = normalizeText(text);
  const words = normalized.split(" ").filter(w => w.length > 2);
  
  const phrases: string[] = [];
  
  // Single important words
  words.forEach(w => {
    if (w.length > 4) phrases.push(w);
  });
  
  // Bi-grams
  for (let i = 0; i < words.length - 1; i++) {
    phrases.push(`${words[i]} ${words[i + 1]}`);
  }
  
  return [...new Set(phrases)];
}

export function extractTechnologies(text: string): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(" ");
  const found = new Set<string>();
  
  words.forEach(word => {
    if (TECHNOLOGY_KEYWORDS.has(word)) {
      found.add(word);
    }
  });
  
  // Also check for compound terms
  const compoundTerms = [
    "deep learning", "machine learning", "neural network", "computer vision",
    "natural language", "reinforcement learning", "transfer learning",
    "real time", "real-time"
  ];
  
  compoundTerms.forEach(term => {
    if (normalized.includes(term)) {
      found.add(term.replace(" ", "-"));
    }
  });
  
  return found;
}

export function extractMethodology(text: string): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(" ");
  const found = new Set<string>();
  
  words.forEach(word => {
    if (METHODOLOGY_KEYWORDS.has(word)) {
      found.add(word);
    }
  });
  
  return found;
}

export function extractKeywords(tags: string[]): Set<string> {
  return new Set(
    tags.map(tag => 
      tag.toLowerCase()
        .replace(/^#/, "")
        .replace(/[^\w-]/g, "")
    )
  );
}

// ============= Semantic Similarity Functions =============

/**
 * Calculate Jaccard similarity between two sets
 */
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
  if (set1.size === 0 && set2.size === 0) return 0;
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
}

/**
 * Calculate semantic similarity between two texts based on key phrases
 * This compares overall meaning, not individual words
 */
function semanticTextSimilarity(text1: string, text2: string): number {
  const phrases1 = new Set(extractKeyPhrases(text1));
  const phrases2 = new Set(extractKeyPhrases(text2));
  
  // If either text is empty, return 0
  if (phrases1.size === 0 || phrases2.size === 0) return 0;
  
  // Calculate overlap of key phrases
  const intersection = [...phrases1].filter(p => phrases2.has(p));
  const union = new Set([...phrases1, ...phrases2]);
  
  // Base Jaccard score
  const jaccardScore = (intersection.length / union.size) * 100;
  
  // Bonus for matching longer phrases (indicates structural similarity)
  let structureBonus = 0;
  intersection.forEach(phrase => {
    if (phrase.includes(" ")) {
      structureBonus += 5; // Bonus for multi-word phrase matches
    }
  });
  structureBonus = Math.min(structureBonus, 20);
  
  return Math.min(100, jaccardScore + structureBonus);
}

/**
 * Calculate title similarity
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(extractWords(title1).filter(w => w.length > 3));
  const words2 = new Set(extractWords(title2).filter(w => w.length > 3));
  
  return jaccardSimilarity(words1, words2);
}

// ============= Section-Based Comparison =============

interface ProjectSection {
  title: string;
  abstract: string;
  technologies: Set<string>;
  keywords: Set<string>;
  methodology: Set<string>;
}

function extractProjectSections(
  title: string,
  description: string,
  fullDescription: string,
  tags: string[],
  methodology?: string
): ProjectSection {
  const fullText = `${description} ${fullDescription} ${methodology || ""}`;
  
  return {
    title,
    abstract: fullDescription || description,
    technologies: extractTechnologies(fullText),
    keywords: extractKeywords(tags),
    methodology: extractMethodology(fullText + " " + (methodology || ""))
  };
}

function compareSections(
  uploaded: ProjectSection,
  source: ProjectSection
): SectionScore[] {
  const scores: SectionScore[] = [];
  
  // Title comparison
  const titleSim = calculateTitleSimilarity(uploaded.title, source.title);
  scores.push({
    section: "title",
    similarity: Math.round(titleSim),
    weight: SECTION_WEIGHTS.title,
    weightedScore: titleSim * SECTION_WEIGHTS.title,
    details: `Title words overlap: ${Math.round(titleSim)}%`
  });
  
  // Abstract comparison (semantic, not word-level)
  const abstractSim = semanticTextSimilarity(uploaded.abstract, source.abstract);
  scores.push({
    section: "abstract",
    similarity: Math.round(abstractSim),
    weight: SECTION_WEIGHTS.abstract,
    weightedScore: abstractSim * SECTION_WEIGHTS.abstract,
    details: `Abstract semantic similarity: ${Math.round(abstractSim)}%`
  });
  
  // Technologies comparison (CRITICAL - different tech = different project)
  const techSim = jaccardSimilarity(uploaded.technologies, source.technologies);
  scores.push({
    section: "technologies",
    similarity: Math.round(techSim),
    weight: SECTION_WEIGHTS.technologies,
    weightedScore: techSim * SECTION_WEIGHTS.technologies,
    details: `Technologies match: ${[...uploaded.technologies].filter(t => source.technologies.has(t)).join(", ") || "None"}`
  });
  
  // Keywords comparison
  const keywordSim = jaccardSimilarity(uploaded.keywords, source.keywords);
  scores.push({
    section: "keywords",
    similarity: Math.round(keywordSim),
    weight: SECTION_WEIGHTS.keywords,
    weightedScore: keywordSim * SECTION_WEIGHTS.keywords,
    details: `Keywords overlap: ${Math.round(keywordSim)}%`
  });
  
  // Methodology comparison
  const methodSim = jaccardSimilarity(uploaded.methodology, source.methodology);
  scores.push({
    section: "methodology",
    similarity: Math.round(methodSim),
    weight: SECTION_WEIGHTS.methodology,
    weightedScore: methodSim * SECTION_WEIGHTS.methodology,
    details: `Methodology approach: ${Math.round(methodSim)}%`
  });
  
  return scores;
}

// ============= Main Plagiarism Check =============

interface ProjectContent {
  title: string;
  description?: string;
  fullText: string;
  tags?: string[];
  methodology?: string;
}

export function checkPlagiarism(
  uploadedText: string,
  projectDatabase: ProjectContent[],
  uploadedMetadata?: {
    title?: string;
    tags?: string[];
    methodology?: string;
  }
): PlagiarismReport {
  // Extract sections from uploaded document
  const uploadedTitle = uploadedMetadata?.title || extractTitleFromText(uploadedText);
  const uploadedTags = uploadedMetadata?.tags || [];
  
  const uploadedSections = extractProjectSections(
    uploadedTitle,
    uploadedText.substring(0, 200),
    uploadedText,
    uploadedTags,
    uploadedMetadata?.methodology
  );
  
  const allMatches: PlagiarismMatch[] = [];
  const allSentenceMatches: SentenceMatch[] = [];
  const sourceRefs: SourceReference[] = [];
  
  let isExactDuplicate = false;
  let isDifferentTechnology = false;
  let maxOverallScore = 0;
  
  const uploadedWords = extractWords(uploadedText);
  const totalWords = uploadedWords.length;
  
  // Compare against each project in database
  for (const project of projectDatabase) {
    const sourceSections = extractProjectSections(
      project.title,
      project.description || "",
      project.fullText,
      project.tags || [],
      project.methodology
    );
    
    // Compare all sections
    const sectionScores = compareSections(uploadedSections, sourceSections);
    
    // Calculate weighted overall score
    const overallScore = sectionScores.reduce((sum, s) => sum + s.weightedScore, 0);
    
    // Check for technology differentiation
    const techScore = sectionScores.find(s => s.section === "technologies");
    const abstractScore = sectionScores.find(s => s.section === "abstract");
    const titleScore = sectionScores.find(s => s.section === "title");
    
    // If technologies are significantly different (<30%), treat as different project
    // even if problem statement is similar
    if (techScore && techScore.similarity < 30 && titleScore && titleScore.similarity > 50) {
      isDifferentTechnology = true;
    }
    
    // Determine if this is an exact duplicate
    // All sections must be highly similar (>90% weighted average)
    if (overallScore >= 90 && techScore && techScore.similarity >= 80) {
      isExactDuplicate = true;
    }
    
    // Only count as plagiarism if BOTH abstract AND technologies match
    // Different abstract with same tech = different implementation
    // Same abstract with different tech = different project
    const effectiveScore = calculateEffectiveScore(sectionScores);
    
    if (effectiveScore > 20) {
      if (effectiveScore > maxOverallScore) {
        maxOverallScore = effectiveScore;
      }
      
      // Estimate words "copied" based on abstract similarity
      const wordsCopied = Math.round(totalWords * (effectiveScore / 100));
      
      sourceRefs.push({
        projectTitle: project.title,
        matchPercentage: Math.round(effectiveScore),
        wordsCopied,
        sentencesMatched: Math.round(effectiveScore / 10),
        sectionScores
      });
      
      // Create match entries for high-similarity sections
      sectionScores
        .filter(s => s.similarity >= 60)
        .forEach(s => {
          const matchType: "exact" | "paraphrase" | "partial" = 
            s.similarity >= 90 ? "exact" :
            s.similarity >= 70 ? "paraphrase" : "partial";
          
          allMatches.push({
            matchedText: `${s.section.charAt(0).toUpperCase() + s.section.slice(1)} section`,
            sourceProject: project.title,
            sourceLocation: s.section,
            uploadedLocation: s.section,
            similarity: s.similarity,
            matchType
          });
        });
    }
  }
  
  // Calculate final plagiarism score
  let overallPlagiarismScore = Math.round(maxOverallScore);
  
  // If technologies are completely different, cap the plagiarism score
  if (isDifferentTechnology) {
    overallPlagiarismScore = Math.min(overallPlagiarismScore, 40);
  }
  
  // If exact duplicate, set to 100%
  if (isExactDuplicate) {
    overallPlagiarismScore = 100;
  }
  
  overallPlagiarismScore = Math.min(100, overallPlagiarismScore);
  
  return {
    overallPlagiarismScore,
    originalContentScore: 100 - overallPlagiarismScore,
    totalWordsCopied: Math.round(totalWords * (overallPlagiarismScore / 100)),
    totalWords,
    matches: allMatches.sort((a, b) => b.similarity - a.similarity),
    sentenceBreakdown: allSentenceMatches,
    sourceProjects: sourceRefs.sort((a, b) => b.matchPercentage - a.matchPercentage),
    isExactDuplicate,
    isDifferentTechnology
  };
}

/**
 * Calculate effective similarity score based on section interactions
 * Different technologies with same abstract = low score
 * Same technologies with different abstract = low score
 * Both similar = high score
 */
function calculateEffectiveScore(sectionScores: SectionScore[]): number {
  const tech = sectionScores.find(s => s.section === "technologies")?.similarity || 0;
  const abstract = sectionScores.find(s => s.section === "abstract")?.similarity || 0;
  const title = sectionScores.find(s => s.section === "title")?.similarity || 0;
  const keywords = sectionScores.find(s => s.section === "keywords")?.similarity || 0;
  const method = sectionScores.find(s => s.section === "methodology")?.similarity || 0;
  
  // If technologies are very different (<30%), significantly reduce score
  if (tech < 30) {
    return Math.min(40, (title * 0.3 + abstract * 0.3 + keywords * 0.2 + method * 0.2));
  }
  
  // If abstract is very different (<30%), significantly reduce score
  if (abstract < 30) {
    return Math.min(40, (title * 0.3 + tech * 0.3 + keywords * 0.2 + method * 0.2));
  }
  
  // Both abstract and tech are similar - use weighted average
  return (
    title * SECTION_WEIGHTS.title +
    abstract * SECTION_WEIGHTS.abstract +
    tech * SECTION_WEIGHTS.technologies +
    keywords * SECTION_WEIGHTS.keywords +
    method * SECTION_WEIGHTS.methodology
  ) * 100 / (
    SECTION_WEIGHTS.title +
    SECTION_WEIGHTS.abstract +
    SECTION_WEIGHTS.technologies +
    SECTION_WEIGHTS.keywords +
    SECTION_WEIGHTS.methodology
  );
}

/**
 * Extract a title from the beginning of text
 */
function extractTitleFromText(text: string): string {
  const firstLine = text.split(/[.!?\n]/)[0];
  return firstLine.substring(0, 100);
}

// ============= Tokenization (for backward compatibility) =============

export function tokenizeIntoSentences(text: string): string[] {
  return text
    .replace(/([.!?])\s+/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map(s => s.trim())
    .filter(s => s.length > 10);
}

export function tokenizeIntoWords(text: string): string[] {
  return extractWords(text);
}

// ============= Threshold Configuration =============

export const PLAGIARISM_THRESHOLDS = {
  EXACT_MATCH: 95,      // Duplicate document
  HIGH_SIMILARITY: 70,  // Significant plagiarism
  MODERATE: 40,         // Some overlap
  LOW: 20,              // Minor matches
  UNIQUE: 20            // Below this = original content
};

export function getPlagiarismLevel(score: number): {
  level: "duplicate" | "high" | "moderate" | "low" | "unique";
  label: string;
  color: string;
} {
  if (score >= PLAGIARISM_THRESHOLDS.EXACT_MATCH) {
    return { level: "duplicate", label: "Duplicate Content", color: "destructive" };
  }
  if (score >= PLAGIARISM_THRESHOLDS.HIGH_SIMILARITY) {
    return { level: "high", label: "High Similarity", color: "destructive" };
  }
  if (score >= PLAGIARISM_THRESHOLDS.MODERATE) {
    return { level: "moderate", label: "Moderate Similarity", color: "warning" };
  }
  if (score >= PLAGIARISM_THRESHOLDS.LOW) {
    return { level: "low", label: "Low Similarity", color: "muted" };
  }
  return { level: "unique", label: "Original Content", color: "success" };
}
