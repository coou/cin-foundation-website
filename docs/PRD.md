Product Requirements Document CIN Foundation Starter Website (v1.0)


| **Document Version:** | 1.0                                        |
| --------------------- | ------------------------------------------ |
| **Status:**           | Draft                                      |
| **Author:**           | Gemini (in collaboration with CIN Founder) |
| **Date:**             | July 16, 2025                              |

## 1. Introduction & Purpose

### 1.1. Product Vision

The CIN Foundation website will serve as the primary digital "front door" for the Collective Intelligence Network. Its purpose is not to be the network itself, but to be the authoritative source of information that establishes the project's credibility, articulates its profound vision, and attracts the first cohort of high-value collaborators (directors, researchers, partners, and early community members). It must be professional, intellectually rigorous, and inspiring.

### 1.2. Scope

This PRD covers the initial public-facing website (v1.0). It is designed as a static informational site. It will **not** include dynamic user accounts, interactive network features, or a content management system (CMS). All content will be updated by deploying new versions of the site.

### 1.3. Target Audience

- **Academics & Researchers:** (Computer Science, Economics, Sociology, Philosophy) Seeking to understand the theoretical underpinnings and research opportunities.
    
- **Potential Board Members & Advisors:** Experienced professionals evaluating the project's seriousness, governance, and long-term vision.
    
- **Technologists & Developers:** (AI/ML, Blockchain, Distributed Systems) Interested in the open-source technology stack and potential for contribution.
    
- **Philanthropists & Grant Officers:** Assessing the charitable mission and potential for societal impact.
    
- **The Intellectually Curious Public:** Individuals interested in the future of society, AI, and economics.
    

### 1.4. Goals & Success Metrics

- **Goal 1: Establish Credibility.** The site must look and feel professional and intellectually sound.
    
    - **Metric:** Positive qualitative feedback from initial outreach targets.
        
- **Goal 2: Clearly Articulate the Vision.** Visitors should leave with a clear understanding of the CIN's core purpose and themes.
    
    - **Metric:** Low bounce rate (<60%) and an average time on page of >90 seconds for the "Vision" and "Whitepaper" sections.
        
- **Goal 3: Drive High-Quality Engagement.** The site should encourage the right people to get involved.
    
    - **Metric:** Receive at least 5-10 qualified inquiries via the contact email within the first three months of outreach.
        
- **Goal 4: Be Low-Cost and Secure.** Leverage the Firebase Spark plan effectively.
    
    - **Metric:** Monthly hosting costs remain at $0. Achieve a top score on security and performance benchmarks (e.g., Google Lighthouse).
        

## 2. Functional Requirements

The website will be a Single Page Application (SPA) with distinct sections accessible via the navigation bar.

### 2.1. **Global Elements**

- **FR1: Navigation Bar:** A sticky header containing the CIN logo and links to the main sections: Vision, Research, Blog, Get Involved.
    
- **FR2: Footer:** A simple footer with copyright information, a link to the Governance repository on GitHub, and a reiteration of the non-profit status.
    

### 2.2. **Page Sections**

- **FR3: Home / Hero Section**
    
    - **Description:** The first thing a visitor sees. It must immediately capture the ambition and essence of the project.
        
    - **Content:**
        
        - Compelling headline (e.g., "Building the Operating System for a More Intelligent Society").
            
        - The core "Elevator Pitch" (1-2 sentences).
            
        - A primary Call-to-Action (CTA) button linking to the "Vision" section.
            
        - A secondary CTA linking to the "Whitepaper."
            
    - **Reference:** The approved website demo (`e0f8b1c5-a9d1-4b7e-9e8c-f1d2c6c7b3d4`).
        
