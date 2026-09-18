"use strict";

/* =========================================================
   ENGLISH 4MS
   CHAPTERS 1 → 3
========================================================= */


/* =========================================================
   DOM
========================================================= */

const DOM = {

    app: document.getElementById("app"),

    menuBtn: document.getElementById("menuBtn"),
    closeMenuBtn: document.getElementById("closeMenuBtn"),
    sideMenu: document.getElementById("sideMenu"),
    menuOverlay: document.getElementById("menuOverlay"),

    searchBtn: document.getElementById("searchBtn"),
    searchPanel: document.getElementById("searchPanel"),
    searchInput: document.getElementById("searchInput"),
    clearSearchBtn: document.getElementById("clearSearchBtn"),

    favoritesBtn: document.getElementById("favoritesBtn"),

    levelsBtn: document.getElementById("levels"),
    levelSection: document.querySelector(".level-section"),

    lessonsList: document.getElementById("lessonsList"),
    emptyState: document.getElementById("emptyState"),

    lessonsTitle: document.getElementById("lessonsTitle"),
    lessonsSubtitle: document.getElementById("lessonsSubtitle"),
    lessonCount: document.getElementById("lessonCount"),

    readerModal: document.getElementById("readerModal"),
    modalOverlay: document.querySelector(".modal-overlay"),

    closeReaderBtn: document.getElementById("closeReaderBtn"),

    readerLevel: document.getElementById("readerLevel"),
    readerLessonNumber: document.getElementById("readerLessonNumber"),

    readerFavoriteBtn: document.getElementById("readerFavoriteBtn"),

    readerTitle: document.getElementById("readerTitle"),
    readerTitleAr: document.getElementById("readerTitleAr"),

    readerText: document.getElementById("readerText"),
    readerTranslation: document.getElementById("readerTranslation"),

    vocabularySection: document.getElementById("vocabularySection"),
    vocabularyContainer: document.getElementById("vocabularyContainer"),

    questionsSection: document.getElementById("questionsSection"),
    questionsContainer: document.getElementById("questionsContainer"),

    showAnswersBtn: document.getElementById("showAnswersBtn"),
    answersContainer: document.getElementById("answersContainer"),

    prevLessonBtn: document.getElementById("prevLessonBtn"),
    nextLessonBtn: document.getElementById("nextLessonBtn"),

    currentPosition: document.getElementById("currentPosition"),

    continueMenuBtn: document.getElementById("continueMenuBtn"),
    resetProgressBtn: document.getElementById("resetProgressBtn"),

    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage"),

    openWebBtn: document.getElementById("openWebBtn")
};


/* =========================================================
   EXTRA DOM
========================================================= */

const resetModal =
    document.getElementById("resetModal");

const cancelResetBtn =
    document.getElementById("cancelResetBtn");

const confirmResetBtn =
    document.getElementById("confirmResetBtn");

const resetModalOverlay =
    document.getElementById("resetModalOverlay");

const themeToggleBtn =
    document.getElementById("themeToggleBtn");

const speechRate =
    document.getElementById("speechRate");

const speechRateValue =
    document.getElementById("speechRateValue");

const speechRateControl =
    document.getElementById("speechRateControl");


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {

    DATA_FILES: {

        chapter1: "chapter1.json",
        chapter2: "chapter2.json",
        chapter3: "chapter3.json"

    },

    STORAGE_KEYS: {

        CHAPTER:
            "english_plus_chapter",

        FAVORITES:
            "english_plus_favorites",

        COMPLETED:
            "english_plus_completed",

        LAST_LESSON:
            "english_plus_last_lesson",

        SPEECH_RATE:
            "english_plus_speech_rate",

        THEME:
            "english_plus_theme"

    },

    DEFAULT_CHAPTER:
        "chapter1",

    CHAPTERS: [
        "chapter1",
        "chapter2",
        "chapter3"
    ]

};


/* =========================================================
   STATE
========================================================= */

const AppState = {

    data: {

        chapter1: null,
        chapter2: null,
        chapter3: null

    },

    currentChapter:
        CONFIG.DEFAULT_CHAPTER,

    currentLessonIndex:
        0,

    currentLesson:
        null,

    searchQuery:
        "",

    showFavoritesOnly:
        false,

    completedOnly:
        false,

    favorites:
        [],

    completed:
        [],

    isSpeaking:
        false

};


/* =========================================================
   SPEECH RATE
========================================================= */

const savedSpeechRate =
    localStorage.getItem(
        CONFIG.STORAGE_KEYS.SPEECH_RATE
    ) || "1";


if (speechRate) {

    speechRate.value =
        savedSpeechRate;

}


if (speechRateValue) {

    speechRateValue.textContent =
        `${Number(savedSpeechRate).toFixed(1)}x`;

}


if (speechRateControl) {

    speechRateControl.classList.add(
        "hidden"
    );

}


