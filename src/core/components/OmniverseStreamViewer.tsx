// SPDX-FileCopyrightText: Copyright (c) 2026 CADIT. All rights reserved.
import React, { Component } from 'react';
import {
  AppStreamer,
  StreamEvent,
  StreamProps,
  DirectConfig,
  GFNConfig,
  StreamType
} from '@nvidia/omniverse-webrtc-streaming-library';
import streamConfig from '../../../stream.config.json';

export interface OmniverseStreamViewerProps {
  style?: React.CSSProperties;
  onStarted?: () => void;
  onStreamFailed?: (error: any) => void;
  onCustomEvent?: (event: any) => void;
}

interface OmniverseStreamViewerState {
  streamReady: boolean;
  statusText: string;
  isError: boolean;
}

export class OmniverseStreamViewer extends Component<
  OmniverseStreamViewerProps,
  OmniverseStreamViewerState
> {
  private _isRequested: boolean = false;

  constructor(props: OmniverseStreamViewerProps) {
    super(props);
    this.state = {
      streamReady: false,
      statusText: 'Connecting to Omniverse Kit stream...',
      isError: false
    };
  }

  componentDidMount() {
    if (this._isRequested) return;
    this._isRequested = true;

    try {
      let streamProps: StreamProps;
      const source = (streamConfig.source || 'local') as 'local' | 'stream' | 'gfn';

      if (source === 'local') {
        const directConfig: DirectConfig = {
          videoElementId: 'remote-video',
          audioElementId: 'remote-audio',
          authenticate: false,
          maxReconnects: 20,
          signalingServer: streamConfig.local?.server || '127.0.0.1',
          signalingPort: streamConfig.local?.signalingPort || 49100,
          mediaServer: streamConfig.local?.server || '127.0.0.1',
          nativeTouchEvents: true,
          width: 1920,
          height: 1080,
          fps: 60,
          onUpdate: (msg: StreamEvent) => this._onUpdate(msg),
          onStart: (msg: StreamEvent) => this._onStart(msg),
          onCustomEvent: (msg: any) => this._onCustomEvent(msg),
          onStop: (msg: StreamEvent) => this._onStop(msg),
          onTerminate: (msg: StreamEvent) => this._onTerminate(msg)
        };

        streamProps = {
          streamConfig: directConfig,
          streamSource: StreamType.DIRECT
        };
      } else {
        // GFN or custom stream fallback
        streamProps = {
          streamConfig: {
            videoElementId: 'remote-video',
            audioElementId: 'remote-audio',
            authenticate: false,
            signalingServer: '127.0.0.1',
            signalingPort: 49100,
            mediaServer: '127.0.0.1',
            onStart: (msg: StreamEvent) => this._onStart(msg)
          } as any,
          streamSource: StreamType.DIRECT
        };
      }

      AppStreamer.connect(streamProps)
        .then((result: any) => {
          if (result && result.status === 'success') {
            this.setState({ streamReady: true, statusText: 'Live Stream Active' });
            this.props.onStarted?.();
          } else {
            this.setState({ statusText: 'WebRTC handshaking established' });
          }
        })
        .catch(err => {
          this.setState({
            isError: true,
            statusText: `Streaming connection failed: ${err?.message || 'Server unreachable'}`
          });
          this.props.onStreamFailed?.(err);
        });
    } catch (e: any) {
      this.setState({
        isError: true,
        statusText: `Initialization error: ${e?.message || e}`
      });
      this.props.onStreamFailed?.(e);
    }
  }

  componentDidUpdate(_prevProps: OmniverseStreamViewerProps, prevState: OmniverseStreamViewerState) {
    if (prevState.streamReady === false && this.state.streamReady === true) {
      const localPlayer = document.getElementById('remote-video') as HTMLVideoElement;
      if (localPlayer) {
        localPlayer.tabIndex = -1;
        localPlayer.playsInline = true;
        localPlayer.muted = true;
        localPlayer.play().catch(e => console.log('Autoplay handled:', e));
      }
    }
  }

  static stop() {
    try {
      AppStreamer.stop();
      (AppStreamer as any)._stream = null;
    } catch {}
  }

  private _onStart(message: any) {
    if (message.action === 'start' && message.status === 'success' && !this.state.streamReady) {
      console.info('[WebRTC] Omniverse WebRTC streamReady');
      this.setState({ streamReady: true, statusText: 'Live Stream Active' });
      this.props.onStarted?.();

      const videoEl = document.getElementById('remote-video') as HTMLVideoElement;
      if (videoEl) {
        videoEl.tabIndex = -1;
        videoEl.playsInline = true;
        videoEl.muted = true;
        videoEl.play().catch(() => {});
      }
    }
  }

  private _onUpdate(message: StreamEvent) {
    // Custom update stream telemetry hooks if any
  }

  private _onCustomEvent(message: any) {
    this.props.onCustomEvent?.(message);
  }

  private _onStop(message: StreamEvent) {
    console.log('[WebRTC] Stream stopped:', message);
  }

  private _onTerminate(message: StreamEvent) {
    console.log('[WebRTC] Stream terminated:', message);
  }

  render() {
    const { streamReady, statusText, isError } = this.state;

    return (
      <div
        id="omniverse-stream-container"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000000',
          overflow: 'hidden',
          zIndex: 0,
          ...this.props.style
        }}
      >
        <video
          id="remote-video"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          tabIndex={-1}
          playsInline
          muted
          autoPlay
          onLoadedMetadata={() => {
            if (!this.state.streamReady) {
              this.setState({ streamReady: true, statusText: 'Live Stream Active' });
              this.props.onStarted?.();
            }
          }}
          onPlaying={() => {
            if (!this.state.streamReady) {
              this.setState({ streamReady: true, statusText: 'Live Stream Active' });
              this.props.onStarted?.();
            }
          }}
        />
        <audio id="remote-audio" muted />
        <h3 style={{ visibility: 'hidden' }} id="message-display">...</h3>

        {!streamReady && (
          <div
            onClick={() => {
              const videoEl = document.getElementById('remote-video') as HTMLVideoElement;
              if (videoEl) {
                videoEl.play().catch(() => {});
                this.setState({ streamReady: true, statusText: 'Live Stream Active' });
                this.props.onStarted?.();
              }
            }}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: isError ? '#ff4d4f' : '#8c9ba5',
              fontFamily: 'Inter, -apple-system, sans-serif',
              fontSize: '14px',
              letterSpacing: '0.5px',
              backgroundColor: 'rgba(10, 13, 20, 0.75)',
              zIndex: 1,
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: isError ? '3px solid #ff4d4f' : '3px solid rgba(255, 255, 255, 0.1)',
                borderTopColor: isError ? 'transparent' : '#00e5ff',
                borderRadius: '50%',
                animation: isError ? 'none' : 'spin 1s linear infinite',
                marginBottom: '16px'
              }}
            />
            <span>{statusText}</span>
            <span style={{ fontSize: '11px', color: '#556575', marginTop: '6px' }}>
              Port 49100 / Signalling Server (Click anywhere to activate)
            </span>
          </div>
        )}
      </div>
    );
  }
}
