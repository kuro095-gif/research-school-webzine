"use strict";

const driveHosts = new Set(["drive.google.com", "drive.usercontent.google.com"]);
const driveFileId = /^[A-Za-z0-9_-]{10,}$/;

function driveUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" || !driveHosts.has(url.hostname) || url.username || url.password || url.port) {
      return null;
    }
    const fileId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)(?:\/(?:view|preview|edit))?\/?$/)?.[1];
    const filePaths = url.hostname === "drive.google.com" ? ["/open", "/uc"] : ["/download"];
    return driveFileId.test(fileId ?? "") ||
      (filePaths.includes(url.pathname) && driveFileId.test(url.searchParams.get("id") ?? ""))
      ? url
      : null;
  } catch {
    return null;
  }
}

function downloadUrl(value) {
  const url = driveUrl(value);
  if (!url) return null;
  if (url.hostname === "drive.usercontent.google.com" || url.pathname === "/uc") return url;

  const fileId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/)?.[1] ?? url.searchParams.get("id");
  const download = new URL("https://drive.google.com/uc");
  download.searchParams.set("export", "download");
  download.searchParams.set("id", fileId);
  const resourceKey = url.searchParams.get("resourcekey");
  if (resourceKey) download.searchParams.set("resourcekey", resourceKey);
  return download;
}

function setExternalLink(element, url) {
  element.href = url.href;
  element.target = "_blank";
  element.rel = "noopener noreferrer";
}

function attachFormLinks(files) {
  const forms = Array.isArray(files.forms) ? files.forms : [];
  const entries = new Map(forms.map(form => [String(form.number), form]));

  for (const card of document.querySelectorAll("[data-form-number]")) {
    const form = entries.get(card.dataset.formNumber);
    const container = card.querySelector("[data-form-downloads]");
    if (!form || !container) continue;

    const add = (label, url, style) => {
      if (!label || !url) return;
      const link = document.createElement("a");
      link.className = "button small " + style;
      link.textContent = label;
      setExternalLink(link, url);
      container.append(link);
    };

    const pdf = form.pdf ?? {};
    add("PDF로 열기", driveUrl(pdf.viewUrl), "outline");
    add("PDF 내려받기", downloadUrl(pdf.downloadUrl) ?? downloadUrl(pdf.viewUrl), "secondary");
    for (const item of form.downloads ?? []) {
      add(item.label || "한글 파일 내려받기", downloadUrl(item.url), "primary");
    }
    container.hidden = container.children.length === 0;
  }
}

async function setupDocuments() {
  const buttons = [...document.querySelectorAll("[data-guide-link]")];
  const dialog = document.getElementById("pdf-info");
  for (const button of buttons) {
    button.addEventListener("click", event => {
      if (button.getAttribute("href") === "#pdf-info" && dialog?.showModal && !dialog.open) {
        event.preventDefault();
        dialog.showModal();
      }
    });
  }
  try {
    const response = await fetch("data/files.json");
    if (!response.ok) throw new Error("자료 목록 응답 오류");
    const files = await response.json();
    const guide = driveUrl(files.guide?.viewUrl);
    if (guide) buttons.forEach(button => setExternalLink(button, guide));
    attachFormLinks(files);
  } catch (error) {
    // The guide text and local previews remain available while links are being fixed.
    console.warn("자료 링크를 불러오지 못했습니다.", error);
  }
}

