// Protótipo JustGospelDance: detecção de pose na webcam com MediaPipe Pose Landmarker
// e pontuação da pose atual contra uma pose de referência (a mesma ideia do jogo,
// só que a referência aqui é estática em vez de vir de um choreo.json).
import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";
import { REF_T, vetoresMembros, similaridade, classe, angulo, MIN_MEMBROS } from "./pontuacao.js";

const cfg = document.body.dataset;
const MODELOS = { lite: cfg.mpModelLite, full: cfg.mpModelFull };
const params = new URLSearchParams(location.search);
// ?delegate=CPU força o processamento na CPU (útil em máquinas com WebGL ruim).
const FORCAR_CPU = params.get("delegate") === "CPU";

const $ = (id) => document.getElementById(id);
const video = $("video");
const canvas = $("canvas");
const ctx = canvas.getContext("2d");
const drawer = new DrawingUtils(ctx);

// Estado exposto para inspeção no console e para testes automatizados.
const estado = { pronto: false, frames: 0, poses: 0, erros: [], modelo: null, delegate: null, ultimaNota: null, fps: 0 };
window.__jgd = estado;

let landmarker = null;
let referencia = REF_T;
let ultimoMundo = null; // último worldLandmarks, usado na captura de referência
let ultimoTempoVideo = -1;
let ultimoTimestamp = 0;
let contFps = 0;
let marcaFps = performance.now();

function status(msg) { $("status").textContent = msg; }

async function criarLandmarker(modelo, delegate) {
  const vision = await FilesetResolver.forVisionTasks(cfg.mpWasm);
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODELOS[modelo], delegate },
    runningMode: "VIDEO",
    numPoses: 1,
  });
}

async function carregarModelo() {
  const modelo = $("modelo").value;
  status(`Carregando modelo ${modelo}…`);
  if (landmarker) { landmarker.close(); landmarker = null; }
  try {
    if (FORCAR_CPU) throw new Error("CPU forçada por ?delegate=CPU");
    landmarker = await criarLandmarker(modelo, "GPU");
    estado.delegate = "GPU";
  } catch (e) {
    console.warn("GPU indisponível, usando CPU:", e);
    landmarker = await criarLandmarker(modelo, "CPU");
    estado.delegate = "CPU";
  }
  estado.modelo = modelo;
  $("delegate").textContent = `${modelo} / ${estado.delegate}`;
  status("Modelo pronto. Afaste-se até o corpo inteiro aparecer.");
}

async function iniciar() {
  $("btnIniciar").disabled = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }, audio: false,
    });
    video.srcObject = stream;
    await new Promise((res) => video.addEventListener("loadeddata", res, { once: true }));
    await video.play();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    await carregarModelo();
    $("btnCapturar").disabled = false;
    $("btnT").disabled = false;
    estado.pronto = true;
    requestAnimationFrame(loop);
  } catch (e) {
    estado.erros.push(String(e));
    status(`Não foi possível iniciar: ${e.message || e}`);
    $("btnIniciar").disabled = false;
  }
}

function loop() {
  if (landmarker && video.readyState >= 2 && video.currentTime !== ultimoTempoVideo) {
    ultimoTempoVideo = video.currentTime;
    // detectForVideo exige timestamps estritamente crescentes (em ms).
    const ts = Math.max(performance.now(), ultimoTimestamp + 1);
    ultimoTimestamp = ts;
    try {
      processar(landmarker.detectForVideo(video, ts));
    } catch (e) {
      estado.erros.push(String(e));
      status(`Erro na detecção: ${e.message || e}`);
    }
    estado.frames++;
    contFps++;
    const agora = performance.now();
    if (agora - marcaFps >= 1000) {
      estado.fps = Math.round((contFps * 1000) / (agora - marcaFps));
      $("fps").textContent = String(estado.fps);
      contFps = 0;
      marcaFps = agora;
    }
  }
  requestAnimationFrame(loop);
}

function processar(res) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const lm = res.landmarks?.[0];
  const w = res.worldLandmarks?.[0];
  if (!lm || !w) {
    ultimoMundo = null;
    estado.ultimaNota = null;
    $("classe").textContent = "";
    $("nota").textContent = "–";
    $("visiveis").textContent = "0";
    status("Nenhuma pessoa detectada.");
    return;
  }
  estado.poses++;
  ultimoMundo = w;
  drawer.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, { color: "#7ee787", lineWidth: 4 });
  drawer.drawLandmarks(lm, { color: "#ffffff", fillColor: "#ffffff", lineWidth: 1, radius: 4 });

  const jog = vetoresMembros(w);
  const { nota, visiveis } = similaridade(jog, referencia);
  const cls = classe(nota);
  estado.ultimaNota = nota;
  $("nota").textContent = nota == null ? "–" : nota.toFixed(2);
  $("nota").className = cls;
  $("visiveis").textContent = `${visiveis} / ${jog.membros.length}`;
  $("classe").textContent = cls;
  $("classe").className = cls;
  $("cotovelos").textContent = `${angulo(w, 11, 13, 15)}° / ${angulo(w, 12, 14, 16)}°`;
  $("ombros").textContent = `${angulo(w, 13, 11, 23)}° / ${angulo(w, 14, 12, 24)}°`;
  $("joelhos").textContent = `${angulo(w, 23, 25, 27)}° / ${angulo(w, 24, 26, 28)}°`;
  if (visiveis < MIN_MEMBROS) status("Poucos membros visíveis: afaste-se e mostre braços e pernas.");
  else status("Comparando com a referência. Faça a pose para pontuar.");
}

$("btnCapturar").addEventListener("click", async () => {
  for (let i = 3; i > 0; i--) {
    status(`Faça a pose… capturando em ${i}`);
    await new Promise((r) => setTimeout(r, 1000));
  }
  if (!ultimoMundo) { status("Nenhuma pose detectada para capturar."); return; }
  referencia = vetoresMembros(ultimoMundo);
  $("refInfo").textContent = "Referência atual: pose capturada da webcam.";
});

$("btnT").addEventListener("click", () => {
  referencia = REF_T;
  $("refInfo").textContent = "Referência atual: pose em T (braços abertos na horizontal).";
});

$("modelo").addEventListener("change", () => { if (estado.pronto) carregarModelo(); });
$("btnIniciar").addEventListener("click", iniciar);

if (params.get("auto") === "1") iniciar();
