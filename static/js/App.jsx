import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  redirectToGoogle,
  logout,
  getCurrentUser,
} from "./api-service";

export default function App() {
  const [currentPage, setCurrentPage] = useState("auth");
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPopup, setCurrentPopup] = useState(null);
  const [authError, setAuthError] = useState("");
  const [socket, setSocket] = useState(null);
  const [roomState, setRoomState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [roomError, setRoomError] = useState("");
  const [messageText, setMessageText] = useState("");

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
      setCurrentUser(null);
      setCurrentPage("auth");
      setRoomState(null);
      setMessages([]);
    });
  }

  function handleRoomResponse(response) {
    if (!response || response.error) {
      setRoomError(response ? response.error : "Room action failed.");
      return;
    }

    setRoomError("");
    setRoomState(response.state.room);
    setMessages(response.state.messages);
    setCurrentPopup(null);
    setCurrentPage("debate");
  }

  function handleCreateCaseSubmit(event) {
    event.preventDefault();

    if (!socket) {
      setRoomError("Socket is not connected yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    socket.emit(
      "room:create",
      {
        topic: formData.get("topic"),
        userOneSide: formData.get("userOneSide"),
        userTwoSide: formData.get("userTwoSide"),
      },
      handleRoomResponse
    );
  }

  function handleJoinCaseSubmit(event) {
    event.preventDefault();

    if (!socket) {
      setRoomError("Socket is not connected yet.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    socket.emit(
      "room:join",
      {
        roomCode: formData.get("roomCode"),
      },
      handleRoomResponse
    );
  }

  function handleSendMessage(event) {
    event.preventDefault();

    if (!socket || !roomState) {
      return;
    }

    socket.emit(
      "room:message",
      {
        roomCode: roomState.roomCode,
        content: messageText,
      },
      function (response) {
        if (response && response.error) {
          setRoomError(response.error);
          return;
        }

        setRoomError("");
        setMessageText("");
      }
    );
  }

  useEffect(function () {
    getCurrentUser().then(function (data) {

      const params = new URLSearchParams(window.location.search);
      const authErrorFromUrl = params.get("authError");

      if (authErrorFromUrl === "google") {
        setAuthError("Google sign-in failed. Please try again.");
      }

      if (!data.user) {
        setCurrentUser(null);
        setCurrentPage("auth");
        return;
      }
      setCurrentUser(data.user);
      setCurrentPage("lobby");
    });
  }, []);

  useEffect(function () {
    if (!currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const nextSocket = io({
      withCredentials: true,
    });

    nextSocket.on("connect_error", function (error) {
      setRoomError(error.message);
    });

    nextSocket.on("room:state", function (state) {
      setRoomState(state.room);
      setMessages(state.messages);
      setCurrentPopup(null);
      setCurrentPage("debate");
    });

    nextSocket.on("room:message", function (message) {
      setMessages(function (currentMessages) {
        const alreadyAdded = currentMessages.some(function (currentMessage) {
          return currentMessage.id === message.id;
        });

        if (alreadyAdded) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    });

    setSocket(nextSocket);

    return function () {
      nextSocket.disconnect();
    };
  }, [currentUser]);

  const mySide =
    roomState && currentUser && roomState.userOneId === currentUser.id
      ? roomState.userOneSide
      : roomState
        ? roomState.userTwoSide
        : "";

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

              {authError && <p className="auth-error">{authError}</p>}

              <p className="auth-helper">
                Sign in securely with your Google account to access the CourtClash
                debate chamber.
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
              <section className="hero">
                <div className="hero-icon">&#9878;</div>
                <h1>Order in the Court</h1>
                <div className="title-rule"></div>
                <p>
                  Bring an opponent, take the stand, and argue by voice. When
                  all arguments are heard, the AI bench delivers its ruling.
                </p>

                <div className="hero-actions">
                  <button
                    className="button primary-button"
                    id="open-case-button"
                    type="button"
                    onClick={handleOpenCaseClick}
                  >
                    Open a New Case
                  </button>

                  <button
                    className="button secondary-button"
                    id="join-case-button"
                    type="button"
                    onClick={handleJoinCaseClick}
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
                      Set the topic and your assigned side. Share the case
                      number with your opponent to begin.
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
                      piece; it&apos;s transcribed to the record live.
                    </p>
                  </article>

                  <article className="step-card">
                    <div className="step-heading">
                      <span className="step-icon">&#9878;</span>
                      <span className="step-number">3</span>
                    </div>
                    <h3>The Ruling</h3>
                    <p>
                      The AI bench reviews the full record and rules on
                      strength, relevance, consistency, and credibility.
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
                  <p>
                    &#10003; Priority matchmaking with top-tier debaters
                  </p>
                </div>
                <button className="get-started">Get Started</button>
              </div>
            </div>
          )}

          {currentPage === "debate" && roomState && (
            <div className="debate-page">
              <section className="debate-header">
                <div>
                  <p className="room-code-label">Room Code</p>
                  <h2>{roomState.roomCode}</h2>
                </div>
                <div>
                  <p className="room-code-label">Your Side</p>
                  <h2>{mySide}</h2>
                </div>
              </section>

              <section className="debate-topic">
                <h2>{roomState.topic}</h2>
                <p>
                  {roomState.status === "waiting"
                    ? "Waiting for the second debater to join."
                    : "Both debaters are in the room."}
                </p>
              </section>

              <section className="transcript-panel">
                <h3>Live Transcript</h3>
                <div className="message-list">
                  {messages.length === 0 && <p>No transcript yet.</p>}
                  {messages.map(function (message) {
                    return (
                      <article
                        className={
                          message.userId === currentUser.id
                            ? "message own-message"
                            : "message"
                        }
                        key={message.id}
                      >
                        <strong>
                          {message.user ? message.user.email : "Unknown user"}
                        </strong>
                        <p>{message.content}</p>
                      </article>
                    );
                  })}
                </div>

                {roomError && <p className="auth-error">{roomError}</p>}

                <form className="message-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Add to the record..."
                  />
                  <button className="submit-button" type="submit">
                    Send
                  </button>
                </form>
              </section>
            </div>
          )}

          {currentPopup === "openCase" && (
            <div
              className="popup-bg"
              id="open-case-popup"
              onClick={handleClosePopup}
            >
              <section
                className="case-popup"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="close-button"
                  type="button"
                  aria-label="Close"
                  onClick={handleClosePopup}
                >
                  &times;
                </button>
                <h2>File a New Case</h2>
                <div className="popup-line"></div>

                <form className="case-form" onSubmit={handleCreateCaseSubmit}>
                  <label className="field">
                    <span>Motion for Debate</span>
                    <input
                      name="topic"
                      type="text"
                      placeholder="e.g. Should AI replace teachers in classrooms?"
                    />
                  </label>

                  <div className="split-fields">
                    <label className="field">
                      <span>Plaintiff (You) Argues</span>
                      <input
                        name="userOneSide"
                        type="text"
                        placeholder="e.g. For"
                      />
                    </label>

                    <label className="field">
                      <span>Defense (Opponent) Argues</span>
                      <input
                        name="userTwoSide"
                        type="text"
                        placeholder="e.g. Against"
                      />
                    </label>
                  </div>

                  {roomError && <p className="auth-error">{roomError}</p>}

                  <button className="submit-button" type="submit">
                    Convene the Court
                  </button>
                </form>
              </section>
            </div>
          )}

          {currentPopup === "joinCase" && (
            <div
              className="popup-bg"
              id="join-case-popup"
              onClick={handleClosePopup}
            >
              <section
                className="case-popup"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  className="close-button"
                  type="button"
                  aria-label="Close"
                  onClick={handleClosePopup}
                >
                  &times;
                </button>
                <h2>Enter the Chamber</h2>
                <div className="popup-line"></div>

                <form className="case-form" onSubmit={handleJoinCaseSubmit}>
                  <label className="field">
                    <span>Case Number</span>
                    <input
                      className="case-code-input"
                      name="roomCode"
                      type="text"
                      placeholder="ABC123"
                    />
                  </label>

                  {roomError && <p className="auth-error">{roomError}</p>}

                  <button className="submit-button" type="submit">
                    Take the Stand
                  </button>
                </form>
              </section>
            </div>
          )}
        </>
      )}
    </>
  );
}
