const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");
const { analyzeReviews } = require("./analyzer");
const { extractReviewsFromCsvRows } = require("../mcp/csv-review-reader");

const app = express();
fs.mkdirSync("uploads", { recursive: true });
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

app.post("/analyze-text", async (req, res) => {
  try {
    const { text } = req.body;

    const reviews = text
      .split("\n")
      .map((review) => review.trim())
      .filter((review) => review.length > 0);

    if (reviews.length === 0) {
      return res.status(400).json({
        error: "분석할 리뷰를 입력해주세요."
      });
    }

    const result = await analyzeReviews(reviews, {
      source: "text",
      source_label: "직접 입력"
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "리뷰 분석 중 오류가 발생했습니다."
    });
  }
});

app.post("/analyze-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "CSV 파일을 업로드해주세요."
      });
    }

    const rows = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on("data", (row) => {
        rows.push(row);
      })
      .on("end", async () => {
        fs.unlinkSync(req.file.path);

        const reviews = extractReviewsFromCsvRows(rows);

        if (reviews.length === 0) {
          return res.status(422).json({
            error: "CSV에서 review 컬럼의 리뷰를 찾지 못했습니다.",
            review_count: 0
          });
        }

        const result = await analyzeReviews(reviews, {
          source: "csv",
          source_label: "CSV 업로드",
          file_name: req.file.originalname
        });

        res.json(result);
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "CSV 분석 중 오류가 발생했습니다."
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
