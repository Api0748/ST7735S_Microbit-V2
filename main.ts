//% weight=20 color=#118AD6 icon="\uf108" block="LCD ST7735 V2"
namespace LCD_ST7735_MicrobitV2 {

    // Définition des broches de la micro:bit (Ajuster si nécessaire)
    const PIN_CS  = DigitalPin.P1;   // Chip Select du LCD
    const PIN_DC  = DigitalPin.P12;  // Data/Command (Note: Si votre shield utilise P2, changez par P2)
    const PIN_RST = DigitalPin.P8;   // Reset du LCD
    const PIN_BL  = AnalogPin.P16;   // Rétroéclairage (Backlight)

    const LCD_WIDTH = 160;
    const LCD_HEIGHT = 128;

    // Création du Framebuffer en RAM interne (Micro:bit V2 uniquement)
    // 160 * 128 * 2 octets (RGB565) = 40960 octets
    let frameBuffer = pins.createBuffer(LCD_WIDTH * LCD_HEIGHT * 2);

    export enum COLOR {
        WHITE = 0xFFFF,
        BLACK = 0x0000,
        BLUE = 0x001F,
        BRED = 0XF81F,
        GRED = 0XFFE0,
        GBLUE = 0X07FF,
        RED = 0xF800,
        MAGENTA = 0xF81F,
        GREEN = 0x07E0,
        CYAN = 0x7FFF,
        YELLOW = 0xFFE0,
        BROWN = 0XBC40,
        BRRED = 0XFC07,
        GRAY = 0X8430
    }

    export enum DOT_PIXEL {
        DOT_PIXEL_1 = 1,
        DOT_PIXEL_2,
        DOT_PIXEL_3,
        DOT_PIXEL_4
    }

    export enum LINE_STYLE {
        LINE_SOLID = 0,
        LINE_DOTTED
    }

    export enum DRAW_FILL {
        DRAW_EMPTY = 0,
        DRAW_FULL
    }

    // Table de police simplifiée intégrée (Font12)
    const Font12_Table = hex`
    000000000000000000000000082008200820082008200000082000000A500A500A50000000000000000000000249024907D0024907D0024902490000001003E0022001C000A0008203E000400000024105220542024400880150022204210000001C002200320018002C0042003C0000000820082004400000000000000000000000400082010402080208010400820040000001040082004100220041008201040000000000104055403E0010403E005540104000000000082008203E0008200820000000000000000000000000000000000000082008201040000000003E000000000000000000000000000000000000000000000820000000000002010102008400480020001000080000001C00220026002A00320022001C0000000820182008200820082008201C0000001C00220004000820104020803E0000003E00040008200C20022002201C00000006000A00120022003E000200020000003E0020003C000200020022001C0000001C00220020003C0022002201C0000003E00020004000820104010401040000001C00220022001C0022002201C0000001C00220022001E00020022001C00000000000820000000000820000000000000000008200000000008200440000000040008201040208010400820004000000000000003E0000003E00000000000002080104008200440082010402080000001C002200040008200820000008200000220055404A404A40444002003E0000001C00220022003E002200220220000003C00220022003C0022002203C0000001C002200200020002002201C0000003C002200220022002202203C0000003E00200020003C0020002003E0000003E00200020003C002000200200000001C00220020002E0022002201E000002200220022003E00220022022000001C00082008200820082008201C0000000E0002000200020002002201C00000220024002800300028002400220000200020002000200020020003E00000220036002A00220022002202200002200220032002A00260022002200001C0022002200220022002201C000003C00220022003C00200020020000001C002200220022002A0024001A000003C00220022003C00280024002200001C00220020001C0002002201C000003E00082008200820082008200820000220022002200220022002201C0000022002200220014001400082008200002200220022002A002A003600220002200220140008201400220022000220022014000820082008200820003E00020004000820104020803E000001C00104010401040104010401C00000002000400082010402080400080000001C00041004100410041004101C00000008201400220000000000000000000000000000000000000000003E00001040082004000000000000000000000000001C0002001E0022001E00002002003C00220022003C000000000000001C00200020001C0000020002001E00220022001E000000000000001C0022003E0020001C0000060008203E000820082008200000000000001E00220022001E0002001C2002003C0022002200220000000820000008200820082008200000004000000040004000400040004400382002002400280030002C002200000C00082008200820082008200E00000000000036002A0022002200000000000003C00220022002200000000000001C00220022001C00000000000003C0022003C00200020000000000001E0022001E0002000200000000000016001A002000200000000000001C0020001C0002001C0000040004001E0004000400060000000000002200220022001E000000000000220022001400082000000000000022002A002A0014000000000000220014000820140022000000000000220022001E0002001C000000000003E00040008203E0000000C00104010403000104010400C000820082008200000082008200820030000820008203000082008200C00000000003C0000000000000000
    `;

