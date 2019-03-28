# build stuff

ASM = shirts bg colors hello sound
BAS = pixels

CC = z80asm
ZXB = ./zxbasic/zxb.py

all: $(BAS)

asm: $(ASM)

$(ASM):
	mkdir -p build
	$(foreach var,$(ASM),$(CC) -o build/$(var) asm/$(var).asm;)

$(BAS):
	mkdir -p build
	$(foreach var,$(BAS),$(ZXB) $(var).bas --tzx --BASIC --autorun -o build/$(var).tzx;)

clean:
	$(foreach var,$(ASM),$(RM) build/$(var);)
	$(foreach var,$(BAS),$(RM) build/$(var);)
