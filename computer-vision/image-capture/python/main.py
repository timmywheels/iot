
# https://www.geeksforgeeks.org/how-to-display-multiple-images-in-one-window-using-opencv-python
# https://answers.opencv.org/question/175912/how-to-display-multiple-images-in-one-window
# https://www.hackster.io/polyhedra64/how-to-link-arduino-serial-to-python-62b9a5

# Maybe interesting:
# https://stackoverflow.com/questions/50881227/display-images-in-a-grid

# Libraries imported via pip install -r requirements.txt
import time         # Python functions regarding clock time

# https://pypi.org/project/opencv-python
import cv2          # OpenCV for processing and displaying images

# https://numpy.org
import numpy as np  # NumPy

# https://pypi.org/project/pyserial
import serial       # PySerial

# Refers to the microcontroller's serial port
incomingArduinoSerialPort = None  # serial port connecting to the Arduino
# incomingSerialPortName = 'COM9'   # Windows version of the serial port's name
incomingSerialPortName = '/dev/tty.usbmodem2101' # macOS serial port
#incomingSerialPortName = '/dev/ttyACM0' # Linux version of the serial port's name
incomingSerialPortBaudRate = 9600 # baud rate of the serial port

# Refers to the microcontroller's camera
IMAGE_HEIGHT = 240 # number of image rows
IMAGE_WIDTH = 320  # number of image columns
NUM_PIXELS = IMAGE_HEIGHT * IMAGE_WIDTH # total number of image pixels

# Start the main process
if __name__ == '__main__':

  # Begin by connecting to the Arduino's serial port.
  print("\nIdentifying the microcontroller's serial port:")

  # Identify port to incoming microcontroller
  try:
    incomingArduinoSerialPort = serial.Serial(incomingSerialPortName, incomingSerialPortBaudRate)
  except Exception as e: # catch all exceptions, make suggestions
    print(f'\nCaught {type(e)}:\n', e) # https://docs.python.org/3/tutorial/errors.html
    print("\nIs the incoming microcontroller connected and active?")
    print("Is the incoming microcontroller's IDE's Serial Monitor deactivated?")
    print("Is the incoming port name correct?")
    print("Exiting program.\n")
    exit(1)
  time.sleep(5) # have to wait for microcontroller to be ready
  print("Connected to incoming microcontroller.\n")

  # Clear the input buffer
  while incomingArduinoSerialPort.in_waiting > 0:
    message = incomingArduinoSerialPort.read()

  # Send request for picture
  incomingArduinoSerialPort.write(b'a')

  # Receive the picture
  time.sleep(5) # wait for microcontroller to act
  imageBytes = b'' # have to accumulate due to input buffer size limits
  while len(imageBytes) < NUM_PIXELS:
    imageBytes += incomingArduinoSerialPort.read(incomingArduinoSerialPort.in_waiting)

  # Create grayscale image matrix with random pixel colors
  image = \
    np.random.randint(0, 255,
                      size=(IMAGE_HEIGHT, IMAGE_WIDTH, 1), dtype=np.uint8)

  # Populate image matrix with received data frame
  i = -1
  for r in range(IMAGE_HEIGHT):
    for c in range(IMAGE_WIDTH):
      i += 1
      image[r, c, 0] = imageBytes[i]

  # Save the image
  timestamp = time.strftime("%Y%m%d-%H%M%S")
  filename = f'portenta_img_{timestamp}.png'
  cv2.imwrite(filename, image)
  print(f"Image saved as: {filename}")

  # Display the image
  display = np.array(image, dtype = np.uint8) # create displayable version of image
  cv2.imshow('Servo.ai', display) # display the image
  cv2.waitKey(0) # press any key to continue
  cv2.destroyWindow('Servo.ai') # delete the image

  # Finished, Exit
  print("Finished.")


