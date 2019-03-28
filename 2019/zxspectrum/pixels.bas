#include "./lib/putchars.bas"
#include "./lib/paintdata.bas"
#include "./lib/sounds.bas"
#include <keys.bas>

#define input_y 22
#define input_x 3
#define codesVariants 4
#define codesLength 7
#define codeOutputLength 29

DIM secretCodes(codesVariants - 1, codesLength - 1) AS UInteger => { { 23174,4,8,15,16,23,42 } , { 30479,4,8,15,16,23,42 } , { 17824,4,8,15,16,23,42 } , { 94494,4,8,15,16,23,42 } }
DIM secretCodesOutput(codesVariants - 1, codeOutputLength - 1) AS UInteger => { { 186, 124, 196, 149, 097, 231, 153, 186, 187, 088, 172, 160, 076, 045, 214, 198, 057, 038, 037, 161, 152, 173, 245, 008, 252, 136, 110, 244, 242 } , { 044, 161, 220, 160, 172, 009, 059, 099, 053, 069, 136, 119, 226, 048, 094, 216, 034, 194, 034, 233, 088, 032, 147, 182, 135, 132, 036, 120, 004 } , { 006, 218, 216, 169, 046, 042, 111, 110, 232, 177, 075, 252, 249, 042, 231, 206, 234, 181, 197, 160, 127, 210, 247, 173, 141, 229, 192, 122, 182 } , { 129, 160, 141, 163, 087, 184, 013, 017, 254, 178, 059, 102, 148, 093, 158, 012, 126, 251, 255, 094, 246, 148, 222, 220, 086, 235, 107, 023, 025 } }

FUNCTION waitKeyboardRelease()
    wait1:  IF INKEY$ <> "" THEN GO TO wait1
END FUNCTION

FUNCTION hardPause(pn)
    FOR p = 0 TO pn*100::NEXT
END FUNCTION

' http://stevehill.xyz/spectrum/2017/03/16/spectrum-development-environment.html
' INK (0-7) + PAPER (0-7 * 8) + BRIGHT (0/64)
' BRIGHT is either 0 or 64
' 0 = Black 1 = Blue 2 = Red 3 = Magenta 4 = Green 5 = Cyan 6 = Yellow 7 = White

#define output_y 16
#define output_x 4
#define output_cols 6
#define output_lines 5

FUNCTION printCode(codeNumber)
    LET ch = 0
    LET pad = 0
    LET nn = 0
    INK 4
    PRINT AT 4, 16; "THESE"
    PRINT AT 5, 16; "ARE YOUR"
    PRINT AT 6, 16; "INSTRUCTIONS"
    INK 7
    FOR cy = 0 TO output_lines - 1
       FOR cx = 0 TO output_cols - 1
          IF nn < 29
              ch = secretCodesOutput(codeNumber, cy * output_cols + cx)
              pad = 0
              IF ch < 100:pad = 1:END IF
              IF ch < 10:pad = 2:END IF
              FOR cp = 0 TO pad: PRINT AT output_y + cy, output_x + cx * 4 + cp; "0": NEXT
              PRINT AT output_y + cy, output_x + cx * 4 + pad; ch
              nn = nn + 1
          END IF
       NEXT
    NEXT
END FUNCTION

FUNCTION instructions(codeNumber)
    putChars(0,0,32,24,@instructionsData)
    paintData (0,0,32,24,@instructionsColors)
    printCode(codeNumber)
    hardPause(20)
END FUNCTION

GOTO start
#include "./screens/lost.bas"
#include "./screens/rocket.bas"
#include "./screens/instructions.bas"
#include "./screens/masks.bas"

start:
    ASM
        ld a,71             ; ink + paper * 8
        ld (23693),a        ; set our screen colours.
        call 3503           ; clear the screen.
        ld a,0              ; 2 is the code for red.
        call 8859           ; set border colour.
    END ASM

    putChars(0,0,32,24,@rocketData)
    paintData (0,0,32,24,@rocketColors)

    hardPause(10)

    putChars(0,0,32,24,@lostData)
    paintData (0,0,32,24,@lostColors)

    DIM value AS UInteger
    value = 0
    LET chrPos = 0
    LET linePos = 0
    LET codeOffset = 0
    LET selectedCode = 0
DO
    LET i = CODE(INKEY$) - CODE("0")
    IF i >= 0 AND i <= 9
        BEEP 0.01, -10
        waitKeyboardRelease()
        IF codeOffset = 0 AND chrPos < 5 OR chrPos < 2
          value = value * 10 + i
          chrPos = chrPos + 1
          linePos = linePos + 1
          PRINT AT input_y, input_x + linePos; i
        END IF
    END IF
    IF codeOffset = 0 AND chrPos = 5 OR codeOffset > 0 AND chrPos = 2
        ' PRINT AT 10,10; value
        ' PRINT AT 11,10; secretCodes(codeOffset)
        IF codeOffset = 0
            FOR co = 0 TO 3
                IF value = secretCodes(co, 0)
                selectedCode = co
                END IF
            NEXT
        END IF
        IF value = secretCodes(selectedCode, codeOffset)
            paintData (0,0,32,24,@lostYellowColors)
            playSuccessSound()
            paintData (0,0,32,24,@lostColors)
            codeOffset = codeOffset + 1
            IF codeOffset = codesLength
                playHurray()
                instructions(selectedCode)
                codeOffset = 0
                hardPause(10)
                GOTO start
            ELSE
                linePos = linePos + 1
                PRINT AT input_y, input_x + linePos; "-"
            END IF
        ELSE
            PRINT AT input_y, input_x; "                        "
            FOR nnn = 1 TO 10
                paintData (0,0,32,24,@lostRedColors)
                BEEP 0.01, (10.0 / nnn)
                paintData (0,0,32,24,@lostColors)
                BEEP 0.01, (10.0 / nnn)
            NEXT
            BEEP 0.2, -20
            codeOffset = 0
            linePos = 0
        END IF
        value = 0
        chrPos = 0
    END IF
LOOP
