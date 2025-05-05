//
//  StallionCommonConstants.h
//  react-native-stallion
//
//  Created by Thor963  on 27/09/24.
//

#import <Foundation/Foundation.h>

@interface StallionObjConstants : NSObject

@property (class, nonatomic, readonly) NSString *prod_directory;
@property (class, nonatomic, readonly) NSString *stage_directory;
@property (class, nonatomic, readonly) NSString *temp_folder_slot;
@property (class, nonatomic, readonly) NSString *new_folder_slot;
@property (class, nonatomic, readonly) NSString *stable_folder_slot;
@property (class, nonatomic, readonly) NSString *default_folder_slot;

@property (class, nonatomic, readonly) NSString *current_prod_slot_key;
@property (class, nonatomic, readonly) NSString *current_stage_slot_key;
@property (class, nonatomic, readonly) NSString *stallion_project_id_identifier;
@property (class, nonatomic, readonly) NSString *stallion_app_token_identifier;
@property (class, nonatomic, readonly) NSString *app_version_identifier;
@property (class, nonatomic, readonly) NSString *stallion_app_token_key;
@property (class, nonatomic, readonly) NSString *stallion_sdk_token_key;
@property (class, nonatomic, readonly) NSString *switch_state_identifier;
@property (class, nonatomic, readonly) NSString *switch_state_prod;
@property (class, nonatomic, readonly) NSString *switch_state_stage;

@property (class, nonatomic, readonly) NSString *rolled_back_prod_event;
@property (class, nonatomic, readonly) NSString *installed_prod_event;
@property (class, nonatomic, readonly) NSString *exception_prod_event;
@property (class, nonatomic, readonly) NSString *exception_stage_event;
@property (class, nonatomic, readonly) NSString *stabilized_prod_event;

@property (class, nonatomic, readonly) NSString *installed_stage_event;

@property (class, nonatomic, readonly) NSString *release_hash_key;

@property (class, nonatomic, readonly) NSString *app_version_cache_key;

@property (class, nonatomic, readonly) NSString *build_folder_name;
@property (class, nonatomic, readonly) NSString *bundle_file_name;
@property (class, nonatomic, readonly) NSString *stallion_native_event;
@property (class, nonatomic, readonly) NSString *last_rolled_back_release_hash_key;
@property (class, nonatomic, readonly) NSString *auto_rolled_back_prod_event;
@property (class, nonatomic, readonly) NSString *is_auto_rollback_key;

@end