speechRate?.addEventListener(
    "input",
    () => {

        const value =
            Number(speechRate.value) || 1;

        if (speechRateValue) {

            speechRateValue.textContent =
                `${value.toFixed(1)}x`;

        }

        localStorage.setItem(
            CONFIG.STORAGE_KEYS.SPEECH_RATE,
            String(value)
        );

    }
);


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    loadStorage();

    loadTheme();

    bindEvents();

    await setupAndroidBackButton();

    await loadChapter();

    updateThemeButton();

    updateUI();

}


/* =========================================================
   LOAD CHAPTERS
========================================================= */

async function loadChapter() {

    for (
        const chapter of CONFIG.CHAPTERS
    ) {

        try {

            await loadChapterData(
                chapter
            );

            console.log(
                `${chapter}.json loaded successfully`
            );

        } catch (error) {

            console.warn(
                `Unable to load ${chapter}.json`,
                error
            );

        }

    }

    if (
        !AppState.data[
            AppState.currentChapter
        ]
    ) {

        AppState.currentChapter =
            "chapter1";

    }

}


async function loadChapterData(
    chapter
) {

    const file =
        CONFIG.DATA_FILES[
            chapter
        ];

    if (!file) {

        throw new Error(
            `No data file for ${chapter}`
        );

    }

    const response =
        await fetch(
            file,
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {

        throw new Error(
            `Failed to load ${file}`
        );

    }

    const data =
        await response.json();

    AppState.data[
        chapter
    ] =
        normalizeChapterData(
            data,
            chapter
        );

}


/* =========================================================
   NORMALIZE DATA
========================================================= */

function normalizeChapterData(
    data,
    chapter
) {

    if (
        Array.isArray(data)
    ) {

        return {

            chapter: chapter,

            title:
                getChapterTitle(
                    chapter
                ),

            lessons: data

        };

    }

    if (
        !data ||
        typeof data !== "object"
    ) {

        return {

            chapter: chapter,

            title:
                getChapterTitle(
                    chapter
                ),

            lessons: []

        };

    }

    return {

        chapter:
            data.chapter ||
            chapter,

        title:
            data.title ||
            getChapterTitle(
                chapter
            ),

        lessons:
            Array.isArray(data.lessons)
                ? data.lessons
                : []

    };

}


/* =========================================================
   STORAGE
========================================================= */

function loadStorage() {

    const savedChapter =
        localStorage.getItem(
            CONFIG.STORAGE_KEYS.CHAPTER
        );

    if (
        CONFIG.CHAPTERS.includes(
            savedChapter
        )
    ) {

        AppState.currentChapter =
            savedChapter;

    }

    AppState.favorites =
        loadArrayFromStorage(
            CONFIG.STORAGE_KEYS.FAVORITES
        );

    AppState.completed =
        loadArrayFromStorage(
            CONFIG.STORAGE_KEYS.COMPLETED
        );

}


function loadArrayFromStorage(
    key
) {

    try {

        const value =
            JSON.parse(
                localStorage.getItem(
                    key
                )
            );

        if (
            Array.isArray(value)
        ) {

            return value.map(
                String
            );

        }

    } catch (error) {

        console.warn(
            `Invalid storage: ${key}`
        );

    }

    return [];

}


function saveStorage() {

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.CHAPTER,
        AppState.currentChapter
    );

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.FAVORITES,
        JSON.stringify(
            AppState.favorites
        )
    );

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.COMPLETED,
        JSON.stringify(
            AppState.completed
        )
    );

}


/* =========================================================
   EVENTS
========================================================= */

function bindEvents() {

    DOM.menuBtn?.addEventListener(
        "click",
        openMenu
    );

    DOM.closeMenuBtn?.addEventListener(
        "click",
        closeMenu
    );

    DOM.menuOverlay?.addEventListener(
        "click",
        closeMenu
    );


    DOM.searchBtn?.addEventListener(
        "click",
        toggleSearch
    );

    DOM.searchInput?.addEventListener(
        "input",
        handleSearch
    );

    DOM.clearSearchBtn?.addEventListener(
        "click",
        clearSearch
    );


    DOM.favoritesBtn?.addEventListener(
        "click",
        toggleFavorites
    );


    DOM.levelsBtn?.addEventListener(
        "click",
        toggleChapters
    );

    DOM.levelSection?.addEventListener(
        "click",
        handleChapterClick
    );


    DOM.closeReaderBtn?.addEventListener(
        "click",
        closeReader
    );

    DOM.modalOverlay?.addEventListener(
        "click",
        closeReader
    );

    DOM.readerFavoriteBtn?.addEventListener(
        "click",
        toggleCurrentFavorite
    );


    DOM.prevLessonBtn?.addEventListener(
        "click",
        previousLesson
    );

    DOM.nextLessonBtn?.addEventListener(
        "click",
        nextLesson
    );


    DOM.openWebBtn?.addEventListener(
        "click",
        handleAudioButton
    );


    DOM.continueMenuBtn?.addEventListener(
        "click",
        continueLastLesson
    );


    DOM.resetProgressBtn?.addEventListener(
        "click",
        resetProgress
    );

    cancelResetBtn?.addEventListener(
        "click",
        closeResetModal
    );

    resetModalOverlay?.addEventListener(
        "click",
        closeResetModal
    );

    confirmResetBtn?.addEventListener(
        "click",
        confirmReset
    );


    themeToggleBtn?.addEventListener(
        "click",
        toggleTheme
    );


    document
        .querySelectorAll(
            ".side-nav-item"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    handleSideNavigation
                );

            }
        );


    document.addEventListener(
        "keydown",
        handleKeyboard
    );

}


