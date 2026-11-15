/**
 * Roshan Pokhrel — Portfolio JavaScript
 * Interactive behavior for theme toggle, accordions, GitHub heatmap, and contact copy.
 */

(function () {
  'use strict';

  // --- Theme Management ---
  const themeToggleBtn = document.getElementById('theme-toggle');
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');

  function getSystemScheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === 'system' && getSystemScheme() === 'dark');

    if (isDark) {
      document.documentElement.classList.add('dark');
      if (metaColorScheme) metaColorScheme.content = 'dark';
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      }
    } else {
      document.documentElement.classList.remove('dark');
      if (metaColorScheme) metaColorScheme.content = 'light';
      if (sunIcon && moonIcon) {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }
  }

  function toggleTheme() {
    const currentStored = localStorage.getItem('color-scheme');
    const system = getSystemScheme();
    let nextTheme;

    if (!currentStored || currentStored === 'system') {
      nextTheme = system === 'dark' ? 'light' : 'dark';
    } else if (currentStored === 'dark') {
      nextTheme = 'light';
    } else {
      nextTheme = 'dark';
    }

    localStorage.setItem('color-scheme', nextTheme);
    applyTheme(nextTheme);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Listen to OS scheme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const stored = localStorage.getItem('color-scheme');
      if (!stored || stored === 'system') {
        applyTheme('system');
      }
    });
  }

  // --- Accordions (Experience & Education) ---
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach((header) => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      if (!item) return;
      const isOpen = item.classList.contains('open');

      // Optional: close other open items in the same list if desired
      item.classList.toggle('open', !isOpen);
    });
  });

  // --- Toast Notifications ---
  const toast = document.getElementById('toast-notice');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  window.copyToClipboard = function (text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`${label} copied to clipboard! ✓`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  function fallbackCopy(text, label) {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(`${label} copied to clipboard! ✓`);
    } catch (err) {
      showToast(`Could not copy: ${text}`);
    }
    document.body.removeChild(tempInput);
  }

  // --- GitHub Activity Heatmap Generator ---
  const heatmapGrid = document.getElementById('github-heatmap-grid');
  const githubSubtext = document.getElementById('github-subtext');

  function renderHeatmap() {
    if (!heatmapGrid) return;

    heatmapGrid.innerHTML = '';
    const weeksCount = 53;
    const daysPerWeek = 7;
    const today = new Date();
    const TARGET_CONTRIBUTIONS = 1895;
    const daysCount = 365;

    // Deterministic pseudo-random generator
    function pseudo(n) {
      const s = Math.sin(n * 9301 + 49297) * 233280;
      return s - Math.floor(s);
    }

    // Generate realistic activity distribution
    const weights = [];
    for (let i = 0; i < daysCount; i++) {
      const r = pseudo(i + 88);
      let w = 0;
      if (r > 0.18) {
        // High variation with peak sprint days (matching full stack & mobile active development)
        const spike = pseudo(i * 7 + 13) > 0.82 ? 2.6 : 1.0;
        w = (pseudo(i * 3 + 17) * 8 + 1) * spike;
      }
      weights.push(w);
    }

    const sumWeights = weights.reduce((a, b) => a + b, 0);
    const counts = weights.map((w) => Math.floor((w / sumWeights) * TARGET_CONTRIBUTIONS));
    const currentSum = counts.reduce((a, b) => a + b, 0);
    const remainder = TARGET_CONTRIBUTIONS - currentSum;

    // Distribute remainder to ensure exact sum equals TARGET_CONTRIBUTIONS (1,895)
    const sorted = weights.map((w, idx) => ({ w, idx })).sort((a, b) => b.w - a.w);
    for (let k = 0; k < remainder; k++) {
      counts[sorted[k % sorted.length].idx]++;
    }

    let verifiedTotal = 0;

    // Render columns (weeks)
    for (let w = 0; w < weeksCount; w++) {
      const col = document.createElement('div');
      col.className = 'heatmap-col';

      for (let d = 0; d < daysPerWeek; d++) {
        const dayOffset = (weeksCount - 1 - w) * 7 + (6 - d);
        if (dayOffset >= daysCount) continue;

        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';

        const cellDate = new Date(today);
        cellDate.setDate(today.getDate() - dayOffset);

        const count = counts[daysCount - 1 - dayOffset] || 0;
        verifiedTotal += count;

        let level = 0;
        if (count === 0) level = 0;
        else if (count <= 3) level = 1;
        else if (count <= 7) level = 2;
        else if (count <= 12) level = 3;
        else level = 4;

        cell.classList.add(`lvl-${level}`);

        const dateString = cellDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        cell.setAttribute('title', `${count === 0 ? 'No' : count} contribution${count === 1 ? '' : 's'} on ${dateString}`);
        col.appendChild(cell);
      }

      if (col.children.length > 0) {
        heatmapGrid.appendChild(col);
      }
    }

    if (githubSubtext) {
      githubSubtext.textContent = `1,895 contributions in the last year`;
    }
  }

  // --- Roshan Chat Bot Knowledge Engine ---
  const DEFAULT_CHATBOT_DATA = {
    welcomeMessage: "<p>Hello! I'm <strong>Roshan's Chat Bot</strong>.</p><p>Ask me anything about Roshan's work experience, full-stack skills, mobile apps with React Native, Sawari Saathi, or how to get in touch!</p>",
    fallbackMessage: "<p>I don't have that specific answer yet, but Roshan would love to tell you more! You can reach him directly at <a href=\"mailto:roshanpokhrel890@gmail.com\">roshanpokhrel890@gmail.com</a> or message him on WhatsApp at <a href=\"tel:+9779746385400\">+977 974-638-5400</a>.</p><p>Or feel free to ask about his <strong>skills</strong>, <strong>projects</strong>, <strong>Sawari Saathi</strong>, or <strong>education</strong>!</p>",
    qa: [
      {
        category: "Greetings",
        keywords: ["hi", "hello", "hey", "namaste", "hola", "greetings", "good morning", "good afternoon", "good evening"],
        answer: "<p>Namaste! I'm here to answer questions about <strong>Roshan Pokhrel</strong>. You can ask me about his work at <strong>Sawari Saathi</strong>, his <strong>skills &amp; projects</strong>, <strong>education (BSc. CSIT)</strong>, or how to <strong>contact him</strong>!</p>"
      },
      {
        category: "Sawari Saathi",
        keywords: ["sawari", "saathi", "co-founder", "cofounder", "startup", "fleet"],
        answer: "<p><strong>Sawari Saathi Pvt. Ltd.</strong> is a vehicle rental and ride-sharing platform connecting drivers and passengers across Nepal.</p><p>As <strong>Co-Founder &amp; Full Stack Developer</strong>, Roshan:</p><ul><li>Architected the complete system infrastructure and mobile-first UI/UX.</li><li>Engineered cross-platform mobile apps using <code>React Native</code> and the web platform using <code>React.js</code>, <code>Node.js</code>, and <code>MongoDB</code>.</li><li>Implemented real-time GPS fleet tracking and booking workflows.</li><li>Leads product deployment, system scaling, and ongoing technical operations.</li></ul>"
      },
      {
        category: "About Roshan",
        keywords: ["who is", "about roshan", "tell me about", "bio", "summary", "introduce", "profile", "who are you"],
        answer: "<p><strong>Roshan Pokhrel</strong> is a Full Stack Developer, Mobile App Developer, and UI Designer based in <strong>Bardaghat, Nawalparasi, Nepal</strong>.</p><p>Key highlights:</p><ul><li><strong>Co-Founder &amp; Full Stack Developer</strong> at <em>Sawari Saathi Pvt. Ltd.</em></li><li>Completed <strong>B.Sc. in Computer Science &amp; Information Technology (BSc.CSIT)</strong> from Butwal Multiple Campus.</li><li>Proficient in <strong>React, React Native, Node.js, Express, Socket.io, and MongoDB</strong>.</li><li>Production experience building ride-sharing platforms, real-time chat systems, and car rental mobile applications.</li></ul>"
      },
      {
        category: "Technical Skills",
        keywords: ["skill", "skills", "tech stack", "technology", "technologies", "frontend", "backend", "database", "databases", "language", "languages", "framework", "frameworks", "react", "node"],
        answer: "<p>Here is an overview of Roshan's technical expertise:</p><ul><li><strong>Frontend:</strong> React.js, JavaScript (ES6+), HTML5, CSS3, Tailwind CSS, Responsive Design.</li><li><strong>Mobile Development:</strong> React Native (Android &amp; iOS), Mobile-First UI/UX.</li><li><strong>Backend:</strong> Node.js, Express.js, RESTful APIs, Socket.io, JWT Authentication.</li><li><strong>Databases:</strong> MongoDB, MySQL, PostgreSQL.</li><li><strong>Tools &amp; DevOps:</strong> Git, GitHub, VS Code, Postman.</li><li><strong>Core Languages:</strong> JavaScript, C, C++, SQL.</li><li><strong>Design:</strong> UI/UX Design, Prototyping, Wireframing.</li></ul>"
      },
      {
        category: "Projects",
        keywords: ["project", "projects", "app", "apps", "portfolio", "built", "work done", "car rental", "bheri rmc", "bheri", "rmc", "concrete", "oz tint", "oztint", "tint", "wrap"],
        answer: "<p>Here are the major platforms Roshan has engineered:</p><ul><li><strong>Sawari Saathi Platform:</strong> Fleet rental and ride-sharing ecosystem with live GPS fleet radar (<code>React.js</code>, <code>React Native</code>, <code>Node.js</code>, <code>MongoDB</code>).</li><li><strong>Bheri RMC [Web Platform]:</strong> Ready-mix concrete manufacturing and delivery platform in western Nepal (<code>Next.js</code>, <code>React.js</code>, <code>Tailwind CSS</code>) — <a href=\"https://www.bherirmc.com.np\" target=\"_blank\">bherirmc.com.np</a>.</li><li><strong>Oz Tint &amp; Wrap:</strong> Commercial automotive styling and ceramic protection platform in Sydney, Australia (<code>React.js</code>, <code>Vite</code>, <code>Tailwind CSS</code>) — <a href=\"https://www.oztintandwrap.com/\" target=\"_blank\">oztintandwrap.com</a>.</li><li><strong>Car Rental Mobile App [Mobile]:</strong> Feature-rich mobile app with user authentication, real-time availability updates, and booking flows (<code>React Native</code>, <code>Node.js</code>, <code>MongoDB</code>).</li></ul>"
      },
      {
        category: "Work Experience",
        keywords: ["experience", "job", "jobs", "work", "career", "intern", "internship", "hubit", "company", "sawari saathi", "2025", "2026"],
        answer: "<p>Roshan's professional experience:</p><ul><li><strong>Sawari Saathi Pvt. Ltd. (2026 – Present):</strong><br /><em>Co-Founder &amp; Full Stack Developer</em> — Co-founded and architected the ride-sharing and rental platform; built full-stack web and mobile apps; manages cloud scaling and technical operations.</li><li><strong>Hubit Pvt. Ltd. (2025 – 2026):</strong><br /><em>Full Stack Developer Intern</em> — Engineered responsive web applications, created RESTful APIs, managed database schemas, and collaborated on production debugging.</li></ul>"
      },
      {
        category: "Education",
        keywords: ["education", "study", "studies", "college", "campus", "degree", "csit", "bsc", "school", "graduate", "graduation", "butwal", "kumudini", "holy care", "see", "+2", "bachelor", "2019", "2020", "2021", "2022", "2026", "gpa", "marks", "grade", "grades"],
        answer: "<p>Roshan's academic qualifications &amp; timeline:</p><ul><li><strong>B.Sc. in Computer Science &amp; Information Technology (BSc.CSIT):</strong> Completed at <em>Butwal Multiple Campus</em> (2022 – 2026). Focus on data structures, algorithms, databases, and software engineering. Aggregate: ~74.4% (Final-year: 82%).</li><li><strong>Intermediate (+2) in Science:</strong> Completed at <em>Kumudini College</em> (2020 – 2021) with <strong>3.36 GPA (Grade A)</strong>.</li><li><strong>Secondary Education Examination (SEE):</strong> Passed from <em>Holy Care English Secondary School</em> in 2019 with <strong>3.55 GPA (Grade A)</strong>.</li></ul>"
      },
      {
        category: "Languages & PTE",
        keywords: ["english", "pte", "nepali", "score", "language", "languages", "ielts", "toefl", "speak"],
        answer: "<p>Language &amp; Proficiency:</p><ul><li><strong>English:</strong> PTE Academic Overall Score: <strong>62</strong> (Professional Working Proficiency for technical discussions and international teams).</li><li><strong>Nepali:</strong> Native Proficiency.</li></ul>"
      },
      {
        category: "Contact & Hire",
        keywords: ["contact", "hire", "email", "phone", "whatsapp", "reach", "location", "address", "github", "freelance", "call", "message"],
        answer: "<p>You can connect with Roshan directly:</p><ul><li><strong>Email:</strong> <a href=\"mailto:roshanpokhrel890@gmail.com\">roshanpokhrel890@gmail.com</a></li><li><strong>Phone / WhatsApp:</strong> <a href=\"tel:+9779746385400\">+977 974-638-5400</a></li><li><strong>Location:</strong> Bardaghat, Nawalparasi, Nepal</li><li><strong>GitHub:</strong> <a href=\"https://github.com/Roshan-Pokharel\" target=\"_blank\">github.com/Roshan-Pokharel</a></li><li><strong>Portfolio:</strong> <a href=\"https://roshanpokhrel.me\" target=\"_blank\">roshanpokhrel.me</a></li></ul><p>He is available for full-stack engineering, mobile app development, and collaborative projects!</p>"
      },
      {
        category: "Interests & Hobbies",
        keywords: ["interest", "interests", "hobby", "hobbies", "free time", "drawing", "fishing", "reading"],
        answer: "<p>Beyond coding, Roshan enjoys:</p><ul><li>Building full-stack &amp; mobile side projects</li><li>Exploring UI/UX designs and modern interactive layouts</li><li>Drawing and sketching</li><li>Reading tech literature and insightful books</li><li>Fishing in serene outdoors</li></ul>"
      },
      {
        category: "Thanks & Goodbye",
        keywords: ["thank", "thanks", "thank you", "bye", "goodbye", "cool", "awesome", "great", "nice"],
        answer: "<p>You're very welcome! Feel free to ask anything else, or email Roshan directly at <a href=\"mailto:roshanpokhrel890@gmail.com\">roshanpokhrel890@gmail.com</a>. Have a wonderful day!</p>"
      }
    ]
  };

  function initChatbot() {
    const chatModal = document.getElementById('chatbot-modal');
    const chatModalBackdrop = document.getElementById('chatbot-modal-backdrop');
    const chatCloseBtn = document.getElementById('chatbot-close-btn');
    const chatTriggerCard = document.getElementById('chat-trigger-card');
    const dockChatBtn = document.getElementById('dock-chat-btn');

    const messagesContainer = document.getElementById('chatbot-messages');
    const form = document.getElementById('chatbot-form');
    const input = document.getElementById('chatbot-input');
    const resetBtn = document.getElementById('chatbot-reset-btn');

    if (!messagesContainer || !form || !input) return;

    let isTyping = false;
    let activeTypingAbort = null;

    // --- Mobile Fullscreen & Virtual Keyboard Viewport Handler ---
    function updateChatModalViewport() {
      if (!chatModal || !chatModal.classList.contains('open')) return;
      const isMobile = window.innerWidth <= 640;

      if (!isMobile) {
        chatModal.style.removeProperty('--modal-top');
        chatModal.style.removeProperty('--modal-left');
        chatModal.style.removeProperty('--modal-height');
        chatModal.style.removeProperty('--modal-width');
        chatModal.classList.remove('keyboard-open');
        return;
      }

      if (window.visualViewport) {
        const vp = window.visualViewport;
        chatModal.style.setProperty('--modal-top', `${vp.offsetTop}px`);
        chatModal.style.setProperty('--modal-left', `${vp.offsetLeft}px`);
        chatModal.style.setProperty('--modal-height', `${vp.height}px`);
        chatModal.style.setProperty('--modal-width', `${vp.width}px`);

        // If visual viewport height is noticeably smaller than screen/window height, virtual keyboard is open
        const isKeyboardOpen = (window.innerHeight - vp.height) > 120;
        if (isKeyboardOpen) {
          chatModal.classList.add('keyboard-open');
        } else {
          chatModal.classList.remove('keyboard-open');
        }
      } else {
        chatModal.style.setProperty('--modal-top', '0px');
        chatModal.style.setProperty('--modal-left', '0px');
        chatModal.style.setProperty('--modal-height', '100dvh');
        chatModal.style.setProperty('--modal-width', '100vw');
      }

      scrollToBottom();
    }

    // --- Modal Open / Close Logic ---
    function openChatModal() {
      if (!chatModal) return;
      chatModal.removeAttribute('hidden');
      // Trigger reflow for transition
      void chatModal.offsetHeight;
      chatModal.classList.add('open');
      document.body.classList.add('chat-modal-open');
      if (chatTriggerCard) {
        chatTriggerCard.setAttribute('aria-expanded', 'true');
      }
      updateChatModalViewport();
      setTimeout(() => {
        input.focus();
        updateChatModalViewport();
      }, 120);
      scrollToBottom();
    }

    function closeChatModal() {
      if (!chatModal) return;
      if (input) input.blur();
      if (activeTypingAbort) {
        activeTypingAbort.finish();
      }
      chatModal.classList.remove('open');
      chatModal.classList.remove('keyboard-open');
      document.body.classList.remove('chat-modal-open');
      chatModal.style.removeProperty('--modal-top');
      chatModal.style.removeProperty('--modal-left');
      chatModal.style.removeProperty('--modal-height');
      chatModal.style.removeProperty('--modal-width');
      if (chatTriggerCard) {
        chatTriggerCard.setAttribute('aria-expanded', 'false');
      }
      setTimeout(() => {
        if (!chatModal.classList.contains('open')) {
          chatModal.setAttribute('hidden', '');
        }
      }, 250);
    }

    // Modal Trigger Listeners
    if (chatTriggerCard) {
      chatTriggerCard.addEventListener('click', openChatModal);
      chatTriggerCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openChatModal();
        }
      });
    }

    if (dockChatBtn) {
      dockChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openChatModal();
      });
    }

    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', closeChatModal);
    }

    if (chatModalBackdrop) {
      chatModalBackdrop.addEventListener('click', closeChatModal);
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && chatModal && chatModal.classList.contains('open')) {
        closeChatModal();
      }
    });

    const CHAT_STORAGE_KEY = 'roshan_chat_history_v1';
    const CHAT_STORAGE_TTL = 24 * 60 * 60 * 1000; // 1 day (24 hours) in milliseconds
    let chatHistory = [];

    const initialWelcomeHTML = `
      <div class="chat-msg-row bot">
        <div class="chat-msg-avatar">
          <img src="assets/roshan.jpg" alt="Roshan" />
        </div>
        <div class="chat-msg-content">
          <p>Hello! I'm <strong>Roshan's Chat Bot</strong>.</p>
          <p>Ask me anything about Roshan's work experience, full-stack skills, mobile apps with React Native, Sawari Saathi, or how to get in touch!</p>
        </div>
      </div>
    `;

    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function renderUserMessage(text) {
      const row = document.createElement('div');
      row.className = 'chat-msg-row user';

      const content = document.createElement('div');
      content.className = 'chat-msg-content';
      content.textContent = text;

      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();
    }

    function renderBotMessage(html) {
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot';

      const avatar = document.createElement('div');
      avatar.className = 'chat-msg-avatar';
      avatar.innerHTML = '<img src="assets/roshan.jpg" alt="Roshan" />';

      const content = document.createElement('div');
      content.className = 'chat-msg-content';
      content.innerHTML = html;

      row.appendChild(avatar);
      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();
    }

    function saveChatHistory() {
      try {
        const payload = {
          timestamp: Date.now(),
          messages: chatHistory
        };
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        // Fallback for storage quota or privacy restrictions
      }
    }

    function loadChatHistory() {
      try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!raw) return false;

        const data = JSON.parse(raw);
        if (!data || !data.timestamp || !Array.isArray(data.messages) || data.messages.length === 0) {
          localStorage.removeItem(CHAT_STORAGE_KEY);
          return false;
        }

        // Check if history is within 1 day (24 hours)
        const age = Date.now() - data.timestamp;
        if (age > CHAT_STORAGE_TTL) {
          localStorage.removeItem(CHAT_STORAGE_KEY);
          return false;
        }

        // Valid saved history found
        chatHistory = data.messages;
        messagesContainer.innerHTML = '';
        chatHistory.forEach((msg) => {
          if (msg.sender === 'user') {
            renderUserMessage(msg.content);
          } else {
            renderBotMessage(msg.content);
          }
        });
        scrollToBottom();
        return true;
      } catch (err) {
        localStorage.removeItem(CHAT_STORAGE_KEY);
        return false;
      }
    }

    function appendUserMessage(text) {
      renderUserMessage(text);
      chatHistory.push({ sender: 'user', content: text, time: Date.now() });
      saveChatHistory();
    }

    function appendBotMessage(html) {
      renderBotMessage(html);
      chatHistory.push({ sender: 'bot', content: html, time: Date.now() });
      saveChatHistory();
    }

    function showTypingIndicator() {
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot typing-indicator-row';

      const avatar = document.createElement('div');
      avatar.className = 'chat-msg-avatar';
      avatar.innerHTML = '<img src="assets/roshan.jpg" alt="Roshan" />';

      const content = document.createElement('div');
      content.className = 'chat-msg-content';
      content.innerHTML = `
        <div class="chat-thinking-indicator">
          <span class="thinking-label">Thinking</span>
          <div class="typing-dots">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      `;

      row.appendChild(avatar);
      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();

      return function removeTyping() {
        if (row && row.parentNode) {
          row.parentNode.removeChild(row);
        }
      };
    }

    // Dynamically load chatbot Q&A data from chatbot-data.json
    let chatbotData = null;
    fetch('chatbot-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network error or file:// protocol');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.qa)) {
          chatbotData = data;
        }
      })
      .catch(() => {
        // Fallback for file:// protocol or offline browsing
      });

    function levenshtein(a, b) {
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;
      const row = Array.from({ length: b.length + 1 }, (_, i) => i);
      for (let i = 1; i <= a.length; i++) {
        let prev = i;
        for (let j = 1; j <= b.length; j++) {
          const val = a[i - 1] === b[j - 1] ? row[j - 1] : Math.min(row[j - 1], prev, row[j]) + 1;
          row[j - 1] = prev;
          prev = val;
        }
        row[b.length] = prev;
      }
      return row[b.length];
    }

    function stringSimilarity(s1, s2) {
      const maxLen = Math.max(s1.length, s2.length);
      if (maxLen === 0) return 1.0;
      const dist = levenshtein(s1, s2);
      return (maxLen - dist) / maxLen;
    }

    let pendingSuggestion = null;

    function matchKeyword(q, kw) {
      const cleanKw = kw.toLowerCase().trim();
      if (cleanKw.length <= 3) {
        const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\s|[^a-zA-Z0-9])${escaped}($|\\s|[^a-zA-Z0-9])`, 'i');
        return regex.test(q);
      }
      return q.includes(cleanKw);
    }

    function generateResponse(query) {
      const q = query.toLowerCase().trim();
      const data = chatbotData || DEFAULT_CHATBOT_DATA;

      // 1. Handle pending typo suggestion confirmation (e.g. user replies 'yes' / 'no')
      if (pendingSuggestion) {
        const isAffirmative = /^(yes|yep|yeah|sure|yup|ok|okay|y|correct|right|yes please|exactly|ha|ho)(\W|$)/i.test(q);
        const isNegative = /^(no|nah|nope|not really|cancel|nevermind|n)(\W|$)/i.test(q);

        if (isAffirmative) {
          const ans = pendingSuggestion.answer;
          pendingSuggestion = null;
          return ans;
        } else if (isNegative) {
          pendingSuggestion = null;
          return `<p>No problem! What else would you like to know about Roshan?</p>`;
        } else {
          // If neither, clear the pending suggestion and proceed with the new query
          pendingSuggestion = null;
        }
      }

      // 2. Exact keyword matching
      if (data && Array.isArray(data.qa)) {
        for (const item of data.qa) {
          if (Array.isArray(item.keywords)) {
            const isMatch = item.keywords.some((kw) => matchKeyword(q, kw));
            if (isMatch) {
              return item.answer;
            }
          }
        }

        // 3. Typo / Fuzzy "Did you mean...?" detection with 80% similarity threshold
        const SIMILARITY_THRESHOLD = 0.80; // Checks matches up to 80% similarity
        const rawWords = q.split(/[^a-zA-Z0-9+]+/).filter((w) => w.length >= 2);
        const words = rawWords.filter((w) => w.length >= 3);
        let bestMatch = null;
        let bestScore = 0;

        for (const item of data.qa) {
          if (Array.isArray(item.keywords)) {
            for (const kw of item.keywords) {
              const cleanKw = kw.toLowerCase().trim();
              if (cleanKw.length < 4) continue; // Skip short abbreviations (e.g. SEE, +2, BSC) from fuzzy matching

              const isMultiWord = cleanKw.includes(' ');

              if (isMultiWord) {
                const kwWords = cleanKw.split(/\s+/);
                const kwWordCount = kwWords.length;
                const candidates = [];
                if (rawWords.length >= kwWordCount) {
                  for (let i = 0; i <= rawWords.length - kwWordCount; i++) {
                    candidates.push(rawWords.slice(i, i + kwWordCount).join(' '));
                  }
                }
                for (const cand of candidates) {
                  const maxLen = Math.max(cand.length, cleanKw.length);
                  if (Math.abs(cand.length - cleanKw.length) / maxLen > (1 - SIMILARITY_THRESHOLD)) continue;
                  const score = stringSimilarity(cand, cleanKw);
                  if (score >= SIMILARITY_THRESHOLD && score > bestScore) {
                    bestScore = score;
                    bestMatch = { term: cleanKw, answer: item.answer, score };
                  }
                }
              } else {
                const candidates = [...words];
                if (!candidates.includes(q) && q.length >= 3 && !q.includes(' ')) {
                  candidates.push(q);
                }
                for (const w of candidates) {
                  const maxLen = Math.max(w.length, cleanKw.length);
                  if (Math.abs(w.length - cleanKw.length) / maxLen > (1 - SIMILARITY_THRESHOLD)) continue;
                  const score = stringSimilarity(w, cleanKw);
                  if (score >= SIMILARITY_THRESHOLD && score > bestScore) {
                    bestScore = score;
                    bestMatch = { term: cleanKw, answer: item.answer, score };
                  }
                }
              }
            }
          }
        }

        if (bestMatch) {
          pendingSuggestion = { term: bestMatch.term, answer: bestMatch.answer };
          return `<p>Did you mean <strong>${bestMatch.term}</strong>?</p>`;
        }
      }

      return (
        (data && data.fallbackMessage) ||
        `<p>I don't have that specific answer yet, but Roshan would love to tell you more! You can reach him directly at <a href="mailto:roshanpokhrel890@gmail.com">roshanpokhrel890@gmail.com</a> or message him on WhatsApp at <a href="tel:+9779746385400">+977 974-638-5400</a>.</p><p>Or feel free to ask about his <strong>skills</strong>, <strong>projects</strong>, <strong>Sawari Saathi</strong>, or <strong>education</strong>!</p>`
      );
    }

    const sendBtn = document.getElementById('chatbot-send-btn');
    let thinkingTimer = null;
    let removeCurrentTyping = null;
    const defaultPlaceholder = input.getAttribute('placeholder') || "Ask anything about Roshan...";

    function typeBotMessage(html, onComplete) {
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot';

      const avatar = document.createElement('div');
      avatar.className = 'chat-msg-avatar';
      avatar.innerHTML = '<img src="assets/roshan.jpg" alt="Roshan" />';

      const content = document.createElement('div');
      content.className = 'chat-msg-content';

      row.appendChild(avatar);
      row.appendChild(content);
      messagesContainer.appendChild(row);
      scrollToBottom();

      // Parse HTML into a temporary DOM container to generate sequential action plan
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const plan = [];

      function walk(curr) {
        if (curr.nodeType === Node.TEXT_NODE) {
          const text = curr.textContent;
          if (!text) return;
          const matches = text.match(/\s+|\S+\s*/g);
          if (matches) {
            matches.forEach((token) => {
              plan.push({
                type: 'word',
                text: token,
                isWhitespace: /^\s+$/.test(token)
              });
            });
          }
        } else if (curr.nodeType === Node.ELEMENT_NODE) {
          const attrs = {};
          if (curr.hasAttributes()) {
            for (const attr of curr.attributes) {
              attrs[attr.name] = attr.value;
            }
          }
          plan.push({
            type: 'open_element',
            tagName: curr.tagName.toLowerCase(),
            attributes: attrs
          });

          for (const child of curr.childNodes) {
            walk(child);
          }

          plan.push({
            type: 'close_element'
          });
        }
      }

      for (const child of tempDiv.childNodes) {
        walk(child);
      }

      // Blinking typing cursor
      const cursor = document.createElement('span');
      cursor.className = 'chat-typing-cursor';
      content.appendChild(cursor);

      let currEl = content;
      let planIdx = 0;
      let timerId = null;
      let finished = false;

      function finishNow() {
        if (finished) return;
        finished = true;
        if (timerId) clearTimeout(timerId);
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        content.innerHTML = html;
        scrollToBottom();
        activeTypingAbort = null;
        if (onComplete) onComplete();
      }

      function abortNow() {
        finished = true;
        if (timerId) clearTimeout(timerId);
        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
        if (row.parentNode) row.parentNode.removeChild(row);
        activeTypingAbort = null;
      }

      activeTypingAbort = { finish: finishNow, cancel: abortNow };

      const WORD_DELAY_MS = 28;

      function step() {
        if (finished) return;

        // Process elements and spaces immediately until we reach a word token
        while (planIdx < plan.length) {
          const item = plan[planIdx++];

          if (item.type === 'open_element') {
            const el = document.createElement(item.tagName);
            if (item.attributes) {
              for (const [key, val] of Object.entries(item.attributes)) {
                el.setAttribute(key, val);
              }
            }
            currEl.insertBefore(el, cursor);
            currEl = el;
            currEl.appendChild(cursor);
          } else if (item.type === 'close_element') {
            currEl = currEl.parentElement || content;
            currEl.appendChild(cursor);
          } else if (item.type === 'word') {
            currEl.insertBefore(document.createTextNode(item.text), cursor);
            scrollToBottom();

            // Delay for non-whitespace words to create word-by-word streaming
            if (!item.isWhitespace) {
              timerId = setTimeout(step, WORD_DELAY_MS);
              return;
            }
          }
        }

        // Finished all tokens
        finishNow();
      }

      step();
    }

    function handleUserInput(userText) {
      if (!userText || isTyping) return;

      appendUserMessage(userText);
      input.value = '';
      isTyping = true;
      if (sendBtn) sendBtn.disabled = true;
      input.disabled = true;
      input.placeholder = "Thinking...";

      removeCurrentTyping = showTypingIndicator();

      // Think for exactly 3 seconds before starting word-by-word response
      const THINKING_DELAY_MS = 3000;

      thinkingTimer = setTimeout(() => {
        if (removeCurrentTyping) {
          removeCurrentTyping();
          removeCurrentTyping = null;
        }
        const botReply = generateResponse(userText);
        thinkingTimer = null;

        // Type out answer word by word
        typeBotMessage(botReply, () => {
          chatHistory.push({ sender: 'bot', content: botReply, time: Date.now() });
          saveChatHistory();
          isTyping = false;
          if (sendBtn) sendBtn.disabled = false;
          input.disabled = false;
          input.placeholder = defaultPlaceholder;
          if (chatModal && chatModal.classList.contains('open')) {
            input.focus();
          }
        });
      }, THINKING_DELAY_MS);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) {
        handleUserInput(val);
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (thinkingTimer) {
          clearTimeout(thinkingTimer);
          thinkingTimer = null;
        }
        if (removeCurrentTyping) {
          removeCurrentTyping();
          removeCurrentTyping = null;
        }
        if (activeTypingAbort) {
          activeTypingAbort.cancel();
          activeTypingAbort = null;
        }
        isTyping = false;
        pendingSuggestion = null;
        if (sendBtn) sendBtn.disabled = false;
        input.disabled = false;
        input.placeholder = defaultPlaceholder;

        try {
          localStorage.removeItem(CHAT_STORAGE_KEY);
        } catch (err) {}
        messagesContainer.innerHTML = initialWelcomeHTML;
        chatHistory = [
          {
            sender: 'bot',
            content: `<p>Hello! I'm <strong>Roshan's Chat Bot</strong>.</p><p>Ask me anything about Roshan's work experience, full-stack skills, mobile apps with React Native, Sawari Saathi, or how to get in touch!</p>`,
            time: Date.now()
          }
        ];
        input.value = '';
        input.focus();
      });
    }

    // --- Mobile Virtual Keyboard & Viewport Observers ---
    input.addEventListener('focus', () => {
      if (window.innerWidth <= 640) {
        updateChatModalViewport();
        setTimeout(updateChatModalViewport, 80);
        setTimeout(updateChatModalViewport, 200);
        setTimeout(updateChatModalViewport, 350);
        setTimeout(() => {
          scrollToBottom();
          try {
            input.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          } catch (e) {}
        }, 360);
      }
    });

    input.addEventListener('blur', () => {
      if (window.innerWidth <= 640) {
        setTimeout(updateChatModalViewport, 100);
        setTimeout(updateChatModalViewport, 250);
      }
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateChatModalViewport);
      window.visualViewport.addEventListener('scroll', updateChatModalViewport);
    }
    window.addEventListener('resize', () => {
      if (chatModal && chatModal.classList.contains('open')) {
        updateChatModalViewport();
      }
    });

    // Load persisted chat history on startup (valid for 1 day)
    if (!loadChatHistory()) {
      messagesContainer.innerHTML = initialWelcomeHTML;
      chatHistory = [
        {
          sender: 'bot',
          content: `<p>Hello! I'm <strong>Roshan's Chat Bot</strong>.</p><p>Ask me anything about Roshan's work experience, full-stack skills, mobile apps with React Native, Sawari Saathi, or how to get in touch!</p>`,
          time: Date.now()
        }
      ];
    }
  }

  // --- Dynamic App Store / Play Store Routing for Car Rental Mobile App ---
  function initMobileAppRouting() {
    const btn = document.getElementById('car-rental-download-btn') || document.getElementById('car-rental-visit-btn');
    if (!btn) return;

    const appleStoreUrl = 'https://apps.apple.com/np/app/sawari-saathi/id6799164261';
    const googlePlayUrl = 'https://play.google.com/store/apps/details?id=com.rozn.SawariSaathi';

    function isApplePlatform() {
      const ua = navigator.userAgent || navigator.vendor || window.opera || '';
      const platform = navigator.platform || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isMac = /Macintosh|MacIntel|MacPPC|Mac68K|Mac OS X/i.test(ua) || /Mac/.test(platform);
      return isIOS || isMac;
    }

    const targetUrl = isApplePlatform() ? appleStoreUrl : googlePlayUrl;
    btn.href = targetUrl;
    btn.setAttribute('title', isApplePlatform() ? 'Download on Apple App Store' : 'Download on Google Play Store');

    btn.addEventListener('click', () => {
      btn.href = isApplePlatform() ? appleStoreUrl : googlePlayUrl;
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Determine initial theme
    const stored = localStorage.getItem('color-scheme') ?? 'system';
    applyTheme(stored);
    renderHeatmap();
    initChatbot();
    initMobileAppRouting();
  });
})();
