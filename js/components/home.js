/* home.js - home screen, import sheet, and welcome sheet using whyeron-skill-omni */

/* constants */
const HOME_BRAND_TEXT = "DYNAMIX";
const HOME_TITLE_LIMIT = 40;
const HOME_ICON_SETTINGS = "\uE713";
const HOME_ICON_ADD = "\uE710";
const HOME_ICON_FILE = "\uE8B7";
const HOME_ICON_EMPTY = "\uE8F1";

// params: deckMeta (required), progress (required)
function computeDeckMasteryLabel(deckMeta, progress) {
    const partsCount = deckMeta.partsCount || 0;
    const streaks = (progress && progress.partConsecutiveMasteries) ? progress.partConsecutiveMasteries : {};
    const keys = Object.keys(streaks);
    let masteredCount = 0;
    for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        const count = streaks[key] || 0;
        if (count >= 2) {
            masteredCount += 1;
        }
    }
    if (partsCount > 0 && masteredCount > 0) {
        return masteredCount + "/" + partsCount + " mastered";
    }
    if (progress && progress.xp > 0) {
        return progress.xp + " XP";
    }
    return "Ready";
}

// params: rawTitle (required)
function trimDeckTitle(rawTitle) {
    const text = String(rawTitle || "Untitled Deck");
    if (text.length > HOME_TITLE_LIMIT) {
        const sliced = text.slice(0, HOME_TITLE_LIMIT - 3);
        return sliced + "...";
    }
    return text;
}

// params: ctx (required: ActiveRecallApp), file (required: File), onSuccess (optional)
function processDeckFile(ctx, file, onSuccess) {
    if (!file) {
        return;
    }
    let fileName = file.name || "";
    fileName = fileName.toLowerCase();
    const isJson = fileName.endsWith(".json");
    if (!isJson) {
        const errSheet = trAlert({
            title: "Invalid file",
            description: "Please choose a valid .json deck file."
        });
        ctx.trackSheet(errSheet);
        return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const rawText = event.target.result;
            const parsed = JSON.parse(rawText);
            const saved = ctx.storage.saveCustomDeck(parsed);
            if (onSuccess) {
                onSuccess(saved);
            }
            ctx.currentDeck = saved;
            ctx.openDeck(saved.id, "forward");
        } catch (err) {
            const msg = err && err.message ? err.message : "Could not read deck file.";
            const alertCtrl = trAlert({
                title: "Import failed",
                description: msg
            });
            ctx.trackSheet(alertCtrl);
        }
    };
    reader.readAsText(file);
}

// params: ctx (required: ActiveRecallApp)
function openImportSheet(ctx) {
    let sheetCtrl = null;

    const fileInput = trEl("input", "hidden");
    fileInput.type = "file";
    fileInput.accept = ".json,application/json";

    function handleLoaded() {
        if (sheetCtrl) {
            sheetCtrl.close();
        }
    }

    fileInput.addEventListener("change", function (event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            const chosen = files[0];
            processDeckFile(ctx, chosen, handleLoaded);
        }
        event.target.value = "";
    });

    const dropIcon = trIcon(HOME_ICON_FILE, { className: "as-display as-centered as-gray" });
    const dropTitle = trEl("p", "as-primary as-bold as-centered", "Click or drop a .json file");
    const dropSub = trEl("p", "as-tertiary as-gray as-centered", "/whyeron-1.1f-catalyst generated deck");

    const dropCard = trCard([dropIcon, dropTitle, dropSub, fileInput], {
        layout: "standard vbox center space-m border-l",
        onClick: function () {
            fileInput.click();
        }
    });

    dropCard.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropCard.classList.add("dynamix-drop-active");
    });

    dropCard.addEventListener("dragleave", function () {
        dropCard.classList.remove("dynamix-drop-active");
    });

    dropCard.addEventListener("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        dropCard.classList.remove("dynamix-drop-active");
        const dt = event.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            processDeckFile(ctx, dt.files[0], handleLoaded);
        }
    });

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

    sheetCtrl = trSheet({
        title: "Add your reviewer",
        description: "Select a .json deck file to save it locally for offline cramming.",
        body: [dropCard],
        buttons: [cancelBtn],
        removeOnClose: true,
        onClose: function () {
            ctx.clearSheet(sheetCtrl);
        }
    });

    ctx.trackSheet(sheetCtrl);
    sheetCtrl.open();
    return sheetCtrl;
}