/* =========================================================
   ANDROID BACK
========================================================= */

async function setupAndroidBackButton() {

    try {

        const { App } =
            await import(
                "@capacitor/app"
            );

        App.addListener(
            "backButton",
            () => {

                if (
                    DOM.readerModal &&
                    !DOM.readerModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeReader();
                    return;

                }

                if (
                    resetModal &&
                    !resetModal.classList.contains(
                        "hidden"
                    )
                ) {

                    closeResetModal();
                    return;

                }

                if (
                    DOM.sideMenu?.classList.contains(
                        "open"
                    )
                ) {

                    closeMenu();
                    return;

                }

                if (
                    DOM.searchPanel &&
                    !DOM.searchPanel.classList.contains(
                        "hidden"
                    )
                ) {

                    DOM.searchPanel.classList.add(
                        "hidden"
                    );

                    return;

                }

                if (
                    DOM.levelSection &&
                    !DOM.levelSection.classList.contains(
                        "hidden"
                    )
                ) {

                    hideChapters();
                    return;

                }

                showExitConfirmation();

            }
        );

    } catch (error) {

        console.warn(
            "Capacitor App plugin unavailable",
            error
        );

    }

}


async function showExitConfirmation() {

    try {

        const { App } =
            await import(
                "@capacitor/app"
            );

        if (
            window.confirm(
                "Do you want to exit English 4MS?"
            )
        ) {

            await App.exitApp();

        }

    } catch (error) {

        console.warn(error);

    }

}


/* =========================================================
   UI
========================================================= */

function updateUI() {

    updateActiveChapter();

    updateFavoritesButton();

    renderLessons();

}


/* =========================================================
   CHAPTERS
========================================================= */

function handleChapterClick(
    event
) {

    const button =
        event.target.closest(
            ".level-btn"
        );

    if (!button) {

        return;

    }

    const chapter =
        button.dataset.chapter ||
        button.dataset.level;

    if (
        !CONFIG.CHAPTERS.includes(
            chapter
        )
    ) {

        return;

    }

    AppState.currentChapter =
        chapter;

    AppState.currentLessonIndex =
        0;

    AppState.currentLesson =
        null;

    AppState.searchQuery =
        "";

    AppState.showFavoritesOnly =
        false;

    if (DOM.searchInput) {

        DOM.searchInput.value =
            "";

    }

    saveStorage();

    updateActiveChapter();

    renderLessons();

    hideChapters();

}


function updateActiveChapter() {

    document
        .querySelectorAll(
            ".level-btn"
        )
        .forEach(
            button => {

                const chapter =
                    button.dataset.chapter ||
                    button.dataset.level;

                const active =
                    chapter ===
                    AppState.currentChapter;

                button.classList.toggle(
                    "active",
                    active
                );

                button.setAttribute(
                    "aria-selected",
                    String(active)
                );

            }
        );

}


function toggleChapters() {

    const hidden =
        DOM.levelSection?.classList.contains(
            "hidden"
        );

    if (hidden) {

        showChapters();

    } else {

        hideChapters();

    }

}


function showChapters() {

    DOM.levelSection?.classList.remove(
        "hidden"
    );

}


function hideChapters() {

    DOM.levelSection?.classList.add(
        "hidden"
    );

}


/* =========================================================
   CURRENT CHAPTER
========================================================= */

function getCurrentChapterData() {

    return (
        AppState.data[
            AppState.currentChapter
        ] || {

            chapter:
                AppState.currentChapter,

            title:
                getChapterTitle(
                    AppState.currentChapter
                ),

            lessons: []

        }
    );

}


function getCurrentChapterLessons() {

    const data =
        getCurrentChapterData();

    return Array.isArray(
        data.lessons
    )
        ? data.lessons
        : [];

}


function getCurrentChapterTitle() {

    return getChapterTitle(
        AppState.currentChapter
    );

}


/* =========================================================
   LESSON ID
========================================================= */

function getLessonId(
    lesson,
    index
) {

    /*
       مهم:
       حتى لو كان id داخل chapter2
       نفس id الموجود داخل chapter1،
       يتم الفصل بينهما.
    */

    return String(

        `${AppState.currentChapter}_${
            lesson?.id ??
            index
        }`

    );

}


