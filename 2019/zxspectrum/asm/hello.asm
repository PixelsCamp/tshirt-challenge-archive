            ORG 32768
            LD A,2
            CALL 5633
            LD DE, string
            LD BC, eostr-string
            CALL 8252
            RET

string:     DEFB 22,0,11,"Hello World"
eostr:      equ $
