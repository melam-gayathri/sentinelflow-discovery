

# Plagiarism Checker Algorithm Implementation

## Overview

This plan replaces the current weighted-category similarity approach with a proper **plagiarism detection algorithm** that operates at the text level, providing granular sentence-by-sentence and phrase-by-phrase matching—similar to how professional tools like Turnitin or Copyscape work.

---

## Current Approach vs. New Approach

| Aspect | Current Implementation | New Plagiarism Checker |
|--------|----------------------|------------------------|
| **Matching Unit** | Categories (Abstract, Keywords, Tech, Design) | Sentences and N-grams (word sequences) |
| **Algorithm** | Jaccard similarity on word sets | Shingling + Fingerprinting + Cosine Similarity |
| **Granularity** | Section-level percentages | Line-by-line highlighting of copied text |
| **Output** | Weighted score (40/25/20/15) | Exact matched phrases with source references |
| **Duplicate Detection** | Keywords in filename trigger 100% | Full text comparison finds duplicates |

---

## New Algorithm Design

### Core Techniques

1. **Text Preprocessing**
   - Normalize text (lowercase, remove extra whitespace)
   - Tokenize into sentences
   - Remove stopwords for better matching

2. **N-Gram Shingling** (Primary Method)
   - Break text into overlapping word sequences (shingles)
   - Default: 3-word shingles (trigrams)
   - Example: "Deep learning for traffic" → ["deep learning for", "learning for traffic"]

3. **Fingerprint Hashing**
   - Generate hash fingerprints for each shingle
   - Compare fingerprints between uploaded document and database
   - Matching fingerprints = copied phrases

4. **Sentence-Level Matching**
   - Split both documents into sentences
   - Use cosine similarity to compare each sentence pair
   - Threshold: >80% similarity = potential plagiarism

5. **Longest Common Subsequence (LCS)**
   - Find the longest matching text sequences
   - Highlight exact copied passages

---

## Implementation Details

### New Type Definitions

```text
┌─────────────────────────────────────────────────────┐
│  PlagiarismMatch                                    │
├─────────────────────────────────────────────────────┤
│  - matchedText: string (the copied phrase)          │
│  - sourceProject: string (original project title)   │
│  - sourceLocation: string (e.g., "Abstract, Line 3")│
│  - uploadedLocation: string (where in upload)       │
│  - similarity: number (0-100%)                      │
│  - matchType: "exact" | "paraphrase" | "partial"    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  PlagiarismReport                                   │
├─────────────────────────────────────────────────────┤
│  - overallPlagiarismScore: number (0-100%)          │
│  - originalContentScore: number (0-100%)            │
│  - totalWordsCopied: number                         │
│  - totalWords: number                               │
│  - matches: PlagiarismMatch[]                       │
│  - sentenceBreakdown: SentenceMatch[]               │
│  - sourceProjects: SourceReference[]                │
└─────────────────────────────────────────────────────┘
```

### Algorithm Functions to Implement

| Function | Purpose |
|----------|---------|
| `generateShingles(text, n)` | Creates n-word shingles from text |
| `hashShingle(shingle)` | Generates fingerprint hash for a shingle |
| `compareFingerprints(doc1Hashes, doc2Hashes)` | Finds matching fingerprints |
| `calculateCosineSimilarity(vec1, vec2)` | Computes similarity between TF-IDF vectors |
| `findLCS(text1, text2)` | Finds longest common subsequence |
| `tokenizeIntoSentences(text)` | Splits text into sentence array |
| `highlightMatches(text, matches)` | Marks copied portions in text |
| `aggregatePlagiarismScore(matches)` | Calculates overall plagiarism percentage |

### Scoring Formula

```text
Plagiarism Score = (Total Words in Matched Phrases / Total Words in Document) × 100

Example:
- Uploaded document: 500 words
- Matched phrases contain: 450 words
- Plagiarism Score: 90%

For 100% Match (Duplicate):
- All sentences match with >95% similarity
- OR >95% of shingles have matching fingerprints
```

---

## UI Changes

### Enhanced Report Display

1. **Overall Score Card**
   - Large plagiarism percentage with color coding
   - Word count: "450 of 500 words matched (90%)"
   - Unique content indicator

2. **Source Breakdown Table**
   - List of matched source projects
   - Percentage of content from each source
   - Click to expand matched passages

3. **Side-by-Side Text Comparison**
   - Uploaded document on left
   - Source document on right
   - Matched phrases highlighted in red
   - Line numbers for reference

4. **Matched Phrases List**
   - Each matched phrase displayed
   - Source project and location shown
   - Match type indicator (exact/paraphrase)

---

## File Changes

| File | Changes |
|------|---------|
| `src/components/AIAssistancePanel.tsx` | Replace similarity logic with plagiarism detection algorithms; update result display with sentence-level matching UI |

---

## Technical Considerations

### Performance
- Shingle generation: O(n) where n = word count
- Fingerprint comparison: O(m × k) where m = database size, k = shingles per doc
- For frontend-only: limit to first 1000 words per document

### Mock Data Adaptation
- Store full-text abstracts in database (not just keywords)
- Simulate document content extraction based on filename
- Maintain exact-match triggering for testing

### Threshold Configuration
```text
EXACT_MATCH_THRESHOLD = 95%    → Duplicate document
HIGH_SIMILARITY = 70-94%       → Significant plagiarism
MODERATE_SIMILARITY = 40-69%   → Some overlap
LOW_SIMILARITY = 20-39%        → Minor matches
UNIQUE = <20%                  → Original content
```

---

## Example Output

When uploading a document matching "Intelligent Traffic Flow Optimization":

```text
┌──────────────────────────────────────────────────────────────┐
│  PLAGIARISM REPORT                                           │
├──────────────────────────────────────────────────────────────┤
│  Overall Score: 100% PLAGIARIZED                             │
│  ──────────────────────────────────────                      │
│  📄 Words Analyzed: 127                                      │
│  🔴 Words Matched: 127 (100%)                                │
│  📚 Sources Found: 1                                         │
│                                                              │
│  SOURCE BREAKDOWN:                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Intelligent Traffic Flow Optimization using DL         │ │
│  │ Match: 100% | 127 words | 12 sentences                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  MATCHED SENTENCES:                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ "A comprehensive system that uses neural networks       │ │
│  │  to predict and optimize traffic patterns..."          │ │
│  │  → 100% match with source, Line 1                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ "The system employs CNN and RNN to analyze real-time   │ │
│  │  traffic data from IoT sensors..."                     │ │
│  │  → 100% match with source, Line 2                      │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

