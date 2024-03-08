const router = require("express").Router();
const { getDataFromReaderPeer } = require("./db");

router.get("/all", async (req, res) => {
  const bibles = await getDataFromReaderPeer("bibles");
  res.status(200).json({ bibles });
});

router.get("/:id", async (req, res) => {
  const bible = await getDataFromReaderPeer(`bibles/${req.params.id}`);
  res.status(200).json({ bible });
});

router.get("/:id/books", async (req, res) => {
  const books = await getDataFromReaderPeer(`bibles/${req.params.id}/books`);
  res.status(200).json({ books });
});

router.get("/:bibleId/books/:bookId", async (req, res) => {
  const book = await getDataFromReaderPeer(
    `bibles/${req.params.bibleId}/books/${req.params.bookId}`
  );

  res.status(200).json({ book });
});

router.get("/:bibleId/books/:bookId/chapters", async (req, res) => {
  const chapters = await getDataFromReaderPeer(
    `bibles/${req.params.bibleId}/books/${req.params.bookId}/chapters`
  );

  res.status(200).json({ chapters });
});

router.get("/:bibleId/chapters/:chapterId", async (req, res) => {
  const chapter = await getDataFromReaderPeer(
    `bibles/${req.params.bibleId}/chapters/${req.params.chapterId}`
  );

  res.status(200).json({ chapter });
});

router.get("/:bibleId/chapters/:chapterId/verses", async (req, res) => {
  const verses = await getDataFromReaderPeer(
    `bibles/${req.params.bibleId}/chapters/${req.params.chapterId}/verses`
  );

  res.status(200).json({ verses });
});

router.get("/:bibleId/chapters/:chapterId/verse/:verseId", async (req, res) => {
  const verses = await getDataFromReaderPeer(
    `bibles/${req.params.bibleId}/chapters/${req.params.chapterId}/verses/${req.params.verseId}`
  );

  res.status(200).json({ verses });
});

module.exports = router;
