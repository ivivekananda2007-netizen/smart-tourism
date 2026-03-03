# 🚀 GitHub Setup & Sharing Guide

This guide will help you share your Smart Tourism Assistant project with your friends on GitHub!

## Step 1: Create a GitHub Account (if you don't have one)
1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Complete the registration
4. Verify your email

## Step 2: Create a New Repository on GitHub

### Option A: Using GitHub Website
1. Log in to GitHub
2. Click the **"+"** icon in the top-right → **New repository**
3. Fill in:
   - **Repository name:** `trip-plan` (or your preferred name)
   - **Description:** "AI-powered trip planner with hidden gems discovery for Indian destinations"
   - **Visibility:** Public (so friends can see it) or Private (invite only)
   - **Initialize with:** Leave unchecked (we have local files)
4. Click **Create repository**

### Option B: Using Git Command Line
```bash
# You'll do this in Step 3
```

## Step 3: Push Your Project to GitHub

### 3.1 Open Command Prompt/PowerShell in your project folder
```bash
cd c:\trip-plan
```

### 3.2 Initialize Git (if not already done)
```bash
git init
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

### 3.3 Add all your files
```bash
git add .
```

### 3.4 Create initial commit
```bash
git commit -m "Initial commit: Smart Tourism Assistant with hidden gems feature"
```

### 3.5 Add GitHub remote
Replace `YOUR_USERNAME` and `REPO_NAME` with your actual GitHub username and repository name:
```bash
git remote add origin https://github.com/YOUR_USERNAME/trip-plan.git
git branch -M main
git push -u origin main
```

### 3.6 Enter GitHub credentials
- When prompted, enter your GitHub username
- For password, use a **Personal Access Token** (see below)

## Step 4: Generate GitHub Personal Access Token

### Why?
GitHub no longer allows direct password authentication. You need a Personal Access Token.

### How to Generate:
1. Go to GitHub → Click your profile photo → **Settings**
2. Click **Developer settings** (bottom-left)
3. Click **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token (classic)**
5. Configure:
   - **Note:** "Trip Plan Project"
   - **Expiration:** 90 days (or longer)
   - **Select scopes:** Check `repo` (full control of private repositories)
6. Click **Generate token**
7. **Copy the token** (you won't see it again!)
8. Use this token as your password when pushing

## Step 5: Share With Friends

### Option 1: Public Repository (Anyone can view/clone)
Your GitHub page URL will be: `https://github.com/YOUR_USERNAME/trip-plan`

Share this link with your friends. They can:
```bash
git clone https://github.com/YOUR_USERNAME/trip-plan.git
cd trip-plan
cd server
npm install
npm run dev
```

### Option 2: Invite Collaborators (Friends can push code)
1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Collaborators** (left sidebar)
4. Click **Add people**
5. Enter your friend's GitHub username
6. Select permission level:
   - **Pull access:** Read-only
   - **Push access:** Can push code
   - **Admin access:** Full control
7. Send them the invite link

### Option 3: Create Organization (Multiple projects)
If you plan more projects with friends:
1. Go to GitHub → Click your profile → **Settings**
2. **Organizations** → **New organization**
3. Name it and add members
4. Create repositories under the organization

## Step 6: Friends Setup Instructions

Share this with your friends:

```markdown
## How to Set Up This Project

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/trip-plan.git
   cd trip-plan
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   
   # Create .env file and add:
   # PORT=5000
   # MONGO_URI=<your mongodb connection string>
   # JWT_SECRET=<your secret key>
   # WEATHER_API_KEY=<your api key>
   
   npm run seed
   npm run dev
   ```

3. **Set up the frontend** (new terminal)
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. **Open in browser**
   Visit: http://localhost:5173

5. **Get credentials**
   - MongoDB: https://www.mongodb.com/cloud/atlas
   - Weather API: https://openweathermap.org/api
```

## Step 7: Continuous Updates

### When you make changes:
```bash
# Make your changes in the code
git add .
git commit -m "Describe your changes here"
git push origin main
```

### When friends push changes:
```bash
git pull origin main
```

### Handle merge conflicts (if any):
If both you and a friend edit the same file:
```bash
# Resolve conflicts manually in the file
git add .
git commit -m "Merge conflict resolved"
git push origin main
```

## Step 8: Best Practices for Collaboration

### 1. Use Branches for Features
```bash
# Create a new branch for each feature
git checkout -b feature/hidden-gems-improvement
# ... make changes ...
git commit -m "Improve hidden gems filter"
git push origin feature/hidden-gems-improvement

# On GitHub, create a Pull Request (PR)
# Friend reviews and approves
# Merge to main
```

### 2. Keep .env Files Secure
```bash
# .gitignore already has .env
# Create .env.example with dummy values for friends:
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key-here
WEATHER_API_KEY=your-api-key-here
```

### 3. Document Your Code
- Add comments for complex functions
- Keep README.md updated
- Create guides for new features

### 4. Use Issues for Task Management
1. Go to your repository
2. Click **Issues** tab
3. Create new issues for:
   - Bug fixes
   - New features
   - Improvements
4. Assign to team members
5. Link to PRs

## Step 9: Adding More Details to GitHub

### Create Additional Documentation
You already have:
- ✅ `README.md` - Main documentation
- ✅ `HIDDEN_GEMS_SETUP.md` - Feature documentation
- ✅ `HIDDEN_GEMS_TROUBLESHOOTING.md` - Troubleshooting

Consider adding:
- `CONTRIBUTING.md` - Contribution guidelines
- `DEVELOPMENT.md` - Developer setup
- `.env.example` - Environment template

## Useful GitHub Commands

```bash
# Check status
git status

# See commit history
git log --oneline

# Undo last commit (not pushed)
git reset --soft HEAD~1

# Clone specific branch
git clone --branch feature-name https://github.com/username/trip-plan.git

# Fetch latest changes without merging
git fetch origin

# Merge specific branch
git merge origin/other-branch

# Delete a branch
git branch -d feature-name
git push origin --delete feature-name
```

## Troubleshooting GitHub

### "Remote already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/trip-plan.git
```

### "Permission denied (publickey)"
- Regenerate SSH keys or use HTTPS with Personal Access Token
- Or: `git config --global user.password "your-token"`

### "Detached HEAD"
```bash
git checkout main
git pull origin main
```

## Next Steps

1. ✅ Create GitHub repository
2. ✅ Push your code
3. ✅ Share with friends
4. ✅ Collaborate and build together!

## Resources

- GitHub Docs: https://docs.github.com
- Git Tutorial: https://git-scm.com/book
- GitHub Desktop App: https://desktop.github.com (GUI alternative to command line)

Happy coding! 🚀
