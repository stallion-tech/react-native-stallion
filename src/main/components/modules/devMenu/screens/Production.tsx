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
  const hasBundles = !!(newBundle || activeBundle);

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
      {newBundle ? (
        <View style={activeBundle ? styles.section : styles.sectionLast}>
          <SectionLabel label={SECTION_LABELS.NEW_BUNDLE} />
          <ProdBundleCard
            meta={newBundle}
            variant="pending"
            expanded={!!expandedNotes[newBundle.id]}
            onToggleExpand={() => handleToggleExpand(newBundle.id)}
            onRestart={handleRestart}
          />
        </View>
      ) : null}
      {activeBundle ? (
        <View style={styles.sectionLast}>
          <SectionLabel label={SECTION_LABELS.ACTIVE_BUNDLE} />
          <ProdBundleCard
            meta={activeBundle}
            variant="active"
            expanded={!!expandedNotes[activeBundle.id]}
            onToggleExpand={() => handleToggleExpand(activeBundle.id)}
          />
        </View>
      ) : null}
      {!hasBundles ? (
        <StateCard title={PROD_EMPTY_TITLE} subtitle={PROD_EMPTY_SUBTITLE} />
      ) : null}
    </ScrollView>
  );
};

export default Production;
