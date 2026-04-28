# Signal Board - Review Queue

A production-minded review queue interface for AI-assisted product teams. Built with vanilla JavaScript featuring Apple-inspired glass morphism design, dark/light mode support, and comprehensive accessibility.

![Signal Board Preview](https://img.shields.io/badge/status-complete-brightgreen)
![Tech](https://img.shields.io/badge/tech-vanilla%20JS-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Quick Start

### Prerequisites
- Node.js installed on your system ([Download Node.js](https://nodejs.org/))

### Run Locally

1. **Clone the repository:**
   git clone https://github.com/richakaushik461/signal-board.git
   cd signal-board
   Start the development server:

2. **Start the development server:**
    npx serve .
    Open your browser:

3. **Open your browser**
    http://localhost:3000

4. To stop the server: Press Ctrl + C
5. **Live Demo**
    https://richakaushik461.github.io/signal-board/

6. **Features**
Core Functionality
Queue Management: Browse 40 signal items with realistic variety

Full-Text Search: Search across titles, summaries, tags, and owners

Advanced Filtering: Filter by status, priority, and source

Multi-Sort Options: Sort by date, priority, or score

Detail View: Modal with complete item information and actions

Client Actions: Mark reviewed, snooze, escalate, and add notes

User Experience
Loading States: Spinner with 400-700ms simulated network delay

Error Handling: Error state with retry functionality

Empty States: Helpful empty state with clear filters option

Persistence: Filters, sort, density, and theme saved to localStorage

Responsive Design: Desktop, tablet, and mobile optimized

Keyboard Shortcuts: / search, Escape close, Ctrl+R refresh

Design System
Apple-Inspired Glass Morphism: Frosted glass effects

Dark/Light Mode: System-aware with manual toggle

Smooth Animations: Spring-based transitions

Density Modes: Comfortable and compact views

Accessibility
Semantic HTML with ARIA roles and labels

Full keyboard navigation support

Screen reader friendly

Focus management and trapping

Reduced motion support

7. **Tech Stack**
Vanilla JavaScript (ES6+) - No frameworks

CSS3 - Custom properties, Grid, Flexbox

HTML5 - Semantic markup

LocalStorage API - Client-side persistence

8. **Project Structure**
signal-board/
├── index.html
├── style.css
├── main.js
├── data/
│   └── fixtures.js
├── utils/
│   ├── storage.js
│   └── helpers.js
└── README.md

9. **Assignment Requirements Checklist**
Queue surface with 40 items

Search, filter, and sort functionality

Detail view with client-only actions

Loading, empty, and error states

Local preference persistence

Responsive layout

Keyboard accessible

Mock network delay (400-700ms)

Edge cases handled

10. **AI Usage Disclosure**
AI tools used for CSS design inspiration and documentation. All JavaScript logic written and reviewed manually.

11. **Author**
Richa Kaushik

GitHub: https://richakaushik461.github
GitHub: https://github.com/richakaushik461/signal-board
Live Demo: Signal Board- https://richakaushik461.github.io/signal-board
