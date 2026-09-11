const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const current = fs.readFileSync(path.join(repoRoot, "low-dim-materials.html"), "utf8");
const baseline = execFileSync("git", ["show", "HEAD~1:low-dim-materials.html"], {
  cwd: repoRoot,
  encoding: "utf8",
  maxBuffer: 20 * 1024 * 1024
});

function section(source, start, end) {
  const startIndex = source.indexOf(start);
  assert.notStrictEqual(startIndex, -1, `missing start marker: ${start}`);
  const endIndex = source.indexOf(end, startIndex + start.length);
  assert.notStrictEqual(endIndex, -1, `missing end marker after ${start}: ${end}`);
  return source.slice(startIndex, endIndex).replace(/\r\n/g, "\n");
}

[
  ["function renderTwodModeWorkspace() {", "function getTwodPageSize() {"],
  ["function renderTwodResultToolbar(total) {", "function renderTwodResultHeader(columns) {"],
  ["function getTwodTaskWizardState() {", "function renderTwodTaskMethodBranch(method) {"],
  ["function renderLowdimIngestPage(pageId) {", "const TWOD_STANDARDIZATION_CATEGORIES = ["]
].forEach(([start, end]) => {
  assert.strictEqual(
    section(current, start, end),
    section(baseline, start, end),
    `${start} 未恢复到主题应用基线版本`
  );
});

console.log("theme application prototype sections match the baseline snapshot");
