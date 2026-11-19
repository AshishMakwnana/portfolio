# PORTFOLIO DESIGN GUIDELINES
## Ashish Makwana — Personal Developer Portfolio

**Document Type:** UI/UX Design System and Frontend Implementation Specification  
**Product:** Personal Developer Portfolio  
**Design Direction:** Premium Dark Developer Portfolio  
**Primary Goal:** Professional identity, technical credibility, project presentation, and career opportunities.

---

# 1. DESIGN VISION

Create a premium, modern, visually impressive personal portfolio for Ashish Makwana.

The website must communicate that the owner is an experienced software developer who builds real-world applications, backend systems, APIs, and full-stack business solutions.

The website should not look like a generic portfolio template.

The visual identity should combine:

- Modern developer portfolio.
- Premium SaaS product design.
- Minimalist editorial layouts.
- Contemporary technology aesthetics.
- Subtle futuristic visual elements.

The website should feel professional, clean, sophisticated, and technically impressive.

The design should prioritize readability, usability, visual hierarchy, and performance.

## Core design principles

1. Minimalism over decoration.
2. Strong typography over excessive graphics.
3. Meaningful animations over unnecessary movement.
4. Consistent spacing and alignment.
5. Clear content hierarchy.
6. Professional presentation over flashy effects.
7. Mobile-first responsive implementation.
8. Consistent visual language across all pages.

---

# 2. COLOR SYSTEM

Use a dark-first theme with blue and cyan accents.

## Primary colors

| Variable | Hex | Purpose |
|---|---|---|
| Background | #080B12 | Main website background |
| Surface | #111827 | Cards and sections |
| Surface Elevated | #161F2E | Elevated components |
| Primary Accent | #38BDF8 | Buttons and highlights |
| Secondary Accent | #6366F1 | Gradients and decorative accents |
| Primary Text | #F8FAFC | Main headings |
| Secondary Text | #94A3B8 | Paragraphs |
| Muted Text | #64748B | Supporting information |
| Border | #263244 | Borders and separators |
| Success | #22C55E | Completed status |
| Warning | #F59E0B | In-progress status |
| Error | #EF4444 | Error states |

## Gradient system

Use gradients sparingly.

Primary gradient:

linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)

Background glow:

radial-gradient(circle, rgba(56,189,248,0.12), transparent 65%)

Hero background should have a subtle blue radial glow behind the main content.

Do not use gradients on every card, button, or heading.

## Color usage

- Main background: 70–80% of the visual area.
- Cards and surfaces: 10–15%.
- Text: 10–15%.
- Accent colors: Used selectively.

The website should remain predominantly dark.

---

# 3. TYPOGRAPHY

Use a modern sans-serif font.

Preferred font families:

- Inter
- Geist
- Plus Jakarta Sans

Use Inter or Geist as the primary font.

## Typography hierarchy

| Element | Desktop Size | Weight |
|---|---:|---|
| Hero heading | 64–80px | 700–800 |
| Section heading | 40–48px | 700 |
| Project heading | 24–28px | 600 |
| Card heading | 18–22px | 600 |
| Body text | 15–17px | 400 |
| Supporting text | 13–14px | 400 |
| Navigation | 14–15px | 500 |

Use fluid typography with clamp() where appropriate.

Example:

font-size: clamp(2.5rem, 6vw, 5rem);

Headings should have tight line-height.

Body text should be comfortable to read.

Avoid excessive uppercase text.

Use uppercase only for small labels such as:

- ABOUT ME
- SELECTED WORK
- EXPERIENCE
- TECHNOLOGIES

---

# 4. LAYOUT AND SPACING SYSTEM

Use a consistent layout system.

Maximum content width:

1200px–1320px.

Centered content with responsive horizontal padding.

Suggested spacing scale:

- 4px
- 8px
- 12px
- 16px
- 24px
- 32px
- 48px
- 64px
- 80px
- 112px

Section spacing:

Desktop: 100–120px vertical spacing.

Tablet: 72–88px.

Mobile: 56–72px.

Use consistent spacing throughout the website.

Avoid unnecessarily large empty spaces.

---

# 5. NAVIGATION DESIGN

Create a premium sticky navigation bar.

Requirements:

- Transparent or slightly dark background initially.
- Subtle backdrop blur.
- Thin bottom border.
- Smooth background transition while scrolling.
- Logo/name on the left.
- Navigation links in the center or right.
- Resume download button on the right.

Navigation:

Home
About
Skills
Experience
Projects
Contact

On mobile:

