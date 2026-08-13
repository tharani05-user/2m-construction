/* =========================================================
   MOBILE MENU
========================================================= */

document.documentElement.classList.add("js-enabled");

const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.querySelector(".main-navigation");

function getNavigationKey(pathname) {

    const cleanPathname = String(pathname || "")
        .split("?")[0]
        .split("#")[0]
        .replace(/\/+$/, "");

    const segments = cleanPathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "index.html";

    if (lastSegment.toLowerCase() === "index") {
        return "index.html";
    }

    if (lastSegment.toLowerCase().endsWith(".html")) {
        return lastSegment.toLowerCase();
    }

    return `${lastSegment.toLowerCase()}.html`;

}

function syncActiveNavigationLinks() {

    const navLinks = document.querySelectorAll(
        ".main-navigation a[href]"
    );

    if (!navLinks.length) {
        return;
    }

    const currentPageKey = getNavigationKey(
        window.location.pathname
    );

    navLinks.forEach(function (link) {

        const linkUrl = new URL(
            link.getAttribute("href"),
            window.location.href
        );

        const linkPageKey = getNavigationKey(
            linkUrl.pathname
        );

        const isActive = linkPageKey === currentPageKey;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }

    });

}

if (menuToggle && mainNavigation) {

    menuToggle.addEventListener("click", function () {

        const isOpen = mainNavigation.classList.toggle("mobile-open");

        menuToggle.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    /* Close menu when clicking a link */

    const navLinks = mainNavigation.querySelectorAll("a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            mainNavigation.classList.remove("mobile-open");

            menuToggle.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });

}

document.addEventListener("DOMContentLoaded", function () {

    syncActiveNavigationLinks();

});

function setupRevealAnimations() {

    const revealGroups = [
        {
            selector: [
                ".section-heading",
                ".hero-content",
                ".about-intro-content",
                ".residential-service-content",
                ".service-showcase-content",
                ".service-difference-content",
                ".project-cta-content",
                ".projects-final-cta-content",
                ".about-final-cta-content",
                ".why2m-final-cta-content",
                ".contact-faq-content",
                ".quote-form-section-heading"
            ].join(", "),
            effect: "up",
            stagger: 0
        },
        {
            selector: [
                ".service-card",
                ".project-card",
                ".build-category-card",
                ".why-stat",
                ".about-stat",
                ".why2m-stat-item",
                ".why2m-strength-card",
                ".leader-card",
                ".career-job-card",
                ".contact-faq-item",
                ".residential-feature",
                ".service-overview-card"
            ].join(", "),
            effect: "up",
            stagger: 70
        },
        {
            selector: [
                ".about-intro-image",
                ".our-journey-image",
                ".why-choose-image",
                ".careers-life-image",
                ".residential-service-image",
                ".service-showcase-image",
                ".service-difference-image",
                ".why2m-commitment-image"
            ].join(", "),
            effect: "right",
            stagger: 0
        }
    ];

    const observedElements = [];
    const seenElements = new Set();

    revealGroups.forEach(function (group) {

        const elements = document.querySelectorAll(
            group.selector
        );

        elements.forEach(function (element, index) {

            if (seenElements.has(element)) {
                return;
            }

            seenElements.add(element);

            element.classList.add(
                "reveal-item",
                `reveal-${group.effect}`
            );

            if (group.stagger > 0) {
                element.style.setProperty(
                    "--reveal-delay",
                    `${Math.min(index, 8) * group.stagger}ms`
                );
            }

            observedElements.push(element);

        });

    });

    if (!observedElements.length) {
        return;
    }

    if (!("IntersectionObserver" in window)) {

        observedElements.forEach(function (element) {
            element.classList.add("reveal-visible");
        });

        return;

    }

    const observer = new IntersectionObserver(
        function (entries, observerInstance) {

            entries.forEach(function (entry) {

                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.add("reveal-visible");
                observerInstance.unobserve(entry.target);

            });

        },
        {
            threshold: 0.18,
            rootMargin: "0px 0px -8% 0px"
        }
    );

    observedElements.forEach(function (element) {
        observer.observe(element);
    });

}

setupRevealAnimations();

/* =========================================================
   HEADER SCROLL BACKGROUND
========================================================= */

const homeHeader = document.querySelector('.home-header');

if (homeHeader) {
    window.addEventListener('scroll', function () {

        if (window.scrollY > 50) {
            homeHeader.classList.add('scrolled');
        } else {
            homeHeader.classList.remove('scrolled');
        }

    });
}


/* =========================================================
   PROJECT CATEGORY FILTER
========================================================= */

const projectFilters = document.querySelectorAll(".project-filter");
const projectCards = document.querySelectorAll(".project-card");

projectFilters.forEach(function (filterButton) {

    filterButton.addEventListener("click", function () {

        const selectedCategory = this.getAttribute("data-filter");


        /* Remove active from all buttons */

        projectFilters.forEach(function (button) {
            button.classList.remove("active");
        });


        /* Add active to clicked button */

        this.classList.add("active");


        /* Filter projects */

        projectCards.forEach(function (card) {

            const cardCategory = card.getAttribute("data-category");

            if (
                selectedCategory === "all" ||
                cardCategory === selectedCategory
            ) {

                card.classList.remove("is-hidden");

            } else {

                card.classList.add("is-hidden");

            }

        });

    });

});

/* =========================================================
   PROJECT FILTER + ADVANCED PAGINATION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const filterButtons = document.querySelectorAll(".project-filter");
    const projectCards = Array.from(
        document.querySelectorAll(".project-card")
    );

    const projectsGrid = document.querySelector(".projects-grid");
    const paginationContainer = document.querySelector(
        ".projects-pagination"
    );

    if (
        !projectCards.length ||
        !projectsGrid ||
        !paginationContainer
    ) {
        return;
    }


    /* =====================================================
       SETTINGS
    ===================================================== */

    const projectsPerPage = 4;

    let currentPage = 1;
    let currentFilter = "all";

    let filteredProjects = [...projectCards];


    /* =====================================================
       CREATE PAGINATION AREA
    ===================================================== */

    paginationContainer.innerHTML = "";

    const paginationInfo = document.createElement("div");

    paginationInfo.className = "pagination-info";


    const paginationControls = document.createElement("div");

    paginationControls.className = "pagination-controls";


    paginationContainer.appendChild(paginationInfo);

    paginationContainer.appendChild(paginationControls);


    /* =====================================================
       FILTER PROJECTS
    ===================================================== */

    function getFilteredProjects() {

        if (currentFilter === "all") {

            return [...projectCards];

        }

        return projectCards.filter(function (card) {

            return (
                card.getAttribute("data-category") ===
                currentFilter
            );

        });

    }


    /* =====================================================
       DISPLAY PROJECTS
    ===================================================== */

    function displayProjects() {

        filteredProjects = getFilteredProjects();


        /* Total pages */

        const totalPages = Math.ceil(
            filteredProjects.length / projectsPerPage
        );


        /* Safety */

        if (currentPage > totalPages) {
            currentPage = totalPages || 1;
        }


        /* Starting position */

        const startIndex =
            (currentPage - 1) * projectsPerPage;


        /* Ending position */

        const endIndex =
            startIndex + projectsPerPage;


        /* Current page projects */

        const visibleProjects =
            filteredProjects.slice(
                startIndex,
                endIndex
            );


        /* Hide every project */

        projectCards.forEach(function (card) {

            card.classList.add("is-hidden");

        });


        /* Show current projects */

        visibleProjects.forEach(function (card) {

            card.classList.remove("is-hidden");

            /* Reset animation */

            card.style.opacity = "0";
            card.style.transform = "translateY(10px)";

            requestAnimationFrame(function () {

                card.style.transition =
                    "opacity 0.35s ease, transform 0.35s ease";

                card.style.opacity = "1";
                card.style.transform = "translateY(0)";

            });

        });


        /* Update information */

        updatePaginationInfo(
            startIndex,
            visibleProjects.length,
            filteredProjects.length
        );


        /* Create pagination buttons */

        createPagination(totalPages);

    }


    /* =====================================================
       PAGINATION INFORMATION
    ===================================================== */

    function updatePaginationInfo(
        startIndex,
        visibleCount,
        totalCount
    ) {

        if (totalCount === 0) {

            paginationInfo.textContent =
                "No projects found.";

            return;
        }


        const firstProject =
            startIndex + 1;

        const lastProject =
            startIndex + visibleCount;


        paginationInfo.textContent =
            `Showing ${firstProject}–${lastProject} of ${totalCount} Projects`;

    }


    /* =====================================================
       CREATE PAGINATION
    ===================================================== */

    function createPagination(totalPages) {

        paginationControls.innerHTML = "";


        /* =================================================
           PREVIOUS BUTTON
        ================================================= */

        const previousButton =
            document.createElement("button");

        previousButton.type = "button";

        previousButton.className =
            "pagination-btn pagination-prev";

        previousButton.innerHTML =
            '<i class="fa-solid fa-angle-left"></i>';

        previousButton.setAttribute(
            "aria-label",
            "Previous page"
        );


        if (currentPage === 1) {

            previousButton.disabled = true;

            previousButton.classList.add("disabled");

        }


        previousButton.addEventListener(
            "click",
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    displayProjects();

                    scrollToProjects();

                }

            }
        );


        paginationControls.appendChild(
            previousButton
        );


        /* =================================================
           PAGE NUMBERS
        ================================================= */

        for (
            let page = 1;
            page <= totalPages;
            page++
        ) {

            const pageButton =
                document.createElement("button");


            pageButton.type = "button";

            pageButton.className =
                "pagination-btn";


            pageButton.textContent =
                page;


            pageButton.setAttribute(
                "aria-label",
                `Go to page ${page}`
            );


            /* Active page */

            if (page === currentPage) {

                pageButton.classList.add("active");

            }


            pageButton.addEventListener(
                "click",
                function () {

                    currentPage = page;

                    displayProjects();

                    scrollToProjects();

                }
            );


            paginationControls.appendChild(
                pageButton
            );

        }


        /* =================================================
           NEXT BUTTON
        ================================================= */

        const nextButton =
            document.createElement("button");

        nextButton.type = "button";

        nextButton.className =
            "pagination-btn pagination-next";

        nextButton.innerHTML =
            '<i class="fa-solid fa-angle-right"></i>';

        nextButton.setAttribute(
            "aria-label",
            "Next page"
        );


        if (currentPage === totalPages) {

            nextButton.disabled = true;

            nextButton.classList.add("disabled");

        }


        nextButton.addEventListener(
            "click",
            function () {

                if (currentPage < totalPages) {

                    currentPage++;

                    displayProjects();

                    scrollToProjects();

                }

            }
        );


        paginationControls.appendChild(
            nextButton
        );

    }


    /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

    function scrollToProjects() {

        const section =
            document.querySelector(".projects-section");


        if (!section) {
            return;
        }


        const header =
            document.querySelector("header");


        const headerHeight =
            header
                ? header.offsetHeight
                : 0;


        const sectionPosition =
            section.getBoundingClientRect().top +
            window.pageYOffset -
            headerHeight -
            20;


        window.scrollTo({

            top: sectionPosition,

            behavior: "smooth"

        });

    }


    /* =====================================================
       FILTER BUTTON CLICK
    ===================================================== */

    filterButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {


                /* Get selected category */

                currentFilter =
                    this.getAttribute(
                        "data-filter"
                    );


                /* Reset to first page */

                currentPage = 1;


                /* Remove active */

                filterButtons.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                /* Add active */

                this.classList.add("active");


                /* Display */

                displayProjects();

            }
        );

    });


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    displayProjects();

});


