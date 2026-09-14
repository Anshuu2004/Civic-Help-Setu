import React, { useState, useEffect } from 'react';
import SearchBox from '../components/SearchBox';
import { BookOpen, Shield, HelpCircle, Users, CheckCircle2, GraduationCap, Baby, Briefcase, Code, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom hook for typing effect
const useTypewriter = (words, typingSpeed = 70, deletingSpeed = 40, pauseDuration = 2000) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;
    const currentWord = words[wordIndex];

    if (isDeleting) {
      if (text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        timer = setTimeout(() => {}, 500); 
      } else {
        timer = setTimeout(() => setText(currentWord.substring(0, text.length - 1)), deletingSpeed);
      }
    } else {
      if (text === currentWord) {
        timer = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else {
        timer = setTimeout(() => setText(currentWord.substring(0, text.length + 1)), typingSpeed);
      }
    }

    return () => clearTimeout(timer);
  }, [text, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
};

const Home = () => {
  const [bgIndex, setBgIndex] = useState(0);
  const backgrounds = ['/hero-bg.png', '/hero-bg-2.png', '/hero-bg-3.png'];

  const typingWords = [
    "Understand government services.",
    "Apply for a passport.",
    "Get your birth certificate.",
    "Navigate public systems."
  ];
  
  const typedText = useTypewriter(typingWords);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 6000); 
    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center pt-24 pb-32 md:pt-32 md:pb-40 px-4 overflow-hidden">
        {backgrounds.map((bg, idx) => (
          <div 
            key={idx}
            className="bg-slider-layer"
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(253, 250, 246, 0.4), rgba(253, 250, 246, 0.98)), url(${bg})`,
              opacity: bgIndex === idx ? 1 : 0,
              zIndex: -2
            }}
          />
        ))}

        <div className="z-10 w-full max-w-4xl flex flex-col items-center">
          <div className="inline-block px-5 py-2.5 bg-white/80 backdrop-blur-md rounded-full text-accent-main font-bold text-sm mb-8 shadow-sm border border-accent-light animate-float">
            Your Open-Source Civic Guide
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-4xl leading-tight text-text-primary drop-shadow-sm min-h-[120px] flex items-center justify-center">
            <span className="text-accent relative inline-block">
              {typedText}
              <span className="typing-cursor"></span>
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-2xl font-semibold drop-shadow-sm bg-white/40 px-6 py-2 rounded-xl backdrop-blur-sm">
            CivicBridge translates complex bureaucratic processes into clear, actionable steps using verified official sources.
          </p>
          
          <div className="w-full max-w-3xl mb-8 z-20 animate-float-slow">
            <SearchBox size="large" placeholder="What do you need help with? (e.g. I lost my Aadhaar card)" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Link to="/services" className="btn btn-primary">
              Explore All Guides
            </Link>
            <Link to="/assistant" className="btn btn-secondary">
              Try AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Features Bar */}
      <section className="relative z-10" style={{ backgroundColor: 'white' }}>
        <div className="container py-10 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="text-accent-main mb-2" size={32} />
              <h3 className="font-bold text-lg">Verified Sources</h3>
              <p className="text-sm text-muted">100% official government links.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="text-accent-main mb-2" size={32} />
              <h3 className="font-bold text-lg">Clear Steps</h3>
              <p className="text-sm text-muted">No confusing legal jargon.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BookOpen className="text-accent-main mb-2" size={32} />
              <h3 className="font-bold text-lg">Detailed Checklists</h3>
              <p className="text-sm text-muted">Know exactly what to bring.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="text-accent-main mb-2" size={32} />
              <h3 className="font-bold text-lg">Community Driven</h3>
              <p className="text-sm text-muted">Open-source and free forever.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Professional Grid */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">How CivicBridge Works</h2>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-medium">We break down complex bureaucratic processes into clear, actionable steps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          <div className="card p-10 shadow-md hover:shadow-lg transition-shadow bg-white rounded-[2rem]">
            <div className="w-20 h-20 rounded-[1.5rem] bg-accent-light text-accent-main flex items-center justify-center mb-8">
              <HelpCircle size={40} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold mb-4 text-2xl">1. Ask the AI</h3>
            <p className="text-muted text-lg">Describe your situation in plain English. Our AI assistant will interpret your needs and match you with the exact government service required.</p>
          </div>
          <div className="card p-10 shadow-md hover:shadow-lg transition-shadow bg-white rounded-[2rem]">
            <div className="w-20 h-20 rounded-[1.5rem] bg-accent-light text-accent-main flex items-center justify-center mb-8">
              <BookOpen size={40} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold mb-4 text-2xl">2. Read the Guide</h3>
            <p className="text-muted text-lg">Review our simplified, step-by-step guides. We detail eligibility, processing times, expected fees, and required documents clearly.</p>
          </div>
          <div className="card p-10 shadow-md hover:shadow-lg transition-shadow bg-white rounded-[2rem]">
            <div className="w-20 h-20 rounded-[1.5rem] bg-accent-light text-accent-main flex items-center justify-center mb-8">
              <Shield size={40} strokeWidth={2.5} />
            </div>
            <h3 className="font-bold mb-4 text-2xl">3. Apply Safely</h3>
            <p className="text-muted text-lg">We never process applications directly. We point you to the verified, official government portal so you can apply securely.</p>
          </div>
        </div>
      </section>

      {/* Sleek Category Grid */}
      <section className="py-20" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Explore by Category</h2>
              <p className="text-xl md:text-2xl text-muted font-medium">Browse our comprehensive directory of civic guides.</p>
            </div>
            <Link to="/services" className="text-accent-main font-bold hover:underline flex items-center gap-2 text-lg pb-2">
              View Directory <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/services?cat=Identity" className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group">
              <h3 className="font-bold text-2xl mb-4 group-hover:text-accent-main transition-colors">Identity & Docs</h3>
              <p className="text-base text-muted mb-6 leading-relaxed">Aadhaar, Passports, Voter ID, Birth & Death Certificates.</p>
              <span className="text-accent-main text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
            </Link>
            <Link to="/services?cat=Finance" className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group">
              <h3 className="font-bold text-2xl mb-4 group-hover:text-accent-main transition-colors">Finance & Taxes</h3>
              <p className="text-base text-muted mb-6 leading-relaxed">PAN Cards, Income Tax Returns, Provident Fund (EPF).</p>
              <span className="text-accent-main text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
            </Link>
            <Link to="/services?cat=Transport" className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group">
              <h3 className="font-bold text-2xl mb-4 group-hover:text-accent-main transition-colors">Transport</h3>
              <p className="text-base text-muted mb-6 leading-relaxed">Driving Licenses, Vehicle Registration, Challan Payments.</p>
              <span className="text-accent-main text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
            </Link>
            <Link to="/services?cat=Health" className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-md transition-all group">
              <h3 className="font-bold text-2xl mb-4 group-hover:text-accent-main transition-colors">Health & Welfare</h3>
              <p className="text-base text-muted mb-6 leading-relaxed">Ayushman Bharat, Ration Cards, Pension Schemes.</p>
              <span className="text-accent-main text-base font-bold opacity-0 group-hover:opacity-100 transition-opacity">Explore &rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Built for Everyone</h2>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-medium">Navigating government services shouldn't require a law degree.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center text-text-primary mb-2 shadow-sm">
              <GraduationCap size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-3xl">For Students</h3>
            <p className="text-muted text-xl leading-relaxed">Easily find guides for applying to state scholarships, updating educational IDs, and securing student transit passes.</p>
          </div>
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center text-text-primary mb-2 shadow-sm">
              <Baby size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-3xl">For Families</h3>
            <p className="text-muted text-xl leading-relaxed">Navigate the complex processes of registering birth certificates, adding dependents to health schemes, and securing ration cards.</p>
          </div>
          <div className="flex flex-col gap-6 text-center items-center">
            <div className="w-24 h-24 bg-bg-secondary rounded-full flex items-center justify-center text-text-primary mb-2 shadow-sm">
              <Briefcase size={48} strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-3xl">For Businesses</h3>
            <p className="text-muted text-xl leading-relaxed">Understand the exact paperwork needed for GST registration, local trade licenses, and employee provident fund setup.</p>
          </div>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="py-20" style={{ backgroundColor: 'var(--text-primary)', color: 'white' }}>
        <div className="container flex flex-col items-center text-center">
          <Code size={48} className="mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">CivicBridge is 100% Open Source</h2>
          <p className="text-xl text-white/70 max-w-2xl mb-10">
            Public-service information should belong to the public. Our entire platform, including all civic guides, is community-maintained on GitHub. Help us keep information accurate and accessible.
          </p>
          <div className="flex gap-4">
            <Link to="/open-source" className="btn bg-white text-text-primary hover:bg-gray-100 border-none">
              Learn More
            </Link>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn bg-transparent border-2 border-white/30 text-white hover:border-white">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
