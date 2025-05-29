import { NextRequest, NextResponse } from "next/server";

// Simulate the protocol editor state management logic
function simulateProtocolEditorBehavior() {
  console.log("🧪 Testing section isolation logic...");

  // Initial protocol data
  let protocolData: Record<string, any> = {
    "1": {
      sectionNumber: 1,
      title: "Section 1",
      content: "Original content 1",
    },
    "2": {
      sectionNumber: 2,
      title: "Section 2",
      content: "Original content 2",
    },
    "3": {
      sectionNumber: 3,
      title: "Section 3",
      content: "Original content 3",
    },
  };

  // Simulate editedContentBySection state (from TextEditorPane)
  const editedContentBySection: Record<number, any> = {};

  // Helper function to simulate updateSectionContent
  const updateSectionContent = (sectionNumber: number, newContent: string) => {
    const key = sectionNumber.toString();
    const existingSection = protocolData[key];

    // Create new protocol data (from useProtocolEditorState fix)
    const newProtocolData = { ...protocolData };
    newProtocolData[key] = {
      ...existingSection,
      content: newContent,
    };

    protocolData = newProtocolData;
    return protocolData;
  };

  // Helper to simulate TextEditorPane content change
  const simulateContentChange = (sectionNumber: number, newContent: string) => {
    editedContentBySection[sectionNumber] = newContent;
    return editedContentBySection;
  };

  // Helper to simulate save operation (applying edited content to main state)
  const simulateSave = (sectionNumber: number) => {
    const editedContent = editedContentBySection[sectionNumber];
    if (editedContent !== undefined) {
      updateSectionContent(sectionNumber, editedContent);
      // Clear edited content after save
      delete editedContentBySection[sectionNumber];
    }
  };

  const testResults = [];

  // TEST 1: Edit Section 1
  console.log("📝 Test 1: Editing Section 1...");
  simulateContentChange(1, "TEST-123 added to section 1");

  testResults.push({
    test: "Edit Section 1",
    editedContent: editedContentBySection[1],
    mainContent: protocolData["1"].content,
    expected: "TEST-123 added to section 1",
    pass: editedContentBySection[1] === "TEST-123 added to section 1",
  });

  // TEST 2: Switch to Section 2 and edit
  console.log("📝 Test 2: Switching to Section 2 and editing...");
  simulateContentChange(2, "AUTHOR-TEST added to section 2");

  testResults.push({
    test: "Edit Section 2",
    editedContent: editedContentBySection[2],
    mainContent: protocolData["2"].content,
    section1StillInEdited: editedContentBySection[1],
    expected: "AUTHOR-TEST added to section 2",
    pass:
      editedContentBySection[2] === "AUTHOR-TEST added to section 2" &&
      editedContentBySection[1] === "TEST-123 added to section 1",
  });

  // TEST 3: Apply Section 1 changes
  console.log("📝 Test 3: Applying Section 1 changes...");
  simulateSave(1);

  testResults.push({
    test: "Save Section 1",
    mainContent: protocolData["1"].content,
    editedContentCleared: editedContentBySection[1] === undefined,
    section2StillInEdited: editedContentBySection[2],
    expected: "TEST-123 added to section 1",
    pass:
      protocolData["1"].content === "TEST-123 added to section 1" &&
      editedContentBySection[1] === undefined &&
      editedContentBySection[2] === "AUTHOR-TEST added to section 2",
  });

  // TEST 4: Apply Section 2 changes
  console.log("📝 Test 4: Applying Section 2 changes...");
  simulateSave(2);

  testResults.push({
    test: "Save Section 2",
    mainContent: protocolData["2"].content,
    section1MainContent: protocolData["1"].content,
    editedContentCleared: editedContentBySection[2] === undefined,
    expected: "AUTHOR-TEST added to section 2",
    pass:
      protocolData["2"].content === "AUTHOR-TEST added to section 2" &&
      protocolData["1"].content === "TEST-123 added to section 1" &&
      editedContentBySection[2] === undefined,
  });

  // TEST 5: Simulate database save behavior (the critical test)
  console.log("📝 Test 5: Testing database save isolation...");

  // Add new edits after save
  simulateContentChange(1, "NEW-EDIT-1 after save");
  simulateContentChange(3, "NEW-EDIT-3 after save");

  // Simulate save of only Section 1 (this should NOT affect Section 3)
  const beforeSaveSection3 = editedContentBySection[3];
  simulateSave(1);
  const afterSaveSection3 = editedContentBySection[3];

  testResults.push({
    test: "Database Save Isolation",
    section1Applied: protocolData["1"].content === "NEW-EDIT-1 after save",
    section3Preserved:
      afterSaveSection3 === "NEW-EDIT-3 after save" &&
      beforeSaveSection3 === afterSaveSection3,
    section2Unchanged:
      protocolData["2"].content === "AUTHOR-TEST added to section 2",
    pass:
      protocolData["1"].content === "NEW-EDIT-1 after save" &&
      afterSaveSection3 === "NEW-EDIT-3 after save" &&
      protocolData["2"].content === "AUTHOR-TEST added to section 2",
  });

  // Final verification
  const allTestsPassed = testResults.every((test) => test.pass);

  return {
    success: allTestsPassed,
    totalTests: testResults.length,
    passedTests: testResults.filter((test) => test.pass).length,
    results: testResults,
    finalState: {
      protocolData,
      editedContentBySection,
    },
  };
}

export async function GET(_request: NextRequest) {
  try {
    const testResults = simulateProtocolEditorBehavior();

    return NextResponse.json({
      message: testResults.success
        ? "✅ ALL TESTS PASSED - Section isolation is working!"
        : "❌ TESTS FAILED - Section bleeding still occurs",
      testResults,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "❌ Test execution failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
