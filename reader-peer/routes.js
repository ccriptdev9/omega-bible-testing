const router = require("express").Router();
const { getDataFromReaderPeer } = require("./db");
const { getFileFromReaderDrive } = require("./drive");

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

router.get("/audio-bibles/all", async (req, res) => {
  const data = await getDataFromReaderPeer("audio-bibles");
  res.status(200).json({ data });
});

router.get("/audio-bibles/:id", async (req, res) => {
  const data = await getDataFromReaderPeer(`audio-bibles/${req.params.id}`);
  res.status(200).json({ data });
});

router.get("/audio-bibles/:id/books", async (req, res) => {
  const data = await getDataFromReaderPeer(
    `audio-bibles/${req.params.id}/books`
  );
  res.status(200).json({ data });
});

router.get("/audio-bibles/:id/books/:bookId", async (req, res) => {
  console.log("audio bibles");

  const response = await axios.default.get(
    `https://api.scripture.api.bible/v1/audio-bibles/${req.params.id}/books/${req.params.bookId}`,
    {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  console.log("response", response);

  res.status(200).json({ data: response.data });
});

router.get("/audio-bibles/:id/books/:bookId/chapters", async (req, res) => {
  const data = await getDataFromReaderPeer(
    `audio-bibles/${req.params.id}/books/${req.params.bookId}/chapters`
  );

  res.status(200).json({ data });
});

router.get("/audio-bibles/:id/chapters/:chapterId", async (req, res) => {
  const data = await getDataFromReaderPeer(
    `audio-bibles/${req.params.id}/chapters/${req.params.chapterId}`
  );

  res.status(200).json({ data });
});

router.get(
  "/audio-bibles/:id/chapters/:chapterId/get-file",
  async (req, res) => {
    const file = await getFileFromReaderDrive(
      `audio-bible-${req.params.id}-chapter-${req.params.chapterId}.mp3`
    );

    if (file) {
      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Length": file.length,
      });

      res.status(200).send(file);
    } else {
      res.status(404).json({ data: "File not found..." });
    }
  }
);

module.exports = router;
