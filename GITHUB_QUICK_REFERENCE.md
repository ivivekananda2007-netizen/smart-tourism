# ⚡ GitHub Quick Start - 5 Minutes to Share

## TL;DR - Super Fast Version

### 1️⃣ Initialize Git (One-time)
```bash
cd c:\trip-plan
git init
git config user.name "Your Name"
git config user.email "your-email@gmail.com"
git add .
git commit -m "Initial commit: Smart Tourism Assistant"
```

### 2️⃣ Create GitHub Repo
- Go to [github.com/new](https://github.com/new)
- Name: `trip-plan`
- Visibility: **Public**
- Create repository

### 3️⃣ Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/trip-plan.git
git branch -M main
git push -u origin main
```
When asked for password, use your **Personal Access Token** (generate at Settings → Developer settings → Personal access tokens)

### 4️⃣ Share!
```
Check out my project! 
https://github.com/YOUR_USERNAME/trip-plan
```

### 5️⃣ Friends Setup
```bash
git clone https://github.com/YOUR_USERNAME/trip-plan.git
cd trip-plan
# Follow GETTING_STARTED.md
```

---

## 📋 One-Page Checklist

| Step | Action | Command |
|------|--------|---------|
| 1 | Install Git | Download from [git-scm.com](https://git-scm.com/) |
| 2 | Initialize | `git init` |
| 3 | Add files | `git add .` |
| 4 | Commit | `git commit -m "Initial commit"` |
| 5 | Create GitHub repo | Go to [github.com/new](https://github.com/new) |
| 6 | Add remote | `git remote add origin https://github.com/YOU/trip-plan.git` |
| 7 | Rename branch | `git branch -M main` |
| 8 | Push | `git push -u origin main` |
| 9 | Share link | Send URL to friends |

---

## 🔐 Personal Access Token (Needed for Step 3)

1. GitHub.com → Profile → Settings
2. Developer settings → Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. Name it "trip-plan"
5. Select `repo` checkbox
6. Generate & Copy
7. Use as password when pushing

---

## 📱 Share Template

Copy & send this to friends:

```
🗺️ Smart Tourism Assistant

I just uploaded my trip planning project to GitHub!

📍 GitHub Link: https://github.com/YOUR_USERNAME/trip-plan

Features:
✨ 943 hidden gems across India
🤖 AI-powered trip planner
💰 Budget tracking
🌤️ Weather alerts

To get it working:
git clone https://github.com/YOUR_USERNAME/trip-plan.git
cd trip-plan
# Read GETTING_STARTED.md for setup

Let me know if you want to contribute! 🚀
```

---

## 🚀 After First Push

### Make Changes & Push
```bash
# Make changes to files...
git add .
git commit -m "Describe what you changed"
git push origin main
```

### Friends Pull Changes
```bash
git pull origin main
```

### Invite Friends to Edit
1. GitHub Repo → Settings → Collaborators
2. Add their GitHub username
3. They get edit access

---

## ✅ Done!

Your project is now shared on GitHub! 🎉

Friends can:
- ✅ See all your code
- ✅ Clone and run it locally
- ✅ Suggest improvements
- ✅ Contribute features (if invited)

---

**Need more help?** Read:
- `SHARE_ON_GITHUB.md` - Full detailed guide
- `GETTING_STARTED.md` - Setup for friends
- `GITHUB_SETUP.md` - GitHub collaboration guide
