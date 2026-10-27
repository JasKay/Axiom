# Program, Camera and Streaming

Camera is the camera-shaped icon beside Program, in the same strip as the text/video/image/audio controls. It opens source selection and preview. Live camera and broadcasting require an active Church Workspace subscription.

The **Streaming** tab beside Program contains **Record video** and **Live stream**. Recording defaults to the actual audience Program frame. Camera video and audio-only are alternatives. Program audio and the selected microphone/mixer can be included. Files stream directly to a chosen local WebM file; they are not uploaded to Axiom. Program capture uses Electron's own audience frame, excluding the operator interface and the rest of the desktop.

## Connect a live destination

1. Open Streaming → Connect destination. Choose YouTube, Facebook, Instagram, Twitch, or Other RTMP/RTMPS.
2. Open the platform's dashboard, enable its live-streaming feature, and copy its current server URL and stream key. Account eligibility and platform approval remain the platform's responsibility. Instagram requires access to Live Producer; Axiom cannot enable it for an ineligible account.
3. Install a current FFmpeg encoder from the sources linked at https://ffmpeg.org/download.html. Choose its executable once in Axiom. The encoder needs H.264, AAC, and RTMP/RTMPS support. Axiom does not bundle or automatically download FFmpeg. The encoder selection is saved locally.
4. Choose Program or Camera and the microphone/mixer input. Program audio can also be included. Start sending, check the platform preview, and confirm Go Live there when required.
5. Stop the stream in Axiom and end the public event in the platform dashboard when required.

This uses the platform's standard encoder connection, not an OAuth account sign-in or a cloud multistream relay. One destination is supported at a time. Stream keys stay in window memory for the session and go to the local encoder; they are not placed in project exports, browser storage, Axiom's API, logs or billing records. The encoder itself must use the key to connect to the chosen platform. RTMPS provides encrypted transport where the platform supports it.

Streaming consumes the computer's CPU and the church's internet upload bandwidth. It does not consume Axiom's shared-file allowance or require an Axiom media relay. Supported sources and actual permissions should be checked on the church's own equipment before a service. The browser app can use a user-selected display source for local recording where supported; direct RTMP/RTMPS broadcasting uses the desktop app.

Verification: `scripts/verify-streaming.cjs` sends actual H.264/AAC to a local RTMP receiver and decodes the result. Set `AXIOM_TEST_FFMPEG` to an installed encoder. `desktop/program-capture.cjs` records a known Program frame and verifies its decoded pixels. With the same environment variable it also tests the complete native Streaming UI, capture, IPC, encoder, RTMP receiver and decoded Program pixels. These tests do not contact or start a public social broadcast.
