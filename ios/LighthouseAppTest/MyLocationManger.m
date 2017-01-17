//
//  MyLocationManger.m
//  LighthouseAppTest
//
//  Created by Paul Bao on 12/1/17.
//  Copyright © 2017 Facebook. All rights reserved.
//
#import <UIKit/UIKit.h>
#import "MyLocationManger.h"

@implementation MyLocationManger
- (instancetype)init;
{
  CLLocationManager *locationManager = [[CLLocationManager alloc] init];
  return [self initWithLocationManager:locationManager];
}

- (instancetype)initWithLocationManager:(CLLocationManager *)locationManager;
{
  self = [super init];
  if (self) {
    _locationManager = locationManager;
    _locationManager.delegate = self;
  }
  return self;
}

- (void)startRanging;
{
  NSUUID *beaconUUID = [[NSUUID alloc] initWithUUIDString:@"74278BDA-B644-4520-8F0C-720EAF059935"];

  //    CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:beaconUUID identifier:identifier];
  CLBeaconRegion *beaconRegion = [[CLBeaconRegion alloc] initWithProximityUUID:beaconUUID major:17 minor:17 identifier:@"test"];

  beaconRegion.notifyEntryStateOnDisplay = YES;
  [self.locationManager startRangingBeaconsInRegion: beaconRegion];
}

- (void)requestPermission;
{

  if ([self.locationManager respondsToSelector:@selector(requestAlwaysAuthorization)]) {
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8) {
      [self.locationManager requestAlwaysAuthorization];
    }
    if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 9) {
      self.locationManager.allowsBackgroundLocationUpdates = YES;
    }
  }
}
#pragma CLLocationManagerDelegate
-(void) locationManager:(CLLocationManager *)manager didRangeBeacons:
(NSArray *)beacons inRegion:(CLBeaconRegion *)region
{
  if (beacons.count == 0) {
    return;
  }
//  NSMutableArray *beaconArray = [[NSMutableArray alloc] init];

  for (CLBeacon *beacon in beacons) {
//    [beaconArray addObject:@{
//                             @"uuid": [beacon.proximityUUID UUIDString],
//                             @"major": beacon.major,
//                             @"minor": beacon.minor,
//
//                             @"rssi": [NSNumber numberWithLong:beacon.rssi],
//                             @"proximity": [self stringForProximity: beacon.proximity],
//                             @"accuracy": [NSNumber numberWithDouble: beacon.accuracy]
//                             }];
    NSLog(@"Beacon: %@", beacon);
  }
//
//  NSDictionary *event = @{
//                          @"region": @{
//                              @"identifier": region.identifier,
//                              @"uuid": [region.proximityUUID UUIDString],
//                              },
//                          @"beacons": beaconArray
//                          };
//
//  [self.bridge.eventDispatcher sendDeviceEventWithName:@"didRangeBeacons" body:event];
}
@end
