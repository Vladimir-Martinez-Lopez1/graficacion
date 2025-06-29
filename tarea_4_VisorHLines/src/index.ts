
//import { Input } from './Input.js';
import { Obj3D } from './Obj3D.js';
//import { Canvas3D } from './Canvas3D.js';
//import { CvWireframe } from './CvWireFrame.js';
import { CvHLines } from './CvHLines.js';
import { Rota3D } from './Rota3D.js';
import { Point3D } from './point3D.js';

let canvas: HTMLCanvasElement;
let graphics: CanvasRenderingContext2D;

canvas = <HTMLCanvasElement>document.getElementById('circlechart');
graphics = canvas.getContext('2d');

let cv: CvHLines;
let obj: Obj3D;
let ang: number = 0;
let intervaloAspa: number | undefined = undefined;
let intervaloCabeza: number | undefined = undefined;
let tiempoIntervaloAspa = 50; // Tiempo en ms, menor = más rápido
let tiempoIntervaloCabeza = 100; // Puedes ajustar este valor si quieres diferente velocidad
let modoGiro: 'cabezaDer' | 'cabezaIzq' = 'cabezaDer';




function setintervaloAspa() {
  if (intervaloAspa) clearInterval(intervaloAspa);
  intervaloAspa = setInterval(() => {
    pza1DerFunc();
  }, tiempoIntervaloAspa);
}
function setintervaloCabeza() {
  if (intervaloCabeza) clearInterval(intervaloCabeza);
  intervaloCabeza = setInterval(() => {
    if (modoGiro === 'cabezaDer') {
      const prevAngle = cabezaAngle;
      pza12DerFunc();
      if (cabezaAngle === prevAngle) {
        modoGiro = 'cabezaIzq';
      }
    } else if (modoGiro === 'cabezaIzq') {
      const prevAngle = cabezaAngle;
      pza12IzqFunc();
      if (cabezaAngle === prevAngle) {
        modoGiro = 'cabezaDer';
      }
    }
  }, tiempoIntervaloCabeza);
}

function leerArchivo(e: any) {
  var archivo = e.target.files[0];
  if (!archivo) {
    return;
  }
  var lector = new FileReader();
  lector.onload = function (e) {
    var contenido = e.target.result;
    mostrarContenido(contenido);
    obj = new Obj3D();
    if (obj.read(contenido)) {
      //sDir = sDir1;
      cv = new CvHLines(graphics, canvas);
      cv.setObj(obj);
      cv.paint();
      tiempoIntervaloAspa = 50;
      tiempoIntervaloCabeza = 100;
      modoGiro = 'cabezaDer';
      setintervaloAspa();    // Giro automático de aspas
      setintervaloCabeza();  // Giro automático de cabeza
    }
  };
  lector.readAsText(archivo);
}

function mostrarContenido(contenido: any) {
  var elemento = document.getElementById('contenido-archivo');
  //
  //readObject(new Input(contenido));
  elemento.innerHTML = contenido;
}

function vp(dTheta: number, dPhi: number, fRho: number): void {  // Viewpoint
  if (obj != undefined) {
    let obj: Obj3D = cv.getObj();
    if (!obj.vp(cv, dTheta, dPhi, fRho))
      alert('datos no validos');
  }
  else
    alert('aun no has leido un archivo');
}

function eyeDownFunc() {
  vp(0, 0.1, 1);
}

function eyeUpFunc() {
  vp(0, -0.1, 1);
}

function eyeLeftFunc() {
  vp(-0.1, 0, 1);
}

function eyeRightFunc() {
  vp(0.1, 0, 1);
}

function incrDistFunc() {
  vp(0, 0, 2);
}

