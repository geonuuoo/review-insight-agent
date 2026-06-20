# CSV Review Reader MCP

## Overview

CSV Review Reader MCP는 사용자가 업로드한 CSV 파일에서 상품 리뷰 데이터를 읽어와 AI Agent가 분석할 수 있는 형태로 변환하는 MCP 도구이다.

본 MCP는 리뷰 데이터를 수집하는 역할을 담당하며, 수집된 리뷰는 Review Analysis Skill에 전달되어 분석에 활용된다.

---

## Purpose

상품 리뷰가 저장된 CSV 파일을 읽어 다음 기능을 수행한다.

* CSV 파일 업로드 처리
* 리뷰 데이터 추출
* 리뷰 텍스트 정제
* AI Agent 분석용 데이터 생성

---

## Input

CSV 파일

예시

```csv
review
배송이 빨라요
포장이 좋아요
상품에서 냄새가 납니다
생각보다 작아요
```

---

## Process

### Step 1

사용자가 CSV 파일을 업로드한다.

### Step 2

CSV 파일을 읽는다.

### Step 3

review 컬럼을 추출한다.

### Step 4

리뷰 목록을 생성한다.

예시

```json
[
  "배송이 빨라요",
  "포장이 좋아요",
  "상품에서 냄새가 납니다",
  "생각보다 작아요"
]
```

### Step 5

생성된 리뷰 목록을 Agent에게 전달한다.

---

## Output

```json
{
  "reviewCount": 4,
  "reviews": [
    "배송이 빨라요",
    "포장이 좋아요",
    "상품에서 냄새가 납니다",
    "생각보다 작아요"
  ]
}
```

---

## Integration

CSV Review Reader MCP는 다음 구성요소와 연결된다.

```text
CSV File
    ↓
CSV Review Reader MCP
    ↓
Review Analysis Skill
    ↓
Review Insight Agent
    ↓
Web UI
```

---

## Benefits

* 대량 리뷰 분석 가능
* 리뷰 데이터 자동 수집
* 상품 장단점 빠른 파악
* 구매 전 주의사항 확인 가능
* 합리적인 구매 의사결정 지원

---

## Role in Project

본 프로젝트에서 MCP는 외부 데이터(CSV 파일)를 읽어 Agent에게 전달하는 역할을 수행한다.

이를 통해 AI Agent는 사용자가 직접 입력한 리뷰뿐만 아니라 대량의 리뷰 데이터도 분석할 수 있다.

수집된 리뷰 데이터는 Review Analysis Skill로 전달되며, 구매자가 상품의 장점, 불만, 구매 전 주의사항, 감성 분석 결과를 빠르게 확인할 수 있도록 지원한다.

---

## Implementation

실제 구현 파일

```text
mcp/csv-review-reader/index.js
```

주요 기능

* review 컬럼 추출
* 빈 리뷰 제거
* 리뷰 배열 생성
* Agent 분석용 데이터 반환
