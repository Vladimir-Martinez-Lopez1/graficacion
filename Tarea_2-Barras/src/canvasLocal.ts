
export class CanvasLocal {
  //atributos
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;
  protected h: number[] = [];


  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = 12;
    this.rHeight = 8;
    this.maxX = canvas.width - 1
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 12;
    this.centerY = this.maxY / 8 * 7;
  }

  //Metodo para extraer los datos del formulario 
  ActualizarInfo(newData: number[]): void {
    this.h = [...newData];
    this.paint();
  }

  iX(x: number): number { return Math.round(this.centerX + x / this.pixelSize); }
  iY(y: number): number { return Math.round(this.centerY - y / this.pixelSize); }
  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }
  drawRmboide(x1: number, y1: number, x2: number, y2: number,
    x3: number, y3: number, x4: number, y4: number, color: string, drawBorder: boolean = false) {

    // Color de relleno
    this.graphics.fillStyle = color;
    // Comenzamos la ruta de dibujo, o path
    this.graphics.beginPath();
    // Mover a la esquina superior izquierda
    this.graphics.moveTo(x1, y1);
    // Dibujar la línea hacia la derecha
    this.graphics.lineTo(x2, y2);
    // Ahora la que va hacia abajo
    this.graphics.lineTo(x3, y3); // A 80 porque esa es la altura
    // La que va hacia la izquierda
    this.graphics.lineTo(x4, y4);
    // Y dejamos que la última línea la dibuje JS
    this.graphics.closePath();
    // Hacemos que se dibuje
    if (drawBorder) {
      this.graphics.stroke();
    }

    // Lo rellenamos
    this.graphics.fill();
  }

  fx(x: number): number {
    return Math.sin(x * 2.5);
  }


  maxH(h: number[]): number {
    if (h.length === 0) return 10; // Valor por defecto cuando no hay datos

    const max = Math.max(...h);
    const minPositivo = Math.min(...h.filter(x => x > 0));

    // Detección de rango dinámico amplio (diferencia entre máximo y mínimo)
    const rangoDinamico = max / minPositivo;

    // Para rangos muy grandes
    if (rangoDinamico > 100) {
      // se escala el mínimo para hacerlo más visible
      const minEscalable = minPositivo * Math.sqrt(rangoDinamico);
      return Math.max(max, minEscalable * 10); // Aseguramos que el máximo domine
    }

    // Si el máximo es mayor o igual a 1, se escala a la siguiente potencia de 10
    if (max < 1) {
      const pot = Math.pow(10, Math.floor(Math.log10(max)));
      return Math.ceil(max / pot) * pot;
    }
    const pot = Math.pow(10, Math.floor(Math.log10(max)));
    // Se asegura que el maximo sea un valor redondeado
    return Math.ceil(max / pot) * pot;
    //retorna el maximo de la lista de datos
  }


  //funcion para aclarar el color RGB  para lograr el estilo de sombra
  oscurecerColor(color: string, porcentaje: number = 20): string {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    //si el color es un hex, se convierte a RGB
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    }
    //si el color es un RGB, se convierte a HEX
    const num = parseInt(color.replace("#", ""), 16);
    const factor = Math.round(2.55 * porcentaje);
    const R = (num >> 16) - factor;
    const G = (num >> 8 & 0x00FF) - factor;
    const B = (num & 0x00FF) - factor;
    //si el color es un RGB, se convierte a HEX
    const ocurecerColor = `#${(0x1000000 +
      (R > 0 ? (R < 255 ? R : 255) : 0) * 0x10000 +
      (G > 0 ? (G < 255 ? G : 255) : 0) * 0x100 +
      (B > 0 ? (B < 255 ? B : 255) : 0)).toString(16).slice(1)}`;

    //se convierte de nuevo a RGB para poder aplicarlo en las graficas
    const hex = ocurecerColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    //se retorna el color en formato RGB
    return `rgb(${r},${g},${b})`;
  }

  barra(x: number, y: number, alt: number, anchoLados: number = 0.5): void {

    //Constante para alturas que son muy pequeñas
    const alturaVisible = Math.max(alt, 0.3);
    //Constante para que pueda poner las barras exactamente en el comienzo del eje y
    const baseY = this.iY(0);
    //Constante para utilizar una coodenada Y superior a la del eje
    const arriY = this.iY(alturaVisible);
    //Constantes para que el codigo pueda ser mas limpio, estos son los puntos de la barra
    const izqX = this.iX(x - anchoLados);
    const centX = this.iX(x);
    const derX = this.iX(x + anchoLados);
    const lateral = this.iY(0.3) - baseY;
    const arribaTodo = this.iY(alturaVisible - 0.3) - arriY;
    const color = this.graphics.strokeStyle as string;


    //Relleno de las barras
    const colorOscuro = this.oscurecerColor(color, 20);
    //rellenar la cara izquierdo
    this.drawRmboide(centX, baseY, izqX, baseY + lateral, izqX, arriY, centX, arriY + arribaTodo, colorOscuro);
    //rellenar la cara derecha
    this.drawRmboide(centX, baseY, derX, baseY + lateral, derX, arriY, centX, arriY + arribaTodo, color);

    //Relleno de las barras superiores izquierda y derecha
    this.drawRmboide(izqX, arriY, izqX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3), centX, arriY + arribaTodo, '#A9A9A9');
    this.drawRmboide(derX, arriY, derX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3), centX, arriY + arribaTodo, '#FFFFFF');
    //relleno de la cara superior
    this.drawRmboide(izqX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3), centX, this.iY(this.rHeight - 1.7), izqX, this.iY(this.rHeight - 2), '#D3D3D3');
    this.drawRmboide(derX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3), centX, this.iY(this.rHeight - 1.7), derX, this.iY(this.rHeight - 2), '#D3D3D3');


    //Aqui utilizo los pasos usados en clase, pero con las nuevas constantes declaradas
    //1 - 2 (base izquierda)
    this.drawLine(centX, baseY, izqX, baseY + lateral);
    //2 - 3 (lado izquierdo)
    this.drawLine(izqX, baseY + lateral, izqX, arriY);
    //3 -4 (arriba izquierda)
    this.drawLine(izqX, arriY, centX, arriY + arribaTodo);
    //4 - 5 (arriba derecha)
    this.drawLine(centX, arriY + arribaTodo, derX, arriY);
    //5 - 6 (lado derecho)
    this.drawLine(derX, arriY, derX, baseY + lateral);
    //6 - 1 (base derecha)
    this.drawLine(derX, baseY + lateral, centX, baseY);
    //7 - 4 (linea del centro)
    this.drawLine(centX, baseY, centX, arriY + arribaTodo);

    //Dibujar las barras que actuan de sombra en la altura
    this.graphics.strokeStyle = 'gray';
    this.drawLine(izqX, arriY, izqX, this.iY(this.rHeight - 2));
    this.drawLine(centX, arriY + arribaTodo, centX, this.iY(this.rHeight - 2.3));
    this.drawLine(derX, arriY, derX, this.iY(this.rHeight - 2));
    this.drawLine(izqX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 1.7));
    this.drawLine(derX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 1.7));
    this.drawLine(izqX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3));
    this.drawLine(derX, this.iY(this.rHeight - 2), centX, this.iY(this.rHeight - 2.3));
    this.graphics.strokeStyle = 'black';
  }

  //funcion para guardar las posiciones de las barras para poder utilizarlo para mostrarlo
  private barrasInfo: { x: number; y: number; width: number; height: number; value: number }[] = [];

  paint(): void {
    if (!this.h || this.h.length === 0) {
      console.warn("No hay datos para trazar");
      return;
    }
    //let h: number[] = [200, 100, 16, 420];
    //let h: number[] = [1150, 1780, 860, 1260, 1500];
    //let h: number[] = [27, 10, 16,90,50,75];
    //let h: number[] =[1000, 10, 100];
    //let h: number[] = [10, 33, 200, 100, 160,50,75, 42, 140, 25, 66, 98];
    let maxEsc: number;
    // let colors: string[] = ['magenta', 'red', 'green', 'purple'];
    //bloque para generar colores RGB aleatorios, pero con la condicion de que no sean muy oscuros
    const generarColores = (): string => {
      const r = Math.floor(60 + Math.random() * 155);
      const g = Math.floor(40 + Math.random() * 155);
      const b = Math.floor(80 + Math.random() * 155);
      return `rgb(${r},${g},${b})`;
    }

    //se limpian los valores de la lista de barrasInfo
    this.barrasInfo = [];

    //color ya generado
    const colors: string[] = Array.from({ length: this.h.length }, () => generarColores());
    //se calcula el maximo escalado asegurando que sea minimo 1
    maxEsc = Math.max(this.maxH(this.h), 1);
    //se limpia el canvas para comenzar a trazar
    this.graphics.clearRect(0, 0, this.maxX + 1, this.maxY + 1);
    // Dibujar ejes
    this.graphics.strokeStyle = 'green';
    this.graphics.lineWidth = 2;
    this.drawLine(this.iX(0), this.iY(0), this.iX(8), this.iY(0)); // Eje X
    this.drawLine(this.iX(0), this.iY(0), this.iX(0), this.iY(this.rHeight - 2)); // Eje Y
    this.graphics.lineWidth = 1;


    //Constantes para determinar el ancho de los lados
    const anchoLados = this.h.length > 7 ? 0.3 : 0.5;
    const espacioEntreBarras = this.h.length > 7 ? 0.1 : 0.2;

    //Constantes para calcular el ancho total necesario
    const anchoTotal = this.h.length * (anchoLados * 2 + espacioEntreBarras);
    const factorEscala = Math.min(1, 8 / anchoTotal);

    // se dibujan las barras
    let i = 0;
    const anchoBarra = 8 / this.h.length;
    for (let x = 0.7; x < 8; x += anchoBarra) {
      if (i < this.h.length) {
        this.graphics.strokeStyle = colors[i];
        //Normalizacion de la altura con la idea de que sean proporcionales y visibles
        const alturaNormalizada = (this.h[i] / maxEsc) * (this.rHeight - 2);
        const alturaFinal = Math.max(alturaNormalizada, 0.1);
        this.barra(x, 0, alturaFinal, anchoLados * factorEscala);
        i++;
      }
    }
    //Se dibujan las etiquetas de porcentaje
    i = 0;
    this.graphics.font = this.h.length > 7 ? '8px Arial' : '10px Arial';
    for (let x = 0.5; x < 8; x += anchoBarra) {
      this.graphics.strokeStyle = colors[i % colors.length];
      if (i < this.h.length) {
        if (maxEsc > 0) {
          const porcentajeAltura = ((this.h[i] / maxEsc) * 100).toFixed(1);
          this.graphics.strokeText(porcentajeAltura + " %", this.iX(x + 0.1), this.iY(-0.3));
          //se agrega el valor real de la barra
          this.graphics.strokeText(this.h[i].toString(), this.iX(x + 0.1), this.iY(6.6) + 10);
        }
        i++;
      }
    }

    // Dibujar marcas en el eje Y
    const pasosY = 5;
    this.graphics.strokeStyle = 'black';
    this.graphics.font = 'bold 10px Arial';
    this.graphics.textAlign = 'right'
    this.graphics.fillStyle = 'black';
    for (let j = 0; j <= pasosY; j++) {
      const valY = j * (this.rHeight - 2) / pasosY;
      const valEscalado = (j * maxEsc / pasosY).toFixed(1);
      this.drawLine(this.iX(0), this.iY(valY), this.iX(-0.1), this.iY(valY));
      this.graphics.fillText(valEscalado, this.iX(-0.3), this.iY(valY) + 3);
    }
    this.graphics.textAlign = 'left';
  }

}

