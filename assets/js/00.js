
    (function () {
      const params = new URLSearchParams(window.location.search);
      const isLoginEntry = params.get("entry") === "login";
      const isAppEntry = params.get("entry") === "app" || params.get("mode") === "app";
      const isPortalEntry = isLoginEntry || params.get("from") === "portal";
      let hasAppSession = false;
      try {
        hasAppSession = sessionStorage.getItem("lowdim-authenticated") === "true";
        if (isLoginEntry) {
          sessionStorage.removeItem("lowdim-authenticated");
          sessionStorage.removeItem("lowdim-login-user");
          sessionStorage.removeItem("lowdim-login-target");
          sessionStorage.removeItem("lowdim-login-role");
        }
      } catch (error) {
        hasAppSession = false;
      }
      const requestedPage = params.get("target") || params.get("page") || params.get("redirect") || "";
      if (isAppEntry) {
        document.documentElement.classList.add("app-route");
      }
      if (requestedPage) {
        try {
          sessionStorage.setItem("lowdim-login-target", requestedPage.replace(/^page-/, ""));
        } catch (error) {
          console.warn("登录目标页缓存失败", error);
        }
      }
    })();
  