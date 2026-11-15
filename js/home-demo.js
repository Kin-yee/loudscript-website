const demo = document.querySelector(".mac-demo");

if (demo) {
    const media = demo.querySelector(".mac-demo-media");
    const video = media.querySelector("video");
    const toggle = media.querySelector(".mac-demo-toggle");
    const cards = [...demo.querySelectorAll(".mac-step-card")];

    let wantsPlay = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const play = () => video.play().catch(() => {});

    const showActiveChapter = () => {
        const time = video.currentTime;
        for (const card of cards) {
            const active = time >= Number(card.dataset.chapterStart) && time < Number(card.dataset.chapterEnd);
            card.classList.toggle("is-active", active);
            if (active) card.setAttribute("aria-current", "step");
            else card.removeAttribute("aria-current");
        }
    };

    const showPlayState = () => {
        const playing = !video.paused;
        media.classList.toggle("is-playing", playing);
        toggle.setAttribute("aria-label", playing ? toggle.dataset.labelPause : toggle.dataset.labelPlay);
    };

    video.addEventListener("playing", () => media.classList.add("is-started"), { once: true });
    video.addEventListener("play", showPlayState);
    video.addEventListener("pause", showPlayState);
    video.addEventListener("timeupdate", showActiveChapter);
    video.addEventListener("seeked", showActiveChapter);

    toggle.addEventListener("click", () => {
        wantsPlay = video.paused;
        if (wantsPlay) play();
        else video.pause();
    });

    for (const card of cards) {
        const heading = card.querySelector("h3");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "mac-step-seek";
        button.append(...heading.childNodes);
        heading.append(button);
        button.addEventListener("click", () => {
            wantsPlay = true;
            video.currentTime = Number(card.dataset.chapterStart);
            showActiveChapter();
            play();
        });
    }

    new IntersectionObserver((entries) => {
        if (wantsPlay && entries.at(-1).intersectionRatio >= 0.5) play();
        else video.pause();
    }, { threshold: [0, 0.5] }).observe(media);

    toggle.hidden = false;
    demo.classList.add("is-enhanced");
}
