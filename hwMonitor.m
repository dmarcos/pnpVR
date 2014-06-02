 #import <Cocoa/Cocoa.h>
#include "usbNotifications.h"
#include "displaysNotifications.h"

static void defaultCallback(int status) {}

void signal_handler(int signum)
{
  printf("\ngot signal, signnum=%i  stopping current RunLoop\n", signum);
  stopMonitoringDisplays();
  CFRunLoopStop(CFRunLoopGetCurrent());
}

void init_signal_handler()
{
  signal(SIGINT,  signal_handler);
  signal(SIGQUIT, signal_handler);
  signal(SIGTERM, signal_handler);
}

int startMonitoring(void (*onRiftDisplayChanged)(int), void (*onRiftTrackerChanged)(int))
{
  init_signal_handler();
  startMonitoringUSBDevices(onRiftTrackerChanged);
  startMonitoringDisplays(onRiftDisplayChanged);
  CFRunLoopRun();  // run the event loop
  return 0;
}

int main(int argc, char *argv[])
{
  init_signal_handler();
  startMonitoringUSBDevices(&defaultCallback);
  startMonitoringDisplays(&defaultCallback);
  CFRunLoopRun();  // run the event loop
  return 0;
}