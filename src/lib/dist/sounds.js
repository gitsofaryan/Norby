"use strict";
exports.__esModule = true;
exports.playSound = void 0;
var sharedCtx = null;
var getAudioContext = function () {
    if (typeof window === "undefined")
        return null;
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass)
        return null;
    if (!sharedCtx) {
        sharedCtx = new AudioContextClass();
    }
    return sharedCtx;
};
// Auto-unlock AudioContext on first user interaction (critical for Android and iOS)
if (typeof window !== "undefined") {
    var playSilentBuffer_1 = function (ctx) {
        try {
            var buffer = ctx.createBuffer(1, 1, 22050);
            var source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        }
        catch (e) {
            console.warn("[Norby Audio] Failed to play silent buffer:", e);
        }
    };
    var unlock_1 = function () {
        var ctx = getAudioContext();
        if (ctx) {
            if (ctx.state === "suspended") {
                ctx.resume().then(function () {
                    playSilentBuffer_1(ctx);
                    cleanUp_1();
                })["catch"](function (err) {
                    console.warn("[Norby Audio] Failed to unlock AudioContext:", err);
                });
            }
            else {
                playSilentBuffer_1(ctx);
                cleanUp_1();
            }
        }
    };
    var cleanUp_1 = function () {
        window.removeEventListener("click", unlock_1, true);
        window.removeEventListener("touchstart", unlock_1, true);
        window.removeEventListener("touchend", unlock_1, true);
        window.removeEventListener("keydown", unlock_1, true);
    };
    window.addEventListener("click", unlock_1, { capture: true, passive: true });
    window.addEventListener("touchstart", unlock_1, { capture: true, passive: true });
    window.addEventListener("touchend", unlock_1, { capture: true, passive: true });
    window.addEventListener("keydown", unlock_1, { capture: true, passive: true });
}
exports.playSound = function (type) {
    if (typeof window === "undefined")
        return;
    if (localStorage.getItem("norby_mute_sounds") === "true")
        return;
    var ctx = getAudioContext();
    if (!ctx)
        return;
    try {
        // Mobile browsers require the context to be running before scheduling tones.
        if (ctx.state === "suspended") {
            ctx.resume().then(function () { return exports.playSound(type); })["catch"](function () { });
            return;
        }
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        var now = ctx.currentTime;
        switch (type) {
            case "pop":
                osc.type = "sine";
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.5, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case "click":
                osc.type = "square";
                osc.frequency.setValueAtTime(150, now);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case "ring":
                osc.type = "sine";
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.setValueAtTime(800, now + 0.1);
                osc.frequency.setValueAtTime(600, now + 0.2);
                osc.frequency.setValueAtTime(800, now + 0.3);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                gain.gain.setValueAtTime(0.2, now + 0.35);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case "success":
                osc.type = "sine";
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(554.37, now + 0.1); // C#
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
            case "error":
                osc.type = "sawtooth";
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case "wave":
                osc.type = "sine";
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            case "connect":
                osc.type = "sine";
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                osc.frequency.setValueAtTime(783.99, now + 0.16);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.25, now + 0.02);
                gain.gain.setValueAtTime(0.25, now + 0.18);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;
            case "nearby":
                osc.type = "sine";
                osc.frequency.setValueAtTime(750, now);
                osc.frequency.exponentialRampToValueAtTime(250, now + 0.14);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
                osc.start(now);
                osc.stop(now + 0.14);
                break;
            case "broadcast":
                osc.type = "triangle";
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.linearRampToValueAtTime(950, now + 0.08);
                osc.frequency.linearRampToValueAtTime(800, now + 0.16);
                gain.gain.setValueAtTime(0, now);
                gain.gain.linearRampToValueAtTime(0.2, now + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
                osc.start(now);
                osc.stop(now + 0.22);
                break;
        }
    }
    catch (err) {
        // Ignore audio errors
    }
};
