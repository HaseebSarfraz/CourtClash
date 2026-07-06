/*
import { useState } from "react";

function CasePopup({ mode, onClose }) {
  const isCreate = mode === "create";

  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <div className="popup-bg" onClick={onClose}>
      <section
        className="case-popup"
        role="dialog"
        aria-labelledby="case-popup-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="close-button"
          type="button"
          aria-label="Close"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 id="case-popup-title">
          {isCreate ? "File a New Case" : "Enter the Chamber"}
        </h2>
        <div className="popup-line"></div>

        {isCreate ? (
          <form className="case-form" onSubmit={handleSubmit}>
            <label className="field full-field">
              <span>Motion for Debate</span>
              <input
                type="text"
                placeholder="e.g. Should AI replace teachers in classrooms?"
              />
            </label>

            <div className="split-fields">
              <label className="field">
                <span>Plaintiff (You) Argues</span>
                <input type="text" placeholder="e.g. For" />
              </label>

              <label className="field">
                <span>Defense (Opponent) Argues</span>
                <input type="text" placeholder="e.g. Against" />
              </label>
            </div>

            <button className="submit-button" type="submit">
              Convene the Court
            </button>
          </form>
        ) : (
          <form className="case-form" onSubmit={handleSubmit}>
            <label className="field full-field">
              <span>Case Number</span>
              <input
                className="case-code-input"
                type="text"
                placeholder="ABC123"
              />
            </label>

            <button className="submit-button" type="submit">
              Take the Stand
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  const [activeCard, setActiveCard] = useState(null);

  return (
    <>
      <header className="topbar">
        <span className="brand-mark">&#9878;</span>
        <span>
          <span className="brand-name">CourtClash</span>
          <span className="brand-subtitle">The Debate Chamber</span>
        </span>
      </header>

      <main className="page">
        <section className="hero">
          <div className="hero-icon">&#9878;</div>
          <h1>Order in the Court</h1>
          <div className="title-rule"></div>
          <p>
            Bring an opponent, take the stand, and argue by voice. When all
            arguments are heard, the AI bench delivers its ruling.
          </p>

          <div className="hero-actions">
            <button
              className="button primary-button"
              type="button"
              onClick={() => setActiveCard("create")}
            >
              Open a New Case
            </button>
            <button
              className="button secondary-button"
              type="button"
              onClick={() => setActiveCard("join")}
            >
              <span>&#9878;</span>
              Join a Case
            </button>
          </div>
        </section>

        <section className="steps">
          <h2>How Proceedings Unfold</h2>

          <div className="step-list">
            <article className="step-card">
              <div className="step-heading">
                <span className="step-icon">&#9900;</span>
                <span className="step-number">1</span>
              </div>
              <h3>Open a Case</h3>
              <p>
                Set the topic and your assigned side. Share the case number
                with your opponent to begin.
              </p>
            </article>

            <article className="step-card">
              <div className="step-heading">
                <span className="step-icon">&#9874;</span>
                <span className="step-number">2</span>
              </div>
              <h3>Take the Stand</h3>
              <p>
                Alternate turns - opening, argument, rebuttal. Speak your
                piece; it's transcribed to the record live.
              </p>
            </article>

            <article className="step-card">
              <div className="step-heading">
                <span className="step-icon">&#9878;</span>
                <span className="step-number">3</span>
              </div>
              <h3>The Ruling</h3>
              <p>
                The AI bench reviews the full record and rules on strength,
                relevance, consistency, and credibility.
              </p>
            </article>
          </div>
        </section>
      </main>

      {activeCard && (
        <CasePopup mode={activeCard} onClose={() => setActiveCard(null)} />
      )}
    </>
  );
}
*/
