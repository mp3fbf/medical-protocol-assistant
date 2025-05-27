import { describe, it, expect } from "vitest";
import { sanitizeFilename } from "@/lib/generators/utils";

describe("sanitizeFilename utility", () => {
  it("should replace spaces with underscores", () => {
    expect(sanitizeFilename("My Protocol Document")).toBe(
      "my_protocol_document",
    );
  });

  it("should remove most special characters and convert others to underscore", () => {
    expect(
      sanitizeFilename("Protocol!@#$%^&*()_+{}[]|\\:\";'<>,.?/~` Document"),
    ).toBe("protocol_document");
  });

  it("should convert to lowercase", () => {
    expect(sanitizeFilename("UPPERCASE_DOCUMENT")).toBe("uppercase_document");
  });

  it("should handle leading/trailing spaces and then leading/trailing separators", () => {
    expect(sanitizeFilename("  _Protocol-Name_  ")).toBe("protocol-name");
  });

  it("should replace multiple underscores with a single underscore", () => {
    expect(sanitizeFilename("Protocol___Name")).toBe("protocol_name");
  });

  it("should replace multiple hyphens with a single hyphen", () => {
    expect(sanitizeFilename("Protocol---Name")).toBe("protocol-name");
  });

  it("should convert multiple dots within the name part to underscores, preserving extension dot(s)", () => {
    expect(sanitizeFilename("Protocol...Name.pdf")).toBe("protocol_name.pdf");
    expect(sanitizeFilename("Version...1...2.tar.gz")).toBe(
      "version_1_2.tar.gz",
    );
  });

  it("should handle mixed adjacent underscores and hyphens by converting them to a single underscore", () => {
    expect(sanitizeFilename("Protocol_-_Name.txt")).toBe("protocol_name.txt"); // - surrounded by _ becomes _
    expect(sanitizeFilename("file-_-version.zip")).toBe("file_version.zip"); // - surrounded by _ becomes _
    expect(sanitizeFilename("file-.-version.tar.gz")).toBe(
      "file_version.tar.gz",
    ); // internal . and - become _
  });

  it("should return 'untitled_protocol' for empty or whitespace-only input", () => {
    expect(sanitizeFilename("")).toBe("untitled_protocol");
    expect(sanitizeFilename("   ")).toBe("untitled_protocol");
  });

  it("should return 'untitled_protocol' if only special characters are provided and all are removed", () => {
    expect(sanitizeFilename("!@#$")).toBe("untitled_protocol");
    expect(sanitizeFilename("!@#$ %^&*")).toBe("untitled_protocol");
  });

  it("should handle filenames with hyphens in the name part and dots for extension", () => {
    expect(sanitizeFilename("protocol-v1.2.docx")).toBe("protocol-v1_2.docx");
    expect(sanitizeFilename("report-final.pdf")).toBe("report-final.pdf");
    expect(sanitizeFilename("my-file-name.tar.gz")).toBe("my-file-name.tar.gz");
  });

  it("should truncate long filenames and ensure no trailing separators, preserving extension", () => {
    // Name: "a...(90)..._another_long_section_of_name" -> "a_another_long_section_of_name" (len 116)
    // Ext: ".pdf" (len 4). Max name len = 100-4=96.
    // Truncated name: "a_another_long_section_of_name".substring(0,96) -> "a_another_long_section_of_na"
    const longName = "a".repeat(90) + "_another_long_section_of_name.pdf";
    expect(sanitizeFilename(longName)).toBe(
      "a".repeat(90) + "_another_long_section_of_na.pdf",
    );

    const longNameWithoutExt = "b".repeat(150);
    expect(sanitizeFilename(longNameWithoutExt)).toBe("b".repeat(100));

    const longNameWithShortExt = "c".repeat(98) + ".js"; // name "c...(98)", ext ".js" (3). Max name = 97.
    expect(sanitizeFilename(longNameWithShortExt)).toBe("c".repeat(97) + ".js");

    const trickyTruncation =
      "protocol_version_very_long_name_that_needs_truncation.tar.gz"; // ext .tar.gz (7). Max name 93.
    // name part: "protocol_version_very_long_name_that_needs_truncation" (50 chars) - no truncation needed as 50 < 93
    expect(sanitizeFilename(trickyTruncation)).toBe(
      "protocol_version_very_long_name_that_needs_truncation.tar.gz",
    );

    const needsTruncationTarGz =
      "protocol_version_very_long_name_that_needs_serious_truncation_to_fit_within_the_limit_of_one_hundred_characters_for_sure.tar.gz";
    // name part: "protocol_version_very_long_name_that_needs_serious_truncation_to_fit_within_the_limit_of_one_hundred_characters_for_sure" (119 chars)
    // ext: .tar.gz (7). Max name 93.
    const expectedNamePartTarGz =
      "protocol_version_very_long_name_that_needs_serious_truncation_to_fit_within_the_limit_of_one_h"; // 93 chars
    expect(sanitizeFilename(needsTruncationTarGz)).toBe(
      expectedNamePartTarGz + ".tar.gz",
    );
  });

  it("should handle mixed special characters and spaces effectively", () => {
    expect(sanitizeFilename("My !@# Protocol --- V2 . final.docx")).toBe(
      "my_protocol_-_v2_final.docx",
    );
    expect(sanitizeFilename("Doc Name - Ver. 1.2 (draft).pdf")).toBe(
      "doc_name_-_ver_1_2_draft.pdf",
    );
  });

  it("should handle Unicode characters correctly, removing diacritics and preserving extension", () => {
    expect(sanitizeFilename("Protocölo de Atendîménto à Criança.docx")).toBe(
      "protocolo_de_atendimento_a_crianca.docx",
    );
    expect(sanitizeFilename("Prtcl_日本語_V1_éxamplê.doc")).toBe(
      "prtcl_日本語_v1_example.doc",
    );
  });

  it("should correctly handle filenames that become empty or just a separator after initial sanitization", () => {
    expect(sanitizeFilename("---")).toBe("untitled_protocol");
    expect(sanitizeFilename("...")).toBe("untitled_protocol");
    expect(sanitizeFilename("___")).toBe("untitled_protocol");
    expect(sanitizeFilename("._-")).toBe("untitled_protocol");
    expect(sanitizeFilename(".")).toBe("untitled_protocol");
  });
});
