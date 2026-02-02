// Plagiarism Detection Algorithm
// Uses N-gram shingling, fingerprint hashing, and sentence-level matching

// ============= Type Definitions =============

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
}

// ============= Stopwords =============

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "been",
  "be", "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "can", "this", "that", "these", "those", "it",
  "its", "if", "then", "than", "so", "such", "no", "not", "only", "own",
  "same", "too", "very", "just", "also", "now", "our", "your", "their",
  "which", "who", "whom", "what", "when", "where", "why", "how", "all",
  "each", "every", "both", "few", "more", "most", "other", "some", "any",
  "into", "through", "during", "before", "after", "above", "below", "between",
  "under", "again", "further", "once", "here", "there", "about", "out", "over",
  "up", "down", "off", "being", "using", "used"
]);

// ============= Text Preprocessing =============

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

export function tokenizeIntoWords(text: string): string[] {
  return normalizeText(text).split(" ").filter(word => word.length > 0);
}

export function removeStopwords(words: string[]): string[] {
  return words.filter(word => !STOPWORDS.has(word) && word.length > 2);
}

export function tokenizeIntoSentences(text: string): string[] {
  // Split on sentence-ending punctuation while preserving meaning
  return text
    .replace(/([.!?])\s+/g, "$1|SPLIT|")
    .split("|SPLIT|")
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short fragments
}

// ============= N-Gram Shingling =============

export function generateShingles(text: string, n: number = 3): string[] {
  const words = removeStopwords(tokenizeIntoWords(text));
  if (words.length < n) return [words.join(" ")];
  
  const shingles: string[] = [];
  for (let i = 0; i <= words.length - n; i++) {
    shingles.push(words.slice(i, i + n).join(" "));
  }
  return shingles;
}

// ============= Fingerprint Hashing =============

