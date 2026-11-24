/* game.js - study session screen using whyeron-skill-omni */

/* constants */
const GAME_STORY_BUCKET_LIMIT = 15;
const GAME_STORY_BUCKET_COUNT = 10;
const GAME_ICON_CHECK = "\uE73E";
const GAME_ICON_REVEAL = "\uE7B3";
const GAME_MD_PATTERN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

// params: parent (required: node), rawText (optional: string)
function appendMarkdownText(parent, rawText) {
    const source = String(rawText || "");
    if (!source) {
        return;
    }
    GAME_MD_PATTERN.lastIndex = 0;
    let cursor = 0;
    let match = GAME_MD_PATTERN.exec(source);

    while (match !== null) {
        const startIdx = match.index;
        if (startIdx > cursor) {
            const plainChunk = source.slice(cursor, startIdx);
            const textNode = document.createTextNode(plainChunk);
            parent.appendChild(textNode);
        }

        const token = match[0];
        if (token.startsWith("`") && token.endsWith("`")) {
            const innerCode = token.slice(1, -1);
            const codeEl = trEl("code", "dynamix-inline-code", innerCode);
            parent.appendChild(codeEl);
        } else if (token.startsWith("**") && token.endsWith("**")) {
            const innerBold = token.slice(2, -2);
            const boldEl = trEl("strong", "as-bold", innerBold);
            parent.appendChild(boldEl);
        } else if (token.startsWith("*") && token.endsWith("*")) {
            const innerItalic = token.slice(1, -1);
            const italicEl = trEl("em", "as-italic", innerItalic);
            parent.appendChild(italicEl);
        } else {
            const fallbackNode = document.createTextNode(token);
            parent.appendChild(fallbackNode);
        }

        cursor = startIdx + token.length;
        match = GAME_MD_PATTERN.exec(source);
    }

    if (cursor < source.length) {
        const tailChunk = source.slice(cursor);
        const tailNode = document.createTextNode(tailChunk);
        parent.appendChild(tailNode);
    }
}

// params: currentInPass (required: number), totalInPass (required: number)
function computeStoryProgress(currentInPass, totalInPass) {
    const safeTotal = totalInPass > 0 ? totalInPass : 1;
    const safeCurrent = currentInPass > 0 ? currentInPass : 1;

    if (safeTotal <= GAME_STORY_BUCKET_LIMIT) {
        return {
            total: safeTotal,
            current: Math.min(safeTotal, safeCurrent)
        };
    }

    const ratio = safeCurrent / safeTotal;
    const scaled = ratio * GAME_STORY_BUCKET_COUNT;
    const bucket = Math.ceil(scaled);
    const clamped = Math.max(1, Math.min(GAME_STORY_BUCKET_COUNT, bucket));
    return {
        total: GAME_STORY_BUCKET_COUNT,
        current: clamped
    };
}

// params: ctx (required: ActiveRecallApp), summary (required)
function showSessionSummary(ctx, summary) {
    if (!summary) {
        ctx.quitToDeck();
        return;
    }

    const acc = summary.masteryPct || 0;
    const scoreText = String(summary.sessionScore || 0);
    const streakText = (summary.bestStreak || 0) + "x";

    if (summary.isFlawless) {
        const isMastered = summary.consecutiveStreak !== null && summary.consecutiveStreak >= 2;
        const waveTitle = isMastered ? "Mastered" : "Flawless run";
        let waveSub = isMastered
            ? "Two flawless runs in a row with zero errors or reveals."
            : "Zero errors or reveals. Complete one more flawless run to reach mastery.";
        if (summary.unlockedNotice) {
            waveSub = summary.unlockedNotice;
        }

        const statsCard = trStatGroup([
            { value: acc + "%", label: "Accuracy" },
            { value: scoreText, label: "Score" },
            { value: streakText, label: "Streak" }
        ], { label: "Session results" });

        trSuccessWave({
            title: waveTitle,
            subtitle: waveSub,
            icon: GAME_ICON_CHECK,
            palette: "ocean",
            card: statsCard,
            buttonLabel: "Return to deck",
            onDone: function () {
                ctx.quitToDeck();
            }
        });
        return;
    }

    let sheetCtrl = null;
    const statsCard = trStatGroup([
        { value: acc + "%", label: "Accuracy" },
        { value: scoreText, label: "Score" },
        { value: String(summary.totalCards || 0), label: "Cards" }
    ], { label: "Session results" });

    const returnBtn = trButton({
        label: "Return to deck",
        variant: "primary",
        size: "m",
        className: "flex1",
        onClick: function () {
            if (sheetCtrl) {
                sheetCtrl.close();
            }
            ctx.quitToDeck();
        }
    });

    sheetCtrl = trSheet({
        title: "Session complete",
        description: "All cards checked. Practice again to reach 100% first-pass accuracy.",
        body: [statsCard],
        buttons: [returnBtn],
        removeOnClose: true,
        onClose: function () {
            ctx.clearSheet(sheetCtrl);
            ctx.quitToDeck();
        }
    });

    ctx.trackSheet(sheetCtrl);
    sheetCtrl.open();
}

