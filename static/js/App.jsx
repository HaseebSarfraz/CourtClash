import { useEffect, useState } from "react";
import {
  redirectToGoogle,
  logout,
  getCurrentUser,
  storeCurrentUser,
  clearStoredCurrentUser,
} from "./api-service";

export default function App() {
  const [currentPage, setCurrentPage] = useState("auth");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);

  function handleOpenCaseClick() {
  setCurrentPopup("openCase");
}

function handleJoinCaseClick() {
  setCurrentPopup("joinCase");
}

function handleClosePopup() {
  setCurrentPopup(null);
}

  function handleGoogleSignIn() {
    redirectToGoogle();
}

  function handleLogout() {
  logout().then(function () {
    clearStoredCurrentUser();
    setCurrentUser(null);
    setCurrentPage("auth");
  });
}

  useEffect(function () {
  getCurrentUser().then(function (data) {

    console.log("auth/me response:", data);

    if (!data.user) {

      console.log("No user found, showing auth page");
      clearStoredCurrentUser();
      setCurrentUser(null);
      setCurrentPage("auth");
      return;
    }
    console.log("User found, showing lobby");
    storeCurrentUser(data.user);
    setCurrentUser(data.user);
    setCurrentPage("lobby");
  });
}, []);

  return (
  <>
    {currentPage === "auth" && (
      <main className="auth-page">
        <section className="auth-shell" aria-labelledby="auth-title">
          <header className="brand-block">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-mark__icon">⚖</span>
            </div>
            <h1 id="auth-title" className="brand-title">
              CourtClash
            </h1>
            <p className="brand-subtitle">enter the chamber</p>
          </header>

          <section className="auth-card" aria-label="Sign in with Google">
            <button
              className="oauth-button"
              type="button"
              onClick={handleGoogleSignIn}
            >
              <span className="oauth-button__icon" aria-hidden="true">
                G
              </span>
              <span>Continue with Google</span>
            </button>

            <p className="auth-note">
              Sign in securely with your Google account to access the
              CourtClash debate chamber.
            </p>
          </section>
        </section>
      </main>
    )}

    {currentPage !== "auth" && (
      <>
        <div className="header">
          <div className="header-title">
            <h1>CourtClash</h1>
          </div>

          <div className="header-nav">
            <div
              data-page="lobby"
              id="lobby"
              onClick={() => setCurrentPage("lobby")}
            >
              <p>Lobby</p>
            </div>

            <div
              className="case-files"
              id="caseFiles"
              onClick={() => setCurrentPage("caseFiles")}
            >
              <p>Case Files</p>
            </div>

            <div
              className="subscription-btn"
              id="pricing"
              onClick={() => setCurrentPage("pricing")}
            >
              <p>Pricing</p>
            </div>
          </div>

          <div className="username">
            <p>{currentUser ? currentUser.email : "name@gmail.com"}</p>
            <i
              className="fa-solid fa-arrow-right-from-bracket sign-out"
              onClick={handleLogout}
            ></i>
          </div>
        </div>

        {currentPage === "lobby" && (
          <div className="lobby-page" id="lobbyPage">
            <div className="hero-section">
              <div className="hero-mark">
                <i className="fa-solid fa-scale-balanced"></i>
              </div>

              <h1>Order in the Court</h1>
              <div className="hero-divider"></div>

              <p className="hero-copy">
                Bring an opponent, take the stand, and argue by voice. When all
                arguments are heard, the AI bench delivers its ruling.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-action"
                  id="open-case-button"
                  type="button"
                  onClick={handleOpenCaseClick}
                >
                  Open a New Case
                </button>

                <button
                  className="secondary-action"
                  id="join-case-button"
                  type="button"
                  onClick={handleJoinCaseClick}
                >
                  Join a Case
                </button>
              </div>
            </div>

            <section className="steps-section">
              <h2>How Proceedings Unfold</h2>

              <div className="steps-grid">
                <article className="step-card">
                  <div className="step-top">
                    <div className="step-icon">
                      <i className="fa-regular fa-circle"></i>
                    </div>
                    <span className="step-number">1</span>
                  </div>

                  <h3>Open a Case</h3>
                  <p>
                    Set the topic and your assigned side. Share the case number
                    with your opponent to begin.
                  </p>
                </article>

                <article className="step-card">
                  <div className="step-top">
                    <div className="step-icon">
                      <i className="fa-solid fa-gavel"></i>
                    </div>
                    <span className="step-number">2</span>
                  </div>

                  <h3>Take the Stand</h3>
                  <p>
                    Alternate turns - opening, argument, rebuttal. Speak your
                    piece; it&apos;s transcribed to the record live.
                  </p>
                </article>

                <article className="step-card">
                  <div className="step-top">
                    <div className="step-icon">
                      <i className="fa-solid fa-scale-balanced"></i>
                    </div>
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
          </div>
        )}

        {currentPage === "caseFiles" && (
          <div className="case-files-page" id="caseFilesPage">
            <h2>Case Files</h2>

            <div className="record-standing">
              <h3>Record of Standing</h3>
              <div className="standing-cards">
                <div className="standing-card">
                  <i className="fa-solid fa-scale-balanced icon-heard"></i>
                  <div className="standing-number" id="statHeard">
                    0
                  </div>
                  <div className="standing-label">Cases Heard</div>
                </div>

                <div className="standing-card">
                  <i className="fa-solid fa-trophy icon-won"></i>
                  <div className="standing-number" id="statWon">
                    0
                  </div>
                  <div className="standing-label">Won</div>
                </div>

                <div className="standing-card">
                  <i className="fa-solid fa-circle-xmark icon-lost"></i>
                  <div className="standing-number" id="statLost">
                    0
                  </div>
                  <div className="standing-label">Lost</div>
                </div>

                <div className="standing-card">
                  <i className="fa-solid fa-circle-minus icon-tied"></i>
                  <div className="standing-number" id="statTied">
                    0
                  </div>
                  <div className="standing-label">Tied</div>
                </div>

                <div className="standing-card">
                  <i className="fa-solid fa-percent icon-rate"></i>
                  <div className="standing-number" id="statRate">
                    0%
                  </div>
                  <div className="standing-label">Win Rate</div>
                </div>
              </div>
            </div>

            <div className="history-section">
              <h3>Debate History</h3>
              <div className="history-list" id="historyList">
                <p>No Debate History.</p>
              </div>
            </div>
          </div>
        )}

        {currentPage === "pricing" && (
          <div className="pricing-page" id="pricingPage">
            <div className="models">
              <div>
                <h3>Basic</h3>
              </div>
              <div>
                <p>
                  For Only $9.99{" "}
                  <span className="per-month">per member / month</span>
                </p>
              </div>
              <div className="includes">
                <h5>Includes:</h5>
              </div>
              <div className="features">
                <p>&#10003; Up to 2 debates per day</p>
                <p>&#10003; Debate exclusively with Premium members</p>
                <p>&#10003; Sessions capped at 15 minutes</p>
                <p>&#10003; Access to curated debate topics</p>
              </div>
              <button className="get-started">Get Started</button>
            </div>

            <div className="models">
              <div>
                <h3>Premium</h3>
              </div>
              <div>
                <p>
                  For Only $19.99{" "}
                  <span className="per-month">per member / month</span>
                </p>
              </div>
              <div className="includes">
                <h5>Includes:</h5>
              </div>
              <div className="features">
                <p>&#10003; Unlimited debate duration</p>
                <p>&#10003; Debate with members and non-members alike</p>
                <p>&#10003; Unlimited daily debates</p>
                <p>&#10003; Full access to exclusive and premium topics</p>
                <p>&#10003; Priority matchmaking with top-tier debaters</p>
              </div>
              <button className="get-started">Get Started</button>
            </div>
          </div>
        )}

        {currentPopup === "openCase" && (
          <div className="popup-bg" id="open-case-popup" onClick={handleClosePopup}>
            <div
              className="case-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="close-button"
                type="button"
                onClick={handleClosePopup}
              >
                ×
              </button>

              <h2>File a New Case</h2>

              <form className="case-form">
                <label htmlFor="motion">Motion for Debate</label>
                <input
                  id="motion"
                  type="text"
                  placeholder="e.g. Should AI replace teachers in classrooms?"
                />

                <div className="side-inputs">
                  <div>
                    <label htmlFor="plaintiff">Plaintiff (You) Argues</label>
                    <input id="plaintiff" type="text" placeholder="e.g. For" />
                  </div>

                  <div>
                    <label htmlFor="defense">Defense (Opponent) Argues</label>
                    <input
                      id="defense"
                      type="text"
                      placeholder="e.g. Against"
                    />
                  </div>
                </div>

                <button className="primary-action" type="submit">
                  Convene the Court
                </button>
              </form>
            </div>
          </div>
        )}

        {currentPopup === "joinCase" && (
          <div className="popup-bg" id="join-case-popup" onClick={handleClosePopup}>
            <div
              className="case-popup"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="close-button"
                type="button"
                onClick={handleClosePopup}
              >
                ×
              </button>

              <h2>Enter the Chamber</h2>

              <form className="case-form">
                <label htmlFor="caseNumber">Case Number</label>
                <input
                  id="caseNumber"
                  type="text"
                  placeholder="ABC123"
                />

                <button className="primary-action" type="submit">
                  Take the Stand
                </button>
              </form>
            </div>
          </div>
        )}
      </>
    )}
  </>
)};