/* =========================================================
   VISIBLE LESSONS
========================================================= */

function getVisibleLessons() {

    let lessons =
        getCurrentChapterLessons();


    if (
        AppState.searchQuery.trim()
    ) {

        const query =
            AppState.searchQuery
                .toLowerCase()
                .trim();

        lessons =
            lessons.filter(
                lesson => {

                    const title =
                        String(
                            lesson.title ||
                            ""
                        ).toLowerCase();

                    const titleAr =
                        String(
                            lesson.title_ar ||
                            ""
                        ).toLowerCase();

                    const content =
                        String(
                            lesson.content ||
                            ""
                        ).toLowerCase();

                    const translation =
                        String(
                            lesson.translation_ar ||
                            ""
                        ).toLowerCase();

                    return (

                        title.includes(query) ||
                        titleAr.includes(query) ||
                        content.includes(query) ||
                        translation.includes(query)

                    );

                }
            );

    }


    if (
        AppState.showFavoritesOnly
    ) {

        lessons =
            lessons.filter(
                (lesson, index) =>
                    isFavorite(
                        getLessonId(
                            lesson,
                            index
                        )
                    )
            );

    }


    return lessons;

}


/* =========================================================
   RENDER LESSONS
========================================================= */

function renderLessons() {

    const lessons =
        getVisibleLessons();

    updateLessonsHeader(
        lessons.length
    );


    if (
        lessons.length === 0
    ) {

        if (DOM.lessonsList) {

            DOM.lessonsList.innerHTML =
                "";

        }

        DOM.emptyState?.classList.remove(
            "hidden"
        );

        return;

    }


    DOM.emptyState?.classList.add(
        "hidden"
    );


    if (DOM.lessonsList) {

        DOM.lessonsList.innerHTML =
            lessons
                .map(
                    (lesson, index) =>
                        createLessonCard(
                            lesson,
                            index
                        )
                )
                .join("");

    }

    attachLessonEvents();

}


/* =========================================================
   HEADER
========================================================= */

function updateLessonsHeader(
    count
) {

    if (
        AppState.showFavoritesOnly
    ) {

        if (DOM.lessonsTitle) {

            DOM.lessonsTitle.textContent =
                "النصوص المفضلة";

        }

        if (DOM.lessonsSubtitle) {

            DOM.lessonsSubtitle.textContent =
                "النصوص التي حفظتها في المفضلة.";

        }

    } else {

        if (DOM.lessonsTitle) {

            DOM.lessonsTitle.textContent =
                getCurrentChapterTitle();

        }

        if (DOM.lessonsSubtitle) {

            DOM.lessonsSubtitle.textContent =
                getChapterDescription(
                    AppState.currentChapter
                );

        }

    }


    if (DOM.lessonCount) {

        DOM.lessonCount.textContent =
            `${count} نص`;

    }

}


/* =========================================================
   LESSON CARD
========================================================= */

function createLessonCard(
    lesson,
    index
) {

    const id =
        getLessonId(
            lesson,
            index
        );

    const completed =
        isCompleted(id);

    const favorite =
        isFavorite(id);

    return `

        <article
            class="
                lesson-card
                ${completed ? "completed" : ""}
                ${favorite ? "is-favorite" : ""}
            "
            data-lesson-id="${escapeAttribute(id)}"
            tabindex="0"
            role="button"
        >

            <div class="lesson-number">

                ${String(
                    index + 1
                ).padStart(
                    2,
                    "0"
                )}

            </div>


            <div class="lesson-info">

                <h3>

                    ${escapeHTML(
                        lesson.title ||
                        "عنوان النص"
                    )}

                </h3>

                <p>

                    ${escapeHTML(
                        lesson.title_ar ||
                        ""
                    )}

                </p>

            </div>


            <div class="lesson-status">

                ${
                    completed
                        ? "✓"
                        : ""
                }

            </div>


            <div class="lesson-favorite">

                ${
                    favorite
                        ? '<span class="blue-star">★</span>'
                        : ""
                }

            </div>

        </article>

    `;

}


/* =========================================================
   LESSON EVENTS
========================================================= */

function attachLessonEvents() {

    document
        .querySelectorAll(
            ".lesson-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        openLesson(
                            card.dataset.lessonId
                        );

                    }
                );


                card.addEventListener(
                    "keydown",
                    event => {

                        if (
                            event.key === "Enter" ||
                            event.key === " "
                        ) {

                            event.preventDefault();

                            openLesson(
                                card.dataset.lessonId
                            );

                        }

                    }
                );

            }
        );

}


/* =========================================================
   OPEN LESSON
========================================================= */

