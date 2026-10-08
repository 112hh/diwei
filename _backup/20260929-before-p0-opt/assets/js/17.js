
  (() => {
    if (window.__LOWDIM_STANDARD_MANAGEMENT_MENU_READY__) return;
    window.__LOWDIM_STANDARD_MANAGEMENT_MENU_READY__ = true;

    const MANAGE_PAGE = "standard-system-manage";

    function ensureLowdimStandardManageMeta() {
      try {
        if (typeof PAGE_LAYOUT !== "undefined" && !PAGE_LAYOUT[MANAGE_PAGE]) {
          PAGE_LAYOUT[MANAGE_PAGE] = {
            group: "standards",
            portal: "system",
            title: "低维材料标准体系管理",
            breadcrumbParent: "低维材料标准体系"
          };
        }
        if (typeof SYSTEM_PAGE_META !== "undefined" && !SYSTEM_PAGE_META[MANAGE_PAGE]) {
          SYSTEM_PAGE_META[MANAGE_PAGE] = {
            group: "standards",
            portal: "system",
            title: "低维材料标准体系管理",
            breadcrumbParent: "低维材料标准体系"
          };
        }
        if (typeof systemStore !== "undefined" && Array.isArray(systemStore.menus) && !systemStore.menus.some((item) => item.path === "/standards/manage")) {
          systemStore.menus.push({
            id: 231,
            menuName: "低维材料标准体系管理",
            level: 1,
            type: "菜单",
            parent: "低维材料标准体系",
            path: "/standards/manage",
            perms: "standards:manage:list",
            icon: "standard",
            orderNum: 2,
            status: "启用"
          });
        }
      } catch (error) {
        console.warn("低维材料标准体系管理元信息注册失败", error);
      }
    }

    function ensureLowdimStandardManageMenu() {
      const standardsNav = document.querySelector('.sidebar-group[data-group="standards"] .nav');
      if (!standardsNav || standardsNav.querySelector(`[data-page="${MANAGE_PAGE}"]`)) return;
      const current = standardsNav.querySelector('[data-page="standard-twod"]');
      const menuHtml = `
        <button class="nav-btn lowdim-standard-manage-nav" data-group="standards" data-page="${MANAGE_PAGE}" data-label="低维材料标准体系管理" type="button">
          <span>低维材料标准体系管理</span>
        </button>
      `;
      if (current) current.insertAdjacentHTML("afterend", menuHtml);
      else standardsNav.insertAdjacentHTML("beforeend", menuHtml);
      standardsNav.querySelector(`[data-page="${MANAGE_PAGE}"]`)?.addEventListener("click", () => {
        if (typeof switchPage === "function") switchPage(MANAGE_PAGE);
      });
    }

    function ensureLowdimStandardManagePage() {
      if (document.getElementById(`page-${MANAGE_PAGE}`)) return;
      const source = document.getElementById("page-standard-twod");
      const section = document.createElement("section");
      section.className = "page";
      section.id = `page-${MANAGE_PAGE}`;
      if (source?.parentNode) source.parentNode.insertBefore(section, source.nextSibling);
      else document.querySelector("main")?.appendChild(section);
    }

    function ensureLowdimStandardManageStyles() {
      let style = document.getElementById("lowdim-standard-management-menu-style");
      if (!style) {
        style = document.createElement("style");
        style.id = "lowdim-standard-management-menu-style";
        document.head.appendChild(style);
      }
      const clonedRules = Array.from(document.querySelectorAll("style"))
        .filter((node) => node.id !== "lowdim-standard-management-menu-style")
        .map((node) => node.textContent || "")
        .filter((text) => text.includes("#page-standard-twod"))
        .map((text) => text.replaceAll("#page-standard-twod", `#page-${MANAGE_PAGE}`))
        .join("\n");
      style.textContent = `
        ${clonedRules}
      `;
    }

    function syncLowdimStandardManagePage() {
      if (state?.page !== MANAGE_PAGE) return;
      const source = document.getElementById("page-standard-twod");
      const target = document.getElementById(`page-${MANAGE_PAGE}`);
      if (!source || !target) return;
      target.innerHTML = source.innerHTML;
      target.querySelector(".lowdim-standard-head h2")?.replaceChildren(document.createTextNode("低维材料标准体系管理"));
      const eyebrow = target.querySelector(".lowdim-standard-head .twod-search-eyebrow");
      if (eyebrow) eyebrow.textContent = "低维材料标准体系";
    }

    function renderLowdimStandardManagePage() {
      // 角色兜底：标准体系管理页为管理员专属，普通用户身份下不渲染管理内容。
      const role = document.body.dataset.userRole || "";
      if (role && role !== "admin") {
        if (typeof showToast === "function") showToast("权限不足", "低维材料标准体系管理仅管理员可维护，您可以查看低维材料标准体系。");
        return;
      }
      ensureLowdimStandardManagePage();
      if (typeof renderTwodStandardPage === "function") renderTwodStandardPage();
      ensureLowdimStandardManageStyles();
      syncLowdimStandardManagePage();
    }

    ensureLowdimStandardManageMeta();
    ensureLowdimStandardManageMenu();
    ensureLowdimStandardManagePage();
    ensureLowdimStandardManageStyles();

    const baseSwitchPage = typeof switchPage === "function" ? switchPage : null;
    if (baseSwitchPage && !baseSwitchPage.__lowdimStandardManagePatched) {
      const patchedSwitchPage = function switchPageWithLowdimStandardManage(page) {
        baseSwitchPage(page);
        if (page === MANAGE_PAGE) renderLowdimStandardManagePage();
      };
      patchedSwitchPage.__lowdimStandardManagePatched = true;
      switchPage = patchedSwitchPage;
      if (window.MarvisRouter) {
        window.MarvisRouter.go = function(pageId) {
          const cleanId = String(pageId || "").startsWith("page-") ? String(pageId).slice(5) : pageId;
          switchPage(cleanId);
        };
      }
    }

    document.body.addEventListener("click", () => {
      if (state?.page === MANAGE_PAGE) setTimeout(syncLowdimStandardManagePage, 0);
    });
    document.body.addEventListener("input", () => {
      if (state?.page === MANAGE_PAGE) setTimeout(syncLowdimStandardManagePage, 0);
    });
    document.body.addEventListener("change", () => {
      if (state?.page === MANAGE_PAGE) setTimeout(syncLowdimStandardManagePage, 0);
    });

    if (state?.page === MANAGE_PAGE) renderLowdimStandardManagePage();
  })();
  