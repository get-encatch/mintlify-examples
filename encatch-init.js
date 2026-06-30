/**
 * Encatch Web SDK integration for Mintlify docs feedback.
 *
 * Requires encatch-config.js (copy from encatch-config.example.js) to set
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
    var path = window.location.pathname || '';
    return path.indexOf('/es/') === 0 || path === '/es' ? 'es' : 'en';
  }

  function toAbsolutePageUrl(pageUrl) {
    return new URL(pageUrl, window.location.origin).href;
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
        'Encatch publishableKey is not set. Copy encatch-config.example.js to encatch-config.js and add your key.',
      );
      return Promise.resolve(false);
    }

    return loadSdk()
      .then(function (encatch) {
        if (!encatch._initialized) {
          var theme = (options && options.theme) || 'system';
          encatch.init(apiKey, { theme: theme });
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

    ensureEncatchInitialized().then(function (ready) {
      if (ready) {
        syncEncatchLocale(detectLocale());
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
