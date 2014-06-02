CLANG               = clang
LD                  = link
SRC_DIR             = src
BIN_DIR             = bin
LIB_DIR             = lib

all: hwMonitor hwMonitor.dylib

helpers.o:
	$(CLANG) -c helpers.m

usbNotifications.o:
	$(CLANG) -c usbNotifications.c

displaysNotifications.o:
	$(CLANG) -c displaysNotifications.m

hwMonitor: usbNotifications.o displaysNotifications.o
	$(CLANG) -fobjc-arc -framework Foundation -framework IOKit -framework CoreGraphics -framework AppKit hwMonitor.m usbNotifications.o displaysNotifications.o -o $(BIN_DIR)/hwMonitor

hwMonitor.dylib: usbNotifications.o displaysNotifications.o
	$(CLANG) -dynamiclib -fobjc-arc -framework Foundation -framework IOKit -framework CoreGraphics -framework AppKit hwMonitor.m usbNotifications.o displaysNotifications.o -o $(LIB_DIR)/libHWMonitor.dylib

clean:
	rm -rf $(BIN_DIR)/*
	rm -rf $(LIB_DIR)/*
	rm ./*.o