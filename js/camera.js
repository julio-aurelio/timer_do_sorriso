// TimerFace Rush — camera

// ---------- CÂMERA ----------
let videoElement = null;
let canvasElement = null;
let ctx = null;

function initCameraElements() {
    videoElement = document.getElementById('video-frame');
    canvasElement = document.getElementById('detection-canvas');
    ctx = canvasElement.getContext('2d', { willReadFrequently: true });
}

async function iniciarCamera() {
    try {
        if (!videoElement || !canvasElement || !ctx) throw new Error('Elementos da câmera não foram inicializados.');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Este navegador não oferece acesso à câmera.');
        if (videoElement.srcObject) {
            state.camera_ativa = true;
            return true;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
        videoElement.srcObject = stream;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('A câmera demorou demais para iniciar.')), 10000);
            videoElement.onloadedmetadata = () => {
                clearTimeout(timeout);
                Promise.resolve(videoElement.play()).then(resolve).catch(reject);
            };
        });
        state.camera_ativa = true;
        atualizarCameraStatus(true);
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        return true;
    } catch (error) {
        console.error('Câmera erro:', error);
        if (videoElement?.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
        }
        state.camera_ativa = false;
        atualizarCameraStatus(false);
        return false;
    }
}

function pararCamera() {
    deteccaoGeracao++;
    deteccaoAtiva = false;
    if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(t => t.stop());
        videoElement.srcObject = null;
    }
    state.camera_ativa = false;
    if (state.animation_id) {
        cancelAnimationFrame(state.animation_id);
        state.animation_id = null;
    }
}

function getVideoElement() { return videoElement; }
function getCanvasContext() { return { canvas: canvasElement, ctx: ctx }; }
