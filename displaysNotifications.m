#import <Cocoa/Cocoa.h>
#import <IOKit/graphics/IOGraphicsLib.h>
#include "displaysNotifications.h"

static void defaultCallback(int status) {}

static void (*onRiftDisplayChanged)(int) = &defaultCallback;

static io_service_t IOServicePortFromCGDisplayID(displayID)
{
  io_iterator_t iter;
  io_service_t serv, servicePort = 0;

  CFMutableDictionaryRef matching = IOServiceMatching("IODisplayConnect");

  // releases matching for us
  kern_return_t err = IOServiceGetMatchingServices(kIOMasterPortDefault,
                           matching,
                           &iter);
  if (err)
  {
    return 0;
  }

  while ((serv = IOIteratorNext(iter)) != 0)
  {
    CFDictionaryRef info;
    CFIndex vendorID, productID;
    CFNumberRef vendorIDRef, productIDRef;
    Boolean success;

    info = IODisplayCreateInfoDictionary(serv,
                         kIODisplayOnlyPreferredName);

    vendorIDRef = CFDictionaryGetValue(info,
                       CFSTR(kDisplayVendorID));
    productIDRef = CFDictionaryGetValue(info,
                        CFSTR(kDisplayProductID));

    success = CFNumberGetValue(vendorIDRef, kCFNumberCFIndexType,
                               &vendorID);
    success &= CFNumberGetValue(productIDRef, kCFNumberCFIndexType,
                                &productID);

    if (!success)
    {
        CFRelease(info);
        continue;
    }

    NSNumber *nsnumber = (__bridge NSNumber*)vendorIDRef;
    NSInteger value = [nsnumber integerValue];

    //NSLog(@"%@",@(value));

    if (CGDisplayVendorNumber(displayID) != vendorID ||
        CGDisplayModelNumber(displayID) != productID)
    {
        CFRelease(info);
        continue;
    }

    // we're a match
    servicePort = serv;
    CFRelease(info);
    break;
  }

  IOObjectRelease(iter);
  return servicePort;
}

static const char* getDisplayName(CGDirectDisplayID displayID)
{
    char* name;
    CFDictionaryRef info, names;
    CFStringRef value;
    CFIndex size;

    io_service_t serv = IOServicePortFromCGDisplayID(displayID);
    if (!serv)
    {
        return strdup("Unknown");
    }

    info = IODisplayCreateInfoDictionary(serv,
                         kIODisplayOnlyPreferredName);

    IOObjectRelease(serv);

    names = CFDictionaryGetValue(info, CFSTR(kDisplayProductName));

    if (!names || !CFDictionaryGetValueIfPresent(names, CFSTR("en_US"),
                             (const void**) &value))
    {
        //_glfwInputError(GLFW_PLATFORM_ERROR, "Failed to retrieve display name");
        CFRelease(info);
        return strdup("Unknown");
    }

    size = CFStringGetMaximumSizeForEncoding(CFStringGetLength(value),
                         kCFStringEncodingUTF8);
    name = calloc(size + 1, sizeof(char));
    CFStringGetCString(value, name, size, kCFStringEncodingUTF8);

    CFRelease(info);

    return name;
}

void DisplayChanged(CGDirectDisplayID displayId, CGDisplayChangeSummaryFlags flags, void* userInfo)
{
  const char* displayName = getDisplayName(displayId);
  CGError err;
  CGDisplayConfigRef configRef;
    // if(display == someDisplayYouAreInterestedIn)
    // {
  NSLog(@"DISPLAY CHANGED");
  if(flags & kCGDisplaySetModeFlag)
  {
    NSLog(@"CONNECTED");
    printf("DISPLAY %s\n" , displayName);
    if (strcmp(displayName, "Rift DK") == 0 ||
        strcmp(displayName, "DELL U2410") == 0) {
      err = CGBeginDisplayConfiguration(&configRef);
      err = CGConfigureDisplayOrigin(configRef, displayId, 4000, 0);
      if(err){
        err = CGCancelDisplayConfiguration(configRef);
      }
      else{
        err = CGCompleteDisplayConfiguration(configRef,1);
      }
      onRiftDisplayChanged(true);
    }
  }
  if(flags & kCGDisplayRemoveFlag)
  {
    NSLog(@"REMOVED");
    onRiftDisplayChanged(false);
  }
  if(flags & kCGDisplayDisabledFlag)
  {
    NSLog(@"DISABLED");
  }
    // }
}

void stopMonitoringDisplays() {
  CGDisplayRemoveReconfigurationCallback(DisplayChanged, NULL);
}

void startMonitoringDisplays(void (*callback)(int)) {
  onRiftDisplayChanged = callback;
  CGError err = CGDisplayRegisterReconfigurationCallback(DisplayChanged, NULL);
  if(err == kCGErrorSuccess) {
    NSLog(@"Success registering display configuration callback");
  }
  NSApplicationLoad();  // establish a connection to the window server. In <Cocoa/Cocoa.h>
}