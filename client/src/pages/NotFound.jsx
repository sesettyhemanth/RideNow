import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import '../styles/NotFound.css'; 
const SKIN = '#f3c9a3'; 
const SKIN_DARK = '#e0a982'; 
const CHEEK = '#ee9a84'; 
const HAIR = '#5a3420'; 
const BEARD = '#4a2818'; 
const HIDE = '#eba54a'; 
const HIDE_SPOT = '#c9782b';
const CABLE = '#1d1d1d'; 
function NotFound() { 
    useEffect(() => { 
        const previousOverflow = document.body.style.overflow; 
        const previousTitle = document.title; document.body.style.overflow = 'hidden'; 
        document.title = '404 | Page not found'; 
        return () => { 
            document.body.style.overflow = previousOverflow; 
            document.title = previousTitle; 
        }; 
    }, []); 
    return ( 
        <main className="not-found"> 
        {/* 404 NUMBER */} 
        <div className="not-found__top"> 
        <h1 className="not-found__code">404</h1> 
        </div> 
        {/* ANIMATION */} 
        <div className="not-found__visual"> 
        <svg className="not-found__scene" viewBox="0 0 600 270" role="img" aria-label="A caveman pulls a plug from the ground and gets an electric shock" > 
        <defs> 
        <linearGradient id="nf-beam" x1="0" y1="1" x2="0" y2="0"> 
        <stop offset="0" stopColor="#ffe94d" stopOpacity="0.9" /> 
        <stop offset="1" stopColor="#ffe94d" stopOpacity="0" /> 
        </linearGradient> 
        </defs> 
        {/* Ground */} 
        <line x1="20" y1="240" x2="580" y2="240" stroke="#eeeeee" strokeWidth="2" />
        {/* SCENERY */} 
        <g aria-hidden="true">
        {/* Left stones */} 
        <rect x="70" y="190" width="52" height="50" rx="24" fill="#ececec" /> 
        <rect x="48" y="168" width="96" height="24" rx="12" fill="#e2e2e2" /> 
        <rect x="80" y="138" width="22" height="34" rx="11" fill="#e8e8e8" /> 
        {/* Right rock */} 
        <path d="M440,240 L440,150 Q440,70 490,70 Q540,70 540,150 L540,240 Z" fill="#efefef" /> 
        {/* Light beam */} 
        <ellipse className="not-found__beam" cx="418" cy="175" rx="16" ry="70" fill="url(#nf-beam)" transform="rotate(-8 418 175)" /> 
        {/* Bushes */} 
        <g fill="#62ae48"> 
        <circle cx="48" cy="228" r="13" /> 
        <circle cx="64" cy="224" r="16" /> 
        <circle cx="160" cy="234" r="8" /> 
        <circle cx="172" cy="232" r="10" /> 
        <circle cx="424" cy="230" r="11" /> 
        <circle cx="436" cy="226" r="9" /> 
        <circle cx="566" cy="236" r="7" /> 
        </g> </g> 
        {/* CHARACTER */} 
        <g transform="translate(300 240) scale(1.45) translate(-300 -240)"> 
        <g className="not-found__hero"> 
        {/* NORMAL CHARACTER */} 
        <g className="not-found__normal"> {/* Legs */}
        <rect x="289" y="196" width="10" height="42" rx="4" fill={SKIN} /> 
        <rect x="302" y="196" width="10" height="42" rx="4" fill={SKIN} /> 
        {/* Feet */} 
        <ellipse cx="293" cy="239" rx="9" ry="3.5" fill={SKIN_DARK} /> 
        <ellipse cx="309" cy="239" rx="9" ry="3.5" fill={SKIN_DARK} /> 
        {/* Chest */} 
        <path d="M283,152 Q300,146 317,152 L320,176 L280,176 Z" fill={SKIN} /> 
        {/* Tunic */} 
        <path d="M280,176 L303,164 L320,172 L320,208 L280,208 Z" fill={HIDE} /> 
        {/* Tunic spots */} 
        <g fill={HIDE_SPOT}> 
        <circle cx="288" cy="178" r="2.6" /> 
        <circle cx="302" cy="176" r="2.4" />
        <circle cx="313" cy="182" r="2.8" /> 
        <circle cx="292" cy="190" r="3" /> 
        <circle cx="306" cy="190" r="2.6" />
        <circle cx="315" cy="198" r="2.4" />
        <circle cx="286" cy="201" r="2.4" />
        <circle cx="299" cy="201" r="2.8" />
            </g> {/* HEAD */} 
            <g className="not-found__head"> 
            {/* Hair */} 
            <path d="M282,122 Q280,100 298,100 Q320,98 318,124 Q312,110 300,110 Q288,110 282,122 Z" fill={HAIR} />
            <circle cx="300" cy="122" r="16" fill={SKIN} /> 
            <path d="M283,119 Q281,100 299,100 Q319,100 317,119 Q310,108 300,109 Q290,108 283,119 Z" fill={HAIR} /> 
            <path d="M283,114 L281,126 L286,120 Z M317,114 L319,126 L314,120 Z" fill={HAIR} /> 
            {/* Cheeks */} 
            <circle cx="285" cy="126" r="3.4" fill={CHEEK} /> 
            <circle cx="315" cy="126" r="3.4" fill={CHEEK} /> 
            {/* Beard */} 
            <path d="M280,124 Q278,158 300,157 Q322,158 320,124 Q316,134 300,134 Q284,134 280,124 Z" fill={BEARD} /> 
            {/* Mouth */} 
            <path d="M294,134 Q300,142 306,134 Q300,131 294,134 Z" fill="#e0837a" /> 
            <circle cx="300" cy="128" r="3.2" fill={CHEEK} /> {/* Eyes */} 
            <path d="M290,121 Q294,123 298,121 M302,121 Q306,123 310,121" stroke="#3b2214" strokeWidth="1.6" fill="none" strokeLinecap="round" /> {/* Brows */} 
            <path d="M289,116 L298,117 M311,116 L302,117" stroke={HAIR} strokeWidth="2" strokeLinecap="round" /> </g>
            {/* Arms holding cable */} 
            <g className="not-found__arm-hold" fill="none" stroke={SKIN} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" > 
            <path d="M284,158 L274,176 L294,166" /> 
            <path d="M316,158 L326,176 L306,166" /> </g> {/* Raised arm */} 
            <g className="not-found__arm-up"> 
            <g className="not-found__wave"> 
            <path d="M316,156 L336,146 L322,118" fill="none" stroke={SKIN} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /> 
            <circle cx="321" cy="115" r="5.5" fill={SKIN} /> </g> </g> {/* Reaching arm */} 
            <g className="not-found__arm-reach"> 
            <path d="M284,158 L268,180 L252,192" fill="none" stroke={SKIN} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /> 
            <circle cx="250" cy="193" r="5.5" fill={SKIN} /> </g> </g> {/* X-RAY CHARACTER */} 
            <g className="not-found__xray"> 
            <g fill="none" stroke="#f7d9a8" strokeWidth="7" strokeLinecap="round" > 
            <line x1="300" y1="127" x2="300" y2="186" /> 
            <line x1="300" y1="138" x2="250" y2="122" /> 
            <line x1="300" y1="138" x2="350" y2="122" /> 
            <line x1="300" y1="192" x2="266" y2="238" /> 
            <line x1="300" y1="192" x2="334" y2="238" /> <g strokeWidth="3">
            <line x1="288" y1="142" x2="312" y2="142" /> 
            <line x1="288" y1="152" x2="312" y2="152" /> 
            <line x1="289" y1="162" x2="311" y2="162" /> </g> </g> 
            <ellipse cx="300" cy="192" rx="13" ry="6" fill="#fff6dc" stroke="#e3cc78" strokeWidth="2" /> {/* Skull */} 
            <circle cx="300" cy="115" r="16" fill="#fff6dc" stroke="#e3cc78" strokeWidth="2" /> {/* Hair */} 
            <path d="M283,119 Q281,98 300,98 Q319,98 317,119 Q312,108 300,108 Q288,108 283,119 Z" fill={HAIR} /> {/* Beard */} 
            <path d="M283,124 Q281,148 300,150 Q319,148 317,124 Q312,132 300,132 Q288,132 283,124 Z" fill={BEARD} /> {/* Eyes */} 
            <circle cx="294" cy="115" r="3.2" fill="#444444" /> 
            <circle cx="306" cy="115" r="3.2" fill="#444444" /> {/* Teeth */} 
            <rect x="293" y="124" width="14" height="6" rx="2" fill="#fff6dc" stroke="#e3cc78" strokeWidth="1.5" /> </g> </g> 
            {/* IDLE CABLE */} 
            <g className="not-found__cable not-found__cable--idle" fill="none" stroke={CABLE} strokeWidth="3" strokeLinecap="round" aria-hidden="true" > 
            <path d="M185,240 C250,246 296,240 297,150" /> 
            <path d="M302,150 C304,200 330,244 360,242 C390,244 405,244 415,240" /> </g> {/* PULL CABLE */} 
            <g className="not-found__cable not-found__cable--pull" fill="none" stroke={CABLE} strokeWidth="3" strokeLinecap="round" aria-hidden="true" > 
            <path d="M185,240 C230,246 252,238 249,200 L244,190" /> 
            <path d="M286,140 C296,190 330,240 365,242 C390,244 405,244 415,240" /> </g> {/* SHOCK CABLE */} 
            <g className="not-found__cable not-found__cable--shock" fill="none" stroke={CABLE} strokeWidth="3" strokeLinecap="round" aria-hidden="true" > 
            <path d="M185,240 C230,243 270,242 288,240 C300,238 302,226 296,216 C290,206 300,200 304,212" /> </g> </g> 
        </svg> 
        </div> {/* TEXT CONTENT */} 
        <section className="not-found__content"> 
            <h2 className="not-found__title"> Looks like you're lost </h2> 
            <p className="not-found__text"> The page you are looking for is not available. </p> 
            <Link to="/" className="not-found__btn"> Go to Home </Link> 
        </section> 
        </main> 
    ); 
} 
export default NotFound;