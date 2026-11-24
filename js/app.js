/* app.js - master coordinator for dynamix using whyeron-skill-omni */

/* constants */
const APP_EPOCH_KEY = "dx-" + Date.now();
const CACHE_REFRESH_KEY = "ar_last_cache_refresh";
const CACHE_RECENT_SEC = 120;
const QUIZ_CHOICE_KEYS = ["1", "2", "3", "4", "5"];

class ActiveRecallApp {
    constructor() {
        this.sound = new SoundEngine();
        this.storage = new StorageManager();
        this.storage.initBundledDecks();
        this.engine = new StudyEngine(this.storage, this.sound);

        this.appEl = document.getElementById("app");
        this.currentRoute = "home";
        this.currentDeck = null;
        this.activeSheet = null;
        this.activeQuiz = null;
        this.historyStack = [];
        this.ignorePopstate = false;

        this.applyFontPreference();
        this.initHistory();
        this.setupKeyboard();
        this.setupWindowDrop();
        this.initServiceWorker();

        this.navigate("home", null, "root", true);

        const seenWelcome = this.storage.hasSeenWelcome();
        if (!seenWelcome && typeof window.DynamixHome === "object" && window.DynamixHome.openWelcomeSheet) {
            window.DynamixHome.openWelcomeSheet(this);
        }
    }

