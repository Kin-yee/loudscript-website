const player = document.querySelector(".ov-player");

if (player) {
    const samples = JSON.parse(player.querySelector(".ov-samples").textContent);
    const keys = player.querySelector(".ov-keys");
    const quote = player.querySelector(".ov-quote");
    const quoteText = quote.querySelector(".ov-quote-text");
    const quoteLit = quote.querySelector(".ov-quote-lit");
    const voices = player.querySelector(".ov-voices");
    const hint = player.querySelector(".ov-hint");
    const audio = new Audio();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // The player is always in exactly one of these states. An event the current
    // state does not list is ignored.
    const transitions = {
        idle: { press: "loading" },
        loading: { playing: "reading", press: "idle", stop: "idle", failed: "error" },
        reading: { ended: "played", press: "idle", stop: "idle", failed: "error" },
        played: { press: "loading", stop: "idle" },
        error: { press: "loading", stop: "idle" }
    };
    let state = "idle";
    let sample = samples[0];
    let wordSpans = [];
    let litWord = -1;
    let frame = 0;
    let flash = 0;

    const lightWord = (index) => {
        if (index === litWord) return;
        litWord = index;
        wordSpans.forEach((span, position) => {
            span.classList.toggle("is-spoken", position < index);
            span.classList.toggle("is-current", position === index);
        });
    };

    const followAudio = () => {
        const time = audio.currentTime;
        let index = -1;
        while (index + 1 < sample.words.length && sample.words[index + 1].start <= time) index++;
        lightWord(index);
        frame = requestAnimationFrame(followAudio);
    };

    const send = (event) => {
        const next = transitions[state][event];
        if (!next) return;
        state = next;
        player.dataset.state = state;
        cancelAnimationFrame(frame);
        if (state === "reading") followAudio();
        else lightWord(-1);
        if (state === "loading") {
            stopPreview();
            audio.currentTime = 0;
            audio.play().catch(() => send("failed"));
        } else if (state !== "reading") {
            audio.pause();
        }
        hint.textContent = hint.dataset[state] ?? hint.dataset.idle;
        const stoppable = state === "loading" || state === "reading";
        keys.setAttribute("aria-label", stoppable ? keys.dataset.labelStop : keys.dataset.labelPlay);
    };

    const showSample = (next) => {
        sample = next;
        audio.src = sample.src;
        quote.lang = sample.lang;
        quoteText.textContent = sample.text;
        let end = 0;
        wordSpans = [];
        quoteLit.replaceChildren(...sample.words.flatMap(({ from, to }) => {
            const span = document.createElement("span");
            span.className = "ov-word";
            span.textContent = sample.text.slice(from, to);
            wordSpans.push(span);
            const gap = sample.text.slice(end, from);
            end = to;
            return [gap, span];
        }));
        litWord = -1;
        for (const chip of voices.children) chip.setAttribute("aria-pressed", String(chip.dataset.voice === sample.voice));
    };

    const press = () => {
        clearTimeout(flash);
        keys.classList.add("is-flash");
        flash = setTimeout(() => keys.classList.remove("is-flash"), 260);
        send("press");
    };

    audio.preload = "none";
    audio.addEventListener("playing", () => send("playing"));
    audio.addEventListener("ended", () => send("ended"));
    audio.addEventListener("error", () => send("failed"));
    keys.addEventListener("click", press);

    if (samples.length > 1) {
        for (const option of samples) {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "ov-voice";
            chip.dataset.voice = option.voice;
            chip.textContent = option.label;
            if (option.lang !== document.documentElement.lang) {
                const language = document.createElement("small");
                language.className = "mac-link-language";
                language.textContent = option.lang.slice(0, 2).toUpperCase();
                chip.append(" ", language);
            }
            chip.addEventListener("click", () => {
                if (option === sample) return;
                send("stop");
                showSample(option);
                if (!reducedMotion.matches) quote.animate({ opacity: [0.4, 1] }, { duration: 180, easing: "ease-out" });
            });
            voices.append(chip);
        }
        voices.hidden = false;
    }
    showSample(sample);
    player.classList.add("is-enhanced");

    // Like the app, a modifier key lights while it is held. Option-R types "®",
    // so the shortcut is matched by physical key, not by the character.
    const heldKeys = { alt: document.querySelectorAll('.ov-key[data-key="alt"]'), meta: document.querySelectorAll('.ov-key[data-key="meta"]') };
    const lightHeld = (alt, meta) => {
        for (const key of heldKeys.alt) key.classList.toggle("is-down", alt);
        for (const key of heldKeys.meta) key.classList.toggle("is-down", meta);
    };
    window.addEventListener("keydown", (event) => {
        lightHeld(event.altKey, event.metaKey);
        if (event.code !== "KeyR" || !event.altKey || !event.metaKey || event.repeat) return;
        event.preventDefault();
        press();
    });
    window.addEventListener("keyup", (event) => lightHeld(event.altKey, event.metaKey));
    window.addEventListener("blur", () => lightHeld(false, false));

    // The voice cards share one preview player, and only one clip plays on the page at a time.
    const preview = new Audio();
    let playingCard = null;
    function stopPreview() {
        if (!playingCard) return;
        preview.pause();
        playingCard.setAttribute("aria-pressed", "false");
        playingCard.setAttribute("aria-label", playingCard.dataset.labelPlay);
        playingCard = null;
    }
    preview.addEventListener("ended", stopPreview);
    preview.addEventListener("error", stopPreview);
    for (const card of document.querySelectorAll(".mac-voice-play")) {
        const clip = samples.find(({ voice }) => voice === card.dataset.voice);
        if (!clip) continue;
        card.hidden = false;
        card.addEventListener("click", () => {
            const wasPlaying = playingCard === card;
            stopPreview();
            if (wasPlaying) return;
            send("stop");
            playingCard = card;
            card.setAttribute("aria-pressed", "true");
            card.setAttribute("aria-label", card.dataset.labelStop);
            preview.src = clip.src;
            preview.play().catch(stopPreview);
        });
    }
}
