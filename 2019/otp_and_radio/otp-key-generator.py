#!/usr/bin/env python
import sys
import random
import string

if len(sys.argv) < 2:
    print("ERROR - Please specify the arguments (length, output file name) to generate the one time pad.")
    exit()
length = int(sys.argv[1])

otp_str = ""
for _ in range(length):
    otp_str += str(random.randint(0, 255)).zfill(3) + " "

with open(sys.argv[2], "w") as file:
    file.write("Agent code: " + str(random.randint(1, 99999)).zfill(5) + "\n\n" + otp_str)
