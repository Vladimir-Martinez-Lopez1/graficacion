export class CanvasLocal {
  protected graphics: CanvasRenderingContext2D;
  protected rWidth: number;
  protected rHeight: number;
  protected maxX: number;
  protected maxY: number;
  protected anchoPixel: number;
  protected altoPixel: number;
  protected centerX: number;
  protected centerY: number;
  protected datos: string[] = [];


  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = 25;
    this.rHeight = 25;
    const tamano = Math.min(canvas.width, canvas.height);
    canvas.width = tamano;
    canvas.height = tamano;
    this.maxX = canvas.width;
    this.maxY = canvas.height;
    const pixelSize = Math.floor(Math.min(this.maxX, this.maxY) / 25);
    this.anchoPixel = pixelSize;
    this.altoPixel = pixelSize;
    this.centerX = 0;
    this.centerY = 0;
  }
  //Metodo para extraer los datos del formulario 
  ActualizarInfo(newData: string[]): void {
    this.datos = [...newData];
    this.paint();
  }

  iX(x: number): number { return this.centerX + x * this.anchoPixel; }
  iY(y: number): number { return this.centerY + y * this.altoPixel; }

  drawLine(x1: number, y1: number, x2: number, y2: number) {
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  //metodo para dibujar un pixel en el canvas
  dibujarPixel(x: number, y: number) {
    this.graphics.fillRect(this.iX(x), this.iY(y), this.anchoPixel, this.altoPixel);
  }

  // Dibuja un patrón de posición en la esquina superior izquierda
  dibujarPatronPosicion(x: number, y: number) {
    // Función para dibujar un cuadro de tamaño variable y un color especifico
    const dibujarCuadro = (dx: number, dy: number, tamaño: number, color: string) => {
      this.graphics.fillStyle = color;
      for (let i = 0; i < tamaño; i++) {
        for (let j = 0; j < tamaño; j++) {
          this.dibujarPixel(x + dx + i, y + dy + j);
        }
      }
    };
    // Marco exterior blanco complementario para el patron de posición
    this.graphics.fillStyle = "white";
    for (let i = -1; i < 8; i++) {
      for (let j = -1; j < 8; j++) {
        this.dibujarPixel(x + i, y + j);
      }
    }

    dibujarCuadro(0, 0, 7, "black"); // Cuadro negro
    dibujarCuadro(1, 1, 5, "white"); // Cuadro blanco
    dibujarCuadro(2, 2, 3, "black"); // caudrado central de color negro
  }

  //función que es utilizada para dibujar el patrón de alineamiento
  dibujarPatronAlineamiento(x: number, y: number) {
    // de nuevo se utiliza la Función para dibujar un cuadro de tamaño variable y un color especifico
    const dibujarCuadro = (dx: number, dy: number, tamaño: number, color: string) => {
      this.graphics.fillStyle = color;
      for (let i = 0; i < tamaño; i++) {
        for (let j = 0; j < tamaño; j++) {
          this.dibujarPixel(x + dx + i, y + dy + j);
        }
      }
    };
    //parametros pasados a la funcion dibujarCuadro
    dibujarCuadro(-2, -2, 5, "black");
    dibujarCuadro(-1, -1, 3, "white");
    dibujarCuadro(0, 0, 1, "black");
  }

  dibujarLineasSincronizacion() {
    for (let i = 8; i < 25 - 8; i++) {
      this.graphics.fillStyle = (i % 2 === 0) ? "black" : "white";
      this.dibujarPixel(i, 6); // Horizontal
      this.dibujarPixel(6, i); // Vertical
    }
  }

  paint() {
    //incia comprobando que hayan datos para dibujar el qr
    if (this.datos.length === 0) {
      console.log("No hay datos para dibujar el QR.");
      return;
    }

    //limpia el canvas para dibujar el nuevo qr
    this.graphics.clearRect(0, 0, this.maxX + 1, this.maxY + 1);

    //const datos = "escueladeciencias.com";
    const ocupado: boolean[][] = Array.from({ length: 25 }, () => Array(25).fill(false));

    // Dibuja el patrón de posición en las esquinas
    const marcarPatronPosicion = (x: number, y: number) => {
      for (let i = -1; i < 8; i++) {
        for (let j = -1; j < 8; j++) {
          const px = x + i;
          const py = y + j;
          if (px >= 0 && px < 25 && py >= 0 && py < 25) ocupado[px][py] = true;
        }
      }
      this.dibujarPatronPosicion(x, y);
    };

    marcarPatronPosicion(0, 0);
    marcarPatronPosicion(0, 18);
    marcarPatronPosicion(18, 0);
    // Dibuja el patrón de posición en la esquina inferior derecha
    for (let i = 8; i < 25 - 8; i++) {
      ocupado[i][6] = true;
      ocupado[6][i] = true;
    }
    this.dibujarLineasSincronizacion();
    //dibuja el patron de alineamiento en el centro del qr
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const ax = 18 + dx;
        const ay = 18 + dy;
        if (ax >= 0 && ax < 25 && ay >= 0 && ay < 25) ocupado[ax][ay] = true;
      }
    }
    this.dibujarPatronAlineamiento(18, 18);

    // Codificar datos BYTE
    //const tablaAlfa = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";


    const bits: string[] = [];
    //Indica el modo BYTE
    bits.push('0100');

    //indica la longitud del mensaje
    bits.push(this.datos.length.toString(2).padStart(8, '0'));

    //Conversion de datos en ASCII a binario
    for (const c of this.datos) {
      const ascii = c.charCodeAt(0);
      bits.push(ascii.toString(2).padStart(8, '0'));
    }

    // Agregar el terminador de datos para el relleno de bits
    const flujoDeBits = bits.join('').padEnd(152, '0');
    let subir = true;
    let indiceDeBit = 0;

    //recorre el flujo de bits y dibuja los pixeles en el canvas mientras se asegura de que no se sobrepase el limite del canvas
    // Siempre de derecha a izquierda
    for (let col = 24; col >= 0; col -= 2) {
      if (col === 6) col--; // Saltar la columna de sincronización

      let fila = 24;
      while (fila >= 0) {
        for (let dx = 0; dx <= 1; dx++) {
          const x = col - dx;
          const y = fila;
          if (x >= 0 && y >= 0 && x < 25 && y < 25 && !ocupado[x][y]) {
            if (indiceDeBit >= flujoDeBits.length) break;
            const bit = flujoDeBits[indiceDeBit++];
            this.graphics.fillStyle = (bit === '1') ? "black" : "white";
            this.dibujarPixel(x, y);
            ocupado[x][y] = true;
          }
        }
        fila--; // Sigue subiendo aunque haya saltado
      }
    }



    // Relleno aleatorio de celdas restantes
    for (let x = 0; x < 25; x++) {
      for (let y = 0; y < 25; y++) {
        if (!ocupado[x][y]) {
          if (Math.random() > 0.5) {
            this.graphics.fillStyle = "black";
            this.dibujarPixel(x, y);
          }
          ocupado[x][y] = true;
        }
      }
    }

    // Cuadrícula de fondo para representarlo como el video
    this.graphics.strokeStyle = "#ccc";
    for (let x = 0; x <= 25; x++)
      this.drawLine(this.iX(x), this.iY(0), this.iX(x), this.iY(25));
    for (let y = 0; y <= 25; y++)
      this.drawLine(this.iX(0), this.iY(y), this.iX(25), this.iY(y));
  }
}

