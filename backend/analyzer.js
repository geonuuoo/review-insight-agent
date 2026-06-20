require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");
const { formatReviewInsightResult } = require("../pi-extension/review-insight-extension");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

function loadReviewAnalysisSkill() {
  const skillPath = path.join(
    process.cwd(),
    "skills",
    "review-analysis-skill",
    "SKILL.md"
  );

  return fs.readFileSync(skillPath, "utf8");
}

function extractJson(text) {
  const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/);

  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    return JSON.parse(text.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("JSON을 찾을 수 없습니다.");
}

async function analyzeReviews(reviews, metadata = {}) {
  const reviewText = reviews.join("\n");
  const reviewAnalysisSkill = loadReviewAnalysisSkill();

  const prompt = `
아래는 이 프로젝트에서 사용하는 Review Analysis Skill 문서입니다.
이 Skill의 절차와 기준을 반드시 참고해서 리뷰를 분석하세요.

[Review Analysis Skill]
${reviewAnalysisSkill}

당신은 구매자의 합리적인 구매 결정을 돕는 쇼핑/커머스 상품 리뷰 분석 Agent입니다.

아래 리뷰들을 분석해서 구매자가 상품을 사기 전에 확인해야 할 정보를 정리하세요.

조건:
- 반드시 JSON 형식만 반환하세요.
- JSON 밖에 설명 문장을 쓰지 마세요.
- pros, complaints, buyer_warnings는 배열로 작성하세요.
- sentiment는 positive, neutral, negative의 합이 100이 되게 작성하세요.
- recommendation은 score, decision, reason을 포함하세요.
- score는 0~100 사이의 구매 추천 점수입니다.
- decision은 "구매 추천", "조건부 구매 추천", "구매 신중", "구매 비추천" 중 하나로 작성하세요.
- reason은 구매자가 이해하기 쉬운 한 문장으로 작성하세요.
- 부정 표현이 있으면 buyer_warnings와 negative 비율에 반영하세요.
- 장점과 불만을 모두 고려해 구매 판단을 제시하세요.

리뷰:
${reviewText}

반환 형식:
{
  "summary": "리뷰 기반 상품 요약",
  "pros": ["장점1", "장점2"],
  "complaints": ["불만1", "불만2"],
  "buyer_warnings": ["구매 전 주의사항1", "구매 전 주의사항2"],
  "sentiment": {
    "positive": 0,
    "neutral": 0,
    "negative": 0
  },
  "recommendation": {
    "score": 0,
    "decision": "조건부 구매 추천",
    "reason": "구매 판단 이유"
  }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text;
    const result = extractJson(text);

    return formatReviewInsightResult({
      ...metadata,
      review_count: reviews.length,
      ...result
    });
  } catch (error) {
    console.error("Gemini 분석 오류:", error);

    return formatReviewInsightResult({
      ...metadata,
      review_count: reviews.length,
      summary: "AI 분석 중 오류가 발생했습니다.",
      pros: ["분석 실패"],
      complaints: ["분석 실패"],
      buyer_warnings: ["API 키, 네트워크 상태 또는 Skill 파일 경로를 확인하세요."],
      sentiment: {
        positive: 0,
        neutral: 100,
        negative: 0
      },
      recommendation: {
        score: 0,
        decision: "분석 실패",
        reason: "AI 분석 결과를 가져오지 못했습니다. 다시 시도해주세요."
      }
    });
  }
}

module.exports = {
  analyzeReviews
};
