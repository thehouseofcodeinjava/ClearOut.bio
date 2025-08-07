#PROMPT 

I want you to build a fully working, production-ready, one-page SaaS tool called ClearOut.bio using the following specs. The tool should be easy to deploy using Vercel or Netlify, run entirely on the free tier, and include both frontend and backend code (if needed), preferably using Next.js + Tailwind CSS + simple API routes (Node.js).

🧩 Project Overview:
Build a one-page SaaS tool that allows users to paste their Linktree or bio page URL, scans it, and returns:
A list of all the outgoing links
The HTTP status of each (200, 301, 404, etc.)
A flag if a link is broken, redirecting, or slow
Option to export the cleaned links as a simple HTML block
🧰 Tech Stack:
Frontend: React + Tailwind CSS (Next.js preferred)
Backend/API: Node.js (via Next.js API routes or Express)
Hosting: Vercel or Netlify (must work without server-side dependencies)
link checker: Use fetch() with timeout logic to detect status codes
No database — keep everything in memory for now
No login/auth (just a tool, not an app)
Clean UI with CTA to "Clean Your Bio Page"

📦 Functional Requirements:
Input field for user to paste a URL (e.g., https://linktr.ee/username)

Parse HTML of that page to extract all external links (anchor tags)

For each link:

Perform a HEAD or GET request (with timeout and retry)

Return:

Status code (200, 301, 404, etc.)

Whether it's redirecting or broken

Final resolved URL

Display results in a table with:

Original link

Final URL

HTTP status

Status label (✅ OK / ⚠️ Redirect / ❌ Broken)

Option to download the cleaned links (e.g., as HTML snippet or .txt)

Show errors gracefully (e.g., if user pastes an invalid URL)

Add footer with:

“Built with ❤️ by [Your Name]”

Privacy policy placeholder

Minimalistic UI with Tailwind (no external UI libs)

✅ UX Requirements:
Responsive layout (mobile-friendly)

Smooth loading indicator while checking links

Show friendly messages (e.g., “No broken links!” or “Found 3 issues”)

No signup required

Works in less than 10 seconds for a typical Linktree page

🚀 Optional Extras (nice-to-haves):
Allow user to edit or remove broken links before exporting

Add shareable report (via query string or temporary file)

Export as clean HTML block with only valid links

🧪 Testing:
Include example test cases (e.g., test URL like https://linktr.ee/example)

Ensure it handles 404, 500, redirects, and slow sites

Use async/await properly to avoid blocking UI

Debounce API requests where needed

📄 Output Format:
Provide full source code in one block:

/pages/index.js (or App.jsx)

/api/checkLinks.js or equivalent API route

Tailwind CSS config if required

package.json with necessary dependencies

No runtime errors — ensure it compiles and runs locally or on Vercel

Comment your code cleanly

🏁 Final Goal:
A fully working link-cleaning SaaS MVP that:

Is fast

Works with zero backend setup

Can be deployed instantly

Demonstrates clear value in <30 seconds