    function LCD_WriteReg(cmd: number): void {
        pins.digitalWritePin(PIN_DC, 0);
        pins.digitalWritePin(PIN_CS, 0);
        pins.spiWrite(cmd);
        pins.digitalWritePin(PIN_CS, 1);
    }

    function LCD_WriteData(data: number): void {
        pins.digitalWritePin(PIN_DC, 1);
        pins.digitalWritePin(PIN_CS, 0);
        pins.spiWrite(data);
        pins.digitalWritePin(PIN_CS, 1);
    }

    function LCD_WriteData_Word(data: number): void {
        pins.digitalWritePin(PIN_DC, 1);
        pins.digitalWritePin(PIN_CS, 0);
        pins.spiWrite(data >> 8);
        pins.spiWrite(data & 0x00FF);
        pins.digitalWritePin(PIN_CS, 1);
    }

    function LCD_SetWindows(Xstart: number, Ystart: number, Xend: number, Yend: number): void {
        LCD_WriteReg(0x2A);
        LCD_WriteData(0x00);
        LCD_WriteData(Xstart & 0xFF);
        LCD_WriteData(0x00);
        LCD_WriteData(Xend & 0xFF);

        LCD_WriteReg(0x2B);
        LCD_WriteData(0x00);
        LCD_WriteData(Ystart & 0xFF);
        LCD_WriteData(0x00);
        LCD_WriteData(Yend & 0xFF);

        LCD_WriteReg(0x2C);
    }

    //% blockId=LCD_Init block="Initialize LCD"
    export function LCD_Init(): void {
        pins.spiPins(DigitalPin.P15, DigitalPin.P14, DigitalPin.P13);
        pins.spiFrequency(8000000); // ⚡ Boost du bus SPI à 8 MHz

        pins.digitalWritePin(PIN_CMD, 1);
        pins.digitalWritePin(PIN_CS, 1);
        pins.digitalWritePin(PIN_RST, 1);
        basic.pause(100);
        pins.digitalWritePin(PIN_RST, 0);
        basic.pause(100);
        pins.digitalWritePin(PIN_RST, 1);
        basic.pause(100);

        // Configuration ST7735S
        LCD_WriteReg(0x11);
        basic.pause(120);
        LCD_WriteReg(0xB1); LCD_WriteData(0x01); LCD_WriteData(0x2C); LCD_WriteData(0x2D);
        LCD_WriteReg(0xB2); LCD_WriteData(0x01); LCD_WriteData(0x2C); LCD_WriteData(0x2D);
        LCD_WriteReg(0xB3); LCD_WriteData(0x01); LCD_WriteData(0x2C); LCD_WriteData(0x2D); LCD_WriteData(0x01); LCD_WriteData(0x2C); LCD_WriteData(0x2D);
        LCD_WriteReg(0xB4); LCD_WriteData(0x07);
        LCD_WriteReg(0xC0); LCD_WriteData(0xA2); LCD_WriteData(0x02); LCD_WriteData(0x84);
        LCD_WriteReg(0xC1); LCD_WriteData(0xC5);
        LCD_WriteReg(0xC2); LCD_WriteData(0x0A); LCD_WriteData(0x00);
        LCD_WriteReg(0xC3); LCD_WriteData(0x8A); LCD_WriteData(0x2A);
        LCD_WriteReg(0xC4); LCD_WriteData(0x8A); LCD_WriteData(0xEE);
        LCD_WriteReg(0xC5); LCD_WriteData(0x0E);
        LCD_WriteReg(0x36); LCD_WriteData(0xA8); // Rotation / Mode miroir
        LCD_WriteReg(0xE0); LCD_WriteData(0x02); LCD_WriteData(0x1c); LCD_WriteData(0x07); LCD_WriteData(0x12); LCD_WriteData(0x37); LCD_WriteData(0x32); LCD_WriteData(0x29); LCD_WriteData(0x2d); LCD_WriteData(0x29); LCD_WriteData(0x25); LCD_WriteData(0x2B); LCD_WriteData(0x39); LCD_WriteData(0x00); LCD_WriteData(0x01); LCD_WriteData(0x03); LCD_WriteData(0x10);
        LCD_WriteReg(0xE1); LCD_WriteData(0x03); LCD_WriteData(0x1d); LCD_WriteData(0x07); LCD_WriteData(0x06); LCD_WriteData(0x2E); LCD_WriteData(0x2C); LCD_WriteData(0x29); LCD_WriteData(0x2D); LCD_WriteData(0x2E); LCD_WriteData(0x2E); LCD_WriteData(0x35); LCD_WriteData(0x3F); LCD_WriteData(0x00); LCD_WriteData(0x00); LCD_WriteData(0x02); LCD_WriteData(0x10);
        LCD_WriteReg(0x3A); LCD_WriteData(0x05);
        LCD_WriteReg(0x29);
    }