- **FR4: Vision / About Section**
    
    - **Description:** A narrative-driven section explaining the "why" behind the CIN.
        
    - **Content:**
        
        - Briefly introduces the limitations of current systems.
            
        - Presents the four core themes as pillars:
            
            1. Beyond Scarcity (Post-Labor Economy)
                
            2. A New Definition of Value (Multi-Dimensional Reputation)
                
            3. Human-AI Symbiosis (Cognitive Partners)
                
            4. Radical Transparency & Trust
                
        - The content from the "Core Theme" documents (`cin-theme-*`) should be adapted for this section.
            
- **FR5: Research / Whitepapers Section**
    
    - **Description:** The credibility anchor. This section demonstrates the intellectual rigor of the project.
        
    - **Content:**
        
        - A prominent link to download the full "Foundational Whitepaper" as a PDF.
            
        - An embedded PDF viewer for easy reading is a "nice-to-have" but not essential for v1.0.
            
        - A list of any other supporting documents or future research papers.
            
        - Include links to the GitHub repositories for `axiom-explorer` and `economic-simulation` with brief descriptions and screenshots/GIFs of them in action.
            
- **FR6: Blog / Insights Section**
    
    - **Description:** A section for more accessible, shorter-form content to engage a broader audience.
        
    - **Content:**
        
        - A grid or list of blog post summaries.
            
        - Initial content will be the four articles derived from the core themes (`cin-blog-post-*`).
            
        - Each summary should link to a simple, dedicated page for the full article text.
            
- **FR7: Get Involved / Contact Section**
    
    - **Description:** A clear and direct call to action for potential collaborators.
        
    - **Content:**
        
        - A brief statement outlining the types of collaborators being sought (researchers, developers, advisors).
            
        - A clear, non-form `mailto:` link for initial contact (to avoid the need for backend functions). Example: `contact@cin-foundation.org`.
            
        - Links to the Foundation's primary social channels (LinkedIn, X/Twitter) and the GitHub organization.
            

## 3. Non-Functional Requirements

- **NFR1: Performance:** The site must be extremely fast. As a static site, it should achieve a Google Lighthouse performance score of 95+.
    
- **NFR2: Security:** All traffic must be served over HTTPS (handled by Firebase Hosting by default). No external scripts from untrusted sources.
    
- **NFR3: Accessibility:** The site must adhere to WCAG 2.1 AA standards, ensuring it is usable by people with disabilities. This includes semantic HTML, proper color contrast, and keyboard navigability.
    
- **NFR4: Responsiveness:** The layout must be fully responsive and optimized for excellent viewing on all devices (desktop, tablet, and mobile).
    
- **NFR5: Design:** The visual design should be clean, modern, professional, and slightly futuristic, consistent with the aesthetic established in the HTML demo (`e0f8b1c5-a9d1-4b7e-9e8c-f1d2c6c7b3d4`).
    

## 4. Technology Stack & Deployment

- **Frontend Framework:** Plain HTML, CSS, and JavaScript. No complex framework (like React or Vue) is needed for v1.0 to ensure maximum performance and simplicity.
    
- **Styling:** Tailwind CSS for a utility-first, modern design system.
    
- **Hosting:** **Firebase Hosting (Spark Plan)**. This provides a generous free tier for hosting, a global CDN for speed, and automated SSL certificate provisioning for security.
    
- **Version Control:** **GitHub**. The website's source code will be hosted in a public repository within the CIN GitHub organization.
    
- **Continuous Deployment (CI/CD):** **GitHub Actions**. A simple workflow will be configured to automatically build and deploy the site to Firebase Hosting upon every push to the `main` branch. This ensures that content updates are seamless and instant.
    

## 5. Future Considerations (Out of Scope for v1.0)

- Content Management System (CMS) for easier blog updates.
    
- Interactive WebGL or D3.js visualizations embedded directly on the site.
    
- User accounts and network integration.
    
- Multi-language support.
    

This PRD provides a clear and comprehensive blueprint for building a powerful, credible, and low-cost starter website that will effectively serve the CIN Foundation's initial strategic goals.