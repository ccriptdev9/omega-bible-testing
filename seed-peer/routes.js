const router = require("express").Router();
const axios = require("axios");
const { getDataFromSeedPeer, saveData } = require("./db");

const API_KEY = "6a1f10d52350bc35add376b42a4446c9";

router.post("/", async (req, res) => {
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
    await saveData(KEY, data);

    await Promise.all(
      data.map(async (bible) => {
        // Construct a key for each bible
        KEY = `bibles/${bible.id}`;

        // Store this specific bible against constructed key
        await saveData(KEY, bible);
      })
    );
  }

  res.status(200).json({ message: "All bibles stored successfully" });
});

router.post("/books", async (req, res) => {
  const bibles = await getDataFromSeedPeer("bibles");

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
        await saveData(KEY, books);
      })
    );

    bibles.forEach(async (bible) => {
      let KEY = `bibles/${bible.id}/books`;

      const books = await getDataFromSeedPeer(KEY);

      await Promise.all(
        books.map(async (book) => {
          KEY = `bibles/${bible.id}/books/${book.id}`;

          // Store this specific book against the constructed key
          await saveData(KEY, book);
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
