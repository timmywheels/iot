// Required dependencies
const { SerialPort } = require('serialport');
const sharp = require('sharp'); 
const { format } = require('date-fns');

// Constants for camera settings
const IMAGE_HEIGHT = 240;
const IMAGE_WIDTH = 320;
const NUM_PIXELS = IMAGE_HEIGHT * IMAGE_WIDTH;

// Serial port configuration
const PORT_CONFIG = {
    // Uncomment the appropriate line for your OS
    // path: 'COM9',                    // Windows
    path: '/dev/tty.usbmodem2101',     // macOS
    // path: '/dev/ttyACM0',           // Linux
    baudRate: 9600
};

async function captureFrame() {
    try {
        console.log("\nIdentifying the microcontroller's serial port:");
        
        // Create serial port connection
        const port = new SerialPort(PORT_CONFIG);

        // Wait for port to open
        await new Promise((resolve, reject) => {
            port.on('open', resolve);
            port.on('error', reject);
        });

        console.log("Connected to incoming microcontroller...");

        // Wait for Arduino to be ready
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Clear input buffer
        port.flush();

        // Request picture by sending the 'a' key
        // to the microcontroller
        port.write('a');

        // Collect image data
        let imageBytes = Buffer.alloc(0);
        
        // Wait for data
        await new Promise(resolve => setTimeout(resolve, 5000));

        while (imageBytes.length < NUM_PIXELS) {
            const chunk = await new Promise((resolve) => {
                port.once('data', resolve);
            });
            imageBytes = Buffer.concat([imageBytes, chunk]);
        }

        // Create raw image buffer
        const rawImageData = Buffer.from(imageBytes);

        // Create grayscale image using Sharp
        const image = sharp(rawImageData, {
            raw: {
                width: IMAGE_WIDTH,
                height: IMAGE_HEIGHT,
                channels: 1
            }
        });

        // Save the image
        const timestamp = format(new Date(), 'yyyyMMdd-HHmmss');
        const filename = `captured_image_${timestamp}.png`;
        
        await image.png().toFile(filename);
        console.log(`Image saved as: ${filename}`);

        // Close the port
        port.close();
        console.log("Finished.");

    } catch (error) {
        console.error('\nError:', error);
        console.log("\nIs the incoming microcontroller connected and active?");
        console.log("Is the incoming microcontroller's IDE's Serial Monitor deactivated?");
        console.log("Is the incoming port name correct?");
        console.log("Exiting program...");
        process.exit(1);
    }
}

// Run the main process
captureFrame();
