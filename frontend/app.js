let currentAnalysisResult = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function switchTab(tabName) {
  const isText = tabName === "text";

  document.getElementById("textTabButton").classList.toggle("active", isText);
  document.getElementById("csvTabButton").classList.toggle("active", !isText);
  document.getElementById("textPanel").classList.toggle("active", isText);
  document.getElementById("csvPanel").classList.toggle("active", !isText);
}

function showLoading(title, message) {
  document.getElementById("result").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <div>
        <p class="eyebrow">Agent Running</p>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    </div>
  `;
}

function showError(message) {
  document.getElementById("result").innerHTML = `
    <div class="error-state">
      <p class="eyebrow">Error</p>
      <h2>분석 실패</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

async function parseResponse(response) {
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(data.error || "분석 중 오류가 발생했습니다.");
  }

  return data;
}

async function analyzeText() {
  const text = document.getElementById("reviewText").value;

  if (!text.trim()) {
    alert("리뷰를 입력해주세요.");
    return;
  }

  showLoading(
    "텍스트 리뷰 분석 중",
    "Review Analysis Skill 기준으로 장점, 불만, 구매 전 주의사항을 추출하고 있습니다."
  );

  try {
    const response = await fetch("/analyze-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    renderResult(await parseResponse(response));
  } catch (error) {
    showError(error.message);
  }
}

async function analyzeCsv() {
  const fileInput = document.getElementById("csvFile");

  if (!fileInput.files.length) {
    alert("CSV 파일을 선택해주세요.");
    return;
  }

  showLoading(
    "CSV 리뷰 분석 중",
    "CSV Review Reader MCP가 리뷰 컬럼을 추출한 뒤 Agent 분석으로 전달합니다."
  );

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  try {
    const response = await fetch("/analyze-csv", {
      method: "POST",
      body: formData
    });

    renderResult(await parseResponse(response));
  } catch (error) {
    showError(error.message);
  }
}

function renderList(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return "<li>분석 결과 없음</li>";
  }

  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderTrace(trace = []) {
  return trace
    .map(
      (step, index) => `
        <div class="trace-step">
          <span>${index + 1}</span>
          <div>
            <strong>${escapeHtml(step.name)}</strong>
            <p>${escapeHtml(step.description)}</p>
          </div>
        </div>
      `
    )
    .join("");
}

function renderSentimentBars(bars = []) {
  return bars
    .map(
      (bar) => `
        <div class="bar">
          <div class="bar-label">
            <span>${escapeHtml(bar.label)}</span>
            <strong>${escapeHtml(bar.value)}%</strong>
          </div>
          <div class="progress">
            <div class="${escapeHtml(bar.tone)}" style="width:${Number(
        bar.value || 0
      )}%"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderInsightCards(cards = []) {
  return cards
    .map(
      (card) => `
        <article class="analysis-card">
          <div class="card-heading">
            <h3>${escapeHtml(card.title)}</h3>
            <span>${escapeHtml(card.count)}개</span>
          </div>
          <ul>${renderList(card.items)}</ul>
        </article>
      `
    )
    .join("");
}

function renderResult(data) {
  currentAnalysisResult = data;

  const dashboard = data.dashboard || {};
  const hero = dashboard.hero || {};
  const recommendation = data.recommendation || {};
  const sourceLabel = data.source_label || "직접 입력";

  document.getElementById("result").innerHTML = `
    <div class="result-header">
      <div>
        <p class="eyebrow">Analysis Dashboard</p>
        <h2>리뷰 인사이트 결과</h2>
      </div>
      <button class="secondary-button" onclick="saveFavoriteProduct()" type="button">
        결과 저장
      </button>
    </div>

    <section class="score-card">
      <div class="score-main">
        <p>AI 구매 추천 점수</p>
        <strong>${escapeHtml(hero.score ?? recommendation.score ?? 0)}</strong>
        <span>점</span>
      </div>
      <div class="score-copy">
        <span class="decision-badge">${escapeHtml(
          hero.decision || recommendation.decision || "판단 보류"
        )}</span>
        <p>${escapeHtml(hero.reason || recommendation.reason || "")}</p>
      </div>
    </section>

    <section class="metric-row">
      <div>
        <span>입력 방식</span>
        <strong>${escapeHtml(sourceLabel)}</strong>
      </div>
      <div>
        <span>분석 리뷰 수</span>
        <strong>${escapeHtml(data.review_count ?? 0)}개</strong>
      </div>
      <div>
        <span>Extension</span>
        <strong>${escapeHtml(data.extension?.name || "Review Insight Extension")}</strong>
      </div>
    </section>

    <section class="summary-card">
      <h3>요약</h3>
      <p>${escapeHtml(data.summary)}</p>
    </section>

    <section class="dashboard-grid">
      ${renderInsightCards(dashboard.cards)}
    </section>

    <section class="detail-grid">
      <div class="summary-card">
        <h3>감성 분석</h3>
        ${renderSentimentBars(dashboard.sentiment_bars)}
      </div>

      <div class="summary-card">
        <h3>Agent 처리 과정</h3>
        <div class="trace-list">
          ${renderTrace(data.agent_trace)}
        </div>
      </div>
    </section>

    <section class="detail-grid">
      <div class="summary-card">
        <div class="section-title-row">
          <h3>최근 분석 기록</h3>
          <button class="ghost-button" onclick="clearHistory()" type="button">전체 삭제</button>
        </div>
        <div id="historyList"></div>
      </div>

      <div class="summary-card">
        <div class="section-title-row">
          <h3>저장한 결과</h3>
          <button class="ghost-button" onclick="clearFavorites()" type="button">전체 삭제</button>
        </div>
        <div id="favoriteList"></div>
      </div>
    </section>
  `;

  saveHistory(data);
  renderHistory();
  renderFavorites();
}

function saveHistory(data) {
  const histories = JSON.parse(localStorage.getItem("analysisHistories")) || [];
  const recommendation = data.recommendation || {};

  histories.unshift({
    date: new Date().toLocaleString(),
    sourceLabel: data.source_label || "직접 입력",
    reviewCount: data.review_count || 0,
    score: recommendation.score,
    decision: recommendation.decision,
    summary: data.summary
  });

  localStorage.setItem("analysisHistories", JSON.stringify(histories.slice(0, 10)));
}

function renderHistory() {
  const histories = JSON.parse(localStorage.getItem("analysisHistories")) || [];
  const historyList = document.getElementById("historyList");

  if (!historyList) return;

  if (histories.length === 0) {
    historyList.innerHTML = "<p class=\"muted\">아직 분석 기록이 없습니다.</p>";
    return;
  }

  historyList.innerHTML = `
    <div class="scroll-list">
      ${histories
        .map(
          (item, index) => `
            <div class="history-item">
              <div class="item-top">
                <strong>${escapeHtml(item.decision)} · ${escapeHtml(
                  item.score
                )}점</strong>
                <button class="delete-btn" onclick="deleteHistory(${index})" type="button">삭제</button>
              </div>
              <p>${escapeHtml(item.sourceLabel)} · ${escapeHtml(
            item.reviewCount
          )}개 리뷰</p>
              <p>${escapeHtml(item.summary)}</p>
              <small>${escapeHtml(item.date)}</small>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function saveFavoriteProduct() {
  const data = currentAnalysisResult;

  if (!data) {
    alert("저장할 분석 결과가 없습니다.");
    return;
  }

  const favorites = JSON.parse(localStorage.getItem("favoriteProducts")) || [];
  const recommendation = data.recommendation || {};

  favorites.unshift({
    date: new Date().toLocaleString(),
    sourceLabel: data.source_label || "직접 입력",
    reviewCount: data.review_count || 0,
    score: recommendation.score,
    decision: recommendation.decision,
    summary: data.summary,
    reason: recommendation.reason
  });

  localStorage.setItem("favoriteProducts", JSON.stringify(favorites.slice(0, 10)));

  alert("분석 결과가 저장되었습니다.");
  renderFavorites();
}

function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favoriteProducts")) || [];
  const favoriteList = document.getElementById("favoriteList");

  if (!favoriteList) return;

  if (favorites.length === 0) {
    favoriteList.innerHTML = "<p class=\"muted\">아직 저장된 결과가 없습니다.</p>";
    return;
  }

  favoriteList.innerHTML = `
    <div class="scroll-list">
      ${favorites
        .map(
          (item, index) => `
            <div class="history-item favorite-item">
              <div class="item-top">
                <strong>${escapeHtml(item.decision)} · ${escapeHtml(
                  item.score
                )}점</strong>
                <button class="delete-btn" onclick="deleteFavorite(${index})" type="button">삭제</button>
              </div>
              <p>${escapeHtml(item.sourceLabel)} · ${escapeHtml(
            item.reviewCount
          )}개 리뷰</p>
              <p>${escapeHtml(item.summary)}</p>
              <p><strong>이유:</strong> ${escapeHtml(item.reason)}</p>
              <small>${escapeHtml(item.date)}</small>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function deleteHistory(index) {
  const histories = JSON.parse(localStorage.getItem("analysisHistories")) || [];

  histories.splice(index, 1);
  localStorage.setItem("analysisHistories", JSON.stringify(histories));
  renderHistory();
}

function deleteFavorite(index) {
  const favorites = JSON.parse(localStorage.getItem("favoriteProducts")) || [];

  favorites.splice(index, 1);
  localStorage.setItem("favoriteProducts", JSON.stringify(favorites));
  renderFavorites();
}

function clearHistory() {
  if (!confirm("최근 분석 기록을 모두 삭제하시겠습니까?")) {
    return;
  }

  localStorage.removeItem("analysisHistories");
  renderHistory();
}

function clearFavorites() {
  if (!confirm("저장한 결과를 모두 삭제하시겠습니까?")) {
    return;
  }

  localStorage.removeItem("favoriteProducts");
  renderFavorites();
}