    //% blockId=LCD_SetBL block="Set Backlight %Light"
    //% Light.min=0 Light.max=1023
    export function LCD_SetBL(Light: number): void {
        pins.analogWritePin(PIN_BL, Light);
    }

    //% blockId=LCD_ClearBuf block="Clear Buffer"
    export function LCD_ClearBuf(): void {
        frameBuffer.fill(0x00); // Nettoie la RAM interne instantanément
    }

    //% blockId=LCD_Display block="Refresh Screen"
    export function LCD_Display(): void {
        LCD_SetWindows(0, 0, LCD_WIDTH - 1, LCD_HEIGHT - 1);
        pins.digitalWritePin(PIN_DC, 1);
        pins.digitalWritePin(PIN_CS, 0);
        pins.spiWriteBuffer(frameBuffer); // ⚡ Envoi global ultra-rapide via DMA matériel !
        pins.digitalWritePin(PIN_CS, 1);
    }

    //% blockId=LCD_Clear block="Clear Screen Directly"
    export function LCD_Clear(): void {
        LCD_ClearBuf();
        LCD_Display();
    }

    //% blockId=DrawPoint block="Draw Point at X %X Y %Y Color %Color Pixel Size %Dot_Pixel"
    export function DrawPoint(X: number, Y: number, Color: number, Dot_Pixel: DOT_PIXEL): void {
        for (let XDir_Num = 0; XDir_Num < Dot_Pixel; XDir_Num++) {
            for (let YDir_Num = 0; YDir_Num < Dot_Pixel; YDir_Num++) {
                let px = X + XDir_Num;
                let py = Y + YDir_Num;
                if (px < LCD_WIDTH && py < LCD_HEIGHT && px >= 0 && py >= 0) {
                    let idx = (px + py * LCD_WIDTH) * 2;
                    frameBuffer[idx] = Color >> 8;
                    frameBuffer[idx + 1] = Color & 0xFF;
                }
            }
        }
    }

    //% blockId=DrawLine block="Draw Line from X1 %Xstart Y1 %Ystart to X2 %Xend Y2 %Yend Color %Color Pixel Size %Dot_Pixel Style %Line_Style"
    export function DrawLine(Xstart: number, Ystart: number, Xend: number, Yend: number, Color: number, Dot_Pixel: DOT_PIXEL, Line_Style: LINE_STYLE): void {
        let Xcurr = Xstart;
        let Ycurr = Ystart;
        let dx = Math.abs(Xend - Xstart);
        let dy = Math.abs(Yend - Ystart);
        let s1 = Xend > Xstart ? 1 : -1;
        let s2 = Yend > Ystart ? 1 : -1;
        let interchange = 0;

        if (dy > dx) {
            let temp = dx; dx = dy; dy = temp;
            interchange = 1;
        }
        let e = 2 * dy - dx;
        let Num = 0;

        for (let i = 0; i <= dx; i++) {
            Num++;
            if (Line_Style == LINE_STYLE.LINE_SOLID || Num % 4 == 0) {
                DrawPoint(Xcurr, Ycurr, Color, Dot_Pixel);
            }
            while (e >= 0) {
                if (interchange == 1) Xcurr += s1;
                else Ycurr += s2;
                e = e - 2 * dx;
            }
            if (interchange == 1) Ycurr += s2;
            else Xcurr += s1;
            e = e + 2 * dy;
        }
    }

