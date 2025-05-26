/**
 * Medical Research Integration
 *
 * This module handles querying the DeepResearch API for medical literature
 * and then uses AI (OpenAI) to process and extract structured information
 * from the research results.
 */
import { v4 as uuidv4 } from "uuid";
import { createChatCompletion, getOpenAIClient } from "./client";
import {
  EXTRACT_MEDICAL_INFO_SYSTEM_PROMPT,
  createExtractionUserPrompt,
} from "./prompts/research";
import type {
  DeepResearchQuery,
  RawDeepResearchArticle,
  ProcessedAIMedicalFinding,
  AggregatedResearchOutput,
} from "@/types/research";
import {
  DEFAULT_CHAT_MODEL,
  JSON_RESPONSE_FORMAT,
  DEEPRESEARCH_API_TIMEOUT_MS,
} from "./config";
import { DeepResearchError, OpenAIError } from "./errors";

const DEEPRESEARCH_API_ENDPOINT =
  process.env.DEEPRESEARCH_API_ENDPOINT ||
  "https://api.deepresearch.example.com"; // Placeholder

/**
 * Simulates a call to the DeepResearch API.
 * In a real implementation, this would make an HTTP request to the DeepResearch service.
 * @param query - The research query.
 * @returns A promise resolving to an array of raw research articles.
 * @throws {DeepResearchError} If the API call fails.
 */
async function callDeepResearchAPI(
  query: DeepResearchQuery,
): Promise<RawDeepResearchArticle[]> {
  const apiKey = process.env.DEEPRESEARCH_API_KEY;

  if (!apiKey && process.env.NODE_ENV !== "test") {
    // In non-test environments, if no API key, we might want to throw or return empty
    // For now, we'll proceed with mock data if no key is found, as per plan.
    console.warn("DEEPRESEARCH_API_KEY not set. Using mock research data.");
  }

  console.log(
    `Simulating DeepResearch API call for condition: "${query.condition}" with sources: ${query.sources?.join(", ")}`,
  );

  // Simulate API call delay
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500 + 200),
  );

  // MOCK IMPLEMENTATION: Return sample data
  // In a real scenario, this would be an actual fetch call:
  /*
  try {
    const response = await fetch(`${DEEPRESEARCH_API_ENDPOINT}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(query),
      timeout: DEEPRESEARCH_API_TIMEOUT_MS, // This needs a library like node-fetch with AbortController
    });

    if (!response.ok) {
      throw new DeepResearchError(`API request failed with status ${response.status}: ${await response.text()}`, { statusCode: response.status });
    }
    return await response.json() as RawDeepResearchArticle[];
  } catch (error) {
    if (error instanceof DeepResearchError) throw error;
    console.error("DeepResearch API call failed:", error);
    throw new DeepResearchError("Failed to fetch data from DeepResearch API.", { cause: error as Error });
  }
  */

  // Mock data based on query for slightly more realistic testing
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

/**
 * Processes raw research articles using an AI model to extract structured findings.
 * @param rawArticles - Array of raw articles from DeepResearch.
 * @param queryContext - The original research query, for context.
 * @returns A promise resolving to an array of processed medical findings.
 */
async function processDeepResearchResults(
  rawArticles: RawDeepResearchArticle[],
  queryContext: DeepResearchQuery, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<ProcessedAIMedicalFinding[]> {
  const allFindings: ProcessedAIMedicalFinding[] = [];
  const openaiClient = getOpenAIClient(); // Ensure client is initialized

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
          temperature: 0.1, // Low temperature for factual extraction
        },
      );

      const content = response.choices[0]?.message?.content;
      if (content) {
        try {
          const extractedData = JSON.parse(
            content,
          ) as ProcessedAIMedicalFinding[];
          // Add generated IDs if AI didn't provide them or ensure uniqueness
          extractedData.forEach((finding) => {
            if (!finding.id) finding.id = uuidv4();
            allFindings.push(finding);
          });
        } catch (parseError) {
          console.error(
            `Failed to parse JSON response from OpenAI for article ${article.id}:`,
            parseError,
          );
          // Optionally, add a finding indicating an error for this article
        }
      }
    } catch (error) {
      console.error(
        `OpenAI processing failed for article ${article.id}:`,
        error,
      );
      // Optionally, handle this error, e.g., by skipping the article or logging
      if (error instanceof OpenAIError) {
        // Log more details or handle specific OpenAI errors
      }
    }
  }
  return allFindings;
}

/**
 * Performs medical research: calls DeepResearch API and processes results with AI.
 * @param query - The research query.
 * @returns A promise resolving to aggregated research output.
 */
export async function performMedicalResearch(
  query: DeepResearchQuery,
): Promise<AggregatedResearchOutput> {
  try {
    const rawArticles = await callDeepResearchAPI(query);
    if (!rawArticles || rawArticles.length === 0) {
      return {
        query: query.condition, // Using condition as the primary query identifier
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

    // Optional: Generate an overall summary of all findings using another AI call
    // const overallSummary = await generateOverallSummary(processedFindings);

    return {
      query: query.condition,
      findings: processedFindings,
      // summary: overallSummary, // If implemented
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Medical research process failed:", error);
    // Ensure a consistent error structure or re-throw a higher-level application error
    throw error; // Re-throw for the tRPC router to handle
  }
}