function openLesson(
    lessonId
) {

    const lessons =
        getCurrentChapterLessons();

    const index =
        lessons.findIndex(
            (lesson, lessonIndex) =>
                getLessonId(
                    lesson,
                    lessonIndex
                ) ===
                String(lessonId)
        );

    if (
        index === -1
    ) {

        return;

    }

    AppState.currentLessonIndex =
        index;

    AppState.currentLesson =
        lessons[index];

    renderReader();

    DOM.readerModal?.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

    saveLastLesson(
        getLessonId(
            AppState.currentLesson,
            AppState.currentLessonIndex
        )
    );

}


/* =========================================================
   RENDER READER
========================================================= */

function renderReader() {

    const lesson =
        AppState.currentLesson;

    if (!lesson) {

        return;

    }

    const lessons =
        getCurrentChapterLessons();

    const index =
        AppState.currentLessonIndex;


    if (DOM.readerLevel) {

        DOM.readerLevel.textContent =
            getChapterTitle(
                AppState.currentChapter
            );

    }


    if (DOM.readerLessonNumber) {

        DOM.readerLessonNumber.textContent =
            `النص ${index + 1}`;

    }


    if (DOM.readerTitle) {

        DOM.readerTitle.textContent =
            lesson.title ||
            "عنوان النص";

    }


    if (DOM.readerTitleAr) {

        DOM.readerTitleAr.textContent =
            lesson.title_ar ||
            "";

    }


    if (DOM.readerText) {

        DOM.readerText.textContent =
            lesson.content ||
            "";

    }


    if (DOM.readerTranslation) {

        DOM.readerTranslation.textContent =
            lesson.translation_ar ||
            "لا توجد ترجمة متوفرة.";

    }


    renderVocabulary();

    renderQuestions();

    updateReaderFavoriteButton();

    updateReaderNavigation(
        lessons.length
    );


    markAsCompleted(
        getLessonId(
            lesson,
            index
        )
    );

}


/* =========================================================
   VOCABULARY
========================================================= */

