/* deck.js - deck overview screen and session setup sheet using whyeron-skill-omni */

/* constants */
const DECK_BRAND_TEXT = "DYNAMIX";
const DECK_DESC_LIMIT = 120;
const DECK_ICON_CHECK = "\uE73E";

// params: deck (required)
function getShortDeckTitle(deck) {
    const raw = (deck && deck.title) ? deck.title : "Deck";
    let lower = raw.toLowerCase();
    if (lower.indexOf("javafx") !== -1) {
        return "JavaFX";
    }
    if (lower.indexOf("oop") !== -1 || lower.indexOf("object-oriented") !== -1) {
        return "OOP";
    }
    if (raw.length > 36) {
        const cut = raw.slice(0, 33);
        return cut + "...";
    }
    return raw;
}

// params: partId (required), progress (required)
function formatPartConfidence(partId, progress) {
    const streaks = (progress && progress.partConsecutiveMasteries) ? progress.partConsecutiveMasteries : {};
    const scores = (progress && progress.partMasteryScores) ? progress.partMasteryScores : {};
    const consecutive = streaks[partId] || 0;
    const bestScore = scores[partId] || 0;

    if (consecutive >= 2) {
        return "100% confident (Mastered)";
    }
    if (consecutive === 1) {
        return "50% confident";
    }
    if (bestScore > 0) {
        const scaled = (bestScore / 100) * 50;
        const rounded = Math.round(scaled);
        const partial = Math.min(49, rounded);
        return partial + "% confident";
    }
    return "Not attempted";
}

// params: ctx (required: ActiveRecallApp), deck (required), mode (required: "part" | "full"), partId (optional: number)
function openSessionSetupSheet(ctx, deck, mode, partId) {
    if (!deck) {
        return null;
    }

    let sheetCtrl = null;
    const sessionMode = mode || "part";
    const targetPartId = partId !== undefined && partId !== null ? partId : 1;
    const progress = ctx.storage.loadProgress(deck.id);

    let isRandomized = sessionMode === "full";
    let includeReview = true;

    let scopeTitle = "Full Active Recall";
    let scopeStatus = (progress.fullMasteryScore || 0) + "% full exam mastery";

    if (sessionMode === "part") {
        const parts = deck.parts || [];
        let foundPart = null;
        for (let i = 0; i < parts.length; i += 1) {
            if (parts[i].id === targetPartId) {
                foundPart = parts[i];
                break;
            }
        }
        scopeTitle = foundPart ? foundPart.title : ("Part " + targetPartId);
        scopeStatus = formatPartConfidence(targetPartId, progress);
    }

    const initialOrder = isRandomized ? "random" : "sequential";
    const orderListCard = trRadioGroup({
        label: "Question order",
        value: initialOrder,
        items: [
            { value: "sequential", title: "Sequential", subtitle: "Good for trial and error." },
            { value: "random", title: "Randomized", subtitle: "Good for mastering." }
        ],
        onChange: function (val) {
            isRandomized = val === "random";
        }
    });

    const orderGroup = trCardGroup({
        headline: "Question order",
        card: orderListCard
    });

    const bodyNodes = [orderGroup];

    if (sessionMode === "part" && targetPartId > 1) {
        const extraCards = StudyEngine.getReviewCardCount(deck, targetPartId);
        const unitLabel = extraCards === 1 ? "card" : "cards";
        const reviewSub = "Adds " + extraCards + " extra " + unitLabel + " from earlier sections.";
        const reviewRow = trCheckRow({
            title: "Include past review cards",
            subtitle: reviewSub,
            checked: includeReview,
            onChange: function (checked) {
                includeReview = checked;
            }
        });
        const reviewCard = trCard([reviewRow]);
        bodyNodes.push(reviewCard);
    }

    const cancelBtn = trButton({
        label: "Cancel",
        size: "m",
        className: "flex1",
        onClick: function () {
            if (sheetCtrl) {
                sheetCtrl.close();
            }
        }
    });

    const startBtn = trButton({
        label: "Start",
        variant: "primary",
        size: "m",
        className: "flex1",
        onClick: function () {
            const cfg = {
                mode: sessionMode,
                partId: targetPartId,
                isRandomized: isRandomized,
                includeReview: includeReview
            };
            if (sheetCtrl) {
                sheetCtrl.close();
            }
            ctx.startSession(cfg);
        }
    });

    sheetCtrl = trSheet({
        title: "Session setup",
        description: scopeTitle,
        footnote: scopeStatus,
        body: bodyNodes,
        buttons: [cancelBtn, startBtn],
        removeOnClose: true,
        onClose: function () {
            ctx.clearSheet(sheetCtrl);
        }
    });

    ctx.trackSheet(sheetCtrl);
    sheetCtrl.open();
    return sheetCtrl;
}

