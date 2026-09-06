// features/business-profile/BusinessProfile.tsx
// One component, three states, driven entirely by props. No screens, no tabs.
// Every displayed value comes from Business or its CredibilityBlock — no description,
// no member-since, no headline. The header band below is decorative chrome only:
// it has no backing field, so unlike every other section here it is never editable.

import { useState } from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { color, space, radius, layout, breakpoint } from '../../components/ui/tokens';
import { AvatarChip, initials } from '../../components/ui/AvatarChip';
import type { Business, BusinessProfileState } from '../../lib/types';

import { Divider } from './components/Divider';
import { OwnerBar } from './components/OwnerBar';
import { PreviewBar } from './components/PreviewBar';
import { NameReadRow } from './components/NameReadRow';
import { NameEditRow } from './components/NameEditRow';
import { FactsRow } from './components/FactsRow';
import { MessageColumn } from './components/MessageColumn';
import { CapabilitiesRead } from './components/CapabilitiesRead';
import { CapsAreasEdit } from './components/CapsAreasEdit';
import { ActivityStats } from './components/ActivityStats';
import { VerifiedPanel } from './components/VerifiedPanel';
import { BusinessDetailsBlock } from './components/BusinessDetailsBlock';
import { ContactBlock } from './components/ContactBlock';
import { OperateBlock } from './components/OperateBlock';
import { InteractionBlock } from './components/InteractionBlock';

/* ─── Props ─────────────────────────────────────────── */

interface VisitorProps {
  state: Extract<BusinessProfileState, 'VISITOR'>;
  business: Business;
  /** Whether the viewing business already has an award with this one — the only thing
   *  that unlocks messaging. Not a Business field: it describes a relationship between
   *  two businesses, not a fact about this one. */
  canMessage?: boolean;
  onMessage?: () => void;
}

interface OwnerProps {
  state: Extract<BusinessProfileState, 'OWNER'>;
  business: Business;
  onSave?: (next: Business) => void;
  onPreview?: () => void;
}

interface PreviewProps {
  state: Extract<BusinessProfileState, 'PREVIEW'>;
  business: Business;
  onExitPreview?: () => void;
}

export type BusinessProfileProps = VisitorProps | OwnerProps | PreviewProps;

/* ─── Main component ─────────────────────────────────── */

type EditKey = 'name' | 'capsAreas' | 'place' | 'contact' | null;