//Funcion para que los datos del formulario se puedan procesar y enviar a la clase CanvasLocal
export function setupChartControls(canvasLocal: CanvasLocal): void {
  //constantes para los elementos del formulario
  const datosRecibidos = document.getElementById("datosRecibidos") as HTMLInputElement;
  const btnDibujar = document.getElementById("btnDibujar") as HTMLButtonElement;
  const btnLimpiar = document.getElementById("btnLimpiar") as HTMLButtonElement;

  function procesarDatos(value: string): string[] {
    // Remueve los espacion en blanco iniciales y los finales
    const espaciosBlancos = value.trim();

    // El texto se convierte en una lista de caracteres
    const procesarDatos = espaciosBlancos.split('');

    return procesarDatos;

  }
  //se asignan los eventos a los botones del formulario
  btnDibujar.addEventListener("click", () => {
    const procesarDatosEntrada = procesarDatos(datosRecibidos.value);

    //validar que no se ingresen valores validos
    if (procesarDatosEntrada.length > 0) {
      canvasLocal.ActualizarInfo(procesarDatosEntrada);
    } else {
      alert("Ingrese un dato a procesar");
    }


  });
  //se asigna el evento al boton limpiar para que limpie  el input
  btnLimpiar.addEventListener("click", () => {
    datosRecibidos.value = '';
    canvasLocal.ActualizarInfo([]);
  });
}

//Funcion para inicializar el canvas y la clase CanvasLocal
const canvas = document.getElementById("circlechart") as HTMLCanvasElement;
const datos = canvas.getContext("2d") as CanvasRenderingContext2D;
const chart = new CanvasLocal(datos, canvas);

setupChartControls(chart);




