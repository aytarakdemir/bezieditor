
export class Scene {

    private canvas: HTMLCanvasElement;
    private ctx;

    private bezierCoordinates: number[][] = [

    ];

    private pivotX: number = 0;
    private pivotY: number = 0;

    private isDragging: boolean = false;
    private dragStart = { x: 0, y: 0 };
    private selected: {curve: number, coordinateX: number, coordinateY: number} | null = null;

    private isEditing: boolean = true;

    constructor() {
        this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);
        this.ctx = (this.canvas as HTMLCanvasElement).getContext('2d')!;
        this.animate();
        this.initMouseEvents();
        this.initControlMenuEvents();
    }

    private resizeCanvas= (): void => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }


    public setPivot(x: number, y: number): void {
        this.pivotX = x;
        this.pivotY = y;    
    }

    public setCoordinates(coords: number[][]) {
        this.bezierCoordinates = coords;
    }
    
    public draw(): void {
        this.ctx.fillStyle = "#ffceb4";
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(this.pivotX, this.pivotY);

        for (let i = 0; i < this.bezierCoordinates.length; i++) {
            if (this.bezierCoordinates[i].length === 6) {
                this.ctx.bezierCurveTo(
                    this.pivotX + this.bezierCoordinates[i][0],
                    this.pivotY + this.bezierCoordinates[i][1],
                    this.pivotX + this.bezierCoordinates[i][2],
                    this.pivotY + this.bezierCoordinates[i][3],
                    this.pivotX + this.bezierCoordinates[i][4],
                    this.pivotY + this.bezierCoordinates[i][5],
                );
            } else {
                this.ctx.moveTo(
                    this.pivotX + this.bezierCoordinates[i][0],
                    this.pivotY + this.bezierCoordinates[i][1],
                );
            }
        }

        this.ctx.fill();
        this.ctx.stroke();
    }

    private drawHandles() {
        if (!this.isEditing) {
            return;
        }
        for (let i = 0; i < this.bezierCoordinates.length; i++) {
            this.ctx.fillStyle = "black";
            this.ctx.beginPath();

            this.ctx.rect(this.pivotX, this.pivotY, 10, 10);
            this.ctx.fill();
            this.ctx.stroke();
            

            if (this.bezierCoordinates[i].length === 6) {

                this.ctx.fillStyle = "yellow";
                this.ctx.beginPath();

                this.ctx.rect(this.pivotX + this.bezierCoordinates[i][4] - 5, this.pivotY + this.bezierCoordinates[i][5] - 5, 10, 10);
                this.ctx.fill();
                this.ctx.stroke();


                this.ctx.fillStyle = "red";
                this.ctx.beginPath();
                this.ctx.ellipse(this.pivotX + this.bezierCoordinates[i][0] - 2.5, this.pivotY + this.bezierCoordinates[i][1] - 2.5, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                this.ctx.fill();

                this.ctx.fillStyle = "blue";
                this.ctx.beginPath();            
                this.ctx.ellipse(this.pivotX + this.bezierCoordinates[i][2] - 2.5, this.pivotY + this.bezierCoordinates[i][3] - 2.5, 5, 5, Math.PI / 4, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                this.ctx.fillStyle = "yellow";
                this.ctx.beginPath();

                this.ctx.rect(this.pivotX + this.bezierCoordinates[i][0] - 5, this.pivotY + this.bezierCoordinates[i][1] - 5, 10, 10);
                this.ctx.fill();
                this.ctx.stroke();
            }

        } 
    }

    private initMouseEvents() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    }
    private initControlMenuEvents() {
        const checkBox = document.getElementById('edit-state') as HTMLInputElement;
        const button = document.getElementById('btn-input') as HTMLButtonElement;
        const textarea = document.getElementById('bezier-input') as HTMLTextAreaElement;
        const outputButton = document.getElementById('btn-output') as HTMLButtonElement;
        const outputParagraph = document.getElementById('output') as HTMLParagraphElement;
        
        checkBox.checked = this.isEditing;
        checkBox.addEventListener('change', () => {
            if (checkBox.checked) {
                this.isEditing = true;
            } else {
                this.isEditing = false;
            }
        });
        button.addEventListener('click', () => {
            try {
                const inputValue = JSON.parse(textarea.value) as number[][];
                if (this.isValidNumberArrayArray(inputValue)) {
                    this.processInput(inputValue);
                } else {
                    alert('Invalid input format. Expected an array of arrays of numbers.');
                    console.error('Invalid input format. Expected an array of arrays of numbers.');
                }
            } catch (error) {
                console.error('Invalid JSON format:', error);
            }
        });
        outputButton.addEventListener('click', () => {
            const formattedArrayString = '[' + this.bezierCoordinates.map(subArray => 
                '\n[' + subArray.join(', ') + ']'
            ).join(',') + '\n]';            
            outputParagraph.textContent = formattedArrayString;
        });
    }

    private processInput(inputValue: number[][]) {
        console.log('Validated input:', inputValue);

        this.bezierCoordinates=inputValue;
    }

    private isValidNumberArrayArray(input: any): input is number[][] {
        return Array.isArray(input) &&
            input.every(subArray =>
                Array.isArray(subArray) &&
                subArray.every(item => typeof item === 'number')
            );
    }

    private onMouseDown(event: MouseEvent) {
        if (!this.isEditing) {
            return;
        }
        this.selected = this.selectedRect(event);
        if (this.selected) {
            this.isDragging = true;
            this.dragStart.x = event.clientX - this.bezierCoordinates[this.selected.curve][this.selected.coordinateX];
            this.dragStart.y = event.clientY - this.bezierCoordinates[this.selected.curve][this.selected.coordinateY];
        }
        else if (this.isPivotSelected(event)) {
            this.isDragging = true;
            this.dragStart.x = event.clientX - this.pivotX;
            this.dragStart.y = event.clientY - this.pivotY;

        }
    }

    private onMouseMove(event: MouseEvent) {
        if (!this.isDragging) return;
        if (this.selected) {
            this.bezierCoordinates[this.selected.curve][this.selected.coordinateX] = event.clientX - this.dragStart.x;
            this.bezierCoordinates[this.selected.curve][this.selected.coordinateY] = event.clientY - this.dragStart.y;
            this.draw();
        }
        else if (this.isPivotSelected(event)) {
            this.pivotX = event.clientX - this.dragStart.x;
            this.pivotY = event.clientY - this.dragStart.y;
            this.draw();
        }
    }

    private onMouseUp() {
        this.selected = null;
        this.isDragging = false;
    }

    private isPivotSelected(event: MouseEvent): boolean {
        return event.clientX >= this.pivotX - 50 &&
            event.clientX <= this.pivotX + 50 &&
            event.clientY >= this.pivotY - 50 &&
            event.clientY <= this.pivotY + 50;
    }

    private selectedRect(event: MouseEvent): {curve: number, coordinateX: number, coordinateY: number} | null {

        for (let i = 0; i < this.bezierCoordinates.length; i++) {

            if (this.bezierCoordinates[i].length === 6) {
                if (event.clientX >= this.pivotX + this.bezierCoordinates[i][4] - 5 &&
                    event.clientX <= this.pivotX + this.bezierCoordinates[i][4] + 5 &&
                    event.clientY >= this.pivotY + this.bezierCoordinates[i][5] - 5 &&
                    event.clientY <= this.pivotY + this.bezierCoordinates[i][5] + 5) 
                    return {curve: i, coordinateX: 4, coordinateY: 5 };

                if (event.clientX >= this.pivotX + this.bezierCoordinates[i][0] - 5 &&
                    event.clientX <= this.pivotX + this.bezierCoordinates[i][0] + 5 &&
                    event.clientY >= this.pivotY + this.bezierCoordinates[i][1] - 5 &&
                    event.clientY <= this.pivotY + this.bezierCoordinates[i][1] + 5) 
                    return {curve: i, coordinateX: 0, coordinateY: 1 };
                
                if (event.clientX >= this.pivotX + this.bezierCoordinates[i][2] - 5 &&
                    event.clientX <= this.pivotX + this.bezierCoordinates[i][2] + 5 &&
                    event.clientY >= this.pivotY + this.bezierCoordinates[i][3] - 5 &&
                    event.clientY <= this.pivotY + this.bezierCoordinates[i][3] + 5) 
                    return {curve: i, coordinateX: 2, coordinateY: 3 };
                
            } else {
                if (event.clientX >= this.pivotX + this.bezierCoordinates[i][0] - 5 &&
                    event.clientX <= this.pivotX + this.bezierCoordinates[i][0] + 5 &&
                    event.clientY >= this.pivotY + this.bezierCoordinates[i][1] - 5 &&
                    event.clientY <= this.pivotY + this.bezierCoordinates[i][1] + 5) 
                    return {curve: i, coordinateX: 0, coordinateY: 1 };
            }

        } 
        return null;
    }
    
    private animate():void {
        requestAnimationFrame(this.animate.bind(this));
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.draw();
        this.drawHandles();
    }


}

