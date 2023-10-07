## Bug Tracker

A platform where you can track bugs on a board similar to Jira. Note: This is an early version, I'll be adding more
features.

### Gallery

TODO: Add Demo Video

<details>
  <summary>See screenshots</summary>
  <p>Board / Tracker</p>
  <a href="https://i.imgur.com/rIUmw9d.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/rIUmw9d.png" />

  <p>Quick Edit Bug</p>
  <a href="https://i.imgur.com/baTodZR.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/baTodZR.png" />

  <p>Bug Details - Edit mode</p>
  <a href="https://i.imgur.com/I6E7aPB.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/I6E7aPB.png" />

  <p>Bug Details</p>
  <a href="https://i.imgur.com/lTIYkJ2.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/lTIYkJ2.png" />

  <p>Manage board / tracker team</p>
  <a href="https://i.imgur.com/T7IZtJl.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/T7IZtJl.png" />

  <p>'My assigned bugs' Page</p>
  <a href="https://i.imgur.com/MiPATTA.png" target="_blank">See Image</a>
  <img src="https://i.imgur.com/MiPATTA.png" />
</details>

### Set-up locally

1. Set-up `.env.local` file at the **root directory** of the project with the following:

```
# Mongo DB variables
DATABASE_URI=<MONGO_DATABASE_URL>
DATABASE_KEY=<NAME_OF_YOUR_DATABASE>

# Authentication System variables (As documented here: https://authjs.dev/reference/sveltekit#usage)
AUTH_SECRET=<REALLY_LONG_AND_COMPLICATED_PASSKEY>

# Github OAuth2 Provider Variables (checkout: https://github.com/settings/applications/new)
GITHUB_ID=<GITHUB_ID>
GITHUB_SECRET=<GITHUB_SECRET>
```

2. Run `npm install` (or your preferred package manager).
3. Run `npm run dev -- --open`.
   Congrats!

