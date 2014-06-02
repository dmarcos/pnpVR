#import <Cocoa/Cocoa.h>
#include <IOKit/IOKitLib.h>
#include <IOKit/IOTypes.h>
#import <IOKit/graphics/IOGraphicsLib.h>

@interface NSScreen (DisplayInfo)

-(NSString*) displayName;
-(NSNumber*) displayID;

@end

@implementation NSScreen (DisplayInfo)

-(NSString*) displayName
{
  CGDirectDisplayID displayID = [[self displayID] intValue];

  NSString *screenName = nil;

  NSDictionary *deviceInfo = (NSDictionary *)CFBridgingRelease(IODisplayCreateInfoDictionary(CGDisplayIOServicePort(displayID), kIODisplayOnlyPreferredName));
  NSDictionary *localizedNames = [deviceInfo objectForKey:[NSString stringWithUTF8String:kDisplayProductName]];

  if ([localizedNames count] > 0) {
    screenName = [localizedNames objectForKey:[[localizedNames allKeys] objectAtIndex:0]];
  }

  return screenName;
}

-(NSNumber*) displayID
{
  return [[self deviceDescription] valueForKey:@"NSScreenNumber"];
}
@end

static void printKeys(const void* key, const void* value, void* context) {
  CFShow(key);
}

void rotateDisplay()
{
  // loop over all IOFramebuffer services
  CFMutableDictionaryRef matchingDict = IOServiceMatching("IOFramebuffer");

  mach_port_t masterPort;
  IOMasterPort(MACH_PORT_NULL, &masterPort);
  io_iterator_t serviceIterator;
  IOServiceGetMatchingServices(masterPort, matchingDict, &serviceIterator);

  io_service_t obj = IOIteratorNext(serviceIterator);
  int caca = 0;
  while (obj)
  {
    io_name_t devName;
    // Rotate screen
    if (caca == 0) {
      IOOptionBits options = (0x00000400 | (kIOScaleRotate90)  << 16);
      kern_return_t kr = IOServiceRequestProbe(obj, options);
      printf("ROTATE\n");
    }
    caca++;

    // Gets and prints device name
    IORegistryEntryGetName(obj, devName);
    printf("Device's name = %s\n", devName);

    // Put this services object into a dictionary object.
    CFMutableDictionaryRef serviceDictionary;
    IORegistryEntryCreateCFProperties(obj,
                                      &serviceDictionary,
                                      kCFAllocatorDefault,
                                      kNilOptions);

    // Print Dictionary keys
    CFDictionaryApplyFunction(serviceDictionary, printKeys, NULL);

    // Print dictionary Values
    // NSDictionary * powerDic = (__bridge NSDictionary *) serviceDictionary;
    // NSString * aValue = [powerDic objectForKey:@"IOFBMemorySize"];
    // NSLog(@"%@", aValue);
    // const void* port = CFDictionaryGetValue(serviceDictionary, "port-number");
    // printf("PORT = %i\n", (int) port);

    IOObjectRelease(obj);
    obj = IOIteratorNext(serviceIterator);
  }
}

void printScreens() {
  // Screens Info
  NSArray *screens = [NSScreen screens];
  for (NSScreen *screen in screens) {
    NSNumber* displayID = [screen displayID];
    NSLog([NSString stringWithFormat:@"%@", displayID]);
    NSLog([NSString stringWithFormat:@"%@", [screen displayName]]);
    //printf("NAME: %s\n" , getDisplayName((CGDirectDisplayID) [displayID intValue]));
  }
}