import asyncio
import websockets
import sys
import time
import RPi.GPIO as GPIO
from pynput import keyboard
GPIO.cleanup()

ip = "10.72.5.228"

Forward=26
Backward=20
Left=16
Right=19
PWMfreq = 50

GPIO.setmode(GPIO.BCM)
GPIO.setup(Forward, GPIO.OUT)
GPIO.setup(Backward, GPIO.OUT)
GPIO.setup(Left, GPIO.OUT)
GPIO.setup(Right, GPIO.OUT)


pwmLeft = GPIO.PWM(Left, PWMfreq)
pwmRight = GPIO.PWM(Right, PWMfreq)
pwmLeft.start(0)
pwmRight.start(0)
pwmFw = GPIO.PWM(Forward, PWMfreq)
pwmBw = GPIO.PWM(Backward, PWMfreq)
pwmFw.start(0)
pwmBw.start(0)


lastLeft = 0
lastRight = 0

def forward():
    pwmFw.ChangeDutyCycle(50)
    print("Moving Forward")

def backward():
    pwmBw.ChangeDutyCycle(50)
    print("Moving Backward")

def stop():
    pwmFw.ChangeDutyCycle(0)
    pwmBw.ChangeDutyCycle(0)
    print("Stopped")

def left(val):
    global lastLeft
    global lastRight
    print(str(lastLeft) + " : " + str(val))
    lastRight = 0
    pwmLeft.ChangeDutyCycle(0)
    if lastLeft > val:
        pwmRight.ChangeDutyCycle(lastLeft-val)
        time.sleep(0.1)
    pwmRight.ChangeDutyCycle(0)
    pwmLeft.ChangeDutyCycle(val)
    lastLeft = val
    #GPIO.output(Left, GPIO.HIGH)
    print("Steering Left with: " + str(val))

def right(val):
    global lastRight
    global lastLeft
    print(str(lastRight) + " : " + str(val))
    lastLeft = 0
    pwmRight.ChangeDutyCycle(0)
    if lastRight > val:
        print("test")
        pwmLeft.ChangeDutyCycle(lastRight-val)
        time.sleep(0.1)
    pwmLeft.ChangeDutyCycle(0)
    pwmRight.ChangeDutyCycle(val)
    lastRight = val
    #GPIO.output(Right, GPIO.HIGH)
    print("Steering Right with: " + str(val))


# create handler for each connection
async def handler(websocket, path):
    data = await websocket.recv()
    reply = f"Data recieved as:  {data}!"
    await websocket.send(reply)
    k = data

    driving = False
    steering = False
    try:
        data = int(data)
        if 10 < data:
            right(data)
        elif data < -10:
            left(abs(data)) 
        else:
            pwmLeft.ChangeDutyCycle(0)
            pwmRight.ChangeDutyCycle(0)
    except:
        if (k == 'fw' or k == 'bw'):
            if k == 'fw':
                forward()
            elif k == 'bw':
                backward()
        elif (k == 'stop'):
            stop()

start_server = websockets.serve(handler, ip, 8080)
 
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()




