
    (() => {
      if (typeof state === "undefined") return;

      const STANDALONE_META_PAGE = document.querySelector('meta[name="lowdim-standalone-page"]')?.getAttribute("content") || "";
      const APP_ROUTE_PAGE = document.documentElement.classList.contains("app-route")
        ? (new URLSearchParams(window.location.search).get("target") || new URLSearchParams(window.location.search).get("page") || new URLSearchParams(window.location.search).get("redirect") || "")
        : "";
      const APP_DEFAULT_PAGE = String(window.LOWDIM_STANDALONE_PAGE || STANDALONE_META_PAGE || APP_ROUTE_PAGE || "twod").replace(/^page-/, "").trim() || "twod";
      const baseSyncAuthView = typeof syncAuthView === "function" ? syncAuthView : null;

      const readLoginTargetPage = (options = {}) => {
        const allowStoredTarget = options.allowStoredTarget === true;
        let target = "";
        const fixedTarget = String(window.LOWDIM_STANDALONE_PAGE || STANDALONE_META_PAGE || APP_ROUTE_PAGE || "").replace(/^page-/, "").trim();
        if (fixedTarget && document.getElementById(`page-${fixedTarget}`)) return fixedTarget;
        try {
          const params = new URLSearchParams(window.location.search);
          target = params.get("target") || params.get("page") || params.get("redirect") || "";
          if (!target && allowStoredTarget && params.get("entry") !== "login") {
            target = sessionStorage.getItem("lowdim-login-target") || "";
          }
        } catch (error) {
          try {
            target = allowStoredTarget ? (sessionStorage.getItem("lowdim-login-target") || "") : "";
          } catch (storageError) {
            target = "";
          }
        }
        target = String(target || "").replace(/^page-/, "").trim();
        return document.getElementById(`page-${target}`) ? target : APP_DEFAULT_PAGE;
      };

      const clearStoredSession = () => {
        try {
          sessionStorage.removeItem("lowdim-authenticated");
          sessionStorage.removeItem("lowdim-login-user");
          sessionStorage.removeItem("lowdim-login-target");
          sessionStorage.removeItem("lowdim-login-role");
        } catch (error) {
          console.warn("登录会话清理失败", error);
        }
      };

      const writeStoredSession = (user, page) => {
        try {
          sessionStorage.setItem("lowdim-authenticated", "true");
          sessionStorage.setItem("lowdim-login-user", user || "researcher");
          sessionStorage.setItem("lowdim-login-target", page || APP_DEFAULT_PAGE);
          sessionStorage.setItem("lowdim-login-role", state.loginRole || "researcher");
        } catch (error) {
          console.warn("登录会话写入失败", error);
        }
      };

      const goPortal = () => {
        clearStoredSession();
        window.location.href="portal.html";
      };

      const normalizeTopbarSessionActions = () => {
        const portalBtn = document.getElementById("portalReturnBtn");
        if (portalBtn) {
          portalBtn.textContent = "返回门户";
          portalBtn.onclick = null;
        }

        const chipName = document.getElementById("userChipName") || document.querySelector(".user-chip span:not(.user-menu-arrow)");
        if (chipName) chipName.textContent = state.loginRole === "researcher" ? "普通用户" : "管理员9527";

        const dropdown = document.getElementById("userDropdown");
        if (dropdown && !dropdown.querySelector('[data-action="portal"]')) {
          const divider = dropdown.querySelector(".user-dropdown-divider");
          const item = document.createElement("div");
          item.className = "user-dropdown-item";
          item.dataset.action = "portal";
          item.innerHTML = '<span class="user-dropdown-icon">⌂</span><span>返回门户</span>';
          dropdown.insertBefore(item, divider || dropdown.firstChild);
        }
      };

      const removeDuplicateAuthNodes = () => {
        const forms = [...document.querySelectorAll("#loginForm")];
        forms.slice(1).forEach((node) => node.remove());
        const registerForms = [...document.querySelectorAll("#registerForm")];
        registerForms.slice(1).forEach((node) => node.remove());
        const submitButtons = [...document.querySelectorAll("#loginShell .login-submit")];
        submitButtons.forEach((button, index) => {
          const form = button.closest("form");
          if (index > 0 && form?.id !== "loginForm") button.remove();
        });
      };

      function bindLoginShellInteractions() {
        removeDuplicateAuthNodes();
        const form = document.getElementById("loginForm");
        if (form && form.dataset.standardLoginBound !== "true") {
          const clone = form.cloneNode(true);
          clone.dataset.standardLoginBound = "true";
          form.replaceWith(clone);
          clone.addEventListener("submit", handleLoginSubmit);
          clone.querySelector("[data-standard-login-submit]")?.addEventListener("click", handleLoginSubmit);
        }
        document.querySelector("#loginForm [data-standard-login-submit]")?.addEventListener("click", handleLoginSubmit);

        document.getElementById("loginCaptchaRefresh")?.addEventListener("click", () => {
          setLoginError("");
          generateLoginCaptcha();
        });

        const registerForm = document.getElementById("registerForm");
        if (registerForm && registerForm.dataset.standardRegisterBound !== "true") {
          const clone = registerForm.cloneNode(true);
          clone.dataset.standardRegisterBound = "true";
          registerForm.replaceWith(clone);
          if (typeof handleRegisterSubmitOverride === "function") {
            clone.addEventListener("submit", handleRegisterSubmitOverride);
          }
        }

        document.getElementById("registerCaptchaRefresh")?.addEventListener("click", () => {
          if (typeof setRegisterErrorOverride === "function") setRegisterErrorOverride("");
          if (typeof generateRegisterCaptchaOverride === "function") generateRegisterCaptchaOverride();
        });
      }

      handleLoginSubmit = function handleLoginSubmitWithStandardFlow(event) {
        event.preventDefault();
        const selectedRole = state.loginRole === "researcher" ? "researcher" : "admin";
        const account = selectedRole === "admin" ? "admin" : "researcher";
        const requestedTargetPage = readLoginTargetPage();
        const targetPage = selectedRole === "researcher" && requestedTargetPage === "twod" ? "data-submit" : requestedTargetPage;
        state.isAuthenticated = true;
        state.loginUser = account;
        state.loginRole = selectedRole;
        state.page = targetPage;
        writeStoredSession(account, targetPage);
        if (window.history?.replaceState) {
          window.history.replaceState(null, "", window.location.pathname + window.location.hash);
        }
        if (typeof syncAuthView === "function") syncAuthView();
        if (typeof switchPage === "function") switchPage(targetPage);
        if (typeof setUserRole === "function") setUserRole(selectedRole);
        else if (typeof applyRoleVisibility === "function") applyRoleVisibility();
        if (typeof showToast === "function") showToast("登录成功", selectedRole === "admin" ? "已进入管理员工作台。" : "已进入普通用户工作台。");
      };

      handleLogout = function handleLogoutToPortal() {
        state.isAuthenticated = false;
        state.loginUser = "";
        state.page = APP_DEFAULT_PAGE;
        goPortal();
      };

      syncAuthView = function syncAuthViewWithStandardFlow() {
        if (baseSyncAuthView) baseSyncAuthView();
        if (state.isAuthenticated) {
          normalizeTopbarSessionActions();
        } else {
          bindLoginShellInteractions();
        }
      };

      bindLoginInteractions = function bindLoginInteractionsWithStandardFlow() {
        bindLoginShellInteractions();
      };

      if (!document.body.dataset.standardPortalFlowBound) {
        document.body.dataset.standardPortalFlowBound = "true";
        document.body.addEventListener("click", (event) => {
          const loginButton = event.target.closest?.("#loginShell .login-submit");
          if (!loginButton || !loginButton.closest("#loginForm")) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (typeof handleLoginSubmit === "function") {
            handleLoginSubmit(event);
          }
        }, true);
        document.body.addEventListener("submit", (event) => {
          if (!event.target.closest?.("#loginForm")) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          if (typeof handleLoginSubmit === "function") {
            handleLoginSubmit(event);
          }
        }, true);
        document.body.addEventListener("click", (event) => {
          const portalButton = event.target.closest?.("#portalReturnBtn");
          const dropdownItem = event.target.closest?.(".user-dropdown-item");
          const action = dropdownItem?.dataset?.action || "";
          if (portalButton || action === "portal" || action === "logout") {
            event.preventDefault();
            event.stopImmediatePropagation();
            goPortal();
          }
        }, true);
      }

      const params = new URLSearchParams(window.location.search);
      const isLoginEntry = params.get("entry") === "login";
      const isStandaloneAppPage = !!STANDALONE_META_PAGE || document.documentElement.classList.contains("app-route");
      let shouldRestoreSession = false;
      let storedUser = "";
      try {
        if (isLoginEntry) {
          clearStoredSession();
        }
        shouldRestoreSession = !isLoginEntry && sessionStorage.getItem("lowdim-authenticated") === "true";
        storedUser = sessionStorage.getItem("lowdim-login-user") || "researcher";
        state.loginRole = sessionStorage.getItem("lowdim-login-role") || state.loginRole || "researcher";
      } catch (error) {
        shouldRestoreSession = false;
      }

      if (isStandaloneAppPage) {
        const targetPage = APP_DEFAULT_PAGE;
        const standaloneRole = state.loginRole === "admin" ? "admin" : "researcher";
        const standaloneUser = standaloneRole === "admin" ? "admin" : "researcher";
        state.isAuthenticated = true;
        state.loginUser = standaloneUser;
        state.loginRole = standaloneRole;
        state.page = targetPage;
        syncAuthView();
        if (typeof setUserRole === "function") setUserRole(standaloneRole);
        if (typeof switchPage === "function") switchPage(targetPage);
      } else if (shouldRestoreSession) {
        const targetPage = readLoginTargetPage({ allowStoredTarget: true });
        state.isAuthenticated = true;
        state.loginUser = storedUser;
        state.page = targetPage;
        syncAuthView();
        if (typeof setUserRole === "function") setUserRole(state.loginRole === "researcher" ? "researcher" : "admin");
        if (typeof switchPage === "function") switchPage(targetPage);
      } else {
        state.isAuthenticated = false;
        state.loginUser = "";
        state.page = APP_DEFAULT_PAGE;
        syncAuthView();
      }
    })();
  