export const DocsPageFeedback = ({ locale = 'en' }) => {
  const t = {
    helpfulQuestion: 'Was this page helpful?',
    yes: 'Yes',
    no: 'No',
    suggestEdits: 'Suggest edits',
    raiseIssue: 'Raise issue',
  };
  const pageUrl =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleVote = (event, vote) => {
    const button = event.currentTarget;
    const wasPressed = button.getAttribute('aria-pressed') === 'true';
    const group = button.parentElement;

    if (group) {
      group.querySelectorAll('button[aria-pressed]').forEach((peer) => {
        peer.setAttribute('aria-pressed', 'false');
        peer.classList.remove('encatch-docs-feedback__pill--active');
      });
    }

    if (wasPressed) {
      button.setAttribute('aria-pressed', 'false');
      button.classList.remove('encatch-docs-feedback__pill--active');
      return;
    }

    button.setAttribute('aria-pressed', 'true');
    button.classList.add('encatch-docs-feedback__pill--active');

    if (window.EncatchDocs) {
      window.EncatchDocs.openHelpfulFeedbackForm(pageUrl, vote, locale);
    }
  };

  return (
    <div className="encatch-docs-feedback not-prose">
      <div className="encatch-docs-feedback__row">
        <p className="encatch-docs-feedback__question">{t.helpfulQuestion}</p>
        <div className="encatch-docs-feedback__actions-row">
          <div className="encatch-docs-feedback__actions">
          <button
            type="button"
            onClick={(event) => handleVote(event, 'yes')}
            aria-pressed="false"
            className="encatch-docs-feedback__pill"
          >
            <svg
              className="encatch-docs-feedback__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M7 10v11M7 10l4-6a2 2 0 0 1 2-1h1a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2l-1 7a2 2 0 0 1-2 2H7" />
            </svg>
            <span>{t.yes}</span>
          </button>
          <button
            type="button"
            onClick={(event) => handleVote(event, 'no')}
            aria-pressed="false"
            className="encatch-docs-feedback__pill"
          >
            <svg
              className="encatch-docs-feedback__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M17 14V3M17 14l-4 6a2 2 0 0 1-2 1h-1a2 2 0 0 1-2-2v-4H3a2 2 0 0 1-2-2l1-7a2 2 0 0 1 2-2h14" />
            </svg>
            <span>{t.no}</span>
          </button>
          </div>
          <div className="encatch-docs-feedback__actions encatch-docs-feedback__actions--secondary">
          <button
            type="button"
            onClick={() =>
              window.EncatchDocs?.openSuggestEditForm(pageUrl, locale)
            }
            className="encatch-docs-feedback__pill"
          >
            <svg
              className="encatch-docs-feedback__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>{t.suggestEdits}</span>
          </button>
          <button
            type="button"
            onClick={() =>
              window.EncatchDocs?.openRaiseIssueForm(pageUrl, locale)
            }
            className="encatch-docs-feedback__pill"
          >
            <svg
              className="encatch-docs-feedback__icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
            <span>{t.raiseIssue}</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};
