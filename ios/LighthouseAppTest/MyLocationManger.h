//
//  MyLocationManger.h
//  LighthouseAppTest
//
//  Created by Paul Bao on 12/1/17.
//  Copyright © 2017 Facebook. All rights reserved.
//
#import <CoreLocation/CoreLocation.h>
#import <Foundation/Foundation.h>

@interface MyLocationManger : NSObject <CLLocationManagerDelegate>
@property (readonly) CLLocationManager *locationManager;
- (void)startRanging;
- (void)requestPermission;
@end
