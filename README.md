
# TCG React App (TypeScript)

This is a Trading Card Game (TCG) web app built with **React** and **TypeScript**. It uses `react-scripts` for development and build, and **Framer Motion** for animations.

---

## 🟢 How to Run This Project (No Coding Experience Needed)

### 1. Install Node.js

- Go to [https://nodejs.org/](https://nodejs.org/) and download the **LTS** version for your operating system (Windows, Mac, or Linux).
- Run the installer and follow the prompts (default options are fine).
- After installation, open a terminal (Command Prompt or PowerShell on Windows).

Check installation:

```
node -v
npm -v
```
Both should print a version number (e.g. `v18.19.0`).

### 2. Download the Project Files

- If you received a ZIP file, extract it to a folder.
- If you are using GitHub, click the green **Code** button and choose **Download ZIP** or use `git clone` if you know how.

### 3. Open a Terminal in the Project Folder

- On Windows: Right-click in the folder and choose **Open in Terminal** or **Open PowerShell window here**.
- On Mac: Open Terminal, then `cd` to the folder.

### 4. Install the Project Dependencies

In the terminal, run:

```
npm install
```

This will download everything needed to run the app. (You only need to do this once, or if you get new files.)

### 5. Start the App

In the same terminal, run:

```
npm start
```

This will open the app in your web browser (usually at [http://localhost:3000](http://localhost:3000)).

---

## � What You Should See

- A card game interface with menus, deck building, and gameplay.
- All code is now in **TypeScript** (`.tsx`/`.ts` files). There are no `.js` files in `src/`.
- You do **not** need to change any code to play or test the app.

---

## 🛠️ Troubleshooting (If Something Doesn't Work)

**1. Node or npm not found?**
  - Make sure you installed Node.js and opened a new terminal after installing.

**2. Errors during `npm install`?**
  - Try deleting the `node_modules` folder and `package-lock.json` file, then run `npm install` again.

**3. Errors during `npm start`?**
  - Make sure you are in the correct folder (where `package.json` is).
  - Try running `npm install` again.
  - If you see a message about a port being in use, close other apps or restart your computer.

**4. Still stuck?**
  - Ask a developer for help, or search the error message online.

---

## � Scripts You Can Use

- `npm start` — Start the app in development mode (auto-reloads on changes)
- `npm run build` — Make a production build (for deployment)
- `npm test` — Run tests (if any)

---

## 📝 Notes for Developers

- All logic is now in TypeScript. No legacy JS files remain.
- Main entry: `src/index.tsx` and `src/App.tsx`
- Styles: `src/App.css` and `src/styles.css`
- Card pool and constants: `src/constants.ts`
- Game state and reducer: `src/state.ts`
- Components: `src/components/`
- Animations: [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License & Contributing

- Add a `LICENSE` file (e.g., MIT) if you plan to open-source the repo.
- Add a `CONTRIBUTING.md` if you want contribution guidelines.

---