function parseCounterValue(text) {

    const trimmedText = String(text || "")
        .trim()
        .replace(/\s+/g, " ");

    const match = trimmedText.match(/^([\d,]+(?:\.\d+)?)(.*)$/);

    if (!match) {
        return null;
    }

    return {
        target: Number(match[1].replace(/,/g, "")),
        suffix: match[2] || ""
    };

}

function animateCounter(counter, target, suffix, duration) {

    const animationDuration = duration || 1700;
    const startTime = performance.now();

    counter.textContent = `0${suffix}`;

    function updateCounter(currentTime) {

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / animationDuration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(target * easedProgress);

        counter.textContent = `${currentValue}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = `${Math.round(target)}${suffix}`;
        }

    }

    requestAnimationFrame(updateCounter);

}

function initCounterSection(sectionSelector, counterSelector, options) {

    const section = document.querySelector(sectionSelector);

    if (!section) {
        return;
    }

    const counters = section.querySelectorAll(counterSelector);

    if (!counters.length) {
        return;
    }

    const duration =
        options && options.duration ? options.duration : 1700;

    const useDataTarget =
        options && options.useDataTarget === true;

    const observerOptions = {
        threshold: 0.3,
        rootMargin: "0px 0px -10% 0px"
    };

    let hasAnimated = false;
    const counterData = [];

    counters.forEach(function (counter) {

        if (useDataTarget) {

            const target = Number(
                counter.getAttribute("data-target")
            );

            const suffix = counter
                .querySelector(".why2m-stat-suffix");

            counterData.push({
                element: counter,
                target: target,
                suffix: suffix ? suffix.textContent.trim() : ""
            });

            counter.textContent = "0";
            return;
        }

        const parsedValue = parseCounterValue(counter.textContent);

        if (!parsedValue) {
            return;
        }

        counterData.push({
            element: counter,
            target: parsedValue.target,
            suffix: parsedValue.suffix
        });

        counter.textContent = `0${parsedValue.suffix}`;

    });

    function runAnimation() {

        if (hasAnimated) {
            return;
        }

        hasAnimated = true;

        counterData.forEach(function (counterInfo) {

            animateCounter(
                counterInfo.element,
                counterInfo.target,
                counterInfo.suffix,
                duration
            );

        });

    }

    if (!("IntersectionObserver" in window)) {
        runAnimation();
        return;
    }

    const observer = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {
                    runAnimation();
                    observer.disconnect();
                }

            });

        },
        observerOptions
    );

    observer.observe(section);

}

document.addEventListener("DOMContentLoaded", function () {

    initCounterSection(
        ".why2m-results-section",
        ".why2m-stat-number",
        {
            useDataTarget: true,
            duration: 1700
        }
    );

    initCounterSection(
        ".why-2m-stats",
        ".why-stat strong",
        {
            duration: 1700
        }
    );

    initCounterSection(
        ".about-statistics",
        ".about-stat strong",
        {
            duration: 1700
        }
    );

});

/* =========================================================
   CAREER FILTER
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const filterButtons =
        document.querySelectorAll(
            ".career-filter-btn"
        );

    const jobCards =
        document.querySelectorAll(
            ".career-job-card"
        );


    filterButtons.forEach(button => {

        button.addEventListener("click", function () {

            const filter =
                this.getAttribute("data-filter");


            /* Active button */

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");


            /* Filter cards */

            jobCards.forEach(card => {

                const category =
                    card.getAttribute("data-category");


                if (
                    filter === "all" ||
                    category === filter
                ) {

                    card.classList.remove("hidden");

                } else {

                    card.classList.add("hidden");

                }

            });

        });

    });


    /* =====================================================
       JOB MODAL
    ===================================================== */

    const modal =
        document.getElementById(
            "careerJobModal"
        );

    const modalTitle =
        document.getElementById(
            "careerModalTitle"
        );

    const closeButton =
        document.getElementById(
            "careerModalClose"
        );

    const overlay =
        document.querySelector(
            ".career-modal-overlay"
        );

    const viewButtons =
        document.querySelectorAll(
            ".career-view-position"
        );


    /* Open modal */

    viewButtons.forEach(button => {

        button.addEventListener("click", function () {

            const jobName =
                this.getAttribute("data-job");


            modalTitle.textContent =
                jobName;


            modal.classList.add("active");

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow =
                "hidden";

        });

    });


    /* Close function */

    function closeCareerModal() {

        modal.classList.remove("active");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

    }


    closeButton.addEventListener(
        "click",
        closeCareerModal
    );


    overlay.addEventListener(
        "click",
        closeCareerModal
    );


    /* ESC key */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                modal.classList.contains("active")
            ) {

                closeCareerModal();

            }

        }
    );

});

document.addEventListener("DOMContentLoaded", function () {

    const faqItems =
        document.querySelectorAll(
            ".contact-faq-item"
        );


    faqItems.forEach(item => {

        const question =
            item.querySelector(
                ".contact-faq-question"
            );


        question.addEventListener("click", function () {

            const isActive =
                item.classList.contains("active");


            /* Close all */

            faqItems.forEach(faq => {
                faq.classList.remove("active");
            });


            /* Open clicked item */

            if (!isActive) {
                item.classList.add("active");
            }

        });

    });

});

/* =========================================================
   QUOTE - FILE UPLOAD PREVIEW
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const fileInput =
        document.getElementById("quoteDocuments");

    const fileList =
        document.getElementById("quoteFileList");


    if (!fileInput || !fileList) {
        return;
    }


    fileInput.addEventListener("change", function () {

        fileList.innerHTML = "";

        const files = Array.from(this.files);


        files.forEach(function (file) {

            const item =
                document.createElement("div");

            item.className =
                "quote-file-item";

            item.innerHTML = `
                <span>
                    <i class="fa-regular fa-file"></i>
                    ${file.name}
                </span>

                <i class="fa-solid fa-check"></i>
            `;

            fileList.appendChild(item);

        });

    });

});

/* =========================================================
   QUOTE - FORM SUBMISSION
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const quoteForm =
        document.getElementById("quoteRequestForm");

    const successMessage =
        document.getElementById("quoteSuccessMessage");


    if (!quoteForm) {
        return;
    }


    quoteForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        const submitButton =
            quoteForm.querySelector(
                ".quote-submit-btn"
            );


        const originalText =
            submitButton.innerHTML;


        submitButton.disabled = true;

        submitButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Submitting...
        `;


        const formData =
            new FormData(quoteForm);


        try {

            /*
             * BACKEND ENDPOINT
             *
             * Example:
             *
             * const response = await fetch(
             *     "backend/submit-quote.php",
             *     {
             *         method: "POST",
             *         body: formData
             *     }
             * );
             *
             */


            /*
             * Temporary frontend success
             */

            await new Promise(function (resolve) {
                setTimeout(resolve, 1200);
            });


            successMessage.textContent =
                "Your quote request has been submitted successfully.";

            quoteForm.reset();

            document.getElementById(
                "quoteFileList"
            ).innerHTML = "";


        } catch (error) {

            successMessage.textContent =
                "Something went wrong. Please try again.";

        }


        submitButton.disabled = false;

        submitButton.innerHTML =
            originalText;

    });

});
