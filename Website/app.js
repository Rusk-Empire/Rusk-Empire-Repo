import {
  baseLayerLuminance,
  StandardLuminance
} from 'https://unpkg.com/@fluentui/web-components@2.6.1';

const LISTING_URL = "{{ listingInfo.Url }}";

const PACKAGES = {
{{~ for package in packages ~}}
  "{{ package.Name }}": {
    name: "{{ package.Name }}",
    displayName: "{{ if package.DisplayName; package.DisplayName; end; }}",
    description: "{{ if package.Description; package.Description; end; }}",
    version: "{{ package.Version }}",
    author: {
      name: "{{ if package.Author.Name; package.Author.Name; end; }}",
      url: "{{ if package.Author.Url; package.Author.Url; end; }}",
    },
    dependencies: {
      {{~ for dependency in package.Dependencies ~}}
        "{{ dependency.Name }}": "{{ dependency.Version }}",
      {{~ end ~}}
    },
    keywords: [
      {{~ for keyword in package.Keywords ~}}
        "{{ keyword }}",
      {{~ end ~}}
    ],
    license: "{{ package.License }}",
    licensesUrl: "{{ package.LicensesUrl }}",
  },
{{~ end ~}}
};

const setTheme = () => {
  const isDarkTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (isDarkTheme()) {
    baseLayerLuminance.setValueFor(
      document.documentElement,
      StandardLuminance.DarkMode
    );
  } else {
    baseLayerLuminance.setValueFor(
      document.documentElement,
      StandardLuminance.LightMode
    );
  }
};

// COPY FUNCTION
async function copyTextToClipboard(text, button) {
  const originalText = button.textContent;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";

      document.body.appendChild(field);
      field.select();

      const copied = document.execCommand("copy");
      field.remove();

      if (!copied) {
        throw new Error("Clipboard copy was blocked");
      }
    }

    button.textContent = "Copied!";

    setTimeout(() => {
      button.textContent = originalText;
    }, 1500);

  } catch (error) {
    console.error("Copy failed:", error);

    button.textContent = "Copy failed";

    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
  }
}

// ADD TO VCC FUNCTION
function addRepositoryToVCC(url) {
  const repositoryUrl = (url || "").trim();

  if (!/^https?:\/\//i.test(repositoryUrl)) {
    alert("The repository URL is missing or invalid.");
    return;
  }

  window.location.href =
    `vcc://vpm/addRepo?url=${encodeURIComponent(repositoryUrl)}`;
}

