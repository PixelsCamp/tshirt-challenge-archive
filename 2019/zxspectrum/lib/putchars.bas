SUB putChars(x AS UBYTE,y AS UBYTE, width AS UBYTE, height AS UBYTE, dataAddress AS UINTEGER)
    ' Copyleft Britlion. Feel free to use as you will. Please attribute me if you use this, however!
 
    ASM
    BLPutChar:
             LD      a,(IX+5)
             ;AND     31
             ld      l,a
             ld      a,(IX+7) ; Y value
             ld      d,a
             AND     24
             add     a,64 ; 256 BYTE "page" FOR screen - 256*64=16384. Change this IF you are working with a screen address elsewhere, such AS a buffer.
             ld      h,a
             ld      a,d
             AND     7
             rrca
             rrca
             rrca
             OR      l
             ld      l,a
 
    PUSH HL ; SAVE our address
 
    LD E,(IX+12) ; data address
    LD D,(IX+13)
    LD B,(IX+9) ; width
    PUSH BC ; SAVE our column count
 
    BLPutCharColumnLoop:
 
    LD B,(IX+11) ; height 
 
    BLPutCharInColumnLoop:
   
    ; gets screen address in HL, AND bytes address in DE. Copies the 8 bytes TO the screen
    ld a,(DE) ; First Row
    LD (HL),a
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; second Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Third Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Fourth Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Fifth Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Sixth Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Seventh Row
    
    INC DE
    INC H
    ld a,(DE)
    LD (HL),a ; Eigth Row
    
    INC DE ; Move TO NEXT data item.
    
    DEC B
    JR Z,BLPutCharNextColumn
    ;The following CODE calculates the address of the NEXT line down below current HL address.
    PUSH DE ; SAVE DE
             ld   a,l   
             AND  224   
             cp   224   
             jp   z,BLPutCharNextThird
 
    BLPutCharSameThird:
             ld   de,-1760
             ;and  a         
             add  hl,de      
             POP DE ; get our data point back.
             jp BLPutCharInColumnLoop
 
    BLPutCharNextThird:
             ld   de,32      
             ;and  a
             add  hl,de   
             POP DE ; get our data point back.
    JP BLPutCharInColumnLoop
 
    BLPutCharNextColumn:
    POP BC
    POP HL
    DEC B
    JP Z, BLPutCharsEnd
 
    INC L   ; Note this would normally be Increase HL - but block painting should never need TO increase H, since that would wrap around.
    PUSH HL
    PUSH BC
    JP BLPutCharColumnLoop
 
BLPutCharsEnd:
    END ASM
 
    END SUB
