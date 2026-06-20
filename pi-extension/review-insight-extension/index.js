function clampPercent(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.max(0, Math.min(100, Math.round(number)));
}

function normalizeList(items) {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => String(item || "").trim())
    .filter((item) => item.length > 0)
    .slice(0, 5);
}

function normalizeSentiment(sentiment = {}) {
  const positive = clampPercent(sentiment.positive);
  const neutral = clampPercent(sentiment.neutral);
  const negative = clampPercent(sentiment.negative);
  const total = positive + neutral + negative;

  if (total === 100) {
    return { positive, neutral, negative };
  }

  if (total === 0) {
    return { positive: 0, neutral: 100, negative: 0 };
  }

  const normalizedPositive = Math.round((positive / total) * 100);
  const normalizedNegative = Math.round((negative / total) * 100);

  return {
    positive: normalizedPositive,
    neutral: Math.max(0, 100 - normalizedPositive - normalizedNegative),
    negative: normalizedNegative
  };
}

function normalizeRecommendation(recommendation = {}) {
  const score = clampPercent(recommendation.score);

  return {
    score,
    decision: recommendation.decision || "판단 보류",
    reason: recommendation.reason || "추천 판단을 생성하지 못했습니다."
  };
}

function createDashboard(result) {
  const recommendation = result.recommendation;
  const sentiment = result.sentiment;

  return {
    hero: {
      score: recommendation.score,
      decision: recommendation.decision,
      reason: recommendation.reason,
      review_count: result.review_count
    },
    cards: [
      {
        id: "pros",
        title: "자주 언급된 장점",
        count: result.pros.length,
        items: result.pros
      },
      {
        id: "complaints",
        title: "반복되는 불만",
        count: result.complaints.length,
        items: result.complaints
      },
      {
        id: "warnings",
        title: "구매 전 주의사항",
        count: result.buyer_warnings.length,
        items: result.buyer_warnings
      }
    ],
    sentiment_bars: [
      { label: "긍정", value: sentiment.positive, tone: "positive" },
      { label: "중립", value: sentiment.neutral, tone: "neutral" },
      { label: "부정", value: sentiment.negative, tone: "negative" }
    ]
  };
}

function createAgentTrace(result) {
  const sourceLabel = result.source_label || "리뷰 입력";

  return [
    {
      name: "Input",
      description: `${sourceLabel}에서 리뷰 ${result.review_count}개 수집`
    },
    {
      name: "MCP",
      description:
        result.source === "csv"
          ? "CSV Review Reader MCP가 파일에서 리뷰 컬럼을 추출"
          : "입력 텍스트를 리뷰 목록으로 정규화"
    },
    {
      name: "Skill",
      description: "Review Analysis Skill 기준으로 장점, 불만, 주의사항 분석"
    },
    {
      name: "Agent",
      description: "Gemini 기반 Agent가 구매 판단과 감성 비율 생성"
    },
    {
      name: "Pi Extension",
      description: "분석 결과를 Web UI 대시보드 구조로 변환"
    }
  ];
}

function formatReviewInsightResult(result) {
  const formatted = {
    review_count: Number(result.review_count) || 0,
    source: result.source || "text",
    source_label: result.source_label || "직접 입력",
    file_name: result.file_name || "",
    summary: result.summary || "요약 결과 없음",
    pros: normalizeList(result.pros),
    complaints: normalizeList(result.complaints),
    buyer_warnings: normalizeList(result.buyer_warnings),
    sentiment: normalizeSentiment(result.sentiment),
    recommendation: normalizeRecommendation(result.recommendation)
  };

  return {
    ...formatted,
    dashboard: createDashboard(formatted),
    agent_trace: createAgentTrace(formatted),
    extension: {
      name: "Review Insight Extension",
      role: "AI 분석 결과를 Web UI 대시보드 모델로 변환"
    }
  };
}

module.exports = {
  formatReviewInsightResult
};
