#include <iostream>
#include <thread>
#include "serialib.h"

bool serial_ready = false;
unsigned short serial_time;
serialib serial_connection;
std::string serial_port;
std::thread serial_thread;
bool serial_modified = true;

/** Amplitude of motor rotation, multiplied to motor force before sending to glove */
double amplitude = 20.0;
/** thumb motor force applied (from -1 to 1) */
double thumbForce = 0;
/** index motor force applied (from -1 to 1) */
double indexForce = 0;
/** if thumb motor force is modified (to send data) */
bool thumbModified = false;
/** if index motor force is modified (to send data) */
bool indexModified = false;

double clamp(double val, double min, double max) {
    return (val < min)? min : ((val > max)? max : val);
}

void setIndexForce(double value) {
    indexForce = clamp(value, -1, 1);
    indexModified = true;
}

void setThumbForce(double value) {
    thumbForce = clamp(value, -1, 1);
    thumbModified = true;
}

void setAmplitude(double value) {
    amplitude = clamp(value, 0, 64);
}

unsigned char garbage;
void serial_startConnection()
{
    serial_ready = false;
    while (serial_connection.openDevice(serial_port.c_str(), 9600) != 1);
    serial_ready = true;
    while (serial_ready)
    {
        if (thumbModified)
        {
            thumbModified = false;
            unsigned char data = (unsigned char) clamp(62.0 + thumbForce * amplitude, 0.0, 127.0);
            serial_connection.writeBytes(&data, 1);
        }
        if (indexModified)
        {
            indexModified = false;
            unsigned char data = (unsigned char) clamp(192 + indexForce * amplitude, 128.0, 255.0);
            serial_connection.writeBytes(&data, 1);
        }
        
        serial_connection.readBytes(&garbage, 1, 5); // just to empty any reminding buffer
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
}

void serial_start(std::string p) {
    serial_port = p;
    serial_time = 0;
    serial_thread = std::thread(serial_startConnection);
}
void serial_stop() {
    serial_ready = false;
    serial_thread.join();
    serial_connection.closeDevice();
}