# 🐳 How to Clean Install Docker Desktop on Windows

Since you're having issues, a clean reinstall is the best way to fix them. Follow these steps exactly.

## Part 1: Uninstall Existing Docker (Delete)

1.  **Close Docker Desktop** if it's running.
    *   Look for the whale icon in the bottom-right taskbar (near the clock).
    *   Right-click it and select **Quit Docker Desktop**.
2.  Open **Windows Settings**.
3.  Go to **Apps** > **Installed apps**.
4.  Search for **"Docker Desktop"**.
5.  Click the three dots `...` next to it and select **Uninstall**.
6.  Follow the prompts to remove it.
7.  **IMPORTANT: Restart your computer now.** 🔄
    *   Do not skip this step. A reboot ensures all locked files are released.

## Part 2: Install Docker Desktop (New & Best)

1.  **Download the Installer**:
    *   Go to: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    *   Click the big blue button **"Download for Windows"**.

2.  **Run the Installer**:
    *   Double-click `Docker Desktop Installer.exe`.

3.  **Configuration (Critical Request)**:
    *   When asked, **CHECK** the box that says:
        *   ✅ **Use WSL 2 instead of Hyper-V**
    *   (This is the "best" modern way to run Docker on Windows).

4.  **Finish & Restart**:
    *   Let the installation finish.
    *   It will likely ask you to **"Close and restart"** again. Do it. 🔄

5.  **First Run**:
    *   After restarting, Open **Docker Desktop**.
    *   Accept the Service Agreement.
    *   **Sign In** (optional) or click "Continue without signing in".
    *   **Survey**: You can click "Skip" on the survey.

## Part 3: Verify It Works

1.  Open your terminal (PowerShell or Command Prompt).
2.  Run this command:
    ```powershell
    docker run hello-world
    ```
3.  If you see:
    > Hello from Docker!
    > This message shows that your installation appears to be working correctly.

    ...then you are successful! 🎉

## Part 4: Run Your Project

Once Docker is working, navigate to your project folder:

```powershell
cd "c:\Users\SanjayS\Desktop\Month 1\Week 5\Week 5 Test"
docker-compose up --build -d
```

Good luck! 🚀
