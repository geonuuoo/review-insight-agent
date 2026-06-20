/**
 * Review Insight Extension
 *
 * 구매자용 쇼핑/커머스 리뷰 분석 결과를 Web UI에 적합한 형태로 정리하는 Pi Extension 예시 파일입니다.
 */

export const reviewInsightExtension = {
  name: "review-insight-extension",
  description:
    "상품 리뷰 분석 결과를 구매자가 이해하기 쉬운 카드형 데이터로 변환합니다.",

  formatResult(result: any) {
    return {
      summaryCard: result.summary,
      prosCard: result.pros,
      complaintsCard: result.complaints,
      buyerWarningsCard: result.buyer_warnings,
      sentimentChart: result.sentiment,
      recommendationCard: result.recommendation
    };
  }
};