- Use a compact hamburger menu.
- Show a smooth dropdown or slide-in navigation.
- Close the menu after selecting a section.
- Prevent background scrolling when the menu is open.

The active navigation section should be visually distinguishable.

---

# 6. HERO SECTION

This is the most important section.

Create a distinctive, visually strong first impression.

## Layout

Use a two-column desktop layout.

Left column:

- Small availability/status indicator.
- Greeting.
- Main heading.
- Professional designation.
- Short introduction.
- Primary CTA buttons.
- Social links.

Right column:

- Developer-focused visual composition.
- Abstract technical illustration or profile image.
- Subtle glowing elements.
- Small floating technology labels or terminal-inspired elements.

Do not use generic stock photographs.

## Suggested content

Small label:

HELLO, I'M ASHISH MAKWANA

Main heading:

Building Digital Products
Through Code & Engineering.

Highlight selected words using the primary blue accent.

Professional designation:

Laravel Developer | Backend Engineer | Full-Stack Developer

Introduction:

I build scalable web applications, robust backend systems, and practical digital solutions. My primary focus is Laravel, API development, database architecture, and modern web technologies.

Buttons:

- Explore My Work
- Download Resume
- Contact Me

Social links:

- GitHub
- LinkedIn

## Hero visual

Create a unique developer-themed composition.

Possible elements:

- Terminal window.
- Code snippets.
- Technology icons.
- Abstract connected nodes.
- Subtle grid pattern.
- Glowing blue and purple lighting.

Do not make the hero visual more prominent than the actual professional introduction.

---

# 7. ABOUT SECTION

Design this section with a clean editorial layout.

Use a small section label:

01 / ABOUT ME

Main heading:

A Developer Focused on Building Real Solutions.

Present the professional introduction in readable paragraphs.

Highlight these areas:

- Backend engineering.
- Laravel development.
- REST API development.
- Database-driven applications.
- Frontend integration.
- Business application development.
- Problem-solving.

Use a small statistics area only when the values are verified.

Do not invent numbers such as projects completed, clients served, or years of experience.

Possible layout:

Left:
Professional introduction.

Right:
Technical highlights or a developer-themed visual.

Use subtle dividers and restrained card styling.

---

# 8. SKILLS SECTION

Section label:

02 / TECHNICAL SKILLS

Heading:

Technologies I Work With.

Display skills in categorized groups.

Suggested categories:

1. Backend Development
2. Frontend Development
3. Databases
4. DevOps and Infrastructure
5. Development Tools

Primary skills should be visually emphasized:

- Laravel
- PHP
- REST APIs
- JavaScript
- MySQL
- jQuery

Use technology icons where available.

Preferred presentation:

- Compact technology cards.
- Small icons.
- Technology name.
- Optional experience or proficiency label.

Do not use unnecessary circular progress indicators or arbitrary percentages.

The skill list must be retrieved from the backend database.

---

# 9. EXPERIENCE SECTION

Section label:

03 / EXPERIENCE

Heading:

My Professional Journey.

Use a vertical timeline design.

Each experience item should display:

- Company.
- Job designation.
- Employment period.
- Location.
- Responsibilities.
- Technologies.

Use a subtle vertical line with small accent markers.

The timeline should have clear spacing.

On mobile, use a single-column layout.

Experience information must be dynamically loaded from the backend.

---

# 10. PROJECTS SECTION

Section label:

04 / SELECTED WORK

Heading:

Projects Built to Solve Real Problems.

This should be one of the strongest sections of the portfolio.

## Project card design

Use a responsive grid.

Desktop: 2 columns.

Tablet: 2 columns where space allows.

Mobile: 1 column.

Each project card should contain:

- Project image or screenshot.
- Project name.
- Category.
- Short description.
- Technology tags.
- Project status.
- View Details action.

## Card styling

- Dark elevated background.
- Thin subtle border.
- Rounded corners.
- Clean spacing.
- Large image area.
- Subtle hover effect.
- Small blue accent details.

## Featured projects

Give featured projects slightly more visual prominence.

Do not make every card look identical if the project content benefits from a varied layout.

## Project details page

Create a dedicated project detail page.

It should contain:

- Project overview.
- Problem statement.
- Solution.
- Key features.
- Technical implementation.
- Technology stack.
- Screenshots.
- Live demo link, when available.
- GitHub link, when available.

Project details must be loaded dynamically using the project slug.

Do not hardcode project content into frontend components.

---

# 11. EDUCATION AND CERTIFICATIONS

Section label:

05 / LEARNING

Use a clean card or timeline layout.

