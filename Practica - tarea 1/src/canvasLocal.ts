
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


  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.graphics = g;
    this.rWidth = 6;
    this.rHeight = 4;
    this.maxX = canvas.width - 1
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = this.maxX / 2;
    this.centerY = this.maxY / 2;
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



  paint() {

    //En esta parte se definen los cuatro vertices o esquinas del cuadrado que utilizare, en este caso de 400 x 400
    let xA = (this.maxX - 400) / 2;
    let yA = (this.maxY - 400) / 2;
    let xB = (this.maxX + 400) / 2;
    let yB = yA;
    let xC = xB;
    let yC = (this.maxY + 400) / 2;
    let xD = xA;
    let yD = yC;

    //Estas seran las variables que se utilizaran para guardar las nuevas coordenas en cada iteración
    let xA1, yA1, xB1, yB1, xC1, yC1, xD1, yD1;


    let q = 0.02; //movimiento de lineas o sepacion de lineas 
    let p = 1 - q;

    //Este bucle sirve para dibujar los cuadrados internos dentro del cuadrado central
    for (let i = 0; i < 130; i++) {

      this.drawLine(xA, yA, xB, yB);
      this.drawLine(xB, yB, xC, yC);
      this.drawLine(xC, yC, xD, yD);
      this.drawLine(xD, yD, xA, yA);

      //En esta seccion se calculan las nuevas posiciones de cada punto, con un desplazamiento hacia el centro
      xA1 = p * xA + q * xB;
      yA1 = p * yA + q * yB;
      xB1 = p * xB + q * xC;
      yB1 = p * yB + q * yC;
      xC1 = p * xC + q * xD;
      yC1 = p * yC + q * yD;
      xD1 = p * xD + q * xA;
      yD1 = p * yD + q * yA;

      //Por ultimo se actualizan las coordenadas para la nueva iteración
      xA = xA1; xB = xB1; xC = xC1; xD = xD1;
      yA = yA1; yB = yB1; yC = yC1; yD = yD1;
    }

  }

}