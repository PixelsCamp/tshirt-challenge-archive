ORG 32768

ld a,49             ; blue ink (1) on yellow paper (6*8).
ld (23693),a        ; set our screen colours.
call 3503           ; clear the screen.

ld a,2              ; 2 is the code for red.
call 8859           ; set border colour.
