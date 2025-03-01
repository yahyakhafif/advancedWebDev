import React from "react";

const App = () => {
  return (
    <div style={styles.body}>
      <header style={styles.header}>
        <nav style={styles.nav}>
          <a href="#home" style={styles.link}>
            Home
          </a>
          <a href="#about" style={styles.link}>
            About
          </a>
          <a href="#contact" style={styles.link}>
            Contact
          </a>
        </nav>
      </header>

      <Section id="home" title="Architecture Genie">
        <p>Your gateway to architectural wonders and artistic inspiration.</p>
      </Section>

      <Section id="about" title="About">
        <p>
          Welcome to Architecture Genie, your ultimate platform for discovering
          and sharing architectural styles and inspirations.
        </p>
      </Section>

      <Section id="contact" title="Contact">
        <p>We'd love to hear from you! Reach out with your questions, feedback, or suggestions.</p>
      </Section>
    </div>
  );
};

const Section = ({ id, title, children }) => {
  return (
    <section id={id} style={styles.section}>
      <h1 style={styles.heading}>{title}</h1>
      {children}
    </section>
  );
};

const styles = {
  body: {
    margin: 0,
    fontFamily: "Arial, sans-serif",
    background: "url('/mainPage.jpeg') no-repeat center center/cover",
    color: "black",
    textAlign: "center",
  },
  header: {
    background: "rgba(0, 0, 0, 0.7)",
    padding: "20px 0",
    position: "fixed",
    width: "100%",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  section: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "50px 20px",
  },
  heading: {
    fontSize: "3em",
    margin: "0.5em 0",
  },
};

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href").substring(1);
      document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
    });
  });
});

export default App;
