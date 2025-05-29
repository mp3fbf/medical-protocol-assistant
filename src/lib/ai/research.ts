/**
 * Medical Research Integration
 *
 * This module handles querying the DeepResearch API for medical literature
 * and then uses AI (OpenAI) to process and extract structured information
 * from the research results.
 */
import { v4 as uuidv4 } from "uuid";
import {
  createChatCompletion,
  getOpenAIClient as _getOpenAIClient,
} from "./client"; // _getOpenAIClient marked as unused
import {
  EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT,
  createExtractionUserPrompt,
} from "./prompts/research";
import type {
  DeepResearchQuery,
  RawDeepResearchArticle,
  ProcessedAIMedicalFinding,
  AggregatedResearchOutput,
} from "@/types/research"; // Import from new canonical location
import {
  DEFAULT_CHAT_MODEL,
  JSON_RESPONSE_FORMAT,
  // DEEPRESEARCH_API_TIMEOUT_MS, // Marked as unused
} from "./config";
import { /* DeepResearchError, */ OpenAIError } from "./errors"; // DeepResearchError marked as unused

// const DEEPRESEARCH_API_ENDPOINT = // Marked as unused
//   process.env.DEEPRESEARCH_API_ENDPOINT ||
//   "https://api.deepresearch.example.com";

async function callDeepResearchAPI(
  query: DeepResearchQuery,
): Promise<RawDeepResearchArticle[]> {
  const apiKey = process.env.DEEPRESEARCH_API_KEY;

  if (!apiKey && process.env.NODE_ENV !== "test") {
    console.warn("DEEPRESEARCH_API_KEY not set. Using mock research data.");
  }

  console.log(
    `Simulating DeepResearch API call for condition: "${query.condition}" with sources: ${query.sources?.join(", ")}`,
  );

  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500 + 200),
  );

  const mockData: RawDeepResearchArticle[] = [
    {
      id: "pubmed-123",
      title: `Guidelines for ${query.condition}`,
      sourceName: "PubMed Central",
      sourceUrl: `https://pubmed.example.com/123`,
      publicationDate: "2023-05-10",
      abstract: `This article reviews the latest guidelines for diagnosing and treating ${query.condition}. Key diagnostic criteria include X, Y, and Z. Treatment typically involves medication A (500mg BID) and medication B (10mg OD). Special attention is needed for geriatric patients due to renal clearance.`,
      fullTextSnippet: `For diagnosis of ${query.condition}, at least two of the following must be present: symptom X, lab value Y > 50 units/L, or imaging finding Z. First-line treatment for adults is Amoxicillin 500mg three times daily for 7 days. For patients over 65, consider reducing Amoxicillin dose by 50% if CrCl < 30 mL/min.`,
      keywords: [query.condition, "guidelines", "treatment", "diagnosis"],
    },
    {
      id: "scielo-456",
      title: `Considerações Geriátricas em ${query.condition}`,
      sourceName: "SciELO",
      sourceUrl: `https://scielo.example.com/456`,
      publicationDate: "2022-11-20",
      abstract: `Elderly patients with ${query.condition} require careful management. Polypharmacy and comorbidities are common. Dose adjustments for drug X are critical.`,
      fullTextSnippet: `In the geriatric population, managing ${query.condition} presents unique challenges. Drug X metabolism is significantly altered in patients >75 years, requiring a dose reduction to 2.5mg daily. Falls risk should be assessed.`,
      keywords: [query.condition, "geriatrics", "elderly"],
    },
  ];
  if (query.sources?.includes("cfm")) {
    mockData.push({
      id: "cfm-789",
      title: `Diretriz CFM para ${query.condition}`,
      sourceName: "CFM",
      sourceUrl: `https://cfm.example.com/789`,
      publicationDate: "2024-01-15",
      abstract: `Conselho Federal de Medicina (CFM) guideline for ${query.condition}.`,
      fullTextSnippet: `O CFM recomenda o uso de Paracetamol 750mg a cada 6 horas para controle sintomático de ${query.condition} leve.`,
      keywords: [query.condition, "diretriz", "CFM"],
    });
  }

  return mockData;
}

async function processDeepResearchResults(
  rawArticles: RawDeepResearchArticle[],
  _queryContext: DeepResearchQuery, // Marked as unused
): Promise<ProcessedAIMedicalFinding[]> {
  const allFindings: ProcessedAIMedicalFinding[] = [];
  // const openaiClient = _getOpenAIClient(); // Marked as unused

  for (const article of rawArticles) {
    const textToAnalyze =
      article.fullTextSnippet || article.abstract || article.title;
    if (!textToAnalyze) continue;

    const userPrompt = createExtractionUserPrompt(
      textToAnalyze,
      article.id,
      article.sourceUrl,
    );

    try {
      const response = await createChatCompletion(
        DEFAULT_CHAT_MODEL,
        [
          { role: "system", content: EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        {
          response_format: JSON_RESPONSE_FORMAT,
          temperature: 0.1,
        },
      );

      const content = response.content;
      if (content) {
        try {
          const extractedData = JSON.parse(
            content,
          ) as ProcessedAIMedicalFinding[];
          extractedData.forEach((finding) => {
            if (!finding.id) finding.id = uuidv4();
            allFindings.push(finding);
          });
        } catch (parseError) {
          console.error(
            `Failed to parse JSON response from OpenAI for article ${article.id}:`,
            parseError,
          );
        }
      }
    } catch (error) {
      console.error(
        `OpenAI processing failed for article ${article.id}:`,
        error,
      );
      if (error instanceof OpenAIError) {
      }
    }
  }
  return allFindings;
}

export async function performMedicalResearch(
  query: DeepResearchQuery,
): Promise<AggregatedResearchOutput> {
  try {
    const rawArticles = await callDeepResearchAPI(query);
    if (!rawArticles || rawArticles.length === 0) {
      return {
        query: query.condition,
        findings: [],
        summary:
          "No relevant articles found or DeepResearch API returned no results.",
        timestamp: new Date().toISOString(),
      };
    }

    const processedFindings = await processDeepResearchResults(
      rawArticles,
      query,
    );

    return {
      query: query.condition,
      findings: processedFindings,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Medical research process failed:", error);
    throw error;
  }
}
