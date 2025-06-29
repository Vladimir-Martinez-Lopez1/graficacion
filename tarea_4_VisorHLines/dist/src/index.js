//import { Input } from './Input.js';
import { Obj3D } from './Obj3D.js';
//import { Canvas3D } from './Canvas3D.js';
//import { CvWireframe } from './CvWireFrame.js';
import { CvHLines } from './CvHLines.js';
import { Rota3D } from './Rota3D.js';
var canvas;
var graphics;
canvas = document.getElementById('circlechart');
graphics = canvas.getContext('2d');
var cv;
var obj;
var ang = 0;
var intervaloAspa = undefined;
var intervaloCabeza = undefined;
var tiempoIntervaloAspa = 50; // Tiempo en ms, menor = más rápido
var tiempoIntervaloCabeza = 100; // Puedes ajustar este valor si quieres diferente velocidad
var modoGiro = 'cabezaDer';
function setintervaloAspa() {
    if (intervaloAspa)
        clearInterval(intervaloAspa);
    intervaloAspa = setInterval(function () {
        pza1DerFunc();
    }, tiempoIntervaloAspa);
}
function setintervaloCabeza() {
    if (intervaloCabeza)
        clearInterval(intervaloCabeza);
    intervaloCabeza = setInterval(function () {
        if (modoGiro === 'cabezaDer') {
            var prevAngle = cabezaAngle;
            pza12DerFunc();
            if (cabezaAngle === prevAngle) {
                modoGiro = 'cabezaIzq';
            }
        }
        else if (modoGiro === 'cabezaIzq') {
            var prevAngle = cabezaAngle;
            pza12IzqFunc();
            if (cabezaAngle === prevAngle) {
                modoGiro = 'cabezaDer';
            }
        }
    }, tiempoIntervaloCabeza);
}
function leerArchivo(e) {
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
            setintervaloAspa(); // Giro automático de aspas
            setintervaloCabeza(); // Giro automático de cabeza
        }
    };
    lector.readAsText(archivo);
}
function mostrarContenido(contenido) {
    var elemento = document.getElementById('contenido-archivo');
    //
    //readObject(new Input(contenido));
    elemento.innerHTML = contenido;
}
function vp(dTheta, dPhi, fRho) {
    if (obj != undefined) {
        var obj_1 = cv.getObj();
        if (!obj_1.vp(cv, dTheta, dPhi, fRho))
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
    var af = 10;
    var VerticeCabezaSup = 1639; //vertice guia aspa detras
    var verticeCabezaInf = 1640; //vertice guia aspa delante
    var ejeA = obj.w[VerticeCabezaSup];
    var ejeB = obj.w[verticeCabezaInf];
    Rota3D.initRotate(ejeA, ejeB, af * Math.PI / 180);
    //For encargado de rotar las piezas de la cabeza (aspas y motor)
    for (var i = 552; i <= 1424; i++) {
        obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    cv.setObj(obj);
    cv.paint();
}
function pza1IzqFunc() {
    var af = -10; //izquirda
    var VerticeCabezaSup = 1639; //vertice guia aspa detras
    var verticeCabezaInf = 1640; //vertice guia aspa delante
    var ejeA = obj.w[VerticeCabezaSup];
    var ejeB = obj.w[verticeCabezaInf];
    Rota3D.initRotate(ejeA, ejeB, af * Math.PI / 180);
    //Aspas (Vértices 552-1424)	
    //For encargado de rotar las piezas de la cabeza (aspas y motor)
    for (var i = 552; i <= 1424; i++) {
        obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    cv.setObj(obj);
    cv.paint();
}
//movimiento del motor y aspas del ventilador
var cabezaAngle = 0; // Ángulo acumulado en radianes
var cabezaAngleLimit = (Math.PI - 0.01) * 0.4; // Límite menor a 180° (en radianes)
function pza12DerFunc() {
    //177-551 motor
    //552-1424 aspas
    var af = 10;
    var rad = af * Math.PI / 180;
    if (cabezaAngle + rad > cabezaAngleLimit)
        return; // No exceder el límite
    var VerticeCabezaSup = 1633; //25 - 1; // índice base 0 vertices guia
    var verticeCabezaInf = 1634; //48 - 1; // vertice guia 
    var ejeA = obj.w[VerticeCabezaSup];
    var ejeB = obj.w[verticeCabezaInf];
    Rota3D.initRotate(ejeA, ejeB, rad);
    for (var i = 177; i <= 551; i++) {
        obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    for (var i = 552; i <= 1424; i++) {
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
    var af = -10;
    var rad = af * Math.PI / 180;
    if (cabezaAngle + rad < -cabezaAngleLimit)
        return; // No exceder el límite negativo
    var VerticeCabezaSup = 1633; //25 - 1; // índice base 0 vertices guia
    var verticeCabezaInf = 1634; //48 - 1; // vertice guia 
    var ejeA = obj.w[VerticeCabezaSup];
    var ejeB = obj.w[verticeCabezaInf];
    Rota3D.initRotate(ejeA, ejeB, rad);
    for (var i = 177; i <= 551; i++) {
        obj.w[i] = Rota3D.rotate(obj.w[i]);
    }
    for (var i = 552; i <= 1424; i++) {
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
var Pix, Piy;
var Pfx, Pfy;
var theta = 0.3, phi = 1.3, SensibilidadX = 0.02, SensibilidadY = 0.02;
var flag = false;
function handleMouse(evento) {
    Pix = evento.offsetX;
    Piy = evento.offsetY;
    flag = true;
}
function makeVizualization(evento) {
    if (flag) {
        Pfx = evento.offsetX;
        Pfy = evento.offsetY;
        //console.log(Pfx, Pfy)
        var difX = Pix - Pfx;
        var difY = Pfy - Piy;
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
function MoverScroll(event) {
    event.preventDefault();
    // Aumentar o disminuir la velocidad de rotación de las aspas con el scroll
    if (event.deltaY < 0) {
        // Scroll arriba: más rápido
        tiempoIntervaloAspa = Math.max(5, tiempoIntervaloAspa - 5);
        setintervaloAspa();
    }
    else if (event.deltaY > 0) {
        // Scroll abajo: más lento
        tiempoIntervaloAspa = Math.min(500, tiempoIntervaloAspa + 5);
        setintervaloAspa();
    }
}
canvas.addEventListener('wheel', MoverScroll, { passive: false });
window.addEventListener('DOMContentLoaded', function () {
    fetch('ventiladorTerminado_estructurado_limpio.txt')
        .then(function (response) { return response.text(); })
        .then(function (contenido) {
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
        .catch(function (err) {
        console.error('No se pudo cargar el archivo por defecto:', err);
    });
});
