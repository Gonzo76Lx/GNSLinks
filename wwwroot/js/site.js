document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Theme Toggle Logic ---
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const sunIcon = themeToggleBtn?.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn?.querySelector(".moon-icon");

    const getStoredTheme = () => localStorage.getItem("gnslinks-theme") || "light";
    const setStoredTheme = theme => localStorage.setItem("gnslinks-theme", theme);

    const applyTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        if (sunIcon && moonIcon) {
            if (theme === "dark") {
                sunIcon.style.display = "block";
                moonIcon.style.display = "none";
            } else {
                sunIcon.style.display = "none";
                moonIcon.style.display = "block";
            }
        }
    };

    applyTheme(getStoredTheme());

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            applyTheme(newTheme);
            setStoredTheme(newTheme);
        });
    }

    // Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const appSidebar = document.getElementById("appSidebar");
    if (mobileMenuBtn && appSidebar) {
        mobileMenuBtn.addEventListener("click", () => {
            appSidebar.classList.toggle("show");
        });
    }

    // --- 2. Live Search & Category Filtering Logic ---
    const searchInput = document.getElementById("linkSearchInput");
    const filterPills = document.querySelectorAll(".filter-pill[data-filter]");
    const modernCards = document.querySelectorAll(".modern-card");
    const dashCards = document.querySelectorAll(".dash-card");
    const emptyState = document.getElementById("emptyState");
    const totalCountSpan = document.getElementById("totalCount");

    let activeCategory = "all";

    const updateLinkCounts = () => {
        let totalVisibleLinks = 0;
        const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

        // Process modern cards (each card is one link)
        modernCards.forEach(card => {
            const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
            const text = card.textContent.toLowerCase();
            const keywords = card.getAttribute("data-keywords") ? card.getAttribute("data-keywords").toLowerCase() : "";
            const href = card.querySelector("a") ? card.querySelector("a").getAttribute("href").toLowerCase() : "";
            
            const matchesQuery = query === "" || text.includes(query) || keywords.includes(query) || href.includes(query);

            if (categoryMatch && matchesQuery) {
                card.style.display = "";
                totalVisibleLinks++;
            } else {
                card.style.display = "none";
            }
        });

        // Process dash cards (Docker, etc. which have items inside)
        dashCards.forEach(card => {
            const categoryMatch = activeCategory === "all" || card.dataset.category === activeCategory;
            
            if (!categoryMatch) {
                card.style.display = "none";
                return;
            }

            const items = card.querySelectorAll(".link-item, .copy-item, .code-block-wrapper");
            let visibleItemsInCard = 0;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const keywords = item.getAttribute("data-keywords") ? item.getAttribute("data-keywords").toLowerCase() : "";
                const anchor = item.querySelector("a");
                const href = anchor ? anchor.getAttribute("href").toLowerCase() : "";

                const matchesQuery = query === "" || text.includes(query) || keywords.includes(query) || href.includes(query);

                if (matchesQuery) {
                    item.style.display = "";
                    visibleItemsInCard++;
                } else {
                    item.style.display = "none";
                }
            });

            if (visibleItemsInCard > 0) {
                card.style.display = "";
                totalVisibleLinks += visibleItemsInCard;
            } else {
                card.style.display = "none";
            }
        });

        if (totalCountSpan) {
            totalCountSpan.textContent = `(${totalVisibleLinks})`;
        }

        if (emptyState) {
            emptyState.style.display = totalVisibleLinks === 0 ? "block" : "none";
        }
    };

    if (searchInput) {
        searchInput.addEventListener("input", updateLinkCounts);

        // Shortcut listener ('/' or 'Ctrl+K')
        document.addEventListener("keydown", (e) => {
            if ((e.key === "/" || (e.ctrlKey && e.key === "k")) && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            } else if (e.key === "Escape" && document.activeElement === searchInput) {
                searchInput.value = "";
                updateLinkCounts();
                searchInput.blur();
            }
        });
    }

    if (filterPills) {
        filterPills.forEach(item => {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                filterPills.forEach(i => i.classList.remove("active"));
                item.classList.add("active");
                activeCategory = item.getAttribute("data-filter");
                updateLinkCounts();
            });
        });
    }

    // Initial count run
    updateLinkCounts();

    // --- 3. Copy To Clipboard Toast ---
    const copyToast = document.getElementById("copyToast");
    const copyToastMsg = document.getElementById("copyToastMessage");
    let toastTimeout;

    const showToast = (message) => {
        if (!copyToast) return;
        if (copyToastMsg) copyToastMsg.textContent = message;

        copyToast.classList.add("show");
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            copyToast.classList.remove("show");
        }, 2500);
    };

    document.addEventListener("click", (e) => {
        const copyBtn = e.target.closest("[data-copy]");
        if (!copyBtn) return;

        const textToCopy = copyBtn.getAttribute("data-copy");
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.classList.add("copied");
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = `✓ Copiado`;

            showToast(`"${textToCopy.length > 25 ? textToCopy.substring(0, 25) + '...' : textToCopy}" copiado!`);

            setTimeout(() => {
                copyBtn.classList.remove("copied");
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error("Falha ao copiar:", err);
            showToast("Erro ao copiar para a área de transferência.");
        });
    });
});
