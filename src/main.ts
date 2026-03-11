import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis
const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

document.addEventListener("DOMContentLoaded", () => {
    // --- 1. INITIAL STATES (from inline script) ---
    gsap.set(".nvg-nav", { opacity: 0, y: -20 });
    gsap.set(".launch-btn", { opacity: 0, y: -20 });
    gsap.set(".hero-header h1", { opacity: 0, y: 30 });
    gsap.set(".hero-header p", { opacity: 0, y: 30 });
    gsap.set(".earn-btn", { opacity: 0, y: 20 });
    gsap.set(".animated-icons .animated-icon", { opacity: 0, y: 40 });

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });
    tl.to(".nvg-nav", { opacity: 1, y: 0 }, 0.1)
      .to(".launch-btn", { opacity: 1, y: 0 }, 0.15)
      .to(".hero-header h1", { opacity: 1, y: 0 }, 0.35)
      .to(".hero-header p", { opacity: 1, y: 0 }, 0.55)
      .to(".earn-btn", { opacity: 1, y: 0 }, 0.70)
      .to(".animated-icons .animated-icon", {
          opacity: 1,
          y: 0,
          stagger: 0.08
      }, 0.90);

    // --- 2. SYMBOLS ANIMATION (from SymbolsAnim.js) ---
    const animatedIcons = document.querySelector(".animated-icons") as HTMLElement;
    const iconElements = document.querySelectorAll(".animated-icon");
    const textSegments = document.querySelectorAll(".text-segment");
    const placeholders = document.querySelectorAll(".placeholder-icon");
    const heroHeader = document.querySelector(".hero-header") as HTMLElement;
    const heroSection = document.querySelector(".hero") as HTMLElement;

    if (!animatedIcons || !heroSection) return;

    let iconLoopTL: gsap.core.Timeline;
    const iconElementsArray = Array.from(iconElements) as HTMLElement[];
    const iconData = iconElementsArray.map((icon) => ({
        element: icon,
        x: (icon as HTMLElement).offsetLeft
    }));
    const allOriginalXPositions = iconData.map(d => d.x);

    function shuffleArray<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    iconLoopTL = gsap.timeline({
        repeat: -1,
        repeatDelay: 1,
        defaults: { ease: "power2.inOut" }
    });

    const shrinkDuration = 0.2;
    const growDuration = 0.5;
    const staggerAmount = 0.1;
    const initialDelay = 0.5;
    const swapTime = `+=${initialDelay + shrinkDuration + 0.1}`;

    iconLoopTL.to(iconElementsArray, {
        scale: 0,
        opacity: 0,
        duration: shrinkDuration,
        ease: "power2.in",
        filter: 'blur(3px)',
        stagger: staggerAmount
    }, initialDelay);

    iconLoopTL.call(() => {
        const shuffledTargetPositions = shuffleArray([...allOriginalXPositions]);
        iconData.forEach((data, index) => {
            const targetX = shuffledTargetPositions[index];
            const translationX = targetX - data.x;
            gsap.set(data.element, { x: `+=${translationX}` });
        });
        iconData.forEach((data, index) => {
            data.x = shuffledTargetPositions[index];
        });
    }, [], swapTime);

    iconLoopTL.to(iconElementsArray, {
        scale: 1,
        opacity: 1,
        duration: growDuration,
        ease: "power2.out",
        filter: 'blur(0px)',
        stagger: staggerAmount
    }, ">");

    const textAnimationOrder: { segment: Element, originalIndex: number }[] = [];
    textSegments.forEach((segment, index) => {
        textAnimationOrder.push({ segment, originalIndex: index });
    });

    for (let i = textAnimationOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [textAnimationOrder[i], textAnimationOrder[j]] = [textAnimationOrder[j], textAnimationOrder[i]];
    }

    const isMobile = window.innerWidth <= 1000;
    const headerIconSize = isMobile ? 30 : 60;
    const currentIconSize = iconElementsArray.length > 0 ? iconElementsArray[0].getBoundingClientRect().width : 60;
    const exactScale = headerIconSize / currentIconSize;

    ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: `+=${window.innerHeight * 0.6}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onLeave: () => {
            if (iconLoopTL) {
                iconLoopTL.pause();
                gsap.set(iconElementsArray, { scale: 1, opacity: 1, filter: 'blur(0px)' });
            }
        },
        onEnterBack: () => {
            if (iconLoopTL) {
                iconLoopTL.play(0);
                gsap.set(animatedIcons, { x: 0, y: 0 });
                iconElementsArray.forEach(icon => gsap.set(icon, { x: 0, y: 0 }));
                iconData.forEach((data, index) => {
                    data.x = allOriginalXPositions[index];
                });
            }
        },
        onUpdate: (self) => {
            const progress = self.progress;
            textSegments.forEach((segment) => gsap.set(segment, { opacity: 0 }));

            if (progress <= 0.3) {
                if (iconLoopTL && iconLoopTL.paused()) iconLoopTL.resume();
                const moveProgress = progress / 0.3;
                const containerMoveY = -window.innerHeight * 0.3 * moveProgress;

                if (progress <= 0.15) {
                    const headerProgress = progress / 0.15;
                    const headerMoveY = -50 * headerProgress;
                    const headerOpacity = 1 - headerProgress;
                    gsap.set(heroHeader, {
                        transform: `translate(-50%, calc(-50% + ${headerMoveY}px))`,
                        opacity: headerOpacity,
                    });
                } else {
                    gsap.set(heroHeader, {
                        transform: `translate(-50%, calc(-50% + -50px))`,
                        opacity: 0,
                    });
                }

                const duplicateIcons = document.querySelectorAll(".duplicate-icon");
                duplicateIcons.forEach(dup => dup.remove());

                gsap.set(animatedIcons, { x: 0, y: containerMoveY });
                iconElementsArray.forEach((icon, index) => {
                    const staggerDelay = index * 0.1;
                    const iconStart = staggerDelay;
                    const iconEnd = staggerDelay + 0.5;
                    const iconProgress = gsap.utils.mapRange(iconStart, iconEnd, 0, 1, moveProgress);
                    const clampedProgress = Math.max(0, Math.min(1, iconProgress));
                    const startOffset = -containerMoveY;
                    const individualY = startOffset * (1 - clampedProgress);
                    gsap.set(icon, { x: 0, y: individualY });
                });

            } else if (progress <= 0.6) {
                if (iconLoopTL) iconLoopTL.pause();
                const scaleProgress = (progress - 0.3) / 0.3;
                gsap.set(heroHeader, { transform: `translate(-50%, calc(-50% + -50px))`, opacity: 0 });
                heroSection.style.backgroundColor = scaleProgress >= 0.5 ? "#e3e3db" : "#141414";

                const duplicateIcons = document.querySelectorAll(".duplicate-icon");
                duplicateIcons.forEach(dup => dup.remove());

                const targetCenterY = window.innerHeight / 2;
                const targetCenterX = window.innerWidth / 2;
                const containerRect = animatedIcons.getBoundingClientRect();
                const currentCenterX = containerRect.left + containerRect.width / 2;
                const currentCenterY = containerRect.top + containerRect.height / 2;
                const deltaX = (targetCenterX - currentCenterX) * scaleProgress;
                const deltaY = (targetCenterY - currentCenterY) * scaleProgress;
                const baseY = -window.innerHeight * 0.3;
                const currentScale = 1 + (exactScale - 1) * scaleProgress;

                gsap.set(animatedIcons, { x: deltaX, y: baseY + deltaY, scale: currentScale, opacity: 1 });
                iconElementsArray.forEach((icon) => gsap.set(icon, { x: 0, y: 0 }));

            } else if (progress <= 0.75) {
                if (iconLoopTL) iconLoopTL.pause();
                const moveProgress = (progress - 0.6) / 0.15;
                gsap.set(heroHeader, { transform: `translate(-50%, calc(-50% + -50px))`, opacity: 0 });
                heroSection.style.backgroundColor = "#e3e3db";

                const targetCenterY = window.innerHeight / 2;
                const targetCenterX = window.innerWidth / 2;
                const containerRect = animatedIcons.getBoundingClientRect();
                const currentCenterX = containerRect.left + containerRect.width / 2;
                const currentCenterY = containerRect.top + containerRect.height / 2;
                const deltaX = targetCenterX - currentCenterX;
                const deltaY = targetCenterY - currentCenterY;
                const baseY = -window.innerHeight * 0.3;

                gsap.set(animatedIcons, { x: deltaX, y: baseY + deltaY, scale: exactScale, opacity: 0 });
                iconElementsArray.forEach((icon) => gsap.set(icon, { x: 0, y: 0 }));

                let duplicateIcons = document.querySelectorAll(".duplicate-icon");
                if (duplicateIcons.length === 0) {
                    iconElementsArray.forEach((icon) => {
                        const duplicate = icon.cloneNode(true) as HTMLElement;
                        duplicate.classList.add("duplicate-icon");
                        duplicate.style.position = "absolute";
                        duplicate.style.width = headerIconSize + "px";
                        duplicate.style.height = headerIconSize + "px";
                        duplicate.style.zIndex = "1000";
                        document.body.appendChild(duplicate);
                    });
                    duplicateIcons = document.querySelectorAll(".duplicate-icon");
                }

                duplicateIcons.forEach((duplicate, index) => {
                    const dup = duplicate as HTMLElement;
                    if (index < placeholders.length) {
                        const iconRect = iconElementsArray[index].getBoundingClientRect();
                        const startPageX = iconRect.left + iconRect.width / 2 + window.scrollX;
                        const startPageY = iconRect.top + iconRect.height / 2 + window.scrollY;

                        const targetRect = placeholders[index].getBoundingClientRect();
                        const targetPageX = targetRect.left + targetRect.width / 2 + window.scrollX;
                        const targetPageY = targetRect.top + targetRect.height / 2 + window.scrollY;

                        const moveX = targetPageX - startPageX;
                        const moveY = targetPageY - startPageY;

                        let currentX = 0;
                        let currentY = 0;
                        if (moveProgress <= 0.5) {
                            currentY = moveY * (moveProgress / 0.5);
                        } else {
                            currentY = moveY;
                            currentX = moveX * ((moveProgress - 0.5) / 0.5);
                        }

                        dup.style.left = startPageX + currentX - headerIconSize / 2 + "px";
                        dup.style.top = startPageY + currentY - headerIconSize / 2 + "px";
                        dup.style.opacity = "1";
                        dup.style.display = "flex";
                    }
                });
            } else {
                if (iconLoopTL) iconLoopTL.pause();
                gsap.set(heroHeader, { transform: `translate(-50%, calc(-50% + -100px))`, opacity: 0 });
                heroSection.style.backgroundColor = "#e3e3db";
                gsap.set(animatedIcons, { opacity: 0 });

                const duplicateIcons = document.querySelectorAll(".duplicate-icon");
                duplicateIcons.forEach((duplicate, index) => {
                    const dup = duplicate as HTMLElement;
                    if (index < placeholders.length) {
                        const targetRect = placeholders[index].getBoundingClientRect();
                        dup.style.left = targetRect.left + targetRect.width / 2 + window.scrollX - headerIconSize / 2 + "px";
                        dup.style.top = targetRect.top + targetRect.height / 2 + window.scrollY - headerIconSize / 2 + "px";
                        dup.style.opacity = "1";
                    }
                });

                textAnimationOrder.forEach((item, randomIndex) => {
                    const segmentStart = 0.75 + (randomIndex * 0.03);
                    const segmentEnd = segmentStart + 0.015;
                    const segmentProgress = gsap.utils.mapRange(segmentStart, segmentEnd, 0, 1, progress);
                    const clampedProgress = Math.max(0, Math.min(1, segmentProgress));
                    gsap.set(item.segment, { opacity: clampedProgress });
                });
            }
        }
    });

    // --- 3. TEXT ANIMATION (from TextAnim.js) ---
    const animeTextParagraphs = document.querySelectorAll(".anime-text p");
    const wordHighlightBgColor = "60, 60, 60";
    const keywords = ["colors", "designing", "tools", "design", "ui", "websites", "feature", "brand", "intuitive"];

    animeTextParagraphs.forEach((paragraph) => {
        const text = paragraph.textContent || "";
        const words = text.split(/\s+/);
        paragraph.innerHTML = "";

        words.forEach((word) => {
            if (word.trim()) {
                const wordContainer = document.createElement("div");
                wordContainer.className = "word";
                const wordText = document.createElement("span");
                wordText.textContent = word;

                const normalizedWord = word.toLowerCase().replace(/[.,!?;:"]/g, "");
                if (keywords.includes(normalizedWord)) {
                    wordContainer.classList.add("keyword-wrapper");
                    wordText.classList.add("keyword", normalizedWord);
                }
                wordContainer.appendChild(wordText);
                paragraph.appendChild(wordContainer);
            }
        });
    });

    const animeTextContainers = document.querySelectorAll(".anime-text-container");
    animeTextContainers.forEach((container) => {
        ScrollTrigger.create({
            trigger: container,
            pin: container,
            start: "top top",
            end: `+=${window.innerHeight * 0.5}px`,
            pinSpacing: true,
            onUpdate: (self) => {
                const progress = self.progress;
                const words = Array.from(container.querySelectorAll(".anime-text .word")) as HTMLElement[];
                const totalWords = words.length;

                words.forEach((word, index) => {
                    const wordText = word.querySelector("span") as HTMLElement;
                    if (progress <= 0.7) {
                        const revealProgress = Math.min(1, progress / 0.7);
                        const overlapWords = 15;
                        const totalAnimationLength = 1 + overlapWords / totalWords;
                        const wordStart = index / totalWords;
                        const wordEnd = wordStart + overlapWords / totalWords;
                        const timelineScale = 1 / Math.min(totalAnimationLength, 1 + (totalWords - 1) / totalWords + overlapWords / totalWords);
                        const adjustedStart = wordStart * timelineScale;
                        const adjustedEnd = wordEnd * timelineScale;
                        const duration = adjustedEnd - adjustedStart;
                        const wordProgress = revealProgress <= adjustedStart ? 0 : revealProgress >= adjustedEnd ? 1 : (revealProgress - adjustedStart) / duration;

                        word.style.opacity = wordProgress.toString();
                        const backgroundFadeStart = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
                        const backgroundOpacity = Math.max(0, 1 - backgroundFadeStart);
                        word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${backgroundOpacity})`;

                        const textRevealProgress = wordProgress >= 0.9 ? (wordProgress - 0.9) / 0.1 : 0;
                        wordText.style.opacity = Math.pow(textRevealProgress, 0.5).toString();
                    } else {
                        const reverseProgress = (progress - 0.7) / 0.3;
                        word.style.opacity = "1";
                        const reverseOverlapWords = 5;
                        const reverseWordStart = index / totalWords;
                        const reverseWordEnd = reverseWordStart + reverseOverlapWords / totalWords;
                        const reverseTimelineScale = 1 / Math.max(1, (totalWords - 1) / totalWords + reverseOverlapWords / totalWords);
                        const reverseAdjustedStart = reverseWordStart * reverseTimelineScale;
                        const reverseAdjustedEnd = reverseWordEnd * reverseTimelineScale;
                        const reverseDuration = reverseAdjustedEnd - reverseAdjustedStart;
                        const reverseWordProgress = reverseProgress <= reverseAdjustedStart ? 0 : reverseProgress >= reverseAdjustedEnd ? 1 : (reverseProgress - reverseAdjustedStart) / reverseDuration;

                        if (reverseWordProgress > 0) {
                            wordText.style.opacity = (1 - reverseWordProgress).toString();
                            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, ${reverseWordProgress})`;
                        } else {
                            wordText.style.opacity = "1";
                            word.style.backgroundColor = `rgba(${wordHighlightBgColor}, 0)`;
                        }
                    }
                });
            }
        });
    });
});
