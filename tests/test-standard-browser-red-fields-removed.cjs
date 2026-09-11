const fs = require("fs");
const path = require("path");
const assert = require("assert");

const html = fs.readFileSync(
  path.join(__dirname, "..", "low-dim-materials.html"),
  "utf8"
);

const browserPage = html.slice(
  html.indexOf("function renderLowdimStandardBrowserPage()"),
  html.indexOf("function bindLowdimStandardBrowserEvents()")
);

const managementPage = html.slice(
  html.indexOf("function renderLowdimStandardManagePage()"),
  html.indexOf("function renderLowdimStandardDetailPage(record)")
);

assert(
  !browserPage.includes('<span class="lowdim-standard-browser-type-label">标准类型</span>'),
  "截图红框中的标准类型标签仍存在"
);
assert(
  !browserPage.includes('<span class="twod-search-eyebrow">低维材料标准体系</span>'),
  "截图红框中的页面眉题仍存在"
);
assert(
  !browserPage.includes("<h2>低维材料标准体系</h2>"),
  "截图红框中的页面标题仍存在"
);
assert(
  !browserPage.includes('data-standard-browser-manage>标准体系管理'),
  "截图红框中的标准体系管理按钮仍存在"
);
assert(
  !browserPage.includes('class="lowdim-standard-browser-list-head"><strong>共 ${filtered.length} 条标准</strong><span>'),
  "截图红框中的当前类型文字仍存在"
);
assert(
  !managementPage.includes('<span class="lowdim-standard-type-label">标准类型：</span>'),
  "管理页截图红框中的标准类型标签仍存在"
);
assert(
  !managementPage.includes('<span class="twod-search-eyebrow">低维材料标准体系</span>'),
  "管理页截图红框中的页面眉题仍存在"
);

console.log("standard browser red-box fields are removed");