export function hashShingle(shingle: string): number {
  // Simple hash function for shingle fingerprinting
  let hash = 0;
  for (let i = 0; i < shingle.length; i++) {
    const char = shingle.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function generateFingerprints(shingles: string[]): Set<number> {
  return new Set(shingles.map(hashShingle));
}

export function compareFingerprints(
  uploadedHashes: Set<number>,
  sourceHashes: Set<number>
): { matchCount: number; matchPercentage: number } {
  const intersection = [...uploadedHashes].filter(h => sourceHashes.has(h));
  const unionSize = new Set([...uploadedHashes, ...sourceHashes]).size;
  
  return {
    matchCount: intersection.length,
    matchPercentage: unionSize > 0 ? (intersection.length / unionSize) * 100 : 0
  };
}

// ============= Sentence-Level Matching =============

export function calculateSentenceSimilarity(sentence1: string, sentence2: string): number {
  const words1 = removeStopwords(tokenizeIntoWords(sentence1));
  const words2 = removeStopwords(tokenizeIntoWords(sentence2));
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = [...set1].filter(w => set2.has(w)).length;
  const union = new Set([...set1, ...set2]).size;
  
  // Jaccard similarity
  const jaccardScore = union > 0 ? (intersection / union) * 100 : 0;
  
  // Also consider word order with a simple positional bonus
  let orderBonus = 0;
  const minLen = Math.min(words1.length, words2.length);
  for (let i = 0; i < minLen; i++) {
    if (words1[i] === words2[i]) orderBonus += 5;
  }
  orderBonus = Math.min(orderBonus, 20); // Cap order bonus at 20%
  
  return Math.min(100, jaccardScore + orderBonus);
}

export function findMatchingSentences(
  uploadedSentences: string[],
  sourceSentences: string[],
  sourceProject: string,
  threshold: number = 60
): SentenceMatch[] {
  const matches: SentenceMatch[] = [];
  
  uploadedSentences.forEach((uploadedSentence, lineNum) => {
    let bestMatch: SentenceMatch | null = null;
    
    sourceSentences.forEach(sourceSentence => {
      const similarity = calculateSentenceSimilarity(uploadedSentence, sourceSentence);
      
      if (similarity >= threshold) {
        if (!bestMatch || similarity > bestMatch.similarity) {
          bestMatch = {
            uploadedSentence,
            sourceSentence,
            sourceProject,
            similarity: Math.round(similarity),
            lineNumber: lineNum + 1
          };
        }
      }
    });
    
    if (bestMatch) {
      matches.push(bestMatch);
    }
  });
  
  return matches;
}

// ============= Longest Common Subsequence =============

export function findLCS(text1: string, text2: string): string {
  const words1 = tokenizeIntoWords(text1);
  const words2 = tokenizeIntoWords(text2);
  
  const m = words1.length;
  const n = words2.length;
  
  // Create DP table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (words1[i - 1] === words2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find LCS
  const lcs: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (words1[i - 1] === words2[j - 1]) {
      lcs.unshift(words1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  
  return lcs.join(" ");
}

// ============= Main Plagiarism Check =============

interface ProjectContent {
  title: string;
  fullText: string;
}

export function checkPlagiarism(
  uploadedText: string,
  projectDatabase: ProjectContent[]
): PlagiarismReport {
  const uploadedSentences = tokenizeIntoSentences(uploadedText);
  const uploadedShingles = generateShingles(uploadedText, 3);
  const uploadedFingerprints = generateFingerprints(uploadedShingles);
  const uploadedWords = tokenizeIntoWords(uploadedText);
  const totalWords = uploadedWords.length;
  
  const allMatches: PlagiarismMatch[] = [];
  const allSentenceMatches: SentenceMatch[] = [];
  const sourceRefs: Map<string, SourceReference> = new Map();
  
  let isExactDuplicate = false;
  let maxOverallMatch = 0;
  
  // Compare against each project in database
  for (const project of projectDatabase) {
    const sourceShingles = generateShingles(project.fullText, 3);
    const sourceFingerprints = generateFingerprints(sourceShingles);
    const sourceSentences = tokenizeIntoSentences(project.fullText);
    
    // Fingerprint comparison for overall similarity
    const fingerprintResult = compareFingerprints(uploadedFingerprints, sourceFingerprints);
    
    // Sentence-level matching
    const sentenceMatches = findMatchingSentences(
      uploadedSentences,
      sourceSentences,
      project.title,
      60
    );
    
    allSentenceMatches.push(...sentenceMatches);
    
    // Check for exact duplicate (>95% fingerprint match OR >95% sentences match)
    const sentenceMatchRatio = uploadedSentences.length > 0 
      ? (sentenceMatches.length / uploadedSentences.length) * 100 
      : 0;
    
    const highSimilaritySentences = sentenceMatches.filter(m => m.similarity >= 90);
    const exactMatchRatio = uploadedSentences.length > 0
      ? (highSimilaritySentences.length / uploadedSentences.length) * 100
      : 0;
    
    if (fingerprintResult.matchPercentage >= 95 || exactMatchRatio >= 95) {
      isExactDuplicate = true;
    }
    
    // Calculate words copied based on matched sentences
    let wordsCopied = 0;
    sentenceMatches.forEach(match => {
      wordsCopied += tokenizeIntoWords(match.uploadedSentence).length;
    });
    
    // Create source reference
    if (sentenceMatches.length > 0 || fingerprintResult.matchPercentage > 20) {
      const matchPercentage = Math.max(
        fingerprintResult.matchPercentage,
        sentenceMatchRatio
      );
      
      if (matchPercentage > maxOverallMatch) {
        maxOverallMatch = matchPercentage;
      }
      
      sourceRefs.set(project.title, {
        projectTitle: project.title,
        matchPercentage: Math.round(matchPercentage),
        wordsCopied,
        sentencesMatched: sentenceMatches.length
      });
    }
    
    // Create phrase-level matches for high-similarity sentences
    sentenceMatches
      .filter(m => m.similarity >= 80)
      .forEach(match => {
        const matchType: "exact" | "paraphrase" | "partial" = 
          match.similarity >= 95 ? "exact" :
          match.similarity >= 80 ? "paraphrase" : "partial";
        
        allMatches.push({
          matchedText: match.uploadedSentence,
          sourceProject: project.title,
          sourceLocation: `Sentence match`,
          uploadedLocation: `Line ${match.lineNumber}`,
          similarity: match.similarity,
          matchType
        });
      });
  }
  
  // Calculate overall plagiarism score
  const totalWordsCopied = allSentenceMatches.reduce(
    (sum, match) => sum + tokenizeIntoWords(match.uploadedSentence).length,
    0
  );
  
  // Avoid counting duplicate words
  const uniqueCopiedWords = Math.min(totalWordsCopied, totalWords);
  
  let overallPlagiarismScore = totalWords > 0 
    ? Math.round((uniqueCopiedWords / totalWords) * 100) 
    : 0;
  
  // If exact duplicate detected, force 100%
  if (isExactDuplicate) {
    overallPlagiarismScore = 100;
  }
  
  // Cap at 100%
  overallPlagiarismScore = Math.min(100, overallPlagiarismScore);
  
  return {
    overallPlagiarismScore,
    originalContentScore: 100 - overallPlagiarismScore,
    totalWordsCopied: uniqueCopiedWords,
    totalWords,
    matches: allMatches.sort((a, b) => b.similarity - a.similarity),
    sentenceBreakdown: allSentenceMatches.sort((a, b) => b.similarity - a.similarity),
    sourceProjects: Array.from(sourceRefs.values()).sort((a, b) => b.matchPercentage - a.matchPercentage),
    isExactDuplicate
  };
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
    return { level: "high", label: "High Plagiarism", color: "destructive" };
  }
  if (score >= PLAGIARISM_THRESHOLDS.MODERATE) {
    return { level: "moderate", label: "Moderate Similarity", color: "warning" };
  }
  if (score >= PLAGIARISM_THRESHOLDS.LOW) {
    return { level: "low", label: "Low Similarity", color: "muted" };
  }
  return { level: "unique", label: "Original Content", color: "success" };
}
