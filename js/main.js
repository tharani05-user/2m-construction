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


    /* =====================================================
       CAREER APPLICATION FORM
    ===================================================== */

    const careerForm =
        document.getElementById(
            "careerCvForm"
        );

    const careerFormMessage =
        document.getElementById(
            "careerFormMessage"
        );

    const careerSubmitButton =
        careerForm
            ? careerForm.querySelector(
                ".careers-final-submit"
            )
            : null;

    const careerFileInput =
        document.getElementById(
            "careerCv"
        );

    const careerSuccessModal =
        document.getElementById(
            "careerSuccessModal"
        );

    const careerSuccessClose =
        document.getElementById(
            "careerSuccessClose"
        );

    const careerSuccessBtn =
        document.getElementById(
            "careerSuccessBtn"
        );

    const careerSuccessOverlay =
        careerSuccessModal
            ? careerSuccessModal.querySelector(
                ".career-success-overlay"
            )
            : null;

    const careerAjaxEndpoint =
        "https://formsubmit.co/ajax/2mconstruction@gmail.com";

    const careerSubmitLabel =
        careerSubmitButton
            ? careerSubmitButton.innerHTML
            : "";

    const allowedCareerExtensions = [
        "pdf",
        "doc",
        "docx"
    ];

    const maxCareerFileSize =
        5 * 1024 * 1024;

    let careerSuccessLastFocus = null;

    function setCareerFormMessage(message, isError) {

        if (!careerFormMessage) {
            return;
        }

        careerFormMessage.textContent = message || "";
        careerFormMessage.classList.toggle(
            "is-error",
            Boolean(isError)
        );

    }

    function validateCareerFile(file) {

        if (!file) {
            return "Please upload your CV.";
        }

        const fileName = String(file.name || "");
        const fileExtension = fileName.includes(".")
            ? fileName.split(".").pop().toLowerCase()
            : "";

        if (!allowedCareerExtensions.includes(fileExtension)) {
            return "Please upload a PDF, DOC or DOCX file.";
        }

        if (file.size > maxCareerFileSize) {
            return "Your CV must be 5MB or smaller.";
        }

        return "";

    }

    function openCareerSuccessModal() {

        if (!careerSuccessModal) {
            return;
        }

        careerSuccessLastFocus =
            document.activeElement;

        careerSuccessModal.classList.add("active");
        careerSuccessModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.style.overflow = "hidden";

    }

    function closeCareerSuccessModal() {

        if (!careerSuccessModal) {
            return;
        }

        careerSuccessModal.classList.remove("active");
        careerSuccessModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.style.overflow = "";

        if (
            careerSuccessLastFocus &&
            typeof careerSuccessLastFocus.focus === "function"
        ) {
            careerSuccessLastFocus.focus();
        }

        careerSuccessLastFocus = null;

    }

    if (careerFileInput) {

        careerFileInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files && this.files[0]
                        ? this.files[0]
                        : null;

                if (!file) {
                    setCareerFormMessage("", false);
                    return;
                }

                const validationMessage =
                    validateCareerFile(file);

                if (validationMessage) {

                    setCareerFormMessage(
                        validationMessage,
                        true
                    );

                    this.value = "";
                    return;

                }

                setCareerFormMessage("", false);

            }
        );

    }

    if (careerForm) {

        careerForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (!careerForm.reportValidity()) {
                    return;
                }

                const selectedFile =
                    careerFileInput &&
                    careerFileInput.files &&
                    careerFileInput.files[0]
                        ? careerFileInput.files[0]
                        : null;

                const validationMessage =
                    validateCareerFile(selectedFile);

                if (validationMessage) {

                    setCareerFormMessage(
                        validationMessage,
                        true
                    );

                    return;

                }

                setCareerFormMessage("", false);

                if (!careerSubmitButton) {
                    return;
                }

                careerSubmitButton.disabled = true;
                careerSubmitButton.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Submitting...
                `;

                try {

                    const formData =
                        new FormData(careerForm);

                    const response =
                        await fetch(
                            careerAjaxEndpoint,
                            {
                                method: "POST",
                                headers: {
                                    Accept: "application/json"
                                },
                                body: formData
                            }
                        );

                    let responseData = null;

                    try {
                        responseData =
                            await response.json();
                    } catch (jsonError) {
                        responseData = null;
                    }

                    if (
                        responseData &&
                        responseData.success === false
                    ) {

                        throw new Error(
                            responseData.message ||
                            "Something went wrong while submitting your application. Please try again."
                        );

                    }

                    if (!response.ok) {

                        const errorMessage =
                            responseData &&
                            responseData.message
                                ? responseData.message
                                : "Something went wrong while submitting your application. Please try again.";

                        throw new Error(errorMessage);

                    }

                    careerForm.reset();
                    setCareerFormMessage("", false);
                    openCareerSuccessModal();

                } catch (error) {

                    setCareerFormMessage(
                        "Something went wrong while submitting your application. Please try again.",
                        true
                    );

                } finally {

                    careerSubmitButton.disabled = false;
                    careerSubmitButton.innerHTML =
                        careerSubmitLabel;

                }

            }
        );

    }

    if (careerSuccessClose) {

        careerSuccessClose.addEventListener(
            "click",
            closeCareerSuccessModal
        );

    }

    if (careerSuccessBtn) {

        careerSuccessBtn.addEventListener(
            "click",
            closeCareerSuccessModal
        );

    }

    if (careerSuccessOverlay) {

        careerSuccessOverlay.addEventListener(
            "click",
            closeCareerSuccessModal
        );

    }

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                careerSuccessModal &&
                careerSuccessModal.classList.contains(
                    "active"
                )
            ) {

                closeCareerSuccessModal();

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
   CONTACT - PROJECT ENQUIRY FORM
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const projectEnquiryForm =
        document.getElementById("projectEnquiryForm");

    const contactFormMessage =
        document.getElementById("contactFormMessage");

    const contactSubmitButton =
        projectEnquiryForm
            ? projectEnquiryForm.querySelector(".contact-submit-btn")
            : null;

    const contactSuccessModal =
        document.getElementById("contactSuccessModal");

    const contactSuccessClose =
        document.getElementById("contactSuccessClose");

    const contactSuccessBtn =
        document.getElementById("contactSuccessBtn");

    const contactSuccessOverlay =
        contactSuccessModal
            ? contactSuccessModal.querySelector(".contact-success-overlay")
            : null;

    const contactAjaxEndpoint =
        "https://formsubmit.co/ajax/2mconstruction@gmail.com";

    const contactSubmitLabel =
        contactSubmitButton ? contactSubmitButton.innerHTML : "";

    function setContactFormMessage(message) {

        if (contactFormMessage) {
            contactFormMessage.textContent = message || "";
        }

    }

    function openContactSuccessModal() {

        if (!contactSuccessModal) {
            return;
        }

        contactSuccessModal.classList.add("active");
        contactSuccessModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

    }

    function closeContactSuccessModal() {

        if (!contactSuccessModal) {
            return;
        }

        contactSuccessModal.classList.remove("active");
        contactSuccessModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

    }

    if (projectEnquiryForm && contactSubmitButton) {

        projectEnquiryForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            if (!projectEnquiryForm.reportValidity()) {
                return;
            }

            setContactFormMessage("");
            contactSubmitButton.disabled = true;
            contactSubmitButton.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Sending...
            `;

            try {

                const response = await fetch(contactAjaxEndpoint, {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: new FormData(projectEnquiryForm)
                });

                let responseData = {};

                try {
                    responseData = await response.json();
                } catch (error) {
                    responseData = {};
                }

                if (
                    !response.ok ||
                    responseData.success === false ||
                    responseData.success === "false" ||
                    !responseData.success
                ) {
                    throw new Error("Contact enquiry submission failed");
                }

                projectEnquiryForm.reset();
                setContactFormMessage("");
                openContactSuccessModal();

            } catch (error) {

                setContactFormMessage(
                    "Something went wrong while sending your enquiry. Please try again."
                );

            } finally {

                contactSubmitButton.disabled = false;
                contactSubmitButton.innerHTML = contactSubmitLabel;

            }

        });

    }

    if (contactSuccessClose) {
        contactSuccessClose.addEventListener("click", closeContactSuccessModal);
    }

    if (contactSuccessBtn) {
        contactSuccessBtn.addEventListener("click", closeContactSuccessModal);
    }

    if (contactSuccessOverlay) {
        contactSuccessOverlay.addEventListener("click", closeContactSuccessModal);
    }

    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            contactSuccessModal &&
            contactSuccessModal.classList.contains("active")
        ) {
            closeContactSuccessModal();
        }

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

    const quoteSuccessMessage =
        document.getElementById("quoteSuccessMessage");

    const quoteSuccessModal =
        document.getElementById("quoteSuccessModal");

    const quoteSuccessClose =
        document.getElementById("quoteSuccessClose");

    const quoteSuccessBtn =
        document.getElementById("quoteSuccessBtn");

    const quoteFileList =
        document.getElementById("quoteFileList");

    const submissionEndpoint =
        quoteForm ? (
            quoteForm.getAttribute("action") ||
            "https://formsubmit.co/ajax/2mconstruction@gmail.com"
        ) : "";


    if (!quoteForm) {
        return;
    }


    const submitButton =
        quoteForm.querySelector(".quote-submit-btn");

    let isSubmitting = false;


    function clearQuoteStatusMessage() {

        if (!quoteSuccessMessage) {
            return;
        }

        quoteSuccessMessage.textContent = "";
        quoteSuccessMessage.style.color = "";

    }


    function showQuoteErrorMessage(message) {

        if (!quoteSuccessMessage) {
            return;
        }

        quoteSuccessMessage.textContent = message;
        quoteSuccessMessage.style.color = "#b42318";

    }


    function clearQuoteFileList() {

        if (quoteFileList) {
            quoteFileList.innerHTML = "";
        }

    }


    function openQuoteSuccessModal() {

        if (!quoteSuccessModal) {
            return;
        }

        quoteSuccessModal.classList.add("active");
        quoteSuccessModal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        if (quoteSuccessClose) {
            window.setTimeout(function () {
                quoteSuccessClose.focus();
            }, 0);
        }

    }


    function closeQuoteSuccessModal() {

        if (!quoteSuccessModal) {
            return;
        }

        quoteSuccessModal.classList.remove("active");
        quoteSuccessModal.setAttribute("aria-hidden", "true");

        document.body.style.overflow = "";

    }


    function restoreSubmitButton() {

        if (!submitButton) {
            return;
        }

        submitButton.disabled = false;
        submitButton.innerHTML = submitButton.dataset.originalHtml ||
            "Request My Quote";

    }


    if (submitButton) {
        submitButton.dataset.originalHtml = submitButton.innerHTML;
    }


    quoteForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        clearQuoteStatusMessage();

        if (isSubmitting) {
            return;
        }

        if (!quoteForm.reportValidity()) {
            return;
        }

        if (!submitButton) {
            return;
        }

        isSubmitting = true;

        const originalText =
            submitButton.dataset.originalHtml ||
            submitButton.innerHTML;

        submitButton.dataset.originalHtml = originalText;
        submitButton.disabled = true;
        submitButton.innerHTML = "Sending...";

        const formData = new FormData(quoteForm);


        try {

            const response = await fetch(
                submissionEndpoint,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json"
                    },
                    body: formData
                }
            );

            const responseText = await response.text();

            let responseData = null;

            try {
                responseData = responseText ? JSON.parse(responseText) : null;
            } catch (parseError) {
                responseData = null;
            }

            const submissionSucceeded =
                response.ok &&
                (
                    (responseData && responseData.success) ||
                    (!responseData && /success|thank/i.test(responseText))
                );

            if (!submissionSucceeded) {
                throw new Error(
                    (responseData && responseData.message) ||
                    responseText ||
                    "Something went wrong while submitting your request."
                );
            }

            quoteForm.reset();
            clearQuoteFileList();
            clearQuoteStatusMessage();
            closeQuoteSuccessModal();
            openQuoteSuccessModal();


        } catch (error) {

            showQuoteErrorMessage(
                "Something went wrong while submitting your request. Please try again."
            );

        } finally {

            isSubmitting = false;
            restoreSubmitButton();

        }


    });


    if (quoteSuccessClose) {

        quoteSuccessClose.addEventListener("click", closeQuoteSuccessModal);

    }


    if (quoteSuccessBtn) {

        quoteSuccessBtn.addEventListener("click", closeQuoteSuccessModal);

    }


    if (quoteSuccessModal) {

        const quoteSuccessOverlay =
            quoteSuccessModal.querySelector(".quote-success-overlay");

        if (quoteSuccessOverlay) {

            quoteSuccessOverlay.addEventListener(
                "click",
                closeQuoteSuccessModal
            );

        }

    }


    document.addEventListener("keydown", function (event) {

        if (
            event.key === "Escape" &&
            quoteSuccessModal &&
            quoteSuccessModal.classList.contains("active")
        ) {

            closeQuoteSuccessModal();

        }

    });

});
