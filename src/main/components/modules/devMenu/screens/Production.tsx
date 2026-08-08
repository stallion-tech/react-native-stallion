import React, { useCallback, useContext, useState } from 'react';
import { ScrollView, View } from 'react-native';

import DeviceCard from '../components/DeviceCard';
import ProdBundleCard from '../components/ProdBundleCard';
import SectionLabel from '../components/SectionLabel';
import StateCard from '../components/StateCard';

import {
  PROD_EMPTY_SUBTITLE,
  PROD_EMPTY_TITLE,
  SECTION_LABELS,
} from '../../../../constants/appConstants';
import { GlobalContext } from '../../../../state';
import { restart } from '../../../../utils/StallionNativeUtils';

import styles from '../styles';

const Production: React.FC = () => {
  const { configState, updateMetaState } = useContext(GlobalContext);
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );

  const newBundle = updateMetaState.newBundle;
  const activeBundle = updateMetaState.currentlyRunningBundle;
  // A downloaded bundle is what the design surfaces; the running bundle takes
  // its place only when nothing is pending.
  const shownBundle = newBundle || activeBundle;

  const handleToggleExpand = useCallback((bundleId: string) => {
    setExpandedNotes((previous) => ({
      ...previous,
      [bundleId]: !previous[bundleId],
    }));
  }, []);

  const handleRestart = useCallback(() => {
    requestAnimationFrame(() => restart());
  }, []);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.screenPadding}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <SectionLabel label={SECTION_LABELS.THIS_DEVICE} />
        <DeviceCard
          appVersion={configState?.appVersion}
          uid={configState?.uid}
        />
      </View>
      {shownBundle ? (
        <View style={styles.sectionLast}>
          <SectionLabel
            label={
              newBundle
                ? SECTION_LABELS.NEW_BUNDLE
                : SECTION_LABELS.ACTIVE_BUNDLE
            }
          />
          <ProdBundleCard
            meta={shownBundle}
            variant={newBundle ? 'pending' : 'active'}
            expanded={!!expandedNotes[shownBundle.id]}
            onToggleExpand={() => handleToggleExpand(shownBundle.id)}
            onRestart={handleRestart}
          />
        </View>
      ) : (
        <StateCard title={PROD_EMPTY_TITLE} subtitle={PROD_EMPTY_SUBTITLE} />
      )}
    </ScrollView>
  );
};

export default Production;