//Funcion para que los datos del formulario se puedan procesar y enviar a la clase CanvasLocal
export function setupChartControls(canvasLocal: CanvasLocal): void {
  //constantes para los elementos del formulario
  const datosRecibidos = document.getElementById("datosRecibidos") as HTMLInputElement;
  const btnDibujar = document.getElementById("btnDibujar") as HTMLButtonElement;
  const btnLimpiar = document.getElementById("btnLimpiar") as HTMLButtonElement;
  //const para procesar los datos del formulario y convertirlos a un array de numeros
  const procesarDatos = (input: string): number[] => {
    return input.split(',').map(item => parseFloat(item.trim())).filter(item => !isNaN(item));
  };

  //se asignan los eventos a los botones del formulario
  btnDibujar.addEventListener("click", () => {
    const procesarDatosEntrada = procesarDatos(datosRecibidos.value);

    //validar que no se ingresen valores negativos
    const negativos = procesarDatosEntrada.some(valor => valor < 0);
    if (negativos) {
      alert("No se permiten valores negativos.");
      this.graphics.clearRect(0, 0, this.maxX + 1, this.maxY + 1);
      this.h = [];
      return;
    }
    //validar que no se ingresen valores validos
    if (procesarDatosEntrada.length > 0) {
      canvasLocal.ActualizarInfo(procesarDatosEntrada);
    } else {
      alert("Ingrese valores validos separados por comas ejemplo: 10, 20, 30");
    }


  });

  btnLimpiar.addEventListener("click", () => {
    datosRecibidos.value = '';
    canvasLocal.ActualizarInfo([]);
  });
}

//Funcion para inicializar el canvas y la clase CanvasLocal
const canvas = document.getElementById("circlechart") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const chart = new CanvasLocal(ctx, canvas);

setupChartControls(chart);