Display:

- Education.
- Institution.
- Dates.
- Certification title.
- Issuing organization.
- Certificate link.

Only display verified information.

---

# 12. CONTACT SECTION

Section label:

06 / GET IN TOUCH

Heading:

Have a Project in Mind?
Let's Talk.

Use a two-column layout.

Left:

- Contact introduction.
- Email.
- Location.
- GitHub.
- LinkedIn.

Right:

Contact form fields:

- Name.
- Email.
- Subject.
- Message.

Submit button:

Send Message.

Requirements:

- Proper client-side validation.
- Backend validation.
- Loading indicator.
- Success feedback.
- Error feedback.
- Store submissions in the database.

Prevent spam with server-side rate limiting.

---

# 13. FOOTER

Create a minimal footer.

Include:

- Ashish Makwana.
- Professional designation.
- Navigation links.
- Social links.
- Copyright year.

Use a thin top border.

Avoid unnecessary footer columns.

---

# 14. ANIMATION SYSTEM

Animations should make the experience feel smooth and polished.

Use Framer Motion if already available and appropriate for the existing frontend stack.

Otherwise, prefer lightweight CSS animations and the Intersection Observer API.

Do not install an animation library without checking the existing dependencies.

## Animation principles

- Smooth.
- Subtle.
- Fast.
- Purposeful.
- Consistent.

Default easing:

cubic-bezier(0.22, 1, 0.36, 1)

## A. Page entrance

On initial page load:

- Navigation fades in.
- Hero content fades upward.
- Hero visual appears with a slight scale transition.
- Buttons appear with a small stagger.

Duration:

400–800ms.

## B. Scroll reveal

For section headings and content:

- Opacity: 0 to 1.
- Translate Y: 20px to 0.
- Duration: 500–700ms.

Use staggered animations for cards.

Only animate when an element enters the viewport.

Do not repeatedly animate the same element every time the user scrolls up and down.

## C. Project card hover

On hover:

- Translate Y: -5px.
- Border becomes slightly brighter.
- Image scales to approximately 1.03.
- Accent glow becomes slightly visible.

Transition:

250–350ms.

## D. Button interactions

Buttons should have:

- Smooth color transition.
- Slight background brightness change.
- Small arrow movement where appropriate.
- Clear focus state.

Avoid excessive button scaling.

## E. Hero background

Use a very subtle animated radial gradient or moving glow.

The movement should be slow and almost unnoticeable.

Avoid distracting moving backgrounds.

## F. Floating visual elements

If the hero includes floating technology elements:

- Use very small movement.
- Duration: 4–8 seconds.
- Alternate direction.
- Avoid rapid bouncing.

## G. Navigation

Use smooth scrolling.

Highlight the active section using a subtle color or underline transition.

## H. Loading states

Use subtle skeleton loaders for projects and other dynamic content.

Do not show full-page loading spinners unnecessarily.

## Accessibility

Respect:

prefers-reduced-motion: reduce

When reduced motion is enabled:

- Disable nonessential animations.
- Remove continuous floating effects.
- Avoid smooth scrolling if it causes discomfort.
- Keep all content accessible.

---

# 15. INTERACTION DESIGN

All interactive elements must have clear states.

Buttons:

- Default.
- Hover.
- Active.
- Focus.
- Disabled.
- Loading.

Inputs:

- Default.
- Focus.
- Error.
- Success.
- Disabled.

Cards:

- Default.
- Hover.
- Focus where interactive.

Links must have visible hover and keyboard focus states.

Do not use clickable elements without meaningful functionality.

---

# 16. RESPONSIVE DESIGN

Support:

- Large desktop: 1440px and above.
- Standard desktop: 1024px–1439px.
- Tablet: 768px–1023px.
- Mobile: 320px–767px.

## Desktop

- Two-column hero.
- Multi-column project cards.
- Spacious content.
- Full navigation.

## Tablet

- Reduced section spacing.
- Flexible hero layout.
- Smaller headings.
- Responsive project grid.

## Mobile

- Single-column hero.
- Compact navigation.
- One-column project cards.
- Full-width primary buttons where appropriate.
- Smaller typography.
- Touch-friendly controls.
- No horizontal overflow.

Do not simply shrink the desktop design.

Design mobile layouts intentionally.

---

# 17. TECHNICAL DESIGN REQUIREMENTS

The frontend and backend are separate applications.

Project structure:

portfolio/
├── backend/
└── frontend/

The frontend is responsible for:

- Public website.
- Admin dashboard.
- API integration.
- Rendering portfolio content.
- Responsive interactions.