// params: ctx (required: ActiveRecallApp), deck (required), options (optional)
function startStudySession(ctx, deck, options) {
    const engine = ctx.engine;
    engine.startSession(deck, options || {});

    let currentChoices = [];
    let choiceButtons = [];
    let revealBtn = null;
    let feedbackSlot = null;
    let answered = false;
    let feedbackShowing = false;

    function requestQuit() {
        const confirmCtrl = trConfirm({
            title: "Quit study session?",
            description: "Your current session progress will not be saved.",
            confirmLabel: "Quit",
            cancelLabel: "Keep studying",
            critical: true,
            onConfirm: function () {
                ctx.clearSheet(confirmCtrl);
                ctx.quitToDeck();
            },
            onCancel: function () {
                ctx.clearSheet(confirmCtrl);
            }
        });
        ctx.trackSheet(confirmCtrl);
    }

    function markChoiceCorrect(rowEl) {
        if (!rowEl) {
            return;
        }
        rowEl.classList.add("as-success");
        const idxEl = rowEl.querySelector(".list-index");
        if (idxEl) {
            idxEl.classList.remove("as-gray");
        }
        const checkIcon = trIcon(GAME_ICON_CHECK, { className: "as-success" });
        rowEl.appendChild(checkIcon);
    }

    function renderFeedback(isCorrect, explanation, answerText, isRevealed) {
        if (!feedbackSlot) {
            return;
        }
        feedbackSlot.innerHTML = "";
        feedbackShowing = true;

        let headline = "That is not right";
        if (isCorrect) {
            headline = "That is right";
        } else if (isRevealed) {
            headline = "Answer revealed";
        }

        const cardNodes = [];
        if (!isCorrect && answerText) {
            const ansEl = trEl("p", "as-primary as-bold");
            appendMarkdownText(ansEl, "Correct: " + answerText);
            cardNodes.push(ansEl);
        }
        if (explanation) {
            const expEl = trEl("p", "as-secondary as-midgray");
            appendMarkdownText(expEl, explanation);
            cardNodes.push(expEl);
        }

        if (cardNodes.length > 0) {
            const fbCard = trCard(cardNodes);
            const fbGroup = trCardGroup({
                headline: headline,
                card: fbCard
            });
            feedbackSlot.appendChild(fbGroup);
        } else {
            const headOnly = trSectionHeading(headline);
            feedbackSlot.appendChild(headOnly);
        }

        const continueBtn = trButton({
            label: "Continue",
            variant: "primary",
            onClick: handleContinue
        });
        feedbackSlot.appendChild(continueBtn);
        feedbackSlot.classList.remove("hidden");
        continueBtn.focus();
    }

    function disableRevealButton() {
        if (revealBtn) {
            revealBtn.disabled = true;
            revealBtn.classList.add("disabled");
        }
    }

    function handleAnswer(selectedLetter) {
        if (answered) {
            return;
        }
        answered = true;

        const result = engine.submitAnswer(selectedLetter);
        if (!result) {
            return;
        }

        disableRevealButton();

        const correctList = result.correctAnswers || [];
        let chosenUpper = String(selectedLetter || "");
        chosenUpper = chosenUpper.toUpperCase();

        for (let i = 0; i < choiceButtons.length; i += 1) {
            const entry = choiceButtons[i];
            const rowEl = entry.btn;
            let letterUpper = String(entry.letter || "");
            letterUpper = letterUpper.toUpperCase();
            const isRightChoice = correctList.indexOf(letterUpper) !== -1;
            const isChosenChoice = letterUpper === chosenUpper;

            rowEl.setAttribute("aria-disabled", "true");
            if (isRightChoice) {
                markChoiceCorrect(rowEl);
            } else if (isChosenChoice && !result.isCorrect) {
                rowEl.classList.add("as-critical");
            } else {
                rowEl.classList.add("disabled");
            }
        }

        renderFeedback(result.isCorrect, result.explanation, result.answerText, false);
    }

    function handleAnswerByIndex(idx) {
        if (idx < 0 || idx >= currentChoices.length) {
            return;
        }
        const choice = currentChoices[idx];
        handleAnswer(choice.letter);
    }

    function handleReveal() {
        if (answered) {
            return;
        }
        answered = true;

        const result = engine.revealAnswer();
        if (!result) {
            return;
        }

        disableRevealButton();

        const correctList = result.correctAnswers || [];
        for (let i = 0; i < choiceButtons.length; i += 1) {
            const entry = choiceButtons[i];
            const rowEl = entry.btn;
            let letterUpper = String(entry.letter || "");
            letterUpper = letterUpper.toUpperCase();
            const isRightChoice = correctList.indexOf(letterUpper) !== -1;

            rowEl.setAttribute("aria-disabled", "true");
            if (isRightChoice) {
                markChoiceCorrect(rowEl);
            } else {
                rowEl.classList.add("disabled");
            }
        }

        renderFeedback(false, result.explanation, result.answerText, true);
    }

    function handleContinue() {
        const res = engine.nextCard();
        if (res.completed) {
            ctx.activeQuiz = null;
            showSessionSummary(ctx, res.summary);
            return;
        }
        renderCurrentCard("forward");
    }

    function renderCurrentCard(animDir) {
        answered = false;
        feedbackShowing = false;
        choiceButtons = [];

        const card = engine.getCurrentCard();
        if (!card) {
            ctx.quitToDeck();
            return;
        }

        const prog = engine.getCurrentProgress();
        const storyInfo = computeStoryProgress(prog.currentInPass, prog.totalInPass);
        const storyBar = trStoryBar({
            total: storyInfo.total,
            current: storyInfo.current
        });

        const streakText = prog.streak > 0 ? (prog.streak + "x") : "1.0x";
        const navTitle = card.isReview ? ("Review · Part " + card.sourcePartId) : "Study session";
        const navSubtitle = prog.currentInPass + " of " + prog.totalInPass + " · Q" + card.id + " · " + streakText;

        revealBtn = trButton({
            label: "Reveal",
            icon: GAME_ICON_REVEAL,
            size: "m",
            onClick: handleReveal
        });

        const navBar = trNavBar({
            title: navTitle,
            subtitle: navSubtitle,
            onBack: requestQuit,
            actions: [revealBtn]
        });

        const content = trEl("main", "content vbox space-xl");

        // section 1: header (question number, prompt title, optional review note or code snippet)
        const headerGroup = trEl("div", "group vbox space-s");
        const qNumLabel = "Question " + card.id;
        const qNumEl = trEl("p", "as-tertiary as-gray", qNumLabel);
        headerGroup.appendChild(qNumEl);

        const promptEl = trEl("p", "as-title as-bold");
        appendMarkdownText(promptEl, card.prompt || "");
        headerGroup.appendChild(promptEl);

        if (card.isReview) {
            const reviewNote = "Review card from Part " + card.sourcePartId;
            const noteEl = trEl("p", "as-tertiary as-gray", reviewNote);
            headerGroup.appendChild(noteEl);
        }

        const headerNodes = [headerGroup];
        const codeInfo = engine.getCodeForQuestion(card);
        if (codeInfo && codeInfo.code) {
            const preEl = trEl("pre", "dynamix-code-block", codeInfo.code);
            const codeCard = trCard([preEl]);
            headerNodes.push(codeCard);
        }

        const headerSection = trSection(headerNodes, {
            label: "Question header"
        });
        content.appendChild(headerSection);

        // section 2: content (4 choices in trListCard, responsive 2x2)
        currentChoices = engine.shuffle(card.choices || []);
        const choiceRows = [];

        for (let i = 0; i < currentChoices.length; i += 1) {
            const choice = currentChoices[i];
            const choiceNum = i + 1;
            const textEl = trEl("p", "as-primary");
            appendMarkdownText(textEl, choice.text);
            const rowEl = trListItem({
                index: choiceNum,
                title: textEl,
                onClick: function () {
                    handleAnswer(choice.letter);
                }
            });
            choiceButtons.push({
                letter: choice.letter,
                btn: rowEl
            });
            choiceRows.push(rowEl);
        }

        const choicesListCard = trListCard(choiceRows);
        choicesListCard.classList.add("dynamix-choices-card");
        choicesListCard.setAttribute("role", "group");
        choicesListCard.setAttribute("aria-label", "Answer choices");

        const contentSection = trSection([choicesListCard], {
            label: "Answer choices"
        });
        content.appendChild(contentSection);

        // section 3: bottom (feedback card + external continue button)
        feedbackSlot = trSection([], {
            label: "Feedback",
            className: "hidden"
        });
        content.appendChild(feedbackSlot);

        ctx.mountView({
            storyBar: storyBar,
            navBar: navBar,
            content: content
        }, animDir || "forward");
    }

    renderCurrentCard("forward");

    return {
        handleAnswerByIndex: handleAnswerByIndex,
        handleReveal: handleReveal,
        handleContinue: handleContinue,
        requestQuit: requestQuit,
        isFeedbackShowing: function () {
            return feedbackShowing;
        },
        isAnswered: function () {
            return answered;
        }
    };
}

if (typeof window !== "undefined") {
    window.DynamixGame = {
        startStudySession: startStudySession
    };
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        startStudySession: startStudySession
    };
}
