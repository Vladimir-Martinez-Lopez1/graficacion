
export class CanvasLocal {
  //atributos
  protected graphics: CanvasRenderingContext2D;
  protected rWidth:number;
  protected rHeight:number;
  protected maxX: number;
  protected maxY: number;
  protected pixelSize: number;
  protected centerX: number;
  protected centerY: number;
  
      
  public constructor(g: CanvasRenderingContext2D, canvas: HTMLCanvasElement){
    this.graphics = g;
    this.rWidth = 25;
    this.rHeight= 25;
    this.maxX = canvas.width - 1;
    this.maxY = canvas.height - 1;
    this.pixelSize = Math.max(this.rWidth / this.maxX, this.rHeight / this.maxY);
    this.centerX = 0;
    this.centerY = this.maxY;
  }

  iX(x: number):number{return Math.round(this.centerX + x/this.pixelSize);}
  iY(y: number): number{ return Math.round(this.centerY - y / this.pixelSize); }

  drawLine(x1: number, y1: number, x2: number, y2:number) {
    
    this.graphics.beginPath();
    this.graphics.moveTo(x1, y1);
    this.graphics.lineTo(x2, y2);
    this.graphics.closePath();
    this.graphics.stroke();
  }

  /*fx(x:number):number {
    return Math.sin(x*2.5);
  }*/
 dibujarPixel(x:number, y:number){
  this.graphics.fillRect(this.iX(x), this.iY(y+1), this.iX(1)-this.iX(0), this.iX(1)-this.iX(0));
 }

  paint() {
    //this.drawLine(-100,0,this.maxX,0);
   this.drawLine(this.iX(0), this.iY(0), this.iX(25), this.iY(0));
    /*this.drawLine(this.iX(0), this.iY(-5), this.iX(0), this.iY(5));
    this.drawLine(this.iX(0), this.iY(0), this.iX(3.14159), this.iY(2));
    */
   let tamX=25;
   let tamY=25;
   
    
   this.graphics.fillStyle = "red";
   for(let i=0; i<25; i++)
      for(let j =0; j<25; j++)
        if(Math.random()>0.5) this.dibujarPixel(i,j);

   this.graphics.fillStyle = "black";
   for(let x = 0; x<=tamX; x++)
    this.drawLine(this.iX(x), this.iY(0),this.iX(x), this.iY(tamX));
   
   for(let y = 0; y<=tamY; y++)
    this.drawLine(this.iX(0), this.iY(y),this.iX(tamY), this.iY(y));
  }
  
}