const monthlyTasks = {
  planning: [
    ["운영팀과 협의체 구성", "operations.html#plan"],
    ["운영계획서 준비와 제출", "writing.html#plan-writing"],
    ["지원금 집행 계획서 작성", "forms.html#form-2"],
  ],
  running: [
    ["연구과제를 수업에 적용", "operations.html#run"],
    ["시범수업과 수업 후 협의 준비", "class.html#demo-lesson"],
    ["학생 산출물과 관찰 기록 정리", "operations.html#run"],
  ],
  preparation: [
    ["수업 나눔의 날 일정과 안내 자료 준비", "operations.html#sharing"],
    ["최종보고서 초안과 검증 자료 점검", "writing.html#report-writing"],
    ["수업 나눔의 날 자료 게시 시기 확인", "faq.html#faq-report-1"],
  ],
  reporting: [
    ["수업 나눔의 날 운영과 협의 결과 정리", "operations.html#sharing"],
    ["최종보고서와 일반화 자료 점검·제출", "operations.html#report"],
    ["지원금 최종 결산 보고서 작성", "forms.html#form-3"],
  ],
  following: [
    ["후속 운영과 자료 정리", "operations.html#follow-up"],
    ["보고서와 일반화 자료 보관", "operations.html#report"],
    ["다음 담당자에게 넘길 내용 정리", "handover.html"],
  ],
};

function showMonthlyTasks() {
  const title = document.getElementById("month-title");
  const list = document.getElementById("month-tasks");
  if (!title || !list) return;
  const month = Number(new Intl.DateTimeFormat("en", {timeZone: "Asia/Seoul", month: "numeric"}).format(new Date()));
  const phase = month >= 3 && month <= 4 ? "planning"
    : month >= 5 && month <= 8 ? "running"
    : month >= 9 && month <= 10 ? "preparation"
    : month === 11 ? "reporting"
    : "following";

  title.textContent = month + "월의 할 일";
  list.replaceChildren(...monthlyTasks[phase].map(([label, href]) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    item.append(link);
    return item;
  }));
}

function hashTarget() {
  return document.getElementById(location.hash.slice(1));
}

function setupReader() {
  const chapters = [...document.querySelectorAll("[data-reader-chapter]")];
  if (!chapters.length) return;
  const tocLinks = [...document.querySelectorAll("[data-chapter]")];
  const compactToc = document.querySelector(".toc-mobile");
  const header = document.querySelector(".site-header");
  let active;

  function setActive(id) {
    if (id === active) return;
    active = id;
    for (const link of tocLinks) {
      if (link.dataset.chapter === id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  }

  function trackChapter() {
    const readingLine = (header?.offsetHeight ?? 0) + (matchMedia("(max-width: 760px)").matches ? 69 : 34);
    let current = chapters[0];
    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top > readingLine) break;
      current = chapter;
    }
    setActive(current.id);
  }

  for (const link of tocLinks) {
    link.addEventListener("click", () => {
      if (compactToc?.open) compactToc.open = false;
      setActive(link.dataset.chapter);
    });
  }
  let frame = 0;
  window.addEventListener("scroll", () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      trackChapter();
    });
  }, {passive: true});
  window.addEventListener("hashchange", () => {
    const target = hashTarget()?.closest("[data-reader-chapter]");
    if (target) setActive(target.id);
  });
  const target = hashTarget()?.closest("[data-reader-chapter]");
  if (target) setActive(target.id);
  else trackChapter();
}

function openQuestionFromHash() {
  const target = hashTarget();
  if (target instanceof HTMLDetailsElement && target.classList.contains("faq-item")) {
    target.open = true;
  }
}

const searchPages = [
  ["forms.html", "자료·서식"], ["operations.html", "단계별 업무"],
  ["writing.html", "계획서·보고서"], ["faq.html", "현장 Q&A"],
  ["read.html", "길라잡이 본문"], ["start.html", "처음 맡았어요"],
  ["overview.html", "관리자 3분 요약"], ["class.html", "공개수업 준비"],
  ["handover.html", "인수인계표"],
];
const searchAliases = [
  ["정산", "결산"], ["수업공개", "공개수업"], ["인계", "인수인계"],
  ["한글", "hwp", "hwpx"], ["운영계획서", "연구계획서"], ["최종보고서", "연구학교보고서"],
];

function normalize(text) {
  return text.normalize("NFKC").toLocaleLowerCase("ko").replace(/[^\p{L}\p{N}]/gu, "");
}