function decrDistFunc() {
  vp(0, 0, 0.5);
}
//movimiento de la aspa en su propio eje
//
function pza1DerFunc() {
  let af = 10;
  const VerticeCabezaSup = 1639; //vertice guia aspa detras
  const verticeCabezaInf = 1640; //vertice guia aspa delante
  const ejeA = obj.w[VerticeCabezaSup];
  const ejeB = obj.w[verticeCabezaInf];
  Rota3D.initRotate(ejeA, ejeB, af * Math.PI / 180);
  //For encargado de rotar las piezas de la cabeza (aspas y motor)
  for (let i = 552; i <= 1424; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  cv.setObj(obj);
  cv.paint();
}

function pza1IzqFunc() {
  let af = -10; //izquirda
  const VerticeCabezaSup = 1639; //vertice guia aspa detras
  const verticeCabezaInf = 1640; //vertice guia aspa delante
  const ejeA = obj.w[VerticeCabezaSup];
  const ejeB = obj.w[verticeCabezaInf];
  Rota3D.initRotate(ejeA, ejeB, af * Math.PI / 180);
  //Aspas (Vértices 552-1424)	
  //For encargado de rotar las piezas de la cabeza (aspas y motor)
  for (let i = 552; i <= 1424; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  cv.setObj(obj);
  cv.paint();
}
//movimiento del motor y aspas del ventilador
let cabezaAngle = 0; // Ángulo acumulado en radianes
const cabezaAngleLimit = (Math.PI - 0.01) * 0.4; // Límite menor a 180° (en radianes)
function pza12DerFunc() {
  //177-551 motor
  //552-1424 aspas
  let af = 10;
  const rad = af * Math.PI / 180;
  if (cabezaAngle + rad > cabezaAngleLimit) return; // No exceder el límite

  const VerticeCabezaSup = 1633; //25 - 1; // índice base 0 vertices guia
  const verticeCabezaInf = 1634; //48 - 1; // vertice guia 
  const ejeA = obj.w[VerticeCabezaSup];
  const ejeB = obj.w[verticeCabezaInf];
  Rota3D.initRotate(ejeA, ejeB, rad);

  for (let i = 177; i <= 551; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  for (let i = 552; i <= 1424; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  // Vértices guía de aspas
  obj.w[1639] = Rota3D.rotate(obj.w[1639]);
  obj.w[1640] = Rota3D.rotate(obj.w[1640]);

  cabezaAngle += rad; // Actualizar el ángulo acumulado
  cv.setObj(obj);
  cv.paint();
}

function pza12IzqFunc() {
  let af = -10;
  const rad = af * Math.PI / 180;
  if (cabezaAngle + rad < -cabezaAngleLimit) return; // No exceder el límite negativo

  const VerticeCabezaSup = 1633; //25 - 1; // índice base 0 vertices guia
  const verticeCabezaInf = 1634; //48 - 1; // vertice guia 
  const ejeA = obj.w[VerticeCabezaSup];
  const ejeB = obj.w[verticeCabezaInf];
  Rota3D.initRotate(ejeA, ejeB, rad);

  for (let i = 177; i <= 551; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  for (let i = 552; i <= 1424; i++) {
    obj.w[i] = Rota3D.rotate(obj.w[i]);
  }
  // Vértices guía de aspas
  obj.w[1639] = Rota3D.rotate(obj.w[1639]);
  obj.w[1640] = Rota3D.rotate(obj.w[1640]);
  cabezaAngle += rad;
  cv.setObj(obj);
  cv.paint();
}

document.getElementById('file-input').addEventListener('change', leerArchivo, false);
document.getElementById('eyeDown').addEventListener('click', eyeDownFunc, false);
document.getElementById('eyeUp').addEventListener('click', eyeUpFunc, false);
document.getElementById('eyeLeft').addEventListener('click', eyeLeftFunc, false);
document.getElementById('eyeRight').addEventListener('click', eyeRightFunc, false);
document.getElementById('incrDist').addEventListener('click', incrDistFunc, false);
document.getElementById('decrDist').addEventListener('click', decrDistFunc, false);


//movimiento de piezas
document.getElementById('pza1Izq').addEventListener('click', pza1IzqFunc, false);
document.getElementById('pza1Der').addEventListener('click', pza1DerFunc, false);
document.getElementById('pza12Izq').addEventListener('click', pza12IzqFunc, false);
document.getElementById('pza12Der').addEventListener('click', pza12DerFunc, false);

let Pix: number, Piy: number;
let Pfx: number, Pfy: number;
let theta = 0.3, phi = 1.3, SensibilidadX = 0.02, SensibilidadY = 0.02;
let flag: boolean = false;

function handleMouse(evento: any) {
  Pix = evento.offsetX;
  Piy = evento.offsetY;
  flag = true;
}

function makeVizualization(evento: any) {
  if (flag) {
    Pfx = evento.offsetX;
    Pfy = evento.offsetY;
    //console.log(Pfx, Pfy)
    let difX = Pix - Pfx;
    let difY = Pfy - Piy;
    vp(0, 0.1 * difY / 50, 1);
    Piy = Pfy;
    vp(0.1 * difX, 0 / 50, 1);
    Pix = Pfx;
  }
}

function noDraw() {
  flag = false;
}

canvas.addEventListener('mousedown', handleMouse);
canvas.addEventListener('mouseup', noDraw);
canvas.addEventListener('mousemove', makeVizualization);

function MoverScroll(event: WheelEvent) {
  event.preventDefault();
  // Aumentar o disminuir la velocidad de rotación de las aspas con el scroll
  if (event.deltaY < 0) {
    // Scroll arriba: más rápido
    tiempoIntervaloAspa = Math.max(5, tiempoIntervaloAspa - 5);
    setintervaloAspa();
  } else if (event.deltaY > 0) {
    // Scroll abajo: más lento
    tiempoIntervaloAspa = Math.min(500, tiempoIntervaloAspa + 5);
    setintervaloAspa();
  }
}

canvas.addEventListener('wheel', MoverScroll, { passive: false });
window.addEventListener('DOMContentLoaded', () => {
  fetch('ventiladorTerminado_estructurado_limpio.txt')
    .then(response => response.text())
    .then(contenido => {
      mostrarContenido(contenido);
      obj = new Obj3D();
      if (obj.read(contenido)) {
        cv = new CvHLines(graphics, canvas);
        cv.setObj(obj);
        cv.paint();
        tiempoIntervaloAspa = 50;
        tiempoIntervaloCabeza = 100;
        modoGiro = 'cabezaDer';
        setintervaloAspa();
        setintervaloCabeza();
      }
    })
    .catch(err => {
      console.error('No se pudo cargar el archivo por defecto:', err);
    });
});