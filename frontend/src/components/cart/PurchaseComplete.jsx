import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/PurchaseComplete.css";
import LoadingIndicator from "../common/LoadingIndicator";
import { SuccessTickIcon } from "../../assets/icons";
import hanamaru from "../../assets/hanamaru.webp";

const PurchaseComplete = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showHeading, setShowHeading] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [popPhase, setPopPhase] = useState(null); // null | 'rising' | 'peeking' | 'walking' | 'sinking'
  const [popCycle, setPopCycle] = useState(0);
  const timerRef = useRef(null);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const animRef = useRef(null);
  const walkDataRef = useRef(null);
  const hasPoppedRef = useRef(false);

  const randIdle = () => Math.random() * (60000 - 10000) + 10000;
  const randWalk = () => Math.random() * (60000 - 20000) + 20000;
  const randBetween = (min, max) => Math.random() * (max - min) + min;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      requestAnimationFrame(() => setShowHeading(true));
      const btnTimer = setTimeout(() => setShowButtons(true), 1000);
      return () => clearTimeout(btnTimer);
    }
  }, [loading]);

  // Schedule first pop once buttons appear
  useEffect(() => {
    if (!showButtons) return;
    timerRef.current = setTimeout(() => setPopPhase("rising"), randIdle());
    return () => clearTimeout(timerRef.current);
  }, [showButtons]);

  // Drive the phase state machine
  useEffect(() => {
    let id;
    if (popPhase === "rising") {
      hasPoppedRef.current = true;
      id = setTimeout(() => setPopPhase("peeking"), 400);
    } else if (popPhase === "peeking") {
      id = setTimeout(() => setPopPhase("walking"), 2400);
    } else if (popPhase === "walking") {
      id = setTimeout(() => setPopPhase("sinking"), randWalk());
    } else if (popPhase === "sinking") {
      id = setTimeout(() => setPopPhase(null), 400);
    }
    return () => clearTimeout(id);
  }, [popPhase]);

  // Schedule next cycle after sinking completes
  useEffect(() => {
    if (popPhase === null && hasPoppedRef.current) {
      const id = setTimeout(() => {
        setPopCycle((c) => c + 1);
        setPopPhase("rising");
      }, randIdle());
      return () => clearTimeout(id);
    }
  }, [popPhase]);

  // Reset container position when fully hidden, rising, or peeking
  useEffect(() => {
    if ((popPhase === null || popPhase === "rising" || popPhase === "peeking") && containerRef.current) {
      containerRef.current.style.transform = "";
    }
  }, [popPhase]);

  // Walking animation driven by requestAnimationFrame
  useEffect(() => {
    if (popPhase !== "walking") return;
    const el = containerRef.current;
    if (!el) return;
    const imgEl = el.querySelector("img");

    const SPEED = 50; // px per second
    // Compute walk range dynamically from button width
    const btnEl = buttonRef.current;
    const btnWidth = btnEl ? btnEl.offsetWidth : 350;
    const elWidth = el.offsetWidth || 100;
    const rightOffset = 20; // CSS right: 20px
    const MIN_X = -(btnWidth - elWidth - rightOffset);
    const MAX_X = 0;

    const s = {
      x: 0,
      dir: -1,
      scaleX: 1,
      paused: false,
      flipping: false,
      flipStart: 0,
      flipFrom: 1,
      flipTo: 1,
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
      s.flipTo = newDir < 0 ? 1 : -1;
    }

    function tick(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Paper-cut flip animation (scaleX goes from → 0 → opposite)
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

      // Walking movement
      if (!s.paused && !s.flipping) {
        s.x += s.dir * SPEED * dt;

        // Boundary → flip
        if (s.x <= MIN_X) {
          s.x = MIN_X;
          if (s.dir === -1) triggerFlip(1, now);
        } else if (s.x >= MAX_X) {
          s.x = MAX_X;
          if (s.dir === 1) triggerFlip(-1, now);
        }

        // Random stop
        if (now >= s.nextStopAt && !s.flipping) {
          s.paused = true;
          if (imgEl) imgEl.style.animationPlayState = "paused";

          // Maybe flip direction while stopped
          if (Math.random() > 0.35) {
            const t = setTimeout(() => {
              if (walkDataRef.current !== s || !s.paused) return;
              triggerFlip(s.dir * -1, performance.now());
              // After flipping, maybe resume walking right away
              if (Math.random() > 0.5) {
                s.resumeAt = performance.now() + 350;
              }
            }, randBetween(400, 1200));
            pendingTimers.push(t);
          }

          s.resumeAt = now + randBetween(2000, 5000);
        }
      }

      // Resume from pause
      if (s.paused && !s.flipping && now >= s.resumeAt) {
        s.paused = false;
        if (imgEl) imgEl.style.animationPlayState = "running";
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
      if (imgEl) imgEl.style.animationPlayState = "";
    };
  }, [popPhase]);

  if (loading) {
    return (
      <div className="purchase-complete-container">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="purchase-complete-container">
      <h2 className={`pc-fade-in${showHeading ? " visible" : ""}`}><SuccessTickIcon />Purchase Complete</h2>
      <div className={`purchase-complete-buttons pc-slide-up${showButtons ? " visible" : ""}`}>
        <button
          ref={buttonRef}
          className="purchase-complete-primary"
          onClick={() => navigate("/my-orders")}
        >
        <div key={popCycle} ref={containerRef} className={`pop-out-image${popPhase ? ` pop-${popPhase}` : ""}`}><img src={hanamaru} alt="Hanamaru" /></div>
          View My Orders
        </button>
        <button
          className="purchase-complete-secondary"
          onClick={() => navigate("/")}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default PurchaseComplete;
