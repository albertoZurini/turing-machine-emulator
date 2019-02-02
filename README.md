# Turing machine emulator

This simple web app (no back-end needed) emulates a Turing machine.

# Instructions

A Turing machine reads the input and checks the readed value in the strip with the state it currently is. If the condition is true, then it will execute the instruction after the ">"

(S1, C1) > (S2, C2, M)

Which means

If I am in the state "S1" and the cell I read contains "C1" then go to the state "S2", write "C2" and move "M". M can be positive or negative, a positive M will make the reder move towards left, a negative towards right. 
If you want to execute something independently by the state or the value read on the cell you can use "*" instead of S1 or C1.

# Documentation

[https://zurini.tk/turing-machine-emulator/](https://zurini.tk/turing-machine-emulator/)
