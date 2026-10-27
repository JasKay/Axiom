# Live camera and local service recording

Live camera and service recording require an active Church Workspace subscription. Standalone presentation stays free. Connect Tech's Axiom Pro account to the subscribed church before starting capture. Starting capture requires an online subscription check; video stays local after that. No camera frames, recording audio, or recording files are uploaded by these tools.

## Live camera

Click the **Camera icon beside Program**, in its media-control strip, select a camera or USB capture card, and start its preview. Add the checked camera to your service, then select Live to put it on Program. Camera audio is deliberately excluded to avoid room feedback. The output window receives the feed over a local WebRTC connection with no external STUN/TURN service. Network-camera URLs, RTSP ingestion and cloud streaming are not included.

The green Camera on control stops capture. Stopping the camera blacks its camera output and stops a camera recording. Saved camera items retain only the local device identifier; reconnect the camera after restarting Axiom. They do not send device identifiers or streams to Leader or AxiomU. Switching to Standalone releases capture. Confirm a capture card works with the operating system before preparing a live service.

## Recording

Open **Program → Streaming → Record video**. Choose Program video, camera video or audio only, and select your microphone or mixer input. Choose the destination file and start recording. The visible Recording timer includes **Stop & save**. Program video captures the actual audience output, including slides and video, without the operator controls. Camera video captures the selected camera. Program audio and a microphone/mixer input can be included. Files are WebM, playable in compatible browsers and players such as VLC. No recording consumes the church's cloud upload/storage allowance unless someone later explicitly uploads the saved file.

The desktop writes ordered chunks directly to the selected disk location. It does not accumulate an entire service in renderer memory. The final file is renamed from a unique `.part` file after recording finishes. A recording interrupted by a crash, disk failure or device removal may leave a partial file beside the selected destination. Keep free disk space available, stop/save before disconnecting devices, and test the church's actual camera and audio mixer before a service. A compatible web browser can stream to disk through Save File support; browsers without that support direct users to the desktop app instead of buffering a long recording in memory.

Mac camera/microphone permissions are separate from the unsigned-app launch exception. See [Mac installation](MAC-INSTALLATION.md). Desktop Program capture is limited to Axiom’s own audience frame; it does not capture other applications or the operator interface. See [Streaming setup](STREAMING.md) for destination and encoder instructions.
