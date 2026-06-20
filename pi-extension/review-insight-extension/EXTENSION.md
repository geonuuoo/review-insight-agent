# Review Insight Extension

## Overview

Review Insight Extension은 Review Insight Agent의 AI 분석 결과를 Web UI에서 바로 사용할 수 있는 대시보드 데이터 구조로 변환하는 Pi Extension입니다.

이 프로젝트에서 Extension은 단순히 결과를 전달하지 않고, Agent 응답을 정규화하고 사용자 화면에 필요한 카드, 점수, 감성 그래프, 처리 과정 데이터를 구성합니다.

---

## Role

- AI 분석 결과의 기본값 보정
- 장점, 불만, 구매 전 주의사항 목록 정리
- 감성 분석 비율 정규화
- 구매 추천 점수와 판단 결과 정리
- Web UI용 대시보드 카드 생성
- Agent 처리 과정 trace 생성

---

## Input

Review Analysis Skill과 Gemini Agent가 생성한 JSON 분석 결과를 입력으로 받습니다.

```json
{
  "review_count": 10,
  "source": "csv",
  "source_label": "CSV 업로드",
  "summary": "리뷰 기반 상품 요약",
  "pros": ["장점"],
  "complaints": ["불만"],
  "buyer_warnings": ["구매 전 주의사항"],
  "sentiment": {
    "positive": 55,
    "neutral": 20,
    "negative": 25
  },
  "recommendation": {
    "score": 75,
    "decision": "조건부 구매 추천",
    "reason": "구매 판단 이유"
  }
}
```

---

## Output

Web UI가 사용하는 확장 결과를 반환합니다.

```json
{
  "summary": "...",
  "pros": ["..."],
  "complaints": ["..."],
  "buyer_warnings": ["..."],
  "sentiment": {
    "positive": 55,
    "neutral": 20,
    "negative": 25
  },
  "recommendation": {
    "score": 75,
    "decision": "조건부 구매 추천",
    "reason": "..."
  },
  "dashboard": {
    "hero": {},
    "cards": [],
    "sentiment_bars": []
  },
  "agent_trace": [],
  "extension": {
    "name": "Review Insight Extension",
    "role": "AI 분석 결과를 Web UI 대시보드 모델로 변환"
  }
}
```

---

## Integration

```text
Review Input / CSV Upload
        ↓
CSV Review Reader MCP
        ↓
Review Analysis Skill
        ↓
Gemini 기반 Review Insight Agent
        ↓
Review Insight Extension
        ↓
Web UI Dashboard
```

---

## Implementation

실제 구현 파일:

```text
pi-extension/review-insight-extension/index.js
```

주요 함수:

- `formatReviewInsightResult(result)`
- `createDashboard(result)`
- `createAgentTrace(result)`

이 Extension을 통해 프로젝트는 AI API 응답을 그대로 노출하지 않고, 서비스 화면에 맞춘 구조화된 Agent 결과를 제공합니다.
