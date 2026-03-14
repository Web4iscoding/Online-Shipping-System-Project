import { useState, useEffect, useRef } from "react";
import { useAuth } from "../AuthContext";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";
import "../styles/ContactUs.css";
import { DinoIcon } from "../assets/icons";
import LoadingIndicator from "./common/LoadingIndicator";

const EMAILJS_SERVICE_ID = "service_4tilqif";
const EMAILJS_TEMPLATE_ID = "template_b972nbq";
const EMAILJS_PUBLIC_KEY = "9RiYU99ZOg8wp9NwH";
const RECAPTCHA_SITE_KEY = "6LfxHYosAAAAAE0xvvJp3IHeTT4jfImYI1i469-4";

const ContactUs = () => {
  const { user, isAuthenticated } = useAuth();
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const walkDataRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [inquiry, setInquiry] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [showHeading, setShowHeading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [popPhase, setPopPhase] = useState(null);
  const [popCycle, setPopCycle] = useState(0);

  const randBetween = (min, max) => Math.random() * (max - min) + min;

  // Prefill fields when user data is available
  useEffect(() => {
    if (isAuthenticated && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.account?.email || "");
    }
  }, [isAuthenticated, user]);

  // Start the dino animation 2 seconds after page load
  useEffect(() => {
    const timer = setTimeout(() => setPopPhase("rising"), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Phase state machine (no sinking — infinite loop)
  useEffect(() => {
    let id;
    if (popPhase === "rising") {
      id = setTimeout(() => setPopPhase("peeking"), 400);
    } else if (popPhase === "peeking") {
      id = setTimeout(() => setPopPhase("walking"), 2400);
    }
    return () => clearTimeout(id);
  }, [popPhase]);

  // Reset container position when rising or peeking
  useEffect(() => {
    if ((popPhase === "rising" || popPhase === "peeking") && containerRef.current) {
      containerRef.current.style.transform = "";
    }
  }, [popPhase]);

  // Walking animation driven by requestAnimationFrame
  useEffect(() => {
    if (popPhase !== "walking") return;
    const el = containerRef.current;
    if (!el) return;
    const svgEl = el.querySelector("svg");

    const SPEED = 50;
    const anchorEl = headingRef.current;
    const anchorWidth = anchorEl ? anchorEl.offsetWidth : 200;
    const elWidth = el.offsetWidth || 80;
    const rightOffset = 0;
    const MIN_X = -(anchorWidth - elWidth - rightOffset);
    const MAX_X = 0;

    const s = {
      x: 10,
      dir: -1,
      scaleX: -1,
      paused: false,
      flipping: false,
      flipStart: 0,
      flipFrom: -1,
      flipTo: -1,
      nextStopAt: performance.now() + randBetween(1500, 4000),
      resumeAt: 0,
    };
    walkDataRef.current = s;
    let lastTime = performance.now();
    const pendingTimers = [];

    function triggerFlip(newDir, now) {
      s.flipping = true;
      s.flipStart = now;
      s.flipFrom = s.scaleX;
      s.dir = newDir;
      s.flipTo = newDir < 0 ? -1 : 1;
    }

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (s.flipping) {
        const p = Math.min((now - s.flipStart) / 300, 1);
        if (p >= 1) {
          s.flipping = false;
          s.scaleX = s.flipTo;
        } else if (p < 0.5) {
          s.scaleX = s.flipFrom * (1 - p * 2);
        } else {
          s.scaleX = s.flipTo * ((p - 0.5) * 2);
        }
      }

      if (!s.paused && !s.flipping) {
        s.x += s.dir * SPEED * dt;

        if (s.x <= MIN_X) {
          s.x = MIN_X;
          if (s.dir === -1) triggerFlip(1, now);
        } else if (s.x >= MAX_X) {
          s.x = MAX_X;
          if (s.dir === 1) triggerFlip(-1, now);
        }

        if (now >= s.nextStopAt && !s.flipping) {
          s.paused = true;
          if (svgEl) svgEl.style.animationPlayState = "paused";

          if (Math.random() > 0.35) {
            const t = setTimeout(() => {
              if (walkDataRef.current !== s || !s.paused) return;
              triggerFlip(s.dir * -1, performance.now());
              if (Math.random() > 0.5) {
                s.resumeAt = performance.now() + 350;
              }
            }, randBetween(400, 1200));
            pendingTimers.push(t);
          }

          s.resumeAt = now + randBetween(2000, 5000);
        }
      }

      if (s.paused && !s.flipping && now >= s.resumeAt) {
        s.paused = false;
        if (svgEl) svgEl.style.animationPlayState = "running";
        s.nextStopAt = now + randBetween(2000, 6000);
      }

      el.style.transform = `translateX(${s.x}px) scaleX(${s.scaleX})`;
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      pendingTimers.forEach(clearTimeout);
      walkDataRef.current = null;
      if (svgEl) svgEl.style.animationPlayState = "";
    };
  }, [popPhase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSending(true);

    if (!captchaToken) {
      setError("Please complete the reCAPTCHA.");
      setSending(false);
      return;
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          first_name: firstName,
          last_name: lastName,
          from_email: email,
          message: inquiry,
          time: new Date().toLocaleString(),
          'g-recaptcha-response': captchaToken,
        },
        EMAILJS_PUBLIC_KEY,
      );
      setSent(true);
      setSending(false);
    } catch (err) {
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      setError("Failed to send your message. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  // Fade-in sequence after sent
  useEffect(() => {
    if (!sent) return;
    requestAnimationFrame(() => setShowHeading(true));
    const msgTimer = setTimeout(() => setShowMessage(true), 1000);
    return () => clearTimeout(msgTimer);
  }, [sent]);

  if (sending) {
    return (
      <div className="contact-us-container">
        <LoadingIndicator />
      </div>
    );
  }

  if (sent) {
    return (
      <div className="contact-us-container">
        <h1 className={`cu-fade-in${showHeading ? " visible" : ""}`}>Thank you!</h1>
        <p className={`contact-us-sent-message cu-slide-up${showMessage ? " visible" : ""}`}>
          Your inquiry has been sent. We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="contact-us-container">
      <div className="contact-us-heading-wrapper">
        <h1 className="contact-us-heading" ref={headingRef}>
          Got a question? Shoot us an inquiry.
        </h1>
        <div
          key={popCycle}
          ref={containerRef}
          className={`contact-us-dino${popPhase ? ` pop-${popPhase}` : ""}`}
        >
          <DinoIcon size={1.2} />
        </div>
      </div>

      <form ref={formRef} className="contact-us-form" onSubmit={handleSubmit}>
        <div className="contact-us-name-row">
          <div className="contact-us-field">
            <label htmlFor="contact-first-name">First Name</label>
            <input
              id="contact-first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="contact-us-field">
            <label htmlFor="contact-last-name">Last Name</label>
            <input
              id="contact-last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="contact-us-field">
          <label htmlFor="contact-email">Email Address</label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="contact-us-field">
          <label htmlFor="contact-inquiry">Inquiry</label>
          <textarea
            id="contact-inquiry"
            rows={6}
            value={inquiry}
            onChange={(e) => setInquiry(e.target.value)}
            required
          />
        </div>

        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={(token) => setCaptchaToken(token)}
          onExpired={() => setCaptchaToken(null)}
        />

        {error && <p className="contact-us-error">{error}</p>}

        <button
          type="submit"
          className="contact-us-submit"
          disabled={sending || !captchaToken}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ContactUs;
