# Seven Gigs

A free blog for Filipino freelancers: practical **Upwork tips**, **proposal writing**, and **AI tools for beginners**. Written in plain English, built to be simple and fast.

**Live site:** https://seven25-ui.github.io/seven-gigs/

## What's inside

- Posts about freelancing on Upwork (profiles, proposals, Connects, common mistakes)
- Beginner-friendly guides to AI tools, prompts, and automation (n8n, Telegram bots, and more)
- Search, category filters, and a mobile-friendly hamburger menu
- Share buttons on every post
- About, Contact, Privacy, and Terms pages
- A private admin page for writing and editing posts

## How it works

| Part | Tool |
|------|------|
| Hosting | GitHub Pages |
| Database and login | Supabase |
| Front end | Plain HTML, CSS, and JavaScript (no framework) |
| SEO pages | GitHub Action that builds static post pages |

Posts are stored in Supabase and shown on the site through `app.js`. Every post also gets its own static page for better search engine indexing.

## Static post pages (SEO)

A GitHub Action named **Build post pages** generates:

- `posts/` with one static page per post
- `sitemap.xml`
- `robots.txt`

It runs automatically about every 6 hours. To run it right away, go to the **Actions** tab, choose **Build post pages**, and click **Run workflow**.

## Writing a new post

1. Open the admin page and log in.
2. Fill in the **Title**, **Category**, **Excerpt**, and **Content**.
3. Publish.
4. The new post appears on the site right away. Its static page is created on the next Action run.

To add a new category, add it to the `CATEGORIES` list in `app.js`.

## Setup (if you want to run your own copy)

1. Fork or clone this repo.
2. Create a free [Supabase](https://supabase.com) project and a `posts` table.
3. In `app.js`, put in your own Supabase **project URL** and **anon (public) key**.
4. Create an admin user in Supabase Auth.
5. In the repo, go to **Settings > Pages** and publish from the main branch.
6. Check that the **Build post pages** Action has permission to write to the repo (**Settings > Actions > General > Workflow permissions**).

> **Important:** only use the `anon` key in `app.js`. Never put your `service_role` key in this repo. It would give anyone full access to your database.

## Roadmap

- [ ] Submit the sitemap to Google Search Console
- [ ] Custom domain
- [ ] Apply for Google AdSense
- [ ] More posts (goal: 15 to 20)

## Author

Made by **Gene** ([@Seven25-ui](https://github.com/Seven25-ui)), a freelancer from the Philippines sharing what he learns along the way.

## License

Content on this blog is the author's own. Please ask before republishing posts.
