# react-native-stallion
Stallion is the ultimate testing framework for React Native apps !
It is a simplified build sharing and testing system that skips all the tedious hastle of generating a new new APK or IPA build everytime you make react native code changes.
With stallion a developer can directly publish a react native build to Stallion servers and any tester can simply download updates through the Stallion app SDK without re installing the app.

## How Stallion works
Stallion is just a small modification to your existing workflow.

#### Standard RN app workflow
![Developer](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/3a07fb9d-d098-4ed3-9956-c4e6ccfceaab)

#### With Stallion workflow
![Stallion SDK](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/59f888fe-bfb4-4e41-8d20-1baa9b783154)


## Installation

#### Step 1 - Install Stallion react native SDK
```sh
npm install react-native-stallion
```

#### Step 2 - Implement Stallion config file
Create a file in the root folder of your react native app named: `stallion.config.json`.
Add the following contents -
```
{
    "isEnabled": true
}
```
:warning: *Remember to do a fresh gradle sync / pod install everytime you modify `stallion.config.json` file*
#### Step 3 - Add Stallion api key & secret in Android and iOS projects
* Get your api key & secret from Stallion dashboard [TODO, add dashboard steps here]
* iOS integration - add api key & secret inside `ios/Info.plist` file
![Screenshot 2023-06-10 at 5 32 49 PM](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/e7cb2802-36e1-4c7e-8401-2890ee81ee68)
* Android integration - add api key & secret inside `android/app/src/main/res/strings.xml` file
![Screenshot 2023-06-10 at 5 38 15 PM](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/247b6b3c-6961-4c5c-bd35-a5ebdfb9c996)

#### Step 4 - Add Stallion bundle support in Android and iOS projects
* Android - Inside `MainApplication.java`, override and implement `getJSBundleFile` method like -
`import com.stallion.Stallion;` and use
`Stallion.getJSBundleFile(applicationContext, <default-js-bundle-file-path>)` method. 2nd argument is the default bundle path currently used by your app. If this method is not implemented in your app, just add default path like shown in the screenshot below.
![Screenshot 2023-06-10 at 6 25 19 PM](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/a4677548-996d-43b7-a102-1b4885df2e5b)
* iOS - Inside `AppDelegate.mm` file in `iOS folder` import StallionModule - `#import <react-native-stallion/StallionModule.h>` and modify `sourceURLForBridge` method like - `[StallionModule getBundleURL:[[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"]];`. Here again 1st argument is the default bundle URL of your app without Stallion SDK. For standard RN apps, this path = `[[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"]]`.
![Screenshot 2023-06-10 at 6 35 28 PM](https://github.com/redhorse-tech/react-native-stallion/assets/136098295/49289f60-aa3b-41d6-bed0-726588763785)

## Usage
#### Step 1 - Wrap your root component with Stallion HOC
Import withStallion HOC
```
import { withStallion } from 'react-native-stallion';
```

Wrap the root component with HOC
```
export default withStallion(App);
```

#### Step 2 - Add a custom entry point to Stallion Modal UI
Choose any custom entry point in your app.
Import `useStallionModal` hook and `stallion.config.json` json file
```
import { useStallionModal } from 'react-native-stallion';
import StallionConfig from <path-to-stallion-config-file>;
```
Trigger `setShowModal` from your custom component.
Render the entry point behing enabled flag
```
const MyCustomPageComponent: React.FC = () => {
  const { setShowModal } = useStallionModal();
  return (
      <>
        // Other page level components
        {
          StallionConfig.isEnabled ?
            <Button title="Open Stallion" onPress={() => setShowModal(true)} />
            : null
        }
      </>
  );
};
```
#### Finally
Stallion SDK modal should open by using the custom entry point from above step.
All your builds should be available in a list to download and install.
[TODO, add screenshot of Stallion Modal here]

## Sending updates
* Publish update using Stallion CLI [TODO: Add cli steps here]
* Download the generated build from the Stallion SDK UI

## Production deployment
Before deploying you app on production to App Store or play store for your customers, you can disable Stallion SDK.
This means that no stallion features will be active. Your app will work just as it would without the Stallion SDK.
To disable Stallion SDK modify `stallion.config.json` file to make `isEnabled` flat to `false`.
```
{
    "isEnabled": false
}
```
:warning: *Remember to do a fresh gradle sync / pod install everytime you modify `stallion.config.json` file*

