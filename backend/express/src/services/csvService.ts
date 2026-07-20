export interface ICsvCandidateInput {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  skills?: string;
  experienceYears?: string | number;
  resumeText?: string;
}

export interface ICsvJobInput {
  title: string;
  location?: string;
  team?: string;
  summary?: string;
  requirements?: string;
}

export class CsvService {
  /**
   * Parse CSV string into structured Candidate items
   */
  static parseCandidateCsv(csvString: string): ICsvCandidateInput[] {
    const lines = csvString.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
    const records: ICsvCandidateInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvLine(lines[i]);
      if (values.length === 0) continue;

      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] ? values[idx].trim().replace(/^["']|["']$/g, "") : "";
      });

      if (record["email"] || record["name"]) {
        records.push({
          name: record["name"] || record["email"] || "Imported Candidate",
          email: record["email"] || `candidate_${Date.now()}_${i}@imported.com`,
          phone: record["phone"] || "",
          role: record["role"] || record["title"] || "Software Engineer",
          skills: record["skills"] || "",
          experienceYears: record["experience"] || record["experienceyears"] || "2",
          resumeText: record["resumetext"] || record["resume"] || record["summary"] || ""
        });
      }
    }

    return records;
  }

  /**
   * Parse CSV string into structured Job items
   */
  static parseJobCsv(csvString: string): ICsvJobInput[] {
    const lines = csvString.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));
    const records: ICsvJobInput[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.splitCsvLine(lines[i]);
      if (values.length === 0) continue;

      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] ? values[idx].trim().replace(/^["']|["']$/g, "") : "";
      });

      if (record["title"]) {
        records.push({
          title: record["title"],
          location: record["location"] || "Remote",
          team: record["team"] || "Engineering",
          summary: record["summary"] || record["description"] || "",
          requirements: record["requirements"] || record["skills"] || ""
        });
      }
    }

    return records;
  }

  /**
   * Generate CSV export format for candidate screening results
   */
  static generateScreeningExportCsv(
    screeningResults: Array<{
      candidateName: string;
      email: string;
      jobTitle: string;
      matchScore: number;
      verdict: string;
      appliedDate: string;
      strengths?: string[];
      skillGaps?: string[];
      humanOverrideVerdict?: string;
    }>
  ): string {
    const headers = [
      "Candidate Name",
      "Email",
      "Job Title",
      "Match Score",
      "Verdict",
      "Human Override Verdict",
      "Applied Date",
      "Key Strengths",
      "Skill Gaps"
    ];

    const rows = screeningResults.map((r) => [
      this.escapeCsvCell(r.candidateName),
      this.escapeCsvCell(r.email),
      this.escapeCsvCell(r.jobTitle),
      r.matchScore.toString(),
      this.escapeCsvCell(r.verdict),
      this.escapeCsvCell(r.humanOverrideVerdict || "N/A"),
      this.escapeCsvCell(r.appliedDate),
      this.escapeCsvCell((r.strengths || []).join("; ")),
      this.escapeCsvCell((r.skillGaps || []).join("; "))
    ]);

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  }

  private static splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(cur);
        cur = "";
      } else {
        cur += char;
      }
    }
    result.push(cur);
    return result;
  }

  private static escapeCsvCell(cell: string): string {
    if (!cell) return '""';
    const escaped = cell.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
