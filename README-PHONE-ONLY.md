# Creator Studio v0.1 — phone-only Android build kit

This kit is designed so the source can be uploaded to GitHub and built into a **debug APK by GitHub Actions**, using only an Android phone browser. No APK is included yet; the APK is created by the cloud workflow after you upload this project.

## What currently works
- Import a photo and adjust brightness, contrast, saturation, warmth, quick looks and rotation.
- Export the edited photo as PNG.
- Import and preview a video, adjust preview speed, and set trim markers.

## Important current limitation
The video editor does **not** yet render or export a trimmed MP4. The Export video control explains this. Native media processing and full timeline features are later development work.

## Build from your Android phone
1. Sign in to GitHub in Chrome and create a **new empty repository** named `creator-studio`. Do not add a README or license during repository creation.
2. Download and extract this ZIP on your phone using your file manager or an archive app.
3. Upload the *contents* of the extracted `creator-studio-phone-kit` folder to the repository's `main` branch. Make sure `.github/workflows/build-android.yml` is included. If GitHub's mobile upload flow hides dot-folders, use GitHub's browser desktop-site mode or create the workflow file directly on GitHub.
4. Open the repository's **Actions** tab. Select **Build Creator Studio Android APK**, tap **Run workflow**, then confirm.
5. Wait for the workflow to finish with a green check. Open that completed run, scroll to **Artifacts**, and download `creator-studio-debug-apk`.
6. Extract the artifact ZIP and tap `app-debug.apk` to install. Android may ask you to allow installation from that browser or file manager; only enable it for the app you intentionally built, then turn it off again afterward.

## If the build fails
Open the failed Actions run and inspect the first red step. The build uses hosted Linux, Node.js, Java, Gradle and Android SDK, so these tools do not need to be installed on the phone. Share the error text or screenshot and we can fix the project.

## Safety and privacy
Photo/video preview is processed locally in the app; this prototype does not automatically upload media. The GitHub repository contains source code, not your personal photos or videos. Keep the repository private if you prefer not to publish your code.

## Roadmap
1. Improve photo tools: crop, resize, undo/redo.
2. Add native Android MP4 trim/export and audio handling.
3. Add multi-clip timeline, text, music, transitions and aspect-ratio presets.
4. Test memory use and export performance on real Android phones.
