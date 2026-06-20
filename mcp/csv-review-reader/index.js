function extractReviewsFromCsvRows(rows) {
  const reviews = [];
  const candidateColumns = [
    "review",
    "reviews",
    "content",
    "comment",
    "text",
    "body",
    "리뷰",
    "상품평",
    "구매평",
    "후기"
  ];

  rows.forEach((row) => {
    const normalizedRow = {};

    Object.entries(row).forEach(([key, value]) => {
      normalizedRow[key.replace(/^\uFEFF/, "").trim()] = value;
    });

    const reviewColumn = candidateColumns.find(
      (column) =>
        normalizedRow[column] &&
        String(normalizedRow[column]).trim().length > 0
    );

    if (reviewColumn) {
      reviews.push(String(normalizedRow[reviewColumn]).trim());
    }
  });

  return reviews;
}

module.exports = {
  extractReviewsFromCsvRows
};
