import * as cheerio from "cheerio";
import { classifyPage, buildFormattedContextForChat, LinkAnalysisResult } from "../src/lib/ai/link-intelligence";
import { normalizeAIResponse, parseAIStructuredJson } from "../src/lib/ai/sanitizer";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail: string = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASSED] ${testName}`);
  } else {
    failedTests++;
    console.error(`❌ [FAILED] ${testName} ${detail ? `- ${detail}` : ""}`);
  }
}

async function runTestSuite() {
  console.log("==================================================");
  console.log("LINKORA AI PIPELINE & SECURITY AUTOMATED TEST SUITE");
  console.log("==================================================\n");

  // ==================================================
  // 1. CLASSIFICATION ENGINE TEST SUITE
  // ==================================================
  console.log("--- 1. Testing Page Classifier Engine ---");

  // Test 1.1: Login Page
  {
    const html = `<html><head><title>Sign in to your account</title></head><body><form><input type="email"/><input type="password"/><button>Login</button></form></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://app.example.com/login", "app.example.com", $, [], "");
    assert(res.category === "AUTHENTICATION" && res.subcategory === "LOGIN", "Classifier: Authentication Login Page");
    assert(res.relevantFields.includes("namaLayanan"), "Classifier: Authentication Relevant Fields");
  }

  // Test 1.2: Register Page
  {
    const html = `<html><head><title>Create your account - Sign Up</title></head><body><form><input type="text" name="name"/><input type="password"/><button>Daftar</button></form></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://app.example.com/register", "app.example.com", $, [], "");
    assert(res.category === "AUTHENTICATION" && res.subcategory === "REGISTER", "Classifier: Authentication Register Page");
  }

  // Test 1.3: YouTube Video Page
  {
    const html = `<html><head><title>Next.js 15 Full Tutorial #shorts</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://www.youtube.com/shorts/abc12345", "www.youtube.com", $, ["VideoObject"], "");
    assert(res.category === "VIDEO" && res.subcategory === "SHORT_VIDEO", "Classifier: YouTube Short Video");
  }

  // Test 1.4: GitHub Repository
  {
    const html = `<html><head><title>facebook/react: The library for web and native user interfaces</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://github.com/facebook/react", "github.com", $, [], "");
    assert(res.category === "GITHUB" && res.subcategory === "CODE_REPOSITORY", "Classifier: GitHub Code Repository");
  }

  // Test 1.5: Journal / Scholarly Paper
  {
    const html = `<html><head><title>Attention Is All You Need</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://arxiv.org/abs/1706.03762", "arxiv.org", $, ["ScholarlyArticle"], "");
    assert(res.category === "JOURNAL" && res.subcategory === "RESEARCH_PAPER", "Classifier: Journal / arXiv Paper");
    assert(res.relevantFields.includes("doi") && res.relevantFields.includes("abstract"), "Classifier: Journal Relevant Fields");
  }

  // Test 1.6: Job Posting
  {
    const html = `<html><head><title>Senior Frontend Engineer Hiring - TechCorp</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://www.linkedin.com/jobs/view/12345678", "www.linkedin.com", $, ["JobPosting"], "");
    assert(res.category === "JOB" && res.subcategory === "FULL_TIME_JOB", "Classifier: Job Posting");
    assert(res.relevantFields.includes("gaji") && res.relevantFields.includes("persyaratan"), "Classifier: Job Relevant Fields");
  }

  // Test 1.7: Scholarship
  {
    const html = `<html><head><title>Beasiswa LPDP 2026 Program Magister</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://lpdp.kemenkeu.go.id/beasiswa", "lpdp.kemenkeu.go.id", $, [], "");
    assert(res.category === "SCHOLARSHIP", "Classifier: Scholarship / Beasiswa");
  }

  // Test 1.8: AI Tool
  {
    const html = `<html><head><title>Awesome AI Code Generator Tool</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://producthunt.com/posts/awesome-ai", "producthunt.com", $, ["SoftwareApplication"], "");
    assert(res.category === "AI_TOOL", "Classifier: AI Tool Directory");
  }

  // Test 1.9: Product / E-Commerce
  {
    const html = `<html><head><title>Laptop Gaming Pro 16 Inch</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://tokopedia.com/product/laptop-gaming", "tokopedia.com", $, ["Product"], "");
    assert(res.category === "PRODUCT", "Classifier: E-Commerce Product");
  }

  // Test 1.10: PDF Document
  {
    const html = `<html><head><title>User Manual Guide [PDF]</title></head><body></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://example.com/downloads/manual.pdf", "example.com", $, [], "");
    assert(res.category === "PDF", "Classifier: PDF Document File");
  }

  // Test 1.11: Unknown / General Webpage
  {
    const html = `<html><head><title>Welcome to My Simple Page</title></head><body><p>Hello world</p></body></html>`;
    const $ = cheerio.load(html);
    const res = classifyPage("https://example.com/about", "example.com", $, [], "");
    assert(res.category === "WEBSITE" && res.subcategory === "LANDING_PAGE", "Classifier: General Webpage Fallback");
  }

  // ==================================================
  // 2. TEXT NORMALIZER & SANITIZER TEST SUITE
  // ==================================================
  console.log("\n--- 2. Testing Text Normalizer & Sanitizer ---");

  // Test 2.1: Stripping decorative headers and divider lines
  {
    const raw = `### RINGKASAN HALAMAN\n---\nIni adalah ringkasan.\n***\n___`;
    const cleaned = normalizeAIResponse(raw);
    assert(!cleaned.includes("###") && !cleaned.includes("---") && !cleaned.includes("***"), "Sanitizer: Strip decorative headers & lines");
  }

  // Test 2.2: Preserving URLs and code blocks intact
  {
    const raw = `Kunjungi https://linkora.id/app?ref=123 untuk detail.\n\`\`\`js\nconst x = 10;\n\`\`\``;
    const cleaned = normalizeAIResponse(raw);
    assert(cleaned.includes("https://linkora.id/app?ref=123"), "Sanitizer: Preserve URL intact");
    assert(cleaned.includes("const x = 10;"), "Sanitizer: Preserve Code Block intact");
  }

  // Test 2.3: Robust JSON Parser
  {
    const rawJson = `\`\`\`json\n{\n  "title": "Linkora AI",\n  "tags": ["ai", "link"]\n}\n\`\`\``;
    const parsed = parseAIStructuredJson<{ title: string; tags: string[] }>(rawJson);
    assert(parsed !== null && parsed.title === "Linkora AI" && parsed.tags.length === 2, "Sanitizer: Parse fenced JSON correctly");
  }

  // ==================================================
  // 3. CONTEXT ISOLATION & UNTRUSTED WEB CONTENT TEST SUITE
  // ==================================================
  console.log("\n--- 3. Testing Context Isolation & Untrusted Content Tags ---");

  {
    const mockAnalysisResult: LinkAnalysisResult = {
      url: "https://example.com/job",
      finalUrl: "https://example.com/job",
      normalizedUrl: "https://example.com/job",
      hostname: "example.com",
      title: "Software Engineer Job",
      description: "Hiring Software Engineer",
      category: "Lowongan Kerja",
      tags: ["tech", "job"],
      notes: "IDENTITAS PEKERJAAN:\nPosisi: Software Engineer\nPerusahaan: TechCorp",
      previewImage: null,
      thumbnail: null,
      favicon: "https://www.google.com/s2/favicons?domain=example.com",
      deadline: null,
      priority: "Rendah",
      platform: "JOB",
      author: null,
      publishedDate: null,
      siteName: "TechCorp",
      classification: {
        category: "JOB",
        subcategory: "FULL_TIME_JOB",
        confidence: 0.95,
        evidence: ["Job posting detected"],
        appCategory: "Lowongan Kerja",
        relevantFields: ["posisi", "perusahaan", "lokasi", "gaji", "deadline"],
        categoryInstructions: "",
      },
      formattedContextForChat: "",
    };

    const formattedContext = buildFormattedContextForChat(mockAnalysisResult);
    assert(formattedContext.includes("<untrusted_web_content"), "Context Isolation: Includes <untrusted_web_content> tag");
    assert(formattedContext.includes("category=\"JOB\""), "Context Isolation: Includes category attribute");
    assert(formattedContext.includes("DILARANG KERAS memaksakan template jurnal"), "Context Isolation: Includes strict anti-hallucination instruction");
  }

  console.log("\n==================================================");
  console.log(`TEST SUMMARY: TOTAL: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
