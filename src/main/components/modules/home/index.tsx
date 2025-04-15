import React, { useContext } from 'react';
import { ScrollView, View } from 'react-native';
import BundleCard from './components/BundleCard';
import styles from './styles';
import { GlobalContext } from '../../../state';
import ConfigView from '../listing/components/ConfigView';
import Footer from '../../common/Footer';

interface IHome {
  isDownloading?: boolean;
  downloadProgress?: number;
}

const Home: React.FC<IHome> = ({
  isDownloading = false,
  downloadProgress = 0,
}) => {
  const {
    metaState,
    updateMetaState,
    configState,
    actions: { setShowBucketListing },
  } = useContext(GlobalContext);

  console.log('metaState', metaState);
  return (
    <>
      <ScrollView style={styles.container}>
        <ConfigView config={configState} />
        {updateMetaState?.newBundle && (
          <BundleCard
            title="Latest Release Bundle"
            version={updateMetaState.newBundle.version}
            description={updateMetaState.newBundle.releaseNote}
            updatedAt={updateMetaState.newBundle.updatedAt}
            primaryButtonText="Apply Update"
            onPrimaryButtonPress={() => {}}
            size={updateMetaState.newBundle.size}
          />
        )}
        <BundleCard
          title="Testing Bundle"
          version={'2.3.0'}
          description="Minor bug fixes and performance improvements"
          updatedAt="2025-04-10"
          primaryButtonText="Restart"
          onPrimaryButtonPress={() => {
            console.log('onPrimaryButtonPress');
            setShowBucketListing(true);
          }}
          isLoading={isDownloading}
          progress={downloadProgress}
          showEmptyState={false}
        />
        <BundleCard
          title="Cuurrent Bundle (Default)"
          version={configState?.appVersion}
          primaryButtonText="Select"
          onPrimaryButtonPress={() => { }}
        />
        <View style={{height: 100}} />
      </ScrollView>
      <Footer
        footerButtonText="Test New Bundle"
        onFooterButtonPress={() => {
          setShowBucketListing(true);
        }}
      />
    </>
  );
};

export default Home;
