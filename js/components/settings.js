/* settings.js - settings screen using whyeron-skill-omni */

/* constants */
const SETTINGS_CACHE_KEY = "ar_last_cache_refresh";

let activeCacheRow = null;

// params: none
function formatCacheSubtitle() {
    let lastRefresh = null;
    try {
        if (typeof localStorage !== "undefined") {
            lastRefresh = localStorage.getItem(SETTINGS_CACHE_KEY);
        }
    } catch (err) {
        lastRefresh = null;
    }

    if (!lastRefresh) {
        return "Ready to refresh";
    }
    const elapsedMs = Date.now() - Number(lastRefresh);
    const diffSec = Math.round(elapsedMs / 1000);
    if (diffSec < 60) {
        return "Recently refreshed";
    }
    const rawMins = Math.round(diffSec / 60);
    const mins = Math.max(1, rawMins);
    return "Last updated " + mins + "m ago";
}

// params: isRefreshed (required: boolean)
function updateCacheSubtitle(isRefreshed) {
    if (!activeCacheRow) {
        return;
    }
    const subEl = activeCacheRow.querySelector("p.as-secondary");
    if (!subEl) {
        return;
    }
    if (isRefreshed) {
        subEl.textContent = "Recently refreshed";
    } else {
        subEl.textContent = formatCacheSubtitle();
    }
}

// params: ctx (required: ActiveRecallApp), direction (optional: string)
function renderSettingsScreen(ctx, direction) {
    const navBar = trNavBar({
        title: "Settings",
        onBack: function () {
            ctx.goBack();
        }
    });

    const cacheSubtitle = formatCacheSubtitle();
    const updateCacheRow = trActionRow({
        label: "Update cache now",
        subtitle: cacheSubtitle,
        onClick: function () {
            ctx.refreshCacheNow();
        }
    });
    activeCacheRow = updateCacheRow;

    const removeFilesRow = trActionRow({
        label: "Remove imported files",
        subtitle: "Removes imported decks, streaks, and mastery progress.",
        critical: true,
        onClick: function () {
            const confirmCtrl = trConfirm({
                title: "Remove imported files?",
                description: "This will also remove all streaks and progress you have made. It cannot be undone.",
                confirmLabel: "Remove all",
                cancelLabel: "Cancel",
                critical: true,
                onConfirm: function () {
                    ctx.clearSheet(confirmCtrl);
                    ctx.storage.clearAllData();
                    ctx.currentDeck = null;
                    ctx.showHome("back");
                },
                onCancel: function () {
                    ctx.clearSheet(confirmCtrl);
                }
            });
            ctx.trackSheet(confirmCtrl);
        }
    });

    const generalCard = trListCard([updateCacheRow, removeFilesRow]);
    const generalGroup = trCardGroup({
        headline: "General",
        card: generalCard,
        footnote: "Offline files refresh automatically whenever your connection returns."
    });

    const isMuted = ctx.sound.isMuted();
    const muteRow = trCheckRow({
        title: "Mute sound effects",
        subtitle: "Silence audio feedback during study sessions",
        checked: isMuted,
        onChange: function (checked) {
            ctx.sound.setMuted(checked);
        }
    });

    const currentFont = ctx.storage.getFontPreference();
    const isSystemFont = currentFont === "system";
    const fontRow = trCheckRow({
        title: "Use system font",
        subtitle: "Switch from Segoe UI to your device default font",
        checked: isSystemFont,
        onChange: function (checked) {
            const nextFont = checked ? "system" : "segoe";
            ctx.setFontPreference(nextFont);
        }
    });

    const prefCard = trListCard([muteRow, fontRow]);
    const prefGroup = trCardGroup({
        headline: "Audio & Appearance",
        card: prefCard,
        footnote: "Press M anywhere in the app to toggle sound effects."
    });

    const settingsSection = trSection([generalGroup, prefGroup], {
        label: "Settings"
    });

    const content = trEl("main", "content vbox space-xl");
    content.appendChild(settingsSection);

    ctx.mountView({ navBar: navBar, content: content }, direction || "forward");
}

if (typeof window !== "undefined") {
    window.DynamixSettings = {
        renderSettingsScreen: renderSettingsScreen,
        updateCacheSubtitle: updateCacheSubtitle
    };
}
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        renderSettingsScreen: renderSettingsScreen,
        updateCacheSubtitle: updateCacheSubtitle
    };
}