// params: ctx (required: ActiveRecallApp)
function openWelcomeSheet(ctx) {
    let sheetCtrl = null;
    let dontShowAgain = false;

    const featureItems = [
        trListItem({
            title: "Redesigned dark interface",
            subtitle: "New 3-section study view, responsive 2x2 choice grid on desktop, and bottom sheets for setup and imports."
        }),
        trListItem({
            title: "Inline markdown & code cards",
            subtitle: "Prompts, choices, and explanations now render inline code, bold, and italic formatting cleanly."
        }),
        trListItem({
            title: "Cleaner setup & navigation",
            subtitle: "Native radio selection for Sequential or Randomized order, browser back-button sync, and 1-5, R, Space, and M shortcuts."
        }),
        trListItem({
            title: "Flawless celebrations & offline cache",
            subtitle: "Wave transition on flawless runs, with local deck storage and one-tap cache updates in Settings."
        })
    ];

    const featuresCard = trListCard(featureItems);

    const checkRow = trCheckRow({
        title: "Do not show this again",
        subtitle: "Jump straight to your decks next time",
        checked: false,
        onChange: function (checked) {
            dontShowAgain = checked;
        }
    });
    const prefCard = trCard([checkRow]);

    const gotItBtn = trButton({
        label: "Got it",
        variant: "primary",
        size: "m",
        className: "flex1",
        onClick: function () {
            if (dontShowAgain) {
                ctx.storage.setSeenWelcome(true);
            }
            if (sheetCtrl) {
                sheetCtrl.close();
            }
        }
    });

    const logoNode = trBrandLogo({
        text: HOME_BRAND_TEXT
    });

    sheetCtrl = trSheet({
        title: "What is new in this update",
        headerExtra: logoNode,
        body: [featuresCard, prefCard],
        buttons: [gotItBtn],
        removeOnClose: true,
        onClose: function () {
            ctx.clearSheet(sheetCtrl);
        }
    });

    ctx.trackSheet(sheetCtrl);
    sheetCtrl.open();
    return sheetCtrl;
}

// params: ctx (required: ActiveRecallApp), direction (optional: string)
function renderHomeScreen(ctx, direction) {
    const logoNode = trBrandLogo({
        text: HOME_BRAND_TEXT
    });

    const settingsBtn = trIcon(HOME_ICON_SETTINGS, {
        label: "Settings",
        onClick: function () {
            ctx.showSettings();
        }
    });

    const addBtn = trIcon(HOME_ICON_ADD, {
        label: "Add deck",
        onClick: function () {
            ctx.showImport();
        }
    });

    const navBar = trNavBar({
        titleNode: logoNode,
        actions: [settingsBtn, addBtn]
    });

    const decks = ctx.storage.getRecentDecks();
    const content = trEl("main", "content vbox space-xl");

    if (decks.length === 0) {
        const emptyView = trEmptyState({
            icon: HOME_ICON_EMPTY,
            title: "No decks yet",
            subtitle: "Import a .json reviewer or load a sample deck to start cramming."
        });

        const importBtn = trButton({
            label: "Import JSON deck",
            icon: HOME_ICON_ADD,
            variant: "primary",
            onClick: function () {
                ctx.showImport();
            }
        });

        const bundled = window.BUNDLED_DECKS || {};
        const bundledKeys = Object.keys(bundled);
        const actionNodes = [importBtn];

        if (bundledKeys.length > 0) {
            const sampleBtn = trButton({
                label: "Load sample deck",
                variant: "standard",
                onClick: function () {
                    ctx.loadSampleDeck(bundledKeys[0]);
                }
            });
            actionNodes.push(sampleBtn);
        }

        const actionsWrap = trEl("div", "group vbox space-m");
        trAppend(actionsWrap, actionNodes);

        const emptySection = trSection([emptyView, actionsWrap], {
            flex: true,
            label: "Empty library"
        });
        content.appendChild(emptySection);
    } else {
        const headingEl = trSectionHeading("Recent decks");
        const gridEl = trEl("div", "card-grid vbox space-l");

        for (let i = 0; i < decks.length; i += 1) {
            const deckMeta = decks[i];
            const progress = ctx.storage.loadProgress(deckMeta.id);
            const relTime = ctx.storage.formatRelativeTime(deckMeta.lastOpened);
            const rawTitle = deckMeta.fullName || deckMeta.title || "Deck";
            const displayTitle = trimDeckTitle(rawTitle);
            const cardCount = deckMeta.cardCount || 0;
            const partsCount = deckMeta.partsCount || 0;
            const countLabel = cardCount + " cards";
            const metaSubtitle = partsCount > 0 ? (partsCount + " sections · " + countLabel) : countLabel;
            const masteryLabel = computeDeckMasteryLabel(deckMeta, progress);

            const deckCard = trBrandCard({
                logoText: HOME_BRAND_TEXT,
                subtext: "",
                topRight: relTime || "New",
                title: displayTitle,
                subtitle: metaSubtitle,
                bottomRight: masteryLabel,
                big: false,
                onClick: function () {
                    ctx.openDeck(deckMeta.id, "forward");
                }
            });
            gridEl.appendChild(deckCard);
        }

        const decksSection = trSection([headingEl, gridEl], {
            label: "Recent decks"
        });
        content.appendChild(decksSection);
    }

    ctx.mountView({ navBar: navBar, content: content }, direction || "root");
}

if (typeof window !== "undefined") {
    window.DynamixHome = {
        renderHomeScreen: renderHomeScreen,
        openImportSheet: openImportSheet,
        openWelcomeSheet: openWelcomeSheet,
        processDeckFile: processDeckFile
    };
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        renderHomeScreen: renderHomeScreen,
        openImportSheet: openImportSheet,
        openWelcomeSheet: openWelcomeSheet,
        processDeckFile: processDeckFile
    };
}
