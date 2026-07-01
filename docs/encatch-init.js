/**
 * Encatch Web SDK integration for Mintlify docs feedback.
 *
 * Requires encatch-config.js (copy from encatch-config.js.example) to set
 * window.__ENCATCH_CONFIG__ before this script runs.
 */
(function () {
  var SDK_URL =
    'https://cdn.jsdelivr.net/npm/@encatch/web-sdk@1.4.0/dist/encatch.iife.js';
  var initPromise = null;

  function getConfig() {
    return window.__ENCATCH_CONFIG__ || {};
  }

  function getEncatch() {
    return window._encatch;
  }

  function detectLocale() {
    return 'en';
  }

  function toAbsolutePageUrl(pageUrl) {
    return new URL(pageUrl, window.location.origin).href;
  }

  function toEncatchHostUrl(value) {
    var trimmed = (value || '').trim();
    if (!trimmed) {
      return undefined;
    }
    if (trimmed.indexOf('http://') === 0 || trimmed.indexOf('https://') === 0) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  function getMintlifyTheme() {
    if (typeof document === 'undefined') {
      return 'light';
    }
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }

  function buildEncatchInitConfig(config, options) {
    var initConfig = {
      theme: (options && options.theme) || getMintlifyTheme(),
    };
    var webHost = toEncatchHostUrl(config.webHost);
    var apiHost = toEncatchHostUrl(config.apiHost);
    if (webHost) {
      initConfig.webHost = webHost;
    }
    if (apiHost) {
      initConfig.apiBaseUrl = apiHost;
    }
    return initConfig;
  }

  function loadSdk() {
    if (initPromise) {
      return initPromise;
    }

    initPromise = new Promise(function (resolve, reject) {
      if (getEncatch()) {
        resolve(getEncatch());
        return;
      }

      var onReady = function () {
        if (getEncatch()) {
          resolve(getEncatch());
        } else {
          reject(new Error('Encatch SDK loaded but _encatch is unavailable'));
        }
      };

      if (typeof load === 'function') {
        load(SDK_URL).then(onReady).catch(reject);
        return;
      }

      var script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.onload = onReady;
      script.onerror = function () {
        reject(new Error('Failed to load Encatch SDK from CDN'));
      };
      document.head.appendChild(script);
    });

    return initPromise;
  }

  function ensureEncatchInitialized(options) {
    var config = getConfig();
    var apiKey = (config.publishableKey || '').trim();
    if (!apiKey) {
      console.warn(
        'Encatch publishableKey is not set. Copy encatch-config.js.example to encatch-config.js and add your key.',
      );
      return Promise.resolve(false);
    }

    return loadSdk()
      .then(function (encatch) {
        if (!encatch._initialized) {
          encatch.init(apiKey, buildEncatchInitConfig(config, options));
        }
        return true;
      })
      .catch(function (error) {
        console.error('Encatch init failed:', error);
        return false;
      });
  }

  function syncEncatchLocale(locale) {
    return ensureEncatchInitialized().then(function (ready) {
      if (!ready) {
        return;
      }
      var normalized = (locale || '').trim();
      if (!normalized) {
        return;
      }
      getEncatch().setLocale(normalized);
    });
  }

  function syncEncatchTheme(theme) {
    return ensureEncatchInitialized({ theme: theme || getMintlifyTheme() }).then(
      function (ready) {
        if (!ready) {
          return;
        }
        getEncatch().setTheme(theme || getMintlifyTheme());
      },
    );
  }

  var themeObserver = null;

  function watchMintlifyTheme() {
    if (typeof document === 'undefined' || themeObserver) {
      return;
    }

    themeObserver = new MutationObserver(function () {
      syncEncatchTheme(getMintlifyTheme());
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }

  function openDocumentationFeedbackForm(pageUrl, route, locale, helpfulVote) {
    var config = getConfig();
    var formSlug = (config.formSlug || '').trim();
    var feedbackTypeQuestionSlug = (config.feedbackTypeQuestionSlug || '').trim();
    var pageUrlQuestionSlug = (config.pageUrlQuestionSlug || '').trim();
    var helpfulChoiceQuestionSlug = (config.helpfulChoiceQuestionSlug || '').trim();

    if (!formSlug) {
      console.warn('formSlug is not set in encatch-config.js');
      return;
    }
    if (!feedbackTypeQuestionSlug) {
      console.warn('feedbackTypeQuestionSlug is not set in encatch-config.js');
      return;
    }
    if (!pageUrlQuestionSlug) {
      console.warn('pageUrlQuestionSlug is not set in encatch-config.js');
      return;
    }
    if (route === 'page-helpful') {
      if (!helpfulChoiceQuestionSlug) {
        console.warn('helpfulChoiceQuestionSlug is not set in encatch-config.js');
        return;
      }
      if (!helpfulVote) {
        console.warn('Helpful feedback requires a yes/no vote');
        return;
      }
    }

    ensureEncatchInitialized().then(function (ready) {
      if (!ready) {
        return;
      }
      var activeLocale = locale || detectLocale();
      syncEncatchLocale(activeLocale).then(function () {
        var encatch = getEncatch();
        encatch.addToResponse(feedbackTypeQuestionSlug, route);
        encatch.addToResponse(pageUrlQuestionSlug, toAbsolutePageUrl(pageUrl));
        if (route === 'page-helpful' && helpfulVote) {
          encatch.addToResponse(helpfulChoiceQuestionSlug, helpfulVote);
        }
        encatch.showForm(formSlug);
      });
    });
  }

  function openHelpfulFeedbackForm(pageUrl, vote, locale) {
    openDocumentationFeedbackForm(pageUrl, 'page-helpful', locale, vote);
  }

  function openSuggestEditForm(pageUrl, locale) {
    openDocumentationFeedbackForm(pageUrl, 'suggest-edit', locale);
  }

  function openRaiseIssueForm(pageUrl, locale) {
    openDocumentationFeedbackForm(pageUrl, 'raise-issue', locale);
  }

  window.EncatchDocs = {
    detectLocale: detectLocale,
    ensureEncatchInitialized: ensureEncatchInitialized,
    syncEncatchLocale: syncEncatchLocale,
    syncEncatchTheme: syncEncatchTheme,
    getMintlifyTheme: getMintlifyTheme,
    openHelpfulFeedbackForm: openHelpfulFeedbackForm,
    openSuggestEditForm: openSuggestEditForm,
    openRaiseIssueForm: openRaiseIssueForm,
  };

  function hasPublishableKey() {
    return !!(getConfig().publishableKey || '').trim();
  }

  // Mintlify injects root .js files as client scripts. Wait until
  // encatch-config.js has set window.__ENCATCH_CONFIG__ before initializing.
  function bootstrapEncatch(attempt) {
    if (!hasPublishableKey() && attempt < 100) {
      setTimeout(function () {
        bootstrapEncatch(attempt + 1);
      }, 50);
      return;
    }

    ensureEncatchInitialized({ theme: getMintlifyTheme() }).then(function (ready) {
      if (ready) {
        syncEncatchLocale(detectLocale());
        syncEncatchTheme(getMintlifyTheme());
        watchMintlifyTheme();
      }
    });
  }

  if (document.readyState === 'complete') {
    bootstrapEncatch(0);
  } else {
    window.addEventListener('load', function () {
      bootstrapEncatch(0);
    });
  }
})();