(() => {
  setTheme();

  window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).addEventListener("change", () => {
    setTheme();
  });

  const packageGrid = document.getElementById("packageGrid");

  // PACKAGE SEARCH
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", ({ target: { value = "" } }) => {
    const items = packageGrid.querySelectorAll(
      'fluent-data-grid-row[row-type="default"]'
    );

    items.forEach(item => {
      if (value === "") {
        item.style.display = "grid";
        return;
      }

      if (
        item.dataset?.packageName?.toLowerCase()?.includes(value.toLowerCase()) ||
        item.dataset?.packageId?.toLowerCase()?.includes(value.toLowerCase())
      ) {
        item.style.display = "grid";
      } else {
        item.style.display = "none";
      }
    });
  });

  // HELP BUTTON
  const urlBarHelpButton = document.getElementById("urlBarHelp");
  const addListingToVccHelp =
    document.getElementById("addListingToVccHelp");

  urlBarHelpButton.addEventListener("click", () => {
    addListingToVccHelp.hidden = false;
  });

  const addListingToVccHelpClose =
    document.getElementById("addListingToVccHelpClose");

  addListingToVccHelpClose.addEventListener("click", () => {
    addListingToVccHelp.hidden = true;
  });

  // HELP WINDOW COPY BUTTON
  const vccListingInfoUrlFieldCopy =
    document.getElementById("vccListingInfoUrlFieldCopy");

  vccListingInfoUrlFieldCopy.addEventListener("click", () => {
    const field = document.getElementById("vccListingInfoUrlField");

    copyTextToClipboard(
      field.value,
      vccListingInfoUrlFieldCopy
    );
  });

  // MAIN ADD TO VCC BUTTON
  const vccAddRepoButton =
    document.getElementById("vccAddRepoButton");

  vccAddRepoButton.addEventListener("click", () => {
    const field = document.getElementById("vccUrlField");

    addRepositoryToVCC(field?.value || LISTING_URL);
  });

  // MAIN COPY BUTTON
  const vccUrlFieldCopy =
    document.getElementById("vccUrlFieldCopy");

  vccUrlFieldCopy.addEventListener("click", () => {
    const field = document.getElementById("vccUrlField");

    copyTextToClipboard(
      field.value,
      vccUrlFieldCopy
    );
  });

  // PACKAGE MORE MENU
  const rowMoreMenu = document.getElementById("rowMoreMenu");

  const hideRowMoreMenu = e => {
    if (rowMoreMenu.contains(e.target)) return;

    document.removeEventListener("click", hideRowMoreMenu);
    rowMoreMenu.hidden = true;
  };

  const rowMenuButtons =
    document.querySelectorAll(".rowMenuButton");

  rowMenuButtons.forEach(button => {
    button.addEventListener("click", e => {
      if (rowMoreMenu?.hidden) {
        rowMoreMenu.style.top =
          `${e.clientY + e.target.clientHeight}px`;

        rowMoreMenu.style.left =
          `${e.clientX - 120}px`;

        rowMoreMenu.hidden = false;

        const downloadLink =
          rowMoreMenu.querySelector("#rowMoreMenuDownload");

        const downloadListener = () => {
          window.open(
            e?.target?.dataset?.packageUrl,
            "_blank"
          );
        };

        downloadLink.addEventListener("change", () => {
          downloadListener();
          downloadLink.removeEventListener(
            "change",
            downloadListener
          );
        });

        setTimeout(() => {
          document.addEventListener(
            "click",
            hideRowMoreMenu
          );
        }, 1);
      }
    });
  });

  // PACKAGE INFORMATION MODAL
  const packageInfoModal =
    document.getElementById("packageInfoModal");

  const packageInfoModalClose =
    document.getElementById("packageInfoModalClose");

  packageInfoModalClose.addEventListener("click", () => {
    packageInfoModal.hidden = true;
  });

  const modalControl =
    packageInfoModal.shadowRoot.querySelector(".control");

  modalControl.style.maxHeight = "90%";
  modalControl.style.transition = "height 0.2s ease-in-out";
  modalControl.style.overflowY = "hidden";

  const packageInfoName =
    document.getElementById("packageInfoName");

  const packageInfoId =
    document.getElementById("packageInfoId");

  const packageInfoVersion =
    document.getElementById("packageInfoVersion");

  const packageInfoDescription =
    document.getElementById("packageInfoDescription");

  const packageInfoAuthor =
    document.getElementById("packageInfoAuthor");

  const packageInfoDependencies =
    document.getElementById("packageInfoDependencies");

  const packageInfoKeywords =
    document.getElementById("packageInfoKeywords");

  const packageInfoLicense =
    document.getElementById("packageInfoLicense");

  // PACKAGE ADD TO VCC BUTTONS
  const rowAddToVccButtons =
    document.querySelectorAll(".rowAddToVccButton");

  rowAddToVccButtons.forEach(button => {
    button.addEventListener("click", () => {
      const field = document.getElementById("vccUrlField");

      addRepositoryToVCC(field?.value || LISTING_URL);
    });
  });

  // PACKAGE INFORMATION BUTTONS
  const rowPackageInfoButton =
    document.querySelectorAll(".rowPackageInfoButton");

  rowPackageInfoButton.forEach(button => {
    button.addEventListener("click", e => {
      const packageId = e.target.dataset?.packageId;
      const packageInfo = PACKAGES?.[packageId];

      if (!packageInfo) {
        console.error(
          `Did not find package ${packageId}. Packages available:`,
          PACKAGES
        );
        return;
      }

      packageInfoName.textContent =
        packageInfo.displayName;

      packageInfoId.textContent = packageId;

      packageInfoVersion.textContent =
        `v${packageInfo.version}`;

      packageInfoDescription.textContent =
        packageInfo.description;

      packageInfoAuthor.textContent =
        packageInfo.author.name;

      packageInfoAuthor.href =
        packageInfo.author.url;

      if ((packageInfo.keywords?.length ?? 0) === 0) {
        packageInfoKeywords.parentElement.classList.add("hidden");
      } else {
        packageInfoKeywords.parentElement.classList.remove("hidden");
        packageInfoKeywords.innerHTML = null;

        packageInfo.keywords.forEach(keyword => {
          const keywordDiv = document.createElement("div");

          keywordDiv.classList.add(
            "me-2",
            "mb-2",
            "badge"
          );

          keywordDiv.textContent = keyword;

          packageInfoKeywords.appendChild(keywordDiv);
        });
      }

      if (
        !packageInfo.license?.length &&
        !packageInfo.licensesUrl?.length
      ) {
        packageInfoLicense.parentElement.classList.add("hidden");
      } else {
        packageInfoLicense.parentElement.classList.remove("hidden");

        packageInfoLicense.textContent =
          packageInfo.license ?? "See License";

        packageInfoLicense.href =
          packageInfo.licensesUrl ?? "#";
      }

      packageInfoDependencies.innerHTML = null;

      Object.entries(packageInfo.dependencies).forEach(
        ([name, version]) => {
          const depRow = document.createElement("li");

          depRow.classList.add("mb-2");

          depRow.textContent =
            `${name} @ v${version}`;

          packageInfoDependencies.appendChild(depRow);
        }
      );

      packageInfoModal.hidden = false;

      setTimeout(() => {
        const height =
          packageInfoModal.querySelector(".col").clientHeight;

        modalControl.style.setProperty(
          "--dialog-height",
          `${height + 14}px`
        );
      }, 1);
    });
  });

  // PACKAGE INFORMATION COPY BUTTON
  const packageInfoVccUrlFieldCopy =
    document.getElementById("packageInfoVccUrlFieldCopy");

  packageInfoVccUrlFieldCopy.addEventListener("click", () => {
    const field =
      document.getElementById("packageInfoVccUrlField");

    copyTextToClipboard(
      field.value,
      packageInfoVccUrlFieldCopy
    );
  });

  // PACKAGE INFORMATION HELP BUTTON
  const packageInfoListingHelp =
    document.getElementById("packageInfoListingHelp");

  packageInfoListingHelp.addEventListener("click", () => {
    addListingToVccHelp.hidden = false;
  });

})();