export default function BusinessProfile(props: BusinessProfileProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= breakpoint.desktop;

  const isOwner = props.state === 'OWNER';
  const canMessage = props.state === 'VISITOR' ? (props.canMessage ?? false) : false;
  const onMessage = props.state === 'VISITOR' ? props.onMessage : undefined;
  const onPreview = props.state === 'OWNER' ? props.onPreview : undefined;
  const onExitPreview = props.state === 'PREVIEW' ? props.onExitPreview : undefined;
  const onSave = props.state === 'OWNER' ? props.onSave : undefined;

  const [business, setBusiness] = useState<Business>(props.business);
  const [editing, setEditing] = useState<EditKey>(null);
  const [capsExpanded, setCapsExpanded] = useState(false);

  const [nameDraft, setNameDraft] = useState('');
  const [capsDraft, setCapsDraft] = useState<string[]>([]);
  const [areasDraft, setAreasDraft] = useState<string[]>([]);
  const [newCap, setNewCap] = useState('');
  const [newArea, setNewArea] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [provinceDraft, setProvinceDraft] = useState('');
  const [contactDraft, setContactDraft] = useState('');
  const [mobileDraft, setMobileDraft] = useState('');

  function commit(patch: Partial<Business>) {
    const next = { ...business, ...patch };
    setBusiness(next);
    setEditing(null);
    onSave?.(next);
  }

  const name = business.displayName ?? business.registeredName;
  const doLabel = isOwner ? 'What you do' : 'What they do';

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.page, isWide ? styles.pageWide : null]}>
        {isOwner && <OwnerBar onPreview={onPreview} />}
        {props.state === 'PREVIEW' && <PreviewBar onExit={onExitPreview} />}

        <View style={[styles.columns, isWide ? styles.columnsWide : null]}>
          <View style={[styles.mainCard, isWide ? styles.mainCardWide : null]}>
            <View style={styles.coverBand} />
            <View style={styles.headerBody}>
              <AvatarChip label={initials(name)} size={92} />

              <View style={styles.headerRow}>
                <View style={styles.nameSection}>
                  {editing === 'name' ? (
                    <NameEditRow
                      registeredName={business.registeredName}
                      draft={nameDraft}
                      onChange={setNameDraft}
                      onSave={() => commit({ displayName: nameDraft.trim() || business.displayName })}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <NameReadRow
                      business={business}
                      isOwner={isOwner}
                      onEdit={() => {
                        setNameDraft(name);
                        setEditing('name');
                      }}
                    />
                  )}
                  <FactsRow business={business} />
                </View>

                {!isOwner && <MessageColumn canMessage={canMessage} onMessage={onMessage} />}
              </View>

              <Divider />

              {editing === 'capsAreas' ? (
                <CapsAreasEdit
                  capsDraft={capsDraft}
                  areasDraft={areasDraft}
                  newCap={newCap}
                  newArea={newArea}
                  onChangeNewCap={setNewCap}
                  onChangeNewArea={setNewArea}
                  onAddCap={() => {
                    const v = newCap.trim();
                    if (!v) return;
                    setCapsDraft((prev) => [...prev, v]);
                    setNewCap('');
                  }}
                  onAddArea={() => {
                    const v = newArea.trim();
                    if (!v) return;
                    setAreasDraft((prev) => [...prev, v]);
                    setNewArea('');
                  }}
                  onRemoveCap={(i) => setCapsDraft((prev) => prev.filter((_, j) => j !== i))}
                  onRemoveArea={(i) => setAreasDraft((prev) => prev.filter((_, j) => j !== i))}
                  onSave={() => commit({ capabilities: capsDraft, serviceAreas: areasDraft })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <CapabilitiesRead
                  label={doLabel}
                  capabilities={business.capabilities}
                  expanded={capsExpanded}
                  onToggleExpand={() => setCapsExpanded((v) => !v)}
                  isOwner={isOwner}
                  onEdit={() => {
                    setCapsDraft([...business.capabilities]);
                    setAreasDraft([...business.serviceAreas]);
                    setNewCap('');
                    setNewArea('');
                    setEditing('capsAreas');
                  }}
                />
              )}

              <Divider />

              <ActivityStats credibility={business.credibility} isOwner={isOwner} />
            </View>
          </View>

          <View style={[styles.sidebar, isWide ? styles.sidebarWide : null]}>
            <VerifiedPanel credibility={business.credibility} isOwner={isOwner} />
            <Divider />
            <BusinessDetailsBlock
              business={business}
              isOwner={isOwner}
              editing={editing === 'place'}
              cityDraft={cityDraft}
              provinceDraft={provinceDraft}
              onEdit={() => {
                setCityDraft(business.city);
                setProvinceDraft(business.province);
                setEditing('place');
              }}
              onChangeCity={setCityDraft}
              onChangeProvince={setProvinceDraft}
              onSave={() =>
                commit({
                  city: cityDraft.trim() || business.city,
                  province: provinceDraft.trim() || business.province,
                })
              }
              onCancel={() => setEditing(null)}
            />

            {isOwner && (
              <>
                <Divider />
                <ContactBlock
                  business={business}
                  editing={editing === 'contact'}
                  contactDraft={contactDraft}
                  mobileDraft={mobileDraft}
                  onEdit={() => {
                    setContactDraft(business.contactPerson);
                    setMobileDraft(business.contactMobile);
                    setEditing('contact');
                  }}
                  onChangeContact={setContactDraft}
                  onChangeMobile={setMobileDraft}
                  onSave={() =>
                    commit({
                      contactPerson: contactDraft.trim() || business.contactPerson,
                      contactMobile: mobileDraft.trim() || business.contactMobile,
                    })
                  }
                  onCancel={() => setEditing(null)}
                />
              </>
            )}

            <Divider />
            <OperateBlock serviceAreas={business.serviceAreas} isOwner={isOwner} />
            <Divider />
            <InteractionBlock isOwner={isOwner} canMessage={canMessage} onMessage={onMessage} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ─── Styles ──────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.canvas },
  scrollContent: { flexGrow: 1, paddingBottom: space.section },
  page: { width: '100%', alignSelf: 'center', paddingHorizontal: layout.screenPadding, gap: space.lg },
  pageWide: { maxWidth: layout.maxWidthWide, paddingTop: space.xl },

  columns: { flexDirection: 'column', gap: space.lg },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start', gap: space.xl },

  mainCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.xl,
    backgroundColor: color.surface,
    overflow: 'hidden',
  },
  mainCardWide: { flex: 2.4, minWidth: 0 },

  coverBand: { height: 96, backgroundColor: color.primary },
  headerBody: { padding: space.xl, gap: space.lg, marginTop: -46 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', gap: space.md },
  nameSection: { flex: 1, minWidth: 240, gap: space.md },

  sidebar: { width: '100%', borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl, gap: space.lg },
  sidebarWide: { flex: 1, minWidth: layout.sideColumnMinWidth, maxWidth: 352 },
});
