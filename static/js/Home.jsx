export default function Home() {
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
            <a className="button primary-button" href="#">
              Open a New Case
            </a>
            <a className="button secondary-button" href="#">
              <span>&#9878;</span>
              Join a Case
            </a>
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
    </>
  );
}
