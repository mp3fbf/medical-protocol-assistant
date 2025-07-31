#!/usr/bin/env tsx
/**
 * Script to test flowchart export compaction
 * Usage: pnpm tsx scripts/test-flowchart-export.ts <input-json-file>
 */

import fs from "fs";
import path from "path";
import { compactFlowchartForExport } from "../src/lib/utils/flowchart-converter";

/**
 * Check for node overlaps (helper function for validation)
 */
function checkForOverlaps(nodes: any[]): Array<{node1: string, node2: string}> {
  const overlaps: Array<{node1: string, node2: string}> = [];
  const nodeWidth = 300;
  const nodeHeight = 120;
  
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const node1 = nodes[i];
      const node2 = nodes[j];
      
      // Check if rectangles overlap
      if (!(node1.position.x + nodeWidth < node2.position.x ||
            node2.position.x + nodeWidth < node1.position.x ||
            node1.position.y + nodeHeight < node2.position.y ||
            node2.position.y + nodeHeight < node1.position.y)) {
        overlaps.push({ node1: node1.id, node2: node2.id });
      }
    }
  }
  
  return overlaps;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error("Usage: pnpm tsx scripts/test-flowchart-export.ts <input-json-file>");
    process.exit(1);
  }
  
  const inputFile = args[0];
  const inputPath = path.resolve(inputFile);
  
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }
  
  try {
    // Read input file
    const inputContent = fs.readFileSync(inputPath, "utf-8");
    const inputData = JSON.parse(inputContent);
    
    console.log("=== INPUT ANALYSIS ===");
    console.log(`Nodes: ${inputData.nodes?.length || 0}`);
    console.log(`Edges: ${inputData.edges?.length || 0}`);
    
    // Calculate Y range
    if (inputData.nodes?.length > 0) {
      const yValues = inputData.nodes.map((n: any) => n.position.y);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      console.log(`Y range: ${minY} to ${maxY} (span: ${maxY - minY})`);
      
      const xValues = inputData.nodes.map((n: any) => n.position.x);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      console.log(`X range: ${minX} to ${maxX} (span: ${maxX - minX})`);
    }
    
    // Apply compaction
    console.log("\n=== APPLYING COMPACTION ===");
    const compactedData = compactFlowchartForExport(inputData, {
      id: "test",
      title: path.basename(inputFile, path.extname(inputFile)),
    });
    
    console.log("\n=== OUTPUT ANALYSIS ===");
    console.log(`Nodes: ${compactedData.nodes?.length || 0}`);
    console.log(`Edges: ${compactedData.edges?.length || 0}`);
    
    // Calculate new Y range
    if (compactedData.nodes?.length > 0) {
      const yValues = compactedData.nodes.map((n: any) => n.position.y);
      const minY = Math.min(...yValues);
      const maxY = Math.max(...yValues);
      console.log(`Y range: ${minY} to ${maxY} (span: ${maxY - minY})`);
      
      const xValues = compactedData.nodes.map((n: any) => n.position.x);
      const minX = Math.min(...xValues);
      const maxX = Math.max(...xValues);
      console.log(`X range: ${minX} to ${maxX} (span: ${maxX - minX})`);
      
      // Check for overlaps
      console.log("\n=== OVERLAP CHECK ===");
      const overlaps = checkForOverlaps(compactedData.nodes);
      if (overlaps.length > 0) {
        console.log(`⚠️  Found ${overlaps.length} overlapping node pairs:`);
        overlaps.forEach(overlap => {
          console.log(`  - ${overlap.node1} overlaps with ${overlap.node2}`);
        });
      } else {
        console.log("✅ No overlapping nodes detected!");
      }
    }
    
    // Save output
    const outputFile = inputFile.replace(/\.json$/, "-compacted.json");
    fs.writeFileSync(outputFile, JSON.stringify(compactedData, null, 2));
    console.log(`\nCompacted flowchart saved to: ${outputFile}`);
    
    // Show metadata
    console.log("\n=== METADATA ===");
    console.log(JSON.stringify(compactedData.metadata, null, 2));
    
  } catch (error) {
    console.error("Error processing file:", error);
    process.exit(1);
  }
}

main();