    //% blockId=DrawRectangle block="Draw Rectangle X1 %Xstart Y1 %Ystart X2 %Xend Y2 %Yend Color %Color Fill %Draw_Fill Pixel Size %Dot_Pixel"
    export function DrawRectangle(Xstart: number, Ystart: number, Xend: number, Yend: number, Color: number, Draw_Fill: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        if (Draw_Fill == DRAW_FILL.DRAW_FULL) {
            for (let i = Ystart; i <= Yend; i++) {
                DrawLine(Xstart, i, Xend, i, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            }
        } else {
            DrawLine(Xstart, Ystart, Xend, Ystart, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xstart, Ystart, Xstart, Yend, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xend, Ystart, Xend, Yend, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
            DrawLine(Xstart, Yend, Xend, Yend, Color, Dot_Pixel, LINE_STYLE.LINE_SOLID);
        }
    }

    //% blockId=DrawCircle block="Draw Circle Center X %X_Center Y %Y_Center Radius %Radius Color %Color Fill %Draw_Fill Pixel Size %Dot_Pixel"
    export function DrawCircle(X_Center: number, Y_Center: number, Radius: number, Color: number, Draw_Fill: DRAW_FILL, Dot_Pixel: DOT_PIXEL): void {
        let Esp = 3 - (Radius << 1);
        let XCurrent = 0;
        let YCurrent = Radius;

        while (XCurrent <= YCurrent) {
            if (Draw_Fill == DRAW_FILL.DRAW_FULL) {
                for (let sCount = XCurrent; sCount <= YCurrent; sCount++) {
                    DrawPoint(X_Center + XCurrent, Y_Center + sCount, Color, Dot_Pixel);
                    DrawPoint(X_Center - XCurrent, Y_Center + sCount, Color, Dot_Pixel);
                    DrawPoint(X_Center + sCount, Y_Center + XCurrent, Color, Dot_Pixel);
                    DrawPoint(X_Center - sCount, Y_Center + XCurrent, Color, Dot_Pixel);
                    DrawPoint(X_Center + XCurrent, Y_Center - sCount, Color, Dot_Pixel);
                    DrawPoint(X_Center - XCurrent, Y_Center - sCount, Color, Dot_Pixel);
                    DrawPoint(X_Center + sCount, Y_Center - XCurrent, Color, Dot_Pixel);
                    DrawPoint(X_Center - sCount, Y_Center - XCurrent, Color, Dot_Pixel);
                }
            } else {
                DrawPoint(X_Center + XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center - XCurrent, Y_Center + YCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center + YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center - YCurrent, Y_Center + XCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center + XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center - XCurrent, Y_Center - YCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center + YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);
                DrawPoint(X_Center - YCurrent, Y_Center - XCurrent, Color, Dot_Pixel);
            }
            if (Esp < 0) Esp += (4 * XCurrent + 6);
            else {
                Esp += (10 + 4 * (XCurrent - YCurrent));
                YCurrent--;
            }
            XCurrent++;
        }
    }

    //% blockId=DisString block="Display String %str at X %Xchar Y %Ychar Color %Color"
    export function DisString(Xchar: number, Ychar: number, str: string, Color: number): void {
        let Xcurr = Xchar;
        let Ycurr = Ychar;
        for (let i = 0; i < str.length; i++) {
            let ch = str.charCodeAt(i);
            if (ch < 32 || ch > 126) ch = 32; // Remplacer hors-limite par espace
            let fontIdx = (ch - 32) * 12;

            for (let Page = 0; Page < 12; Page++) {
                let bits = Font12_Table[fontIdx + Page];
                for (let Column = 0; Column < 8; Column++) {
                    if (bits & (0x80 >> Column)) {
                        DrawPoint(Xcurr + Column, Ycurr + Page, Color, DOT_PIXEL.DOT_PIXEL_1);
                    }
                }
            }
            Xcurr += 8; // Avancer au caractère suivant
            if (Xcurr + 8 > LCD_WIDTH) {
                Xcurr = Xchar;
                Ycurr += 12;
            }
        }
    }
}