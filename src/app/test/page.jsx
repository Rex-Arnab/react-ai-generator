"use client";

import { useEffect, useState } from "react";

export default function Component() {
  const [isFocusing, setIsFocusing] = useState(false);

  // For animated border
  useEffect(() => {
    let raf;
    const updateBorder = () => {
      const el = document.getElementById("animated-border-form");
      if (el) {
        el.style.setProperty(
          "--border-anim",
          `${(performance.now() / 1600) % 1}`
        );
      }
      raf = requestAnimationFrame(updateBorder);
    };
    updateBorder();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden flex bg-[#f6f8fb] items-center justify-center"
      style={{
        backgroundImage:
          "url('https://acciojob.com/static/LandingV2/hero/bg.webp'), url('https://acciojob.com/static/LandingV2/hero/ribbon-min.svg')",
        backgroundPosition: "right bottom, left top",
        backgroundRepeat: "no-repeat, no-repeat",
        backgroundSize: "70vw 100vh, cover"
      }}>
      {/* Subtle white overlay for clarity */}
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row justify-between items-center gap-y-12 px-4 md:px-8 py-10">
        {/* LEFT: HERO CONTENT */}
        <div className="max-w-3xl flex flex-col justify-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 text-gray-900">
            <span className="text-[#1976f7]">Upskill</span> And Land Your Dream{" "}
            <span className="text-[#1976f7]">Tech Job </span>
            <span className="inline-block align-top ml-1">
              <span className="inline-flex items-center bg-[#e5f0ff] rounded-lg px-2 py-1 shadow-sm">
                <img
                  alt=""
                  src="https://acciojob.com/static/LandingV2/new-hero-icon.svg"
                  className="w-6 h-6 mr-1"
                />
                <span className="text-[#2566e0] text-xl font-extrabold"> </span>
              </span>
            </span>
          </h1>
          <p className="mt-3 text-lg text-gray-600 leading-relaxed">
            Courses, certifications and placement assistance with 60+ hiring
            drives each month to help you land your dream tech job!
          </p>

          {/* Stats */}
          <div className="mt-8 w-full bg-white rounded-xl shadow-xl flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between px-6 py-4">
            <div className="flex items-center gap-3 sm:border-r border-gray-200 pr-6">
              <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <img
                  alt=""
                  src="https://acciojob.com/_next/static/media/sheild_green_check.eb639f41.svg?imwidth=96"
                  className="w-6 h-6"
                />
              </span>
              <div>
                <div className="font-bold text-gray-900 text-lg">2000+</div>
                <div className="text-xs text-gray-500 font-medium">
                  Students Placed
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-r border-gray-200 px-0 sm:px-6">
              <span className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center">
                <img
                  alt=""
                  src="https://acciojob.com/_next/static/media/medel.26c4481e.svg?imwidth=96"
                  className="w-6 h-6"
                />
              </span>
              <div>
                <div className="font-bold text-gray-900 text-lg ">41 LPA</div>
                <div className="text-xs text-gray-500 font-medium">
                  Highest Salary
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:border-r border-gray-200 px-0 sm:px-6">
              <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <img
                  alt=""
                  src="https://acciojob.com/_next/static/media/people_orange.3c733ba9.svg?imwidth=96"
                  className="w-6 h-6"
                />
              </span>
              <div>
                <div className="font-bold text-gray-900 text-lg">500+</div>
                <div className="text-xs text-gray-500 font-medium">
                  Partner Companies
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 pl-0 sm:pl-6">
              <span className="w-8 h-8 bg-[#e6f3fe] rounded-full flex items-center justify-center">
                <img
                  alt=""
                  src="https://acciojob.com/_next/static/media/doler_round_blue.a2c7bc89.svg?imwidth=96"
                  className="w-6 h-6"
                />
              </span>
              <div>
                <div className="font-bold text-gray-900 text-lg">7.4 LPA</div>
                <div className="text-xs text-gray-500 font-medium">
                  Average Salary
                </div>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="mt-6 text-md font-bold tracking-wider">
            <span className="text-transparent bg-gradient-to-r from-[#4f46e5] to-[#06aed5] bg-clip-text mr-2">
              FULL STACK DEVELOPMENT
            </span>
            <span className="text-gray-300 font-extrabold">|</span>
            <span className="ml-2 text-transparent bg-gradient-to-r from-[#9345e2] to-[#2ed8e8] bg-clip-text">
              DATA SCIENCE & AI
            </span>
          </div>

          {/* Companies */}
          <div className="mt-7 flex flex-wrap gap-10 items-center">
            <div className="flex flex-col items-center gap-2">
              <img
                alt=""
                src="https://acciojob.com/static/LandingV2/hero/recognition-1.svg"
                className="h-9 w-auto opacity-90"
              />
              <span className="text-xs text-gray-400 font-medium mt-1">
                India's Top Companies
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                alt=""
                src="https://acciojob.com/static/LandingV2/hero/recognition-2.svg"
                className="h-7 w-auto opacity-90"
              />
              <span className="text-xs text-gray-400 font-medium mt-1">
                Backed By Y Combinator
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                alt=""
                src="https://acciojob.com/static/LandingV2/hero/recognition-3.svg"
                className="h-10 w-auto opacity-90"
              />
              <span className="text-xs text-gray-400 font-medium mt-1">
                By IIT Delhi Alumni
              </span>
            </div>
          </div>
        </div>

        {/* Arrow Illustration - on large */}
        <img
          src="https://acciojob.com/static/LandingV2/hero/bg.webp"
          alt=""
          className="hidden lg:block absolute right-[40%] top-36 w-56 max-w-xs pointer-events-none"
          style={{ zIndex: 2 }}
        />

        {/* RIGHT: FORM BOX */}
        <div className="relative flex-1 max-w-md w-full flex items-center justify-center lg:ml-16">
          {/* Blue ribbon BG illustration */}
          <img
            src="https://acciojob.com/static/LandingV2/hero/ribbon-min.svg"
            alt=""
            className="absolute -top-10 -right-24 w-[130%] opacity-60 z-0 select-none pointer-events-none"
            aria-hidden="true"
          />
          {/* SVG grid BG - for added subtle touch */}
          <svg
            className="absolute left-0 top-0 w-full h-full z-0"
            aria-hidden="true">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#e3eaf5"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Animated border form wrapper */}
          <div
            id="animated-border-form"
            className="relative z-10 rounded-2xl shadow-2xl bg-white/95 p-8 pt-10 w-full overflow-hidden"
            style={{
              // Border anim using a repeating conic-gradient as mask
              border: "2.5px solid transparent",
              "--border-width": "2.5px",
              borderRadius: "1.25rem",
              boxShadow: "0 6px 32px 0 rgba(104, 165, 255, 0.12)",
              backgroundImage: `
                linear-gradient(white,white),
                conic-gradient(
                  from calc(var(--border-anim,0) * 360deg),
                  #1976f7 0deg,
                  #06aed5 120deg,
                  #9345e2 240deg,
                  #1976f7 360deg
                )
              `,
              backgroundOrigin: "border-box",
              backgroundClip: "padding-box, border-box",
              transition: "box-shadow .35s cubic-bezier(.77,0,.175,1)",
              boxShadow: isFocusing
                ? "0 8px 36px 0 rgba(89, 119, 255, 0.18)"
                : "0 6px 32px 0 rgba(104, 165, 255, 0.12)"
            }}>
            <div className="text-xl lg:text-2xl font-semibold mb-2 text-gray-900 text-center">
              Start learning for{" "}
              <span className="text-[#1976f7] font-extrabold">FREE</span>
            </div>
            <div className="text-sm text-gray-500 mb-7 font-medium text-center">
              Lectures & Assignments curated by Top Tech Professionals
            </div>
            <form
              className="flex flex-col gap-4"
              autoComplete="off"
              onFocus={() => setIsFocusing(true)}
              onBlur={() => setIsFocusing(false)}>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-400">
                  <svg width="20" height="20" fill="none">
                    <path
                      d="M10 10a4 4 0 100-8 4 4 0 000 8zM10 12c-4 0-6 2-6 4v1a1 1 0 001 1h10a1 1 0 001-1v-1c0-2-2-4-6-4z"
                      fill="#A0AEC0"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10 pr-3 py-3 w-full text-gray-900 border border-gray-200 focus:border-[#1976f7] rounded-lg bg-gray-50 font-medium transition-all outline-none"
                  autoComplete="off"
                />
              </div>
              <div className="relative flex">
                <span className="absolute left-3 top-2.5 text-gray-400 flex items-center">
                  <svg width="20" height="20" fill="none">
                    <path
                      d="M2 4.5A2.5 2.5 0 014.5 2h11A2.5 2.5 0 0118 4.5v11a2.5 2.5 0 01-2.5 2.5h-11A2.5 2.5 0 012 15.5v-11zm5 .5a1 1 0 110 2 1 1 0 010-2zm6 0a1 1 0 110 2 1 1 0 010-2z"
                      fill="#A0AEC0"
                    />
                  </svg>
                </span>
                <div className="flex items-center border border-gray-200 bg-gray-50 rounded-lg w-full focus-within:border-[#1976f7] transition-all">
                  <span className="ml-8 w-12 text-gray-800 font-semibold select-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="pl-2 pr-3 py-3 w-full text-gray-900 bg-transparent border-0 focus:outline-none font-medium"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 bg-gradient-to-r from-[#4247e2] to-[#06aed5] text-white py-3 rounded-lg font-semibold text-lg shadow-lg hover:from-[#3956fa] hover:to-[#0cd2e6] focus:scale-95 transition-all flex justify-center items-center gap-2">
                Apply Now{" "}
                <svg width="21" height="21" fill="none" className="ml-1">
                  <path
                    d="M7 16l5-5-5-5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
            <div className="text-xs mt-4 text-gray-500 text-center">
              By clicking ‘Apply Now For Free’, you agree to our{" "}
              <a
                href="#"
                className="text-[#1976f7] font-semibold underline hover:text-[#325dea] transition">
                Terms & Conditions
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