function renderVocabulary() {

    const lesson =
        AppState.currentLesson;

    const vocabulary =
        lesson?.vocabulary ||
        lesson?.words ||
        [];


    if (
        !DOM.vocabularySection ||
        !DOM.vocabularyContainer
    ) {

        return;

    }


    if (
        !Array.isArray(vocabulary) ||
        vocabulary.length === 0
    ) {

        DOM.vocabularySection.classList.add(
            "hidden"
        );

        DOM.vocabularyContainer.innerHTML =
            "";

        return;

    }


    DOM.vocabularySection.classList.remove(
        "hidden"
    );


    DOM.vocabularyContainer.innerHTML =

        vocabulary
            .map(
                item => {

                    if (
                        typeof item ===
                        "string"
                    ) {

                        return `

                            <div class="vocabulary-item">

                                ${escapeHTML(item)}

                            </div>

                        `;

                    }


                    const word =
                        item.word ||
                        item.term ||
                        "";

                    const translation =
                        item.translation_ar ||
                        item.arabic ||
                        item.meaning ||
                        "";

                    const english =
                        item.translation_en ||
                        "";


                    return `

                        <div class="vocabulary-item">

                            <strong>

                                ${escapeHTML(word)}

                            </strong>

                            ${
                                translation
                                    ? `
                                        <span>
                                            ${escapeHTML(
                                                translation
                                            )}
                                        </span>
                                      `
                                    : ""
                            }

                            ${
                                english
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                english
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   QUESTIONS
========================================================= */

function renderQuestions() {

    const lesson =
        AppState.currentLesson;

    const questions =
        Array.isArray(
            lesson?.questions
        )
            ? lesson.questions
            : [];


    if (
        questions.length === 0
    ) {

        DOM.questionsSection?.classList.add(
            "hidden"
        );

        return;

    }


    DOM.questionsSection?.classList.remove(
        "hidden"
    );


    if (!DOM.questionsContainer) {

        return;

    }


    DOM.questionsContainer.innerHTML =

        questions
            .map(
                (question, index) => {

                    const text =
                        typeof question ===
                        "string"

                            ? question

                            : question?.question ||
                              "";

                    const answer =
                        typeof question ===
                        "string"

                            ? ""

                            : question?.answer ||
                              "";

                    return `

                        <div
                            class="question-card"
                            data-index="${index}"
                        >

                            <div
                                class="question-header"
                                tabindex="0"
                                role="button"
                                aria-expanded="false"
                            >

                                <span class="question-number">

                                    Question ${index + 1}

                                </span>

                                <div
                                    class="question-text"
                                    dir="ltr"
                                >

                                    ${escapeHTML(text)}

                                </div>

                            </div>


                            <div
                                class="user-answer-section"
                                dir="ltr"
                            >

                                <label>

                                    Your Answer

                                </label>

                                <textarea
                                    class="user-answer-input"
                                    placeholder="Write your answer here..."
                                    rows="3"
                                ></textarea>

                            </div>


                            <div
                                class="question-answer hidden"
                                dir="ltr"
                            >

                                ${escapeHTML(answer)}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    DOM.questionsContainer
        .querySelectorAll(
            ".question-header"
        )
        .forEach(
            header => {

                header.addEventListener(
                    "click",
                    () => {

                        const card =
                            header.closest(
                                ".question-card"
                            );

                        const answer =
                            card?.querySelector(
                                ".question-answer"
                            );

                        if (!answer) {

                            return;

                        }

                        const hidden =
                            answer.classList.contains(
                                "hidden"
                            );

                        answer.classList.toggle(
                            "hidden",
                            !hidden
                        );

                        header.setAttribute(
                            "aria-expanded",
                            String(hidden)
                        );

                    }
                );

            }
        );

}


/* =========================================================
   NAVIGATION
========================================================= */

function updateReaderNavigation(
    total
) {

    if (DOM.currentPosition) {

        DOM.currentPosition.textContent =
            `${AppState.currentLessonIndex + 1} / ${total}`;

    }


    if (DOM.prevLessonBtn) {

        DOM.prevLessonBtn.disabled =
            AppState.currentLessonIndex <= 0;

    }


    if (DOM.nextLessonBtn) {

        DOM.nextLessonBtn.disabled =
            AppState.currentLessonIndex >=
            total - 1;

    }

}


function previousLesson() {

    if (
        AppState.currentLessonIndex <= 0
    ) {

        return;

    }

    AppState.currentLessonIndex--;

    const lessons =
        getCurrentChapterLessons();

    AppState.currentLesson =
        lessons[
            AppState.currentLessonIndex
        ];

    saveLastLesson(
        getLessonId(
            AppState.currentLesson,
            AppState.currentLessonIndex
        )
    );

    renderReader();

}


function nextLesson() {

    const lessons =
        getCurrentChapterLessons();

    if (
        AppState.currentLessonIndex >=
        lessons.length - 1
    ) {

        return;

    }

    AppState.currentLessonIndex++;

    AppState.currentLesson =
        lessons[
            AppState.currentLessonIndex
        ];

    saveLastLesson(
        getLessonId(
            AppState.currentLesson,
            AppState.currentLessonIndex
        )
    );

    renderReader();

}


function closeReader() {

    stopSpeech();

    DOM.readerModal?.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(
    lessonId
) {

    return AppState.favorites.includes(
        String(lessonId)
    );

}


function toggleFavorite(
    lessonId
) {

    const id =
        String(lessonId);

    if (
        isFavorite(id)
    ) {

        AppState.favorites =
            AppState.favorites.filter(
                item =>
                    item !== id
            );

        showToast(
            "تمت إزالة النص من المفضلة"
        );

    } else {

        AppState.favorites.push(
            id
        );

        showToast(
            "تمت إضافة النص إلى المفضلة"
        );

    }

    saveStorage();

    updateFavoritesButton();

    updateReaderFavoriteButton();

    renderLessons();

}


function toggleCurrentFavorite() {

    if (
        !AppState.currentLesson
    ) {

        return;

    }

    toggleFavorite(
        getLessonId(
            AppState.currentLesson,
            AppState.currentLessonIndex
        )
    );

}


function updateReaderFavoriteButton() {

    if (
        !DOM.readerFavoriteBtn ||
        !AppState.currentLesson
    ) {

        return;

    }

    const favorite =
        isFavorite(
            getLessonId(
                AppState.currentLesson,
                AppState.currentLessonIndex
            )
        );

    DOM.readerFavoriteBtn.textContent =
        favorite
            ? "★"
            : "☆";

    DOM.readerFavoriteBtn.setAttribute(
        "aria-pressed",
        String(favorite)
    );

}


function toggleFavorites() {

    AppState.showFavoritesOnly =
        !AppState.showFavoritesOnly;

    AppState.searchQuery =
        "";

    if (DOM.searchInput) {

        DOM.searchInput.value =
            "";

    }

    updateFavoritesButton();

    renderLessons();

}


function updateFavoritesButton() {

    if (!DOM.favoritesBtn) {

        return;

    }

    DOM.favoritesBtn.textContent =
        AppState.showFavoritesOnly
            ? "⭐"
            : "☆";

}


/* =========================================================
   COMPLETED
========================================================= */

function isCompleted(
    lessonId
) {

    return AppState.completed.includes(
        String(lessonId)
    );

}


function markAsCompleted(
    lessonId
) {

    const id =
        String(lessonId);

    if (
        !isCompleted(id)
    ) {

        AppState.completed.push(
            id
        );

        saveStorage();

    }

}


/* =========================================================
   SEARCH
========================================================= */

function toggleSearch() {

    if (!DOM.searchPanel) {

        return;

    }

    const hidden =
        DOM.searchPanel.classList.contains(
            "hidden"
        );

    DOM.searchPanel.classList.toggle(
        "hidden",
        !hidden
    );

    if (hidden) {

        DOM.searchInput?.focus();

    }

}


function handleSearch(
    event
) {

    AppState.searchQuery =
        event.target.value;

    AppState.showFavoritesOnly =
        false;

    updateFavoritesButton();

    renderLessons();

}


function clearSearch() {

    if (DOM.searchInput) {

        DOM.searchInput.value =
            "";

    }

    AppState.searchQuery =
        "";

    renderLessons();

}


/* =========================================================
   TEXT TO SPEECH
========================================================= */

function speakCurrentLesson() {

    if (
        !AppState.currentLesson
    ) {

        return;

    }

    if (
        !("speechSynthesis" in window)
    ) {

        showToast(
            "القراءة الصوتية غير متاحة."
        );

        return;

    }

    stopSpeech();

    const text =
        AppState.currentLesson.content ||
        "";

    if (
        !text.trim()
    ) {

        return;

    }

    const utterance =
        new SpeechSynthesisUtterance(
            text
        );

    utterance.lang =
        "en-US";

    utterance.rate =
        Number(
            speechRate?.value ||
            1
        );

    utterance.pitch =
        1;

    utterance.onstart =
        () => {

            AppState.isSpeaking =
                true;

        };

    utterance.onend =
        () => {

            AppState.isSpeaking =
                false;

        };

    utterance.onerror =
        () => {

            AppState.isSpeaking =
                false;

        };

    window.speechSynthesis.speak(
        utterance
    );

}


function stopSpeech() {

    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    AppState.isSpeaking =
        false;

}


function handleAudioButton() {

    if (
        "speechSynthesis" in window
    ) {

        speakCurrentLesson();

    } else {

        openCurrentLessonOnWeb();

    }

}


/* =========================================================
   WEB
========================================================= */

function openCurrentLessonOnWeb() {

    const baseURL =
        "https://alaska-sahari.github.io/English-4MS-/";

    if (
        !AppState.currentLesson
    ) {

        window.open(
            baseURL,
            "_blank"
        );

        return;

    }

    const lessonId =
        getLessonId(
            AppState.currentLesson,
            AppState.currentLessonIndex
        );

    const url =
        baseURL +
        `?chapter=${encodeURIComponent(
            AppState.currentChapter
        )}` +
        `&lesson=${encodeURIComponent(
            lessonId
        )}`;

    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   MENU
========================================================= */

function openMenu() {

    DOM.sideMenu?.classList.add(
        "open"
    );

    DOM.menuOverlay?.classList.add(
        "open"
    );

}


function closeMenu() {

    DOM.sideMenu?.classList.remove(
        "open"
    );

    DOM.menuOverlay?.classList.remove(
        "open"
    );

}


/* =========================================================
   SIDE MENU
========================================================= */

function handleSideNavigation(
    event
) {

    const button =
        event.currentTarget;

    const view =
        button.dataset.view;


    if (
        view === "favorites"
    ) {

        AppState.showFavoritesOnly =
            true;

    } else {

        AppState.showFavoritesOnly =
            false;

    }


    updateFavoritesButton();

    renderLessons();

    closeMenu();

}


/* =========================================================
   CONTINUE
========================================================= */

function continueLastLesson() {

    const lastLessonId =
        localStorage.getItem(
            CONFIG.STORAGE_KEYS.LAST_LESSON
        );

    if (
        !lastLessonId
    ) {

        showToast(
            "لا يوجد نص سابق للمتابعة."
        );

        closeMenu();

        return;

    }


    let foundChapter =
        null;

    let foundIndex =
        -1;


    for (
        const chapter
        of CONFIG.CHAPTERS
    ) {

        const lessons =
            AppState.data[
                chapter
            ]?.lessons || [];

        const index =
            lessons.findIndex(
                (
                    lesson,
                    lessonIndex
                ) =>
                    getLessonIdForChapter(
                        lesson,
                        lessonIndex,
                        chapter
                    ) ===
                    String(lastLessonId)
            );

        if (
            index !== -1
        ) {

            foundChapter =
                chapter;

            foundIndex =
                index;

            break;

        }

    }


    if (
        foundChapter === null
    ) {

        showToast(
            "تعذر العثور على النص السابق."
        );

        closeMenu();

        return;

    }


    AppState.currentChapter =
        foundChapter;

    AppState.currentLessonIndex =
        foundIndex;

    AppState.currentLesson =
        AppState.data[
            foundChapter
        ].lessons[
            foundIndex
        ];

    AppState.showFavoritesOnly =
        false;

    saveStorage();

    updateActiveChapter();

    renderLessons();

    renderReader();

    DOM.readerModal?.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

    closeMenu();

}


function getLessonIdForChapter(
    lesson,
    index,
    chapter
) {

    return String(
        `${chapter}_${
            lesson?.id ??
            index
        }`
    );

}


function saveLastLesson(
    lessonId
) {

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.LAST_LESSON,
        String(lessonId)
    );

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.CHAPTER,
        AppState.currentChapter
    );

}


/* =========================================================
   RESET
========================================================= */

function resetProgress() {

    resetModal?.classList.remove(
        "hidden"
    );

}


function closeResetModal() {

    resetModal?.classList.add(
        "hidden"
    );

}


function confirmReset() {

    AppState.completed =
        [];

    localStorage.removeItem(
        CONFIG.STORAGE_KEYS.COMPLETED
    );

    saveStorage();

    renderLessons();

    closeResetModal();

    showToast(
        "تمت إعادة ضبط التقدم."
    );

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            CONFIG.STORAGE_KEYS.THEME
        ) ||
        "light";

    document.documentElement.dataset.theme =
        theme;

}


function toggleTheme() {

    const current =
        document.documentElement.dataset.theme;

    const next =
        current === "dark"
            ? "light"
            : "dark";

    document.documentElement.dataset.theme =
        next;

    localStorage.setItem(
        CONFIG.STORAGE_KEYS.THEME,
        next
    );

    updateThemeButton();

}


function updateThemeButton() {

    if (!themeToggleBtn) {

        return;

    }

    const theme =
        document.documentElement.dataset.theme;

    const icon =
        themeToggleBtn.querySelector(
            "span:first-child"
        );

    const text =
        themeToggleBtn.querySelector(
            "span:last-child"
        );

    if (icon) {

        icon.textContent =
            theme === "dark"
                ? "☀️"
                : "🌙";

    }

    if (text) {

        text.textContent =
            theme === "dark"
                ? "الوضع النهاري"
                : "الوضع الليلي";

    }

}


/* =========================================================
   CHAPTER TITLES
========================================================= */

function getChapterTitle(
    chapter
) {

    const titles = {

        chapter1:
            "نصوص الفصل الأول",

        chapter2:
            "نصوص الفصل الثاني",

        chapter3:
            "نصوص الفصل الثالث"

    };

    return (
        titles[chapter] ||
        "النصوص"
    );

}


/* =========================================================
   CHAPTER DESCRIPTIONS
========================================================= */

function getChapterDescription(
    chapter
) {

    const descriptions = {

        chapter1:
            "نصوص إنجليزية مختارة بعناية لتلاميذ السنة الرابعة متوسط للتحضير لشهادة التعليم المتوسط وتطوير مهارات القراءة والفهم والمفردات.",

        chapter2:
            "نصوص إنجليزية مختارة للفصل الثاني لتطوير مهارات القراءة والفهم والمفردات.",

        chapter3:
            "نصوص إنجليزية مختارة للفصل الثالث لتطوير مهارات القراءة والفهم والمفردات."

    };

    return (
        descriptions[chapter] ||
        ""
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer =
    null;


function showToast(
    message
) {

    if (
        !DOM.toast ||
        !DOM.toastMessage
    ) {

        return;

    }

    DOM.toastMessage.textContent =
        message;

    DOM.toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            () => {

                DOM.toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   KEYBOARD
========================================================= */

function handleKeyboard(
    event
) {

    if (
        event.key === "Escape"
    ) {

        if (
            DOM.readerModal &&
            !DOM.readerModal.classList.contains(
                "hidden"
            )
        ) {

            closeReader();
            return;

        }

        if (
            resetModal &&
            !resetModal.classList.contains(
                "hidden"
            )
        ) {

            closeResetModal();
            return;

        }

        closeMenu();

    }


    if (
        DOM.readerModal?.classList.contains(
            "hidden"
        )
    ) {

        return;

    }


    if (
        event.key === "ArrowLeft"
    ) {

        previousLesson();

    }


    if (
        event.key === "ArrowRight"
    ) {

        nextLesson();

    }

}


/* =========================================================
   SWIPE
========================================================= */

let touchStartX =
    0;

let touchStartY =
    0;


document.addEventListener(
    "touchstart",
    event => {

        if (
            DOM.readerModal?.classList.contains(
                "hidden"
            )
        ) {

            return;

        }

        const touch =
            event.changedTouches[0];

        touchStartX =
            touch.clientX;

        touchStartY =
            touch.clientY;

    },
    {
        passive: true
    }
);


document.addEventListener(
    "touchend",
    event => {

        if (
            DOM.readerModal?.classList.contains(
                "hidden"
            )
        ) {

            return;

        }

        const touch =
            event.changedTouches[0];

        const deltaX =
            touch.clientX -
            touchStartX;

        const deltaY =
            touch.clientY -
            touchStartY;

        if (
            Math.abs(deltaY) >
            Math.abs(deltaX)
        ) {

            return;

        }

        if (
            Math.abs(deltaX) < 60
        ) {

            return;

        }

        if (
            deltaX < 0
        ) {

            previousLesson();

        } else {

            nextLesson();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    value
) {

    return escapeHTML(
        value
    );

}


console.log(
    "English 4MS — Chapters 1, 2 and 3 loaded."
);