function alternatives(word) {
  const normalized = normalize(word);
  return searchAliases.find(group => group.includes(normalized)) ?? [normalized];
}

function getMatches(records, query) {
  const whole = normalize(query);
  const terms = query.split(/\s+/).map(alternatives).filter(group => group[0]);
  if (!terms.length) return [];
  return records.flatMap(record => {
    const title = normalize(record.title);
    const body = normalize(record.body);
    const hits = terms.map(group => group.some(term => title.includes(term)) ? 32 :
      group.some(term => body.includes(term)) ? 6 : 0);
    const literal = title.includes(whole) ? 75 : body.includes(whole) ? 9 : 0;
    if (!literal && hits.some(hit => hit === 0)) return [];
    const score = hits.reduce((sum, hit) => sum + hit, literal);
    return [{...record, score}];
  }).sort((first, second) => second.score - first.score);
}

async function loadSearchPage(href, category) {
  const response = await fetch(href);
  if (!response.ok) throw new Error(href);
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  return [...doc.querySelectorAll("[data-search-title]")].map(node => ({
    title: node.dataset.searchTitle,
    href: node.id ? href + "#" + node.id : href,
    category,
    body: node.textContent.replace(/\s+/g, " ").trim(),
  }));
}

function excerpt(body, query) {
  const lower = body.toLocaleLowerCase("ko");
  const terms = query.split(/\s+/).flatMap(alternatives).filter(Boolean);
  const indices = terms.map(term => lower.indexOf(term)).filter(index => index >= 0);
  const start = indices.length ? Math.max(0, Math.min(...indices) - 32) : 0;
  const snippet = body.slice(start, start + 154).trim();
  return (start ? "…" : "") + snippet + (start + 154 < body.length ? "…" : "");
}

function searchResult(record, query) {
  const item = document.createElement("li");
  item.className = "search-result";
  const meta = document.createElement("p");
  meta.className = "meta";
  meta.textContent = record.category;
  const heading = document.createElement("h2");
  const link = document.createElement("a");
  link.href = record.href;
  link.textContent = record.title;
  heading.append(link);
  const description = document.createElement("p");
  description.textContent = excerpt(record.body, query);
  item.append(meta, heading, description);
  return item;
}

async function runSearch() {
  const list = document.getElementById("search-results");
  if (!list) return;
  const status = document.getElementById("search-status");
  const input = document.getElementById("search-query");
  const query = (new URLSearchParams(location.search).get("q") ?? "").trim().slice(0, 120);
  input.value = query;
  if (!normalize(query)) return;
  status.textContent = "검색하고 있습니다.";
  const pages = await Promise.allSettled(searchPages.map(([href, title]) => loadSearchPage(href, title)));
  const complete = pages.filter(page => page.status === "fulfilled");
  if (!complete.length) {
    status.textContent = "본문을 불러오지 못했습니다. 페이지를 새로고침해 주세요.";
    return;
  }
  const matches = getMatches(complete.flatMap(page => page.value), query);
  if (!matches.length) {
    status.textContent = "‘" + query + "’ 검색 결과가 없습니다. 업무명이나 서식명을 확인해 보세요.";
  } else {
    const shown = matches.slice(0, 60);
    status.textContent = "‘" + query + "’ 검색 결과 " + matches.length + "건" +
      (shown.length < matches.length ? " · 관련도가 높은 60건 표시" : "");
    list.replaceChildren(...shown.map(record => searchResult(record, query)));
  }
  if (complete.length < pages.length) status.textContent += " · 일부 페이지를 불러오지 못했습니다.";
}

setupDocuments();
showMonthlyTasks();
setupReader();
openQuestionFromHash();
window.addEventListener("hashchange", openQuestionFromHash);
document.querySelectorAll("[data-print]").forEach(button => button.addEventListener("click", () => window.print()));
runSearch();
