const router = require("express").Router();
const axios = require("axios");
const fs = require("fs");
const { getDataFromSeedPeer, saveData } = require("./db");
const { storeInDrive, getFileFromDrive } = require("./drive");

const API_KEY = "d6c09d4945b3c5f15772ba0abf08fbd1";

router.post("/audio-bibles", async (req, res) => {
  console.log("audio bibles");

  const response = await axios.default.get(
    "https://api.scripture.api.bible/v1/audio-bibles",
    {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response?.data?.data;
  console.log("Retrieved all audio bibles from API - length", data?.length);

  if (data?.length > 0) {
    // First store all bibles against a single key
    let KEY = "audio-bibles";
    await saveData(KEY, data);

    await Promise.all(
      data.map(async (bible) => {
        // Construct a key for each bible
        KEY = `audio-bibles/${bible.id}`;

        // Store this specific bible against constructed key
        await saveData(KEY, bible);
      })
    );
  }

  res.status(200).json({ data: response?.data?.data });
});

router.get("/audio-bibles/all", async (req, res) => {
  const data = await getDataFromSeedPeer("audio-bibles");
  res.status(200).json({ data });
});

router.get("/audio-bibles/:id", async (req, res) => {
  const data = await getDataFromSeedPeer(`audio-bibles/${req.params.id}`);
  res.status(200).json({ data });
});

router.post("/audio-bibles/books", async (req, res) => {
  const audioBibles = await getDataFromSeedPeer("audio-bibles");

  if (audioBibles?.length > 0) {
    await Promise.all(
      audioBibles.map(async (audioBible) => {
        let KEY = `audio-bibles/${audioBible.id}`;

        try {
          const response = await axios.default.get(
            `https://api.scripture.api.bible/v1/audio-bibles/${audioBible.id}/books`,
            {
              headers: {
                "api-key": API_KEY,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("Retrieved books of audio-bible from the API...");

          KEY = `${KEY}/books`;
          const books = response?.data?.data;
          await saveData(KEY, books);
        } catch (error) {
          console.log("Error retrieving books of audio-bible from the API...");
        }
      })
    );
  }

  res.status(200).json({ data: "Audio-bible-books stored..." });
});

router.get("/audio-bibles/:id/books", async (req, res) => {
  const data = await getDataFromSeedPeer(`audio-bibles/${req.params.id}/books`);
  res.status(200).json({ data });
});

router.post("/audio-bibles/chapters", async (req, res) => {
  console.log("audio bibles");

  const audioBibles = await getDataFromSeedPeer("audio-bibles");

  if (audioBibles?.length > 0) {
    await Promise.all(
      audioBibles.map(async (audioBible) => {
        let KEY = `audio-bibles/${audioBible.id}/books`;

        const books = await getDataFromSeedPeer(KEY);

        if (books?.length > 0) {
          await Promise.all(
            books.map(async (book) => {
              console.log("Making request now...", audioBible.id, book.id);

              try {
                const response = await axios.default.get(
                  `https://api.scripture.api.bible/v1/audio-bibles/${audioBible.id}/books/${book.id}/chapters`,
                  {
                    headers: {
                      "api-key": API_KEY,
                      "Content-Type": "application/json",
                    },
                  }
                );

                console.log(
                  "Retrieved chapters of audio-bible-book from the API..."
                );

                KEY = `${KEY}/${book.id}/chapters`;
                const chapters = response?.data?.data;
                await saveData(KEY, chapters);
              } catch (error) {
                console.log(
                  "Error retrieving chapters of audio-bible-book from the API..."
                );
              }
            })
          );
        }
      })
    );
  }

  res.status(200).json({ data: "All chapters stored..." });
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

router.post("/audio-bibles/individual-chapters", async (req, res) => {
  const audioBibles = await getDataFromSeedPeer("audio-bibles");

  if (audioBibles?.length > 0) {
    await Promise.all(
      audioBibles.map(async (audioBible) => {
        let KEY = `audio-bibles/${audioBible.id}/books`;

        const books = await getDataFromSeedPeer(KEY);

        if (books?.length > 0) {
          await Promise.all(
            books.map(async (book) => {
              KEY = `${KEY}/${book.id}/chapters`;

              const chapters = await getDataFromSeedPeer(KEY);

              if (chapters?.length > 0) {
                await Promise.all(
                  chapters.map(async (chapter) => {
                    try {
                      const response = await axios.default.get(
                        `https://api.scripture.api.bible/v1/audio-bibles/${audioBible.id}/chapters/${chapter.id}`,
                        {
                          headers: {
                            "api-key": API_KEY,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      console.log(
                        "Retrieved individual-chapter of audio-bible-book from the API..."
                      );

                      KEY = `audio-bibles/${audioBible.id}/chapters/${chapter.id}`;
                      const chapters = response?.data?.data;
                      await saveData(KEY, chapters);
                    } catch (error) {
                      console.log(
                        "Error retrieving individual-chapter of audio-bible-book from the API..."
                      );
                    }
                  })
                );
              }
            })
          );
        }
      })
    );
  }

  res.status(200).json({ data: "All chapters stored..." });
});

router.get("/audio-bibles/:id/books/:bookId/chapters", async (req, res) => {
  const data = await getDataFromSeedPeer(
    `audio-bibles/${req.params.id}/books/${req.params.bookId}/chapters`
  );

  res.status(200).json({ data });
});

router.get("/audio-bibles/:id/chapters/:chapterId", async (req, res) => {
  const data = await getDataFromSeedPeer(
    `audio-bibles/${req.params.id}/chapters/${req.params.chapterId}`
  );

  res.status(200).json({ data });
});

router.post(
  "/audio-bibles/:id/chapters/:chapterId/store-file",
  async (req, res) => {
    console.log("storing file...");

    try {
      let response = await axios.default.get(
        `https://api.scripture.api.bible/v1/audio-bibles/${req.params.id}/chapters/${req.params.chapterId}`,
        {
          headers: {
            "api-key": API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      const chapter = response?.data?.data;

      if (chapter?.resourceUrl) {
        response = await axios.default.get(chapter.resourceUrl, {
          responseType: "arraybuffer",
        });

        const path = `audio-bible-${req.params.id}-chapter-${req.params.chapterId}.mp3`;
        await storeInDrive(path, response.data);

        res.status(200).json({ data: "File downloaded successfully." });
      }
    } catch (error) {
      console.log(`Error downloading file - `, error?.message);
      res.status(500).json({ data: "Error downloading file.." });
    }
  }
);

router.get(
  "/audio-bibles/:id/chapters/:chapterId/get-file",
  async (req, res) => {
    await getFileFromDrive(
      `audio-bible-${req.params.id}-chapter-${req.params.chapterId}.mp3`
    );

    res.status(200).json({ data: "File retrieved..." });
  }
);

router.post("/", async (req, res) => {
  console.log("retrieving all bibles.");

  const response = await axios.default.get(
    "https://api.scripture.api.bible/v1/bibles",
    {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json",
      },
    }
  );

  const data = response?.data?.data;
  console.log("Retrieved all bibles from API - length", data?.length);

  if (data?.length > 0) {
    // First store all bibles against a single key
    let KEY = "bibles";
    await saveData(KEY, data, "sub1");

    await Promise.all(
      data.map(async (bible) => {
        // Construct a key for each bible
        KEY = `bibles/${bible.id}`;

        // Store this specific bible against constructed key
        await saveData(KEY, bible, "sub2");
      })
    );
  }

  res.status(200).json({ message: "All bibles stored successfully" });
});

router.post("/books", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles", "sub1");

  console.log("bibles.length", bibles?.length);

  if (bibles?.length > 0) {
    await Promise.all(
      bibles.map(async (bible) => {
        // Construct a key for each bible's books
        let KEY = `bibles/${bible.id}/books`;

        const response = await axios.default.get(
          `https://api.scripture.api.bible/v1/bibles/${bible.id}/books`,
          {
            headers: {
              "api-key": API_KEY,
              "Content-Type": "application/json",
            },
          }
        );

        const books = response?.data?.data;

        // Store this specific bible's books against the constructed key
        await saveData(KEY, books, "sub3");
      })
    );

    bibles.forEach(async (bible) => {
      let KEY = `bibles/${bible.id}/books`;

      const books = await getDataFromSeedPeer(KEY, "sub3");

      await Promise.all(
        books.map(async (book) => {
          KEY = `bibles/${bible.id}/books/${book.id}`;

          // Store this specific book against the constructed key
          await saveData(KEY, book, "sub4");
        })
      );
    });
  }

  res.status(200).json({ message: "All bibles' books stored successfully" });
});

router.get("/all", async (req, res) => {
  const data = await getDataFromSeedPeer("bibles");
  res.status(200).json({ data });
});

router.get("/:id", async (req, res) => {
  const data = await getDataFromSeedPeer(`bibles/${req.params.id}`);
  res.status(200).json({ data });
});

router.get("/:id/books", async (req, res) => {
  const books = await getDataFromSeedPeer(`bibles/${req.params.id}/books`);
  res.status(200).json({ books });
});

router.get("/:bibleId/books/:bookId", async (req, res) => {
  const books = await getDataFromSeedPeer(
    `bibles/${req.params.bibleId}/books/${req.params.bookId}`
  );

  res.status(200).json({ books });
});

router.post("/chapters", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles");

  try {
    if (bibles?.length > 0) {
      await Promise.all(
        bibles.map(async (bible) => {
          let KEY = `bibles/${bible.id}/books`;

          const books = await getDataFromSeedPeer(KEY);

          await Promise.all(
            books.map(async (book) => {
              const response = await axios.default.get(
                `https://api.scripture.api.bible/v1/bibles/${bible.id}/books/${book.id}/chapters`,
                {
                  headers: {
                    "api-key": API_KEY,
                    "Content-Type": "application/json",
                  },
                }
              );

              const chapters = response?.data?.data;
              await saveData(`${KEY}/${book.id}/chapters`, chapters);
            })
          );
        })
      );
    }

    res.status(200).json({ message: "All chapters stored successfully" });
  } catch (error) {
    console.log("Error retrieving chapters", error?.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/individual-chapters", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles");

  if (bibles?.length > 0) {
    try {
      await Promise.all(
        bibles.map(async (bible) => {
          let KEY = `bibles/${bible.id}/books`;

          const books = await getDataFromSeedPeer(KEY);

          if (books?.length > 0) {
            await Promise.all(
              books.map(async (book) => {
                KEY = `${KEY}/${book.id}/chapters`;

                const chapters = await getDataFromSeedPeer(KEY);

                if (chapters?.length > 0) {
                  await Promise.all(
                    chapters.map(async (chapter) => {
                      KEY = `bibles/${bible.id}/chapters/${chapter.id}`;

                      const existingChapter = await getDataFromSeedPeer(KEY);

                      if (!existingChapter) {
                        console.log(
                          "retrieving individual chapter - ",
                          chapter.id
                        );

                        try {
                          const response = await axios.default.get(
                            `https://api.scripture.api.bible/v1/bibles/${bible.id}/chapters/${chapter.id}?content-type=text&include-notes=true&include-titles=true&include-chapter-numbers=true&include-verse-numbers=true&include-verse-spans=true`,
                            {
                              headers: {
                                "api-key": API_KEY,
                                "Content-Type": "application/json",
                              },
                            }
                          );

                          chapter = response?.data?.data;
                          await saveData(KEY, chapter);
                        } catch (error) {
                          console.log(
                            "Error fetching chapter from the API - ",
                            chapter.id
                          );
                        }
                      } else {
                        console.log("chapter already retrieved - ", chapter.id);
                      }
                    })
                  );
                }
              })
            );
          }
        })
      );

      res
        .status(200)
        .json({ message: "All individual chapters stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(200).json({ message: "No bibles found." });
  }
});

router.post("/verses", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles");

  if (bibles?.length > 0) {
    try {
      await Promise.all(
        bibles.map(async (bible) => {
          let KEY = `bibles/${bible.id}/books`;

          const books = await getDataFromSeedPeer(KEY);

          if (books?.length > 0) {
            await Promise.all(
              books.map(async (book) => {
                KEY = `${KEY}/${book.id}/chapters`;

                const chapters = await getDataFromSeedPeer(KEY);

                if (chapters?.length > 0) {
                  await Promise.all(
                    chapters.map(async (chapter) => {
                      KEY = `bibles/${bible.id}/chapters/${chapter.id}/verses`;

                      const existingVerses = await getDataFromSeedPeer(KEY);

                      if (!existingVerses) {
                        console.log("retrieving verses - ", chapter.id);

                        try {
                          const response = await axios.default.get(
                            `https://api.scripture.api.bible/v1/bibles/${bible.id}/chapters/${chapter.id}/verses`,
                            {
                              headers: {
                                "api-key": API_KEY,
                                "Content-Type": "application/json",
                              },
                            }
                          );

                          chapter = response?.data?.data;
                          await saveData(KEY, chapter);
                        } catch (error) {
                          console.log(
                            "Error fetching verses from the API - ",
                            chapter.id
                          );
                        }
                      } else {
                        console.log(
                          "verses for this chapter already retrieved - ",
                          chapter.id
                        );
                      }
                    })
                  );
                }
              })
            );
          }
        })
      );

      res.status(200).json({ message: "All verses stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(200).json({ message: "No bibles found." });
  }
});

router.post("/individual-verses", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles");

  if (bibles?.length > 0) {
    try {
      await Promise.all(
        bibles.map(async (bible) => {
          let KEY = `bibles/${bible.id}/books`;

          const books = await getDataFromSeedPeer(KEY);

          if (books?.length > 0) {
            await Promise.all(
              books.map(async (book) => {
                KEY = `${KEY}/${book.id}/chapters`;

                const chapters = await getDataFromSeedPeer(KEY);

                if (chapters?.length > 0) {
                  await Promise.all(
                    chapters.map(async (chapter) => {
                      KEY = `bibles/${bible.id}/chapters/${chapter.id}/verses`;

                      const verses = await getDataFromSeedPeer(KEY);

                      if (verses?.length > 0) {
                        await Promise.all(
                          verses.map(async (verse) => {
                            KEY = `bibles/${bible.id}/chapters/${chapter.id}/verses${verse.id}`;

                            const existingVerse = await getDataFromSeedPeer(
                              KEY
                            );

                            if (!existingVerse) {
                              console.log("retrieving verse - ", verse.id);

                              try {
                                const response = await axios.default.get(
                                  `https://api.scripture.api.bible/v1/bibles/${bible.id}/verses/${verse.id}`,
                                  {
                                    headers: {
                                      "api-key": API_KEY,
                                      "Content-Type": "application/json",
                                    },
                                  }
                                );

                                chapter = response?.data?.data;

                                KEY = `bibles/${bible.id}/verses/${verse.id}`;
                                await saveData(KEY, chapter);
                              } catch (error) {
                                console.log(
                                  "Error fetching verses from the API - ",
                                  chapter.id
                                );
                              }
                            } else {
                              console.log(
                                "verses for this chapter already retrieved - ",
                                chapter.id
                              );
                            }
                          })
                        );
                      }
                    })
                  );
                }
              })
            );
          }
        })
      );

      res.status(200).json({ message: "All verses stored successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(200).json({ message: "No bibles found." });
  }
});

module.exports = router;