// params: ctx (required: ActiveRecallApp), deck (required), direction (optional: string)
function renderDeckScreen(ctx, deck, direction) {
    if (!deck) {
        ctx.showHome("back");
        return;
    }

    const progress = ctx.storage.loadProgress(deck.id);
    const shortTitle = getShortDeckTitle(deck);

    const navBar = trNavBar({
        title: "Deck overview",
        subtitle: shortTitle,
        onBack: function () {
            ctx.goBack();
        }
    });

    const parts = deck.parts || [];
    const questions = deck.questions || [];
    let masteredCount = 0;
    const streaks = progress.partConsecutiveMasteries || {};
    for (let i = 0; i < parts.length; i += 1) {
        const pId = parts[i].id;
        if ((streaks[pId] || 0) >= 2) {
            masteredCount += 1;
        }
    }

    let rawDesc = deck.desc || "Active recall deck ready for study.";
    if (rawDesc.length > DECK_DESC_LIMIT) {
        rawDesc = rawDesc.slice(0, DECK_DESC_LIMIT - 3);
        rawDesc = rawDesc + "...";
    }

    const topMeta = parts.length + " sections · " + questions.length + " cards";
    const brandCard = trBrandCard({
        logoText: DECK_BRAND_TEXT,
        subtext: "",
        topRight: topMeta,
        title: shortTitle,
        subtitle: rawDesc,
        bottomRight: (progress.fullMasteryScore || 0) + "% full exam",
        big: false
    });

    const statsCard = trStatGroup([
        { value: String(questions.length), label: "Cards" },
        { value: masteredCount + "/" + parts.length, label: "Mastered" },
        { value: (progress.bestStreak || 0) + "x", label: "Best streak" }
    ], { label: "Deck stats" });

    const fullExamBtn = trButton({
        label: "Start full exam",
        icon: DECK_ICON_CHECK,
        variant: "primary",
        onClick: function () {
            ctx.showSetup("full", null);
        }
    });

    const overviewSection = trSection([brandCard, statsCard, fullExamBtn], {
        label: "Deck summary"
    });

    const sectionRows = [];
    for (let i = 0; i < parts.length; i += 1) {
        const part = parts[i];
        const statusText = formatPartConfidence(part.id, progress);
        const row = trActionRow({
            label: part.title,
            subtitle: statusText,
            onClick: function () {
                ctx.showSetup("part", part.id);
            }
        });
        sectionRows.push(row);
    }

    const sectionsListCard = trListCard(sectionRows);
    const sectionsGroup = trCardGroup({
        headline: "Sections",
        card: sectionsListCard,
        footnote: "Complete 2 flawless runs in a row to reach 100% confidence on a section."
    });

    const sectionsSection = trSection([sectionsGroup], {
        label: "Deck sections"
    });

    const content = trEl("main", "content vbox space-xl");
    content.appendChild(overviewSection);
    content.appendChild(sectionsSection);

    ctx.mountView({ navBar: navBar, content: content }, direction || "forward");
}

if (typeof window !== "undefined") {
    window.DynamixDeck = {
        renderDeckScreen: renderDeckScreen,
        openSessionSetupSheet: openSessionSetupSheet
    };
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        renderDeckScreen: renderDeckScreen,
        openSessionSetupSheet: openSessionSetupSheet
    };
}
