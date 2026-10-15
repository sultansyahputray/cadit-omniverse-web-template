import React, { Component } from 'react';
import { AppStreamer, StreamEvent, StreamProps, DirectConfig, GFNConfig, StreamType } from '@nvidia/omniverse-webrtc-streaming-library';
import StreamConfig from '../../../stream.config.json';

interface AppStreamProps {
    sessionId?: string;
    backendUrl?: string;
    signalingserver?: string;
    signalingport?: number;
    mediaserver?: string;
    mediaport?: number;
    accessToken?: string;
    style?: React.CSSProperties;
    onStarted?: () => void;
    onStreamFailed?: () => void;
    onLoggedIn?: (userId: string) => void;
    handleCustomEvent?: (event: any) => void;
    onFocus?: () => void;
    onBlur?: () => void;
}

interface AppStreamState {
    streamReady: boolean;
}

export default class AppStream extends Component<AppStreamProps, AppStreamState> {
    private _requested: boolean;

    static defaultProps = {
        style: {}
    };

    constructor(props: AppStreamProps) {
        super(props);
        this._requested = false;
        this.state = {
            streamReady: false
        };
    }

    componentDidMount() {
        if (!this._requested) {
            this._requested = true;

            let streamProps: StreamProps;
            let streamConfig: DirectConfig | GFNConfig;
            let streamSource: StreamType.DIRECT | StreamType.GFN;

            if (StreamConfig.source === 'gfn') {
                streamSource = StreamType.GFN;
                streamConfig = {
                    //@ts-ignore
                    GFN: (window as any).GFN,
                    catalogClientId: StreamConfig.gfn.catalogClientId,
                    clientId: StreamConfig.gfn.clientId,
                    cmsId: StreamConfig.gfn.cmsId,
                    onUpdate: (message: StreamEvent) => this._onUpdate(message),
                    onStart: (message: StreamEvent) => this._onStart(message),
                    onCustomEvent: (message: any) => this._onCustomEvent(message)
                };
            } else if (StreamConfig.source === 'local') {
                streamSource = StreamType.DIRECT;
                streamConfig = {
                    videoElementId: 'remote-video',
                    audioElementId: 'remote-audio',
                    authenticate: true,
                    maxReconnects: 20,
                    signalingServer: StreamConfig.local.server,
                    signalingPort: StreamConfig.local.signalingPort,
                    mediaServer: StreamConfig.local.server,
                    ...(StreamConfig.local.mediaPort != null && { mediaPort: StreamConfig.local.mediaPort }),
                    nativeTouchEvents: true,
                    width: 1920,
                    height: 1080,
                    fps: 60,
                    onUpdate: (message: StreamEvent) => this._onUpdate(message),
                    onStart: (message: StreamEvent) => this._onStart(message),
                    onCustomEvent: (message: any) => this._onCustomEvent(message),
                    onStop: (message: StreamEvent) => { console.log(message); },
                    onTerminate: (message: StreamEvent) => { console.log(message); }
                };
            } else if (StreamConfig.source === 'stream') {
                streamSource = StreamType.DIRECT;
                streamConfig = {
                    signalingServer: this.props.signalingserver,
                    signalingPort: this.props.signalingport,
                    mediaServer: this.props.mediaserver,
                    mediaPort: this.props.mediaport,
                    backendUrl: this.props.backendUrl,
                    sessionId: this.props.sessionId,
                    autoLaunch: true,
                    cursor: 'free',
                    mic: false,
                    videoElementId: 'remote-video',
                    audioElementId: 'remote-audio',
                    authenticate: false,
                    maxReconnects: 20,
                    nativeTouchEvents: true,
                    width: 1920,
                    height: 1080,
                    fps: 60,
                    onUpdate: (message: StreamEvent) => this._onUpdate(message),
                    onStart: (message: StreamEvent) => this._onStart(message),
                    onCustomEvent: (message: any) => this._onCustomEvent(message),
                    onStop: (message: StreamEvent) => { console.log(message); },
                    onTerminate: (message: StreamEvent) => { console.log(message); },
                };
            } else {
                console.error(`Unknown stream source: ${StreamConfig.source}`);
                return;
            }

            try {
                streamProps = { streamConfig, streamSource };
                AppStreamer.connect(streamProps)
                    .then((result: StreamEvent) => {
                        console.info(result);
                    })
                    .catch((error: StreamEvent) => {
                        console.error(error);
                    });
            } catch (error) {
                console.error(error);
            }
        }
    }

    componentDidUpdate(_prevProps: AppStreamProps, prevState: AppStreamState) {
        if (prevState.streamReady === false && this.state.streamReady === true) {
            const player = document.getElementById("gfn-stream-player-video") as HTMLVideoElement;
            if (player) {
                player.tabIndex = -1;
                player.playsInline = true;
                player.muted = true;
                player.play();
            }
            const localPlayer = document.getElementById("remote-video") as HTMLVideoElement;
            if (localPlayer) {
                localPlayer.tabIndex = -1;
                localPlayer.playsInline = true;
                localPlayer.muted = true;
                localPlayer.play().catch(e => console.log('Autoplay handled:', e));
            }
        }
    }

    static sendMessage(message: any) {
        AppStreamer.sendMessage(message);
    }

    static stop() {
        AppStreamer.stop();
        (AppStreamer as any)._stream = null;
    }

    _onStart(message: any) {
        if (message.action === 'start' && message.status === 'success' && !this.state.streamReady) {
            console.info('Omniverse WebRTC streamReady');
            this.setState({ streamReady: true });
            this.props.onStarted?.();
        }

        if (message.status === "error" && StreamConfig.source === "stream") {
            console.log(message.info);
            this.props.onStreamFailed?.();
            return;
        }
    }

    _onUpdate(message: any) {
        try {
            if (message.action === 'authUser' && message.status === 'success') {
                this.props.onLoggedIn?.(message.info);
            }
        } catch (error) {
            console.error(message);
        }
    }

    _onCustomEvent(message: any) {
        this.props.handleCustomEvent?.(message);
    }

    render() {
        const source = StreamConfig.source;

        if (source === 'gfn') {
            return (
                <div
                    id="view"
                    style={{
                        backgroundColor: '#000000',
                        display: 'flex', justifyContent: 'space-between',
                        height: "100%",
                        width: "100%",
                        ...this.props.style
                    }}
                />
            );
        } else if (source === 'local' || source === 'stream') {
            return (
                <div
                    key={'stream-canvas'}
                    id={'main-div'}
                    style={{
                        backgroundColor: '#000000',
                        visibility: this.state.streamReady ? 'visible' : 'visible',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        overflow: 'hidden',
                        ...this.props.style
                    }}
                >
                    <video
                        key={'video-canvas'}
                        id={'remote-video'}
                        style={{
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        tabIndex={-1}
                        playsInline
                        muted
                        autoPlay
                    />
                    <audio id="remote-audio" muted></audio>
                    <h3 style={{ visibility: 'hidden' }} id="message-display">...</h3>
                </div>
            );
        }

        return null;
    }
}