The backend is responsible for:

- Database.
- APIs.
- Authentication.
- Authorization.
- Content management.
- File management.
- Contact messages.

The frontend must not connect directly to the database.

## Dynamic content

The following content must come from backend APIs:

- Profile.
- About information.
- Skills.
- Experiences.
- Projects.
- Project images.
- Education.
- Certifications.
- Social links.
- Website settings.
- Resume.

Never hardcode editable content in UI components.

Use reusable UI components and a consistent design system.

---

# 18. ADMIN DASHBOARD VISUAL DESIGN

The admin dashboard should share the website's visual identity but prioritize usability.

Use:

- Dark sidebar.
- Clean top navigation.
- Dashboard overview cards.
- Responsive tables.
- Modern forms.
- Consistent buttons.
- Modal dialogs.
- Toast notifications.
- Confirmation dialogs.

Suggested sidebar:

- Overview
- Profile
- Projects
- Skills
- Experience
- Education
- Certifications
- Messages
- Resume
- Website Settings
- Logout

The dashboard should not have excessive gradients or decorative animations.

Admin functionality is more important than visual effects.

All create, edit, delete, publish, and upload operations must actually work.

---

# 19. PERFORMANCE AND ACCESSIBILITY

Performance requirements:

- Optimize images.
- Lazy-load below-the-fold images.
- Avoid unnecessarily large animation libraries.
- Minimize layout shifts.
- Use efficient API requests.
- Avoid unnecessary re-renders.
- Keep transitions GPU-friendly.
- Avoid expensive continuous animations.

Accessibility requirements:

- Semantic HTML.
- Proper heading hierarchy.
- Keyboard navigation.
- Visible focus states.
- Accessible form labels.
- Sufficient contrast.
- Alt text for meaningful images.
- Reduced motion support.

---

# 20. DESIGN RESTRICTIONS

Avoid the following:

1. Generic AI-generated portfolio layouts.
2. Excessive glassmorphism.
3. Too many gradients.
4. Excessive neon colors.
5. Random decorative icons.
6. Huge animated backgrounds.
7. Unnecessary 3D animations.
8. Excessive rounded cards.
9. Unreadable small typography.
10. Fake experience statistics.
11. Fake client testimonials.
12. Fake project screenshots.
13. Unnecessary loading animations.
14. Inconsistent spacing.
15. Overloaded navigation.

The website should look like it was deliberately designed by a professional product designer.

---

# 21. IMPLEMENTATION INSTRUCTIONS FOR GOOGLE AI STUDIO

Before writing or modifying code:

1. Inspect the existing frontend directory.
2. Inspect the existing backend directory.
3. Identify the frameworks and dependencies.
4. Identify existing components and styling conventions.
5. Understand the API integration.
6. Understand the existing database structure.
7. Preserve the existing application architecture.

Do not assume that frontend and backend use the same technology.

Do not replace working functionality.

Do not introduce a new framework just to implement the design.

## Implementation order

Phase 1:
- Establish design tokens.
- Establish typography.
- Establish spacing.
- Establish shared components.

Phase 2:
- Implement navigation.
- Implement hero section.
- Implement about section.
- Implement skills section.

Phase 3:
- Implement experience.
- Implement projects.
- Implement project detail pages.

Phase 4:
- Implement education.
- Implement contact section.
- Implement footer.

Phase 5:
- Implement admin dashboard styling.
- Integrate dynamic API data.
- Implement loading and error states.

Phase 6:
- Implement responsive layouts.
- Implement animations.
- Test accessibility.
- Test performance.

## Important instructions

Do not generate the entire website as one large component.

Build reusable components.

Do not use hardcoded arrays for content that should come from the database.

Do not replace the existing database or backend.

Do not fabricate project information.

Do not modify environment secrets.

Do not implement decorative interactions that have no actual functionality.

After each phase, verify that the implementation works before proceeding.

---

# 22. FINAL DESIGN EXPECTATION

The final portfolio should communicate the following identity:

**Ashish Makwana**

Laravel Developer | Backend Engineer | Full-Stack Developer

A developer who builds real-world applications, scalable backend systems, and practical software solutions.

The website should be:

- Premium.
- Modern.
- Professional.
- Minimal.
- Responsive.
- Fast.
- Accessible.
- Dynamic.
- Easy to maintain.

The most important design objective is to create a memorable professional identity while allowing recruiters and potential clients to understand my technical capabilities and explore my actual projects.

The finished result must feel like a custom-designed developer portfolio, not a downloaded template.