    /* font preference */
    applyFontPreference() {
        const savedFont = this.storage.getFontPreference();
        if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.setAttribute("data-font", savedFont);
        }
    }

    setFontPreference(fontName) {
        this.storage.setFontPreference(fontName);
        if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.setAttribute("data-font", fontName);
        }
    }

    /* minimal #app.app mount helper */
    mountView(parts, direction) {
        if (!this.appEl) {
            return;
        }
        const cfg = parts || {};
        this.appEl.innerHTML = "";

        if (cfg.storyBar) {
            this.appEl.appendChild(cfg.storyBar);
        }
        if (cfg.navBar) {
            this.appEl.appendChild(cfg.navBar);
        }
        if (cfg.content) {
            this.appEl.appendChild(cfg.content);
        }

        this.appEl.scrollTop = 0;

        this.appEl.classList.remove("anim-forward", "anim-back", "anim-root");
        void this.appEl.offsetWidth;

        let animCls = "anim-root";
        if (direction === "forward") {
            animCls = "anim-forward";
        } else if (direction === "back") {
            animCls = "anim-back";
        }
        if (direction !== "none") {
            this.appEl.classList.add(animCls);
        }
    }

    /* active sheet tracking */
    trackSheet(sheetCtrl) {
        this.activeSheet = sheetCtrl || null;
        return this.activeSheet;
    }

    clearSheet(sheetCtrl) {
        if (!sheetCtrl || this.activeSheet === sheetCtrl) {
            this.activeSheet = null;
        }
    }

    hasOpenSheet() {
        if (this.activeSheet && this.activeSheet.el) {
            const isHidden = this.activeSheet.el.classList.contains("hidden");
            if (!isHidden) {
                return true;
            }
        }
        const openBackdrop = document.querySelector(".trSheet.sheet-backdrop:not(.hidden)");
        return Boolean(openBackdrop);
    }

    dismissOpenSheet() {
        if (this.activeSheet && this.activeSheet.el) {
            const isHidden = this.activeSheet.el.classList.contains("hidden");
            if (!isHidden) {
                const ctrl = this.activeSheet;
                this.activeSheet = null;
                ctrl.close();
                return true;
            }
        }
        const openBackdrop = document.querySelector(".trSheet.sheet-backdrop:not(.hidden)");
        if (openBackdrop) {
            openBackdrop.click();
            return true;
        }
        return false;
    }

    /* history & navigation stack */
    initHistory() {
        const self = this;
        const initialState = {
            epoch: APP_EPOCH_KEY,
            route: "home",
            deckId: null
        };
        if (typeof history !== "undefined" && history.replaceState) {
            history.replaceState(initialState, "");
        }
        this.historyStack = [initialState];

        // ive looked up on the internet on this one, popstate fire when user trigger browser or device back button
        window.addEventListener("popstate", function (event) {
            if (self.ignorePopstate) {
                self.ignorePopstate = false;
                return;
            }

            const dismissed = self.dismissOpenSheet();
            if (dismissed) {
                const currentTop = self.historyStack[self.historyStack.length - 1];
                if (currentTop && history.pushState) {
                    history.pushState(currentTop, "");
                }
                return;
            }

            if (self.currentRoute === "game" && self.activeQuiz) {
                const currentTop = self.historyStack[self.historyStack.length - 1];
                if (currentTop && history.pushState) {
                    history.pushState(currentTop, "");
                }
                self.activeQuiz.requestQuit();
                return;
            }

            const state = event.state;
            if (!state || state.epoch !== APP_EPOCH_KEY) {
                self.historyStack = [{ epoch: APP_EPOCH_KEY, route: "home", deckId: null }];
                self.renderRoute("home", null, "back");
                return;
            }

            if (self.historyStack.length > 1) {
                self.historyStack.pop();
            }
            self.renderRoute(state.route, state.deckId, "back");
        });
    }

    navigate(route, deckId, direction, replace) {
        const targetDeckId = deckId || null;
        const entry = {
            epoch: APP_EPOCH_KEY,
            route: route,
            deckId: targetDeckId
        };

        if (replace) {
            this.historyStack = [entry];
            if (typeof history !== "undefined" && history.replaceState) {
                history.replaceState(entry, "");
            }
        } else {
            this.historyStack.push(entry);
            if (typeof history !== "undefined" && history.pushState) {
                history.pushState(entry, "");
            }
        }

        const dir = direction || "forward";
        this.renderRoute(route, targetDeckId, dir);
    }

    goBack() {
        const dismissed = this.dismissOpenSheet();
        if (dismissed) {
            return;
        }
        if (this.historyStack.length > 1) {
            this.historyStack.pop();
            const prev = this.historyStack[this.historyStack.length - 1];
            if (typeof history !== "undefined" && history.replaceState) {
                history.replaceState(prev, "");
            }
            this.renderRoute(prev.route, prev.deckId, "back");
            return;
        }
        this.showHome("back");
    }

    renderRoute(route, deckId, direction) {
        this.currentRoute = route;
        if (route !== "game") {
            this.activeQuiz = null;
        }

        if (route === "home") {
            if (window.DynamixHome && window.DynamixHome.renderHomeScreen) {
                window.DynamixHome.renderHomeScreen(this, direction);
            }
            return;
        }

        if (route === "deck") {
            let deck = this.currentDeck;
            if (deckId && (!deck || deck.id !== deckId)) {
                deck = this.storage.loadDeck(deckId);
            }
            if (!deck) {
                this.showHome("back");
                return;
            }
            this.currentDeck = deck;
            if (window.DynamixDeck && window.DynamixDeck.renderDeckScreen) {
                window.DynamixDeck.renderDeckScreen(this, deck, direction);
            }
            return;
        }

        if (route === "settings") {
            if (window.DynamixSettings && window.DynamixSettings.renderSettingsScreen) {
                window.DynamixSettings.renderSettingsScreen(this, direction);
            }
            return;
        }
    }

    /* route helpers */
    showHome(direction) {
        const dir = direction || "root";
        this.navigate("home", null, dir, true);
    }

    showSettings() {
        this.navigate("settings", null, "forward", false);
    }

    showImport() {
        if (window.DynamixHome && window.DynamixHome.openImportSheet) {
            window.DynamixHome.openImportSheet(this);
        }
    }

    openDeck(deckId, direction) {
        const deck = this.storage.loadDeck(deckId);
        if (!deck) {
            const alertCtrl = trAlert({
                title: "Deck not found",
                description: "The selected deck could not be loaded from storage."
            });
            this.trackSheet(alertCtrl);
            return;
        }
        this.currentDeck = deck;
        this.storage.setActiveDeckId(deckId);
        const dir = direction || "forward";
        this.navigate("deck", deck.id, dir, false);
    }

    showSetup(mode, partId) {
        if (!this.currentDeck) {
            return;
        }
        const targetMode = mode || "part";
        const targetPart = partId !== undefined ? partId : 1;
        if (window.DynamixDeck && window.DynamixDeck.openSessionSetupSheet) {
            window.DynamixDeck.openSessionSetupSheet(this, this.currentDeck, targetMode, targetPart);
        }
    }

    startSession(options) {
        if (!this.currentDeck) {
            return;
        }
        const entry = {
            epoch: APP_EPOCH_KEY,
            route: "game",
            deckId: this.currentDeck.id
        };
        this.historyStack.push(entry);
        if (typeof history !== "undefined" && history.pushState) {
            history.pushState(entry, "");
        }
        this.currentRoute = "game";
        if (window.DynamixGame && window.DynamixGame.startStudySession) {
            this.activeQuiz = window.DynamixGame.startStudySession(this, this.currentDeck, options);
        }
    }

    quitToDeck() {
        this.activeQuiz = null;
        if (this.currentDeck) {
            if (this.historyStack.length > 1) {
                this.historyStack.pop();
            }
            const deckEntry = {
                epoch: APP_EPOCH_KEY,
                route: "deck",
                deckId: this.currentDeck.id
            };
            if (typeof history !== "undefined" && history.replaceState) {
                history.replaceState(deckEntry, "");
            }
            this.renderRoute("deck", this.currentDeck.id, "back");
            return;
        }
        this.showHome("back");
    }

    /* bundled sample loader */
    loadSampleDeck(sampleId) {
        const bundled = window.BUNDLED_DECKS || {};
        const keys = Object.keys(bundled);
        if (keys.length === 0) {
            return;
        }
        const chosenId = (sampleId && bundled[sampleId]) ? sampleId : keys[0];
        const deck = bundled[chosenId];
        if (!deck) {
            return;
        }

        const list = this.storage.getRecentDecks();
        let existingIdx = -1;
        for (let i = 0; i < list.length; i += 1) {
            if (list[i].id === deck.id) {
                existingIdx = i;
                break;
            }
        }
        if (existingIdx !== -1) {
            list.splice(existingIdx, 1);
        }

        const rawTitle = deck.title || "Sample Deck";
        const shortTitle = rawTitle.length > 48 ? rawTitle.slice(0, 48) + "..." : rawTitle;
        const meta = {
            id: deck.id,
            title: shortTitle,
            fullName: rawTitle,
            desc: deck.desc || "",
            cardCount: deck.questions ? deck.questions.length : 0,
            partsCount: deck.parts ? deck.parts.length : 0,
            lastOpened: Date.now(),
            isBundled: true
        };
        list.unshift(meta);
        this.storage.saveRecentDecks(list);
        this.renderRoute("home", null, "none");
    }

    /* compatibility helpers */
    importJsonFile(file) {
        if (!file) {
            return;
        }
        try {
            const isString = typeof file.content === "string";
            const data = isString ? JSON.parse(file.content) : file;
            const saved = this.storage.saveCustomDeck(data);
            this.currentDeck = saved;
            this.openDeck(saved.id, "forward");
        } catch (err) {
            console.warn("import failed:", err);
        }
    }

    triggerImportDeck() {
        this.showImport();
    }

    showDashboard() {
        this.showHome("root");
    }

    /* global drag and drop for json files */
    setupWindowDrop() {
        const self = this;
        window.addEventListener("dragover", function (event) {
            event.preventDefault();
        });
        window.addEventListener("drop", function (event) {
            event.preventDefault();
            if (!event.dataTransfer || !event.dataTransfer.files) {
                return;
            }
            if (event.dataTransfer.files.length === 0) {
                return;
            }
            const file = event.dataTransfer.files[0];
            let lowerName = file.name || "";
            lowerName = lowerName.toLowerCase();
            if (lowerName.endsWith(".json")) {
                if (window.DynamixHome && window.DynamixHome.processDeckFile) {
                    window.DynamixHome.processDeckFile(self, file);
                }
            }
        });
    }

    /* keyboard shortcuts */
    setupKeyboard() {
        const self = this;
        window.addEventListener("keydown", function (event) {
            const target = event.target;
            if (target) {
                const tag = target.tagName;
                if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
                    return;
                }
            }

            const key = event.key;

            if (key === "Escape") {
                const sheetOpen = self.hasOpenSheet();
                if (sheetOpen) {
                    self.dismissOpenSheet();
                    return;
                }
                if (self.currentRoute === "game" && self.activeQuiz) {
                    self.activeQuiz.requestQuit();
                    return;
                }
                if (self.currentRoute === "deck" || self.currentRoute === "settings") {
                    self.goBack();
                    return;
                }
                return;
            }

            if (key === "m" || key === "M") {
                self.sound.toggleMute();
                if (self.currentRoute === "settings" && window.DynamixSettings && window.DynamixSettings.renderSettingsScreen) {
                    window.DynamixSettings.renderSettingsScreen(self, "none");
                }
                return;
            }

            const sheetOpen = self.hasOpenSheet();
            if (sheetOpen) {
                return;
            }

            if (self.currentRoute === "game" && self.activeQuiz) {
                const showingFeedback = self.activeQuiz.isFeedbackShowing();
                if (showingFeedback && (event.code === "Space" || key === "Enter")) {
                    event.preventDefault();
                    self.activeQuiz.handleContinue();
                    return;
                }

                const answered = self.activeQuiz.isAnswered();
                if (!showingFeedback && !answered) {
                    if (key === "r" || key === "R") {
                        event.preventDefault();
                        self.activeQuiz.handleReveal();
                        return;
                    }
                    const isChoiceKey = QUIZ_CHOICE_KEYS.indexOf(key) !== -1;
                    if (isChoiceKey) {
                        const parsed = parseInt(key, 10);
                        const idx = parsed - 1;
                        event.preventDefault();
                        self.activeQuiz.handleAnswerByIndex(idx);
                    }
                }
            }
        });
    }

    /* service worker cache bridge */
    refreshCacheNow() {
        const hasSw = typeof navigator !== "undefined" && navigator.serviceWorker && navigator.serviceWorker.controller;
        if (hasSw) {
            navigator.serviceWorker.controller.postMessage({ type: "REFRESH_CACHE" });
            return;
        }
        const nowStr = String(Date.now());
        localStorage.setItem(CACHE_REFRESH_KEY, nowStr);
        if (window.DynamixSettings && window.DynamixSettings.updateCacheSubtitle) {
            window.DynamixSettings.updateCacheSubtitle(true);
        }
    }

    initServiceWorker() {
        const hasWindow = typeof window !== "undefined";
        const hasSw = typeof navigator !== "undefined" && "serviceWorker" in navigator;
        if (!hasWindow || !hasSw) {
            return;
        }

        function registerSW() {
            const regPromise = navigator.serviceWorker.register("./sw.js");
            regPromise.then(function (reg) {
                const lastRefresh = localStorage.getItem(CACHE_REFRESH_KEY);
                if (reg.installing || reg.waiting) {
                    localStorage.setItem(CACHE_REFRESH_KEY, String(Date.now()));
                } else if (reg.active) {
                    if (lastRefresh) {
                        const elapsedMs = Date.now() - Number(lastRefresh);
                        const diffSec = Math.round(elapsedMs / 1000);
                        if (diffSec < CACHE_RECENT_SEC) {
                            console.log("[Cache] recently refreshed (" + diffSec + "s ago)");
                        } else {
                            const mins = Math.round(diffSec / 60);
                            console.log("[Cache] older than " + mins + "m, will refresh when online");
                        }
                    } else {
                        localStorage.setItem(CACHE_REFRESH_KEY, String(Date.now()));
                    }
                }
                if (navigator.serviceWorker.controller) {
                    navigator.serviceWorker.controller.postMessage({ type: "CHECK_CACHE" });
                }
            }).catch(function (err) {
                console.warn("sw registration failed:", err);
            });
        }

        if (document.readyState === "complete") {
            registerSW();
        } else {
            window.addEventListener("load", registerSW);
        }

        window.addEventListener("online", function () {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: "REFRESH_CACHE" });
            }
        });

        if (navigator.serviceWorker.addEventListener) {
            navigator.serviceWorker.addEventListener("message", function (event) {
                if (!event.data || event.data.type !== "CACHE_STATUS") {
                    return;
                }
                if (event.data.refreshed) {
                    localStorage.setItem(CACHE_REFRESH_KEY, String(Date.now()));
                }
                if (window.DynamixSettings && window.DynamixSettings.updateCacheSubtitle) {
                    window.DynamixSettings.updateCacheSubtitle(event.data.refreshed);
                }
            });
        }
    }
}

if (typeof window !== "undefined") {
    window.addEventListener("DOMContentLoaded", function () {
        window.app = new ActiveRecallApp();
    });
    window.ActiveRecallApp = ActiveRecallApp;
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = { ActiveRecallApp: ActiveRecallApp };
}
