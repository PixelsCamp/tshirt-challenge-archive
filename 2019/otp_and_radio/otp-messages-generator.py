#!/usr/bin/env python
import sys
import os
import re

if len(sys.argv) < 3:
    print("ERROR - Please specify the arguments (otp file name, radio message, zx message).")
    exit()
msg_zx = sys.argv[3]
msg_radio = sys.argv[2]
file_name = sys.argv[1]

say_str = "[[slnc 1000]] "
zx_numbers = ""
zx_str = ""
msg_radio = list(msg_radio)
file = tuple(open(file_name + ".txt", "r"))
key_number = None
agent_id = ""

for line in file:
    line = line.rstrip("\n")
    if re.search("Agent code:", line):
        ar = line.split(" ")
        agent_id = ar[2]
        for c in ar[2]:
            say_str += c + ","
        say_str += " [[slnc 1000]]"
    elif line:
        key_number = (number for number in line.split(" "))

for char in msg_radio:
    sxor = ord(char) ^ int(next(key_number))
    char_code = list(str(sxor).zfill(3))
    for c in char_code:
        say_str += c + ","
    say_str += "[[slnc 1000]]"

for char in msg_zx:
    sxor = ord(char) ^ int(next(key_number))
    char_code = str(sxor).zfill(3)
    zx_str += char_code + " = " + char + " | "
    zx_numbers += char_code + " "


os.system("say -v Samantha -r 120 -o otp.wav --data-format=LEF32@22050 " + say_str)
os.system("sox dk-theme-mono-22.wav otp.wav " + file_name + "_msg.wav")

with open(file_name + "_msg_say.txt", "w") as fout:
    fout.write(say_str)

with open(file_name + "_msg.txt", "w") as fout:
    fout.write(zx_str + "\n\n" + agent_id + " => " + zx_numbers)
