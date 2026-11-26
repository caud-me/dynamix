/* home.js - home screen, import sheet, and welcome sheet using whyeron-skill-omni */

/* constants */
const HOME_BRAND_TEXT = "DYNAMIX";
const HOME_BRAND_SVG = '<svg width="41" height="10" viewBox="0 0 41 10" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.528 9.24L6.204 6.672L6.624 5.832L6.216 4.776L6.792 1.19209e-06H9.336L8.628 5.628L9.06 9.24H6.528ZM7.056 5.82C6.944 6.54 6.72 7.172 6.384 7.716C6.056 8.26 5.636 8.684 5.124 8.988C4.62 9.284 4.044 9.432 3.396 9.432C2.724 9.432 2.132 9.284 1.62 8.988C1.116 8.684 0.720001 8.26 0.432001 7.716C0.144001 7.164 1.13249e-06 6.532 1.13249e-06 5.82C1.13249e-06 5.092 0.144001 4.456 0.432001 3.912C0.720001 3.368 1.116 2.944 1.62 2.64C2.132 2.336 2.724 2.184 3.396 2.184C4.044 2.184 4.62 2.336 5.124 2.64C5.636 2.936 6.06 3.356 6.396 3.9C6.732 4.436 6.952 5.076 7.056 5.82ZM2.484 5.82C2.484 6.156 2.552 6.456 2.688 6.72C2.832 6.984 3.028 7.192 3.276 7.344C3.524 7.488 3.808 7.56 4.128 7.56C4.464 7.56 4.78 7.488 5.076 7.344C5.372 7.192 5.632 6.984 5.856 6.72C6.08 6.456 6.248 6.156 6.36 5.82C6.248 5.476 6.08 5.172 5.856 4.908C5.632 4.644 5.372 4.436 5.076 4.284C4.78 4.132 4.464 4.056 4.128 4.056C3.808 4.056 3.524 4.132 3.276 4.284C3.028 4.436 2.832 4.644 2.688 4.908C2.552 5.172 2.484 5.476 2.484 5.82ZM9.4215 2.388H11.8815L12.3255 5.124V9.24H9.8775V4.752L9.4215 2.388ZM14.8455 2.184C15.5015 2.184 16.0615 2.316 16.5255 2.58C16.9895 2.844 17.3415 3.216 17.5815 3.696C17.8295 4.176 17.9535 4.744 17.9535 5.4V9.24H15.5055V5.76C15.5055 5.248 15.3735 4.856 15.1095 4.584C14.8535 4.312 14.4815 4.176 13.9935 4.176C13.6575 4.176 13.3615 4.248 13.1055 4.392C12.8575 4.536 12.6655 4.74 12.5295 5.004C12.3935 5.268 12.3255 5.58 12.3255 5.94L11.5695 5.544C11.6655 4.816 11.8695 4.204 12.1815 3.708C12.4935 3.204 12.8775 2.824 13.3335 2.568C13.7895 2.312 14.2935 2.184 14.8455 2.184ZM18.3868 2.388H20.8468L21.2908 5.124V9.24H18.8428V4.752L18.3868 2.388ZM23.6548 2.184C24.2868 2.184 24.8228 2.316 25.2628 2.58C25.7028 2.844 26.0388 3.216 26.2708 3.696C26.5028 4.176 26.6188 4.744 26.6188 5.4V9.24H24.1708V5.76C24.1708 5.248 24.0548 4.856 23.8228 4.584C23.5908 4.312 23.2548 4.176 22.8148 4.176C22.5028 4.176 22.2308 4.248 21.9988 4.392C21.7748 4.536 21.5988 4.74 21.4708 5.004C21.3508 5.268 21.2908 5.58 21.2908 5.94L20.5348 5.544C20.6308 4.816 20.8268 4.204 21.1228 3.708C21.4188 3.204 21.7828 2.824 22.2148 2.568C22.6548 2.312 23.1348 2.184 23.6548 2.184ZM28.9708 2.184C29.6028 2.184 30.1388 2.316 30.5788 2.58C31.0268 2.844 31.3668 3.216 31.5988 3.696C31.8308 4.176 31.9468 4.744 31.9468 5.4V9.24H29.4988V5.76C29.4988 5.248 29.3828 4.856 29.1508 4.584C28.9188 4.312 28.5828 4.176 28.1428 4.176C27.8308 4.176 27.5588 4.248 27.3268 4.392C27.1028 4.536 26.9268 4.74 26.7988 5.004C26.6788 5.268 26.6188 5.58 26.6188 5.94L25.8628 5.544C25.9588 4.816 26.1508 4.204 26.4388 3.708C26.7348 3.204 27.1028 2.824 27.5428 2.568C27.9828 2.312 28.4588 2.184 28.9708 2.184ZM31.9109 9.24L35.0909 5.4L35.0789 6.12L32.0909 2.388H34.8149L36.7469 4.752H36.0269L37.9589 2.388H40.6469L37.5509 6.144L37.4309 5.172L40.8389 9.24H38.0549L35.9549 6.708H36.7229L34.6469 9.24H31.9109Z" fill="white"/></svg>';
const HOME_TITLE_LIMIT = 40;
const HOME_ICON_SETTINGS = "\uE712";
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
        svg: HOME_BRAND_SVG
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
        leftActions: [settingsBtn],
        titleNode: logoNode,
        center: true,
        actions: [addBtn]
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
                logoSvg: HOME_BRAND_SVG,
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
