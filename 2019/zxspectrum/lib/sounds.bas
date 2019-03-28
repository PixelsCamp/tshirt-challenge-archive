FUNCTION playErrorSound ()
    FOR n=1 TO 6
        BEEP 0.01, (10.0 / n)
    NEXT
    BEEP 0.5, -20
END FUNCTION

FUNCTION playSuccessSound ()
    FOR n=1 TO 6
        BEEP 0.03, (10.0 / (7 - n))
    NEXT
END FUNCTION

FUNCTION playHurray ()
    FOR z=1 TO 5
       FOR n=1 TO 6
           BEEP 0.01, (10.0 / (7 - n))
       NEXT
    NEXT
END FUNCTION
