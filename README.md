# Seven Gigs

A free blog for Filipino freelancers: practical **Upwork tips**, **proposal writing**, and **AI tools for beginners**. Written in plain English, built to be simple and fast.

**Live site:** https://sevengigs.online/

## What's inside

- Posts about freelancing on Upwork (profiles, proposals, Connects, common mistakes)
- Beginner-friendly guides to AI tools, prompts, and automation (n8n, Telegram bots, and more)
- Search, category filters, and a mobile-friendly hamburger menu
- Share buttons on every post
- A small store page for digital products for freelancers (prompt packs and guides)
- About, Contact, Privacy, and Terms pages
- A private admin page for writing and editing posts

## How it works

| Part | Tool |
|------|------|
| Hosting | GitHub Pages |
| Domain | sevengigs.online (DNS records set at the domain registrar, pointing to GitHub Pages) |
| Database and login | Supabase |
| Front end | Plain HTML, CSS, and JavaScript (no framework) |
| SEO pages | GitHub Action that builds static post pages |

Posts are stored in Supabase (table `gigs_posts`) and shown on the site through `app.js`. Every post also gets its own static page for better search engine indexing.

## Custom domain

The site is served from `sevengigs.online`. The old address (`seven25-ui.github.io/seven-gigs`) redirects to it.

- The `CNAME` file in the root of this repo must contain `sevengigs.online` and nothing else. Do not delete it, or the custom domain will stop working.
- At the domain registrar, the apex domain points to GitHub Pages with four `A` records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`), and `www` is a `CNAME` to `seven25-ui.github.io`.
- In **Settings > Pages**, the custom domain is set to `sevengigs.online` and **Enforce HTTPS** is turned on.

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

You can also add posts directly in Supabase (**SQL Editor** or **Table Editor**) in the `gigs_posts` table, using the columns `title`, `category`, `excerpt`, and `content`.

To add a new category, add it to the `CATEGORIES` list in `app.js`.

## Store

`store.html` lists digital products. To change products, prices, or payment details, edit the block between `EDIT THESE` and `END EDIT` near the bottom of the file. The GCash QR image is `gcash-qr.png` in the root of the repo. Buyers pay, then email their receipt, and the file is sent by email.

## Setup (if you want to run your own copy)

1. Fork or clone this repo.
2. Create a free [Supabase](https://supabase.com) project and a `gigs_posts` table with the columns `id` (uuid), `title`, `category`, `excerpt`, and `content`.
3. In `app.js`, put in your own Supabase **project URL** and **anon (public) key**.
4. Create an admin user in Supabase Auth.
5. In the repo, go to **Settings > Pages** and publish from the main branch.
6. Check that the **Build post pages** Action has permission to write to the repo (**Settings > Actions > General > Workflow permissions**).
7. Optional: add your own domain in **Settings > Pages** and create a `CNAME` file in the repo root with your domain.

> **Important:** only use the `anon` key in `app.js`. Never put your `service_role` key in this repo. It would give anyone full access to your database.

## Roadmap

- [x] Custom domain (sevengigs.online)
- [x] 15 to 20 posts published
- [x] Store page with GCash payment
- [ ] Submit the sitemap to Google Search Console
- [ ] Finish and sell the first digital products
- [ ] Apply for Google AdSense

## Author

Made by **Gene** ([@Seven25-ui](https://github.com/Seven25-ui)), a freelancer from the Philippines sharing what he learns along the way.

## License

Content on this blog is the author's own. Please ask before republishing posts.
