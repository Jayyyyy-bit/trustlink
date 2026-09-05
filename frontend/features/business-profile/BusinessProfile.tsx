// features/business-profile/BusinessProfile.tsx
// One component, three states, driven entirely by props. No screens, no tabs.
// Every displayed value comes from Business or its CredibilityBlock — no description,
// no member-since, no headline. The header band below is decorative chrome only:
// it has no backing field, so unlike every other section here it is never editable.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, useWindowDimensions } from 'react-native';
import {
  color,
  font,
  fontSize,
  lineHeight,
  letterSpacing,
  space,
  radius,
  layout,
  breakpoint,
} from '../../components/ui/tokens';
import { AvatarChip, initials } from '../../components/ui/AvatarChip';
import type {
  Business,
  BusinessType,
  BusinessStatus,
  CredibilityBlock,
  TrustTier,
  ISODateTime,
  BusinessProfileState,
} from '../../lib/types';

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

/* ─── Formatting helpers ────────────────────────────── */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso: ISODateTime): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function tierLabel(tier: TrustTier | null): string {
  return tier === null ? 'Unrated' : `Tier ${tier}`;
}

function businessTypeLabel(type: BusinessType): string {
  switch (type) {
    case 'SOLE_PROP': return 'Sole proprietorship';
    case 'PARTNERSHIP': return 'Partnership';
    case 'CORPORATION': return 'Corporation';
    case 'COOPERATIVE': return 'Cooperative';
  }
}

function businessStatusLabel(status: BusinessStatus): string {
  switch (status) {
    case 'UNVERIFIED': return 'Unverified';
    case 'PENDING': return 'Pending verification';
    case 'VERIFIED': return 'Verified';
    case 'REJECTED': return 'Rejected';
    case 'EXPIRED': return 'Verification expired';
  }
}

function statusTone(status: BusinessStatus): 'primary' | 'neutral' | 'danger' {
  switch (status) {
    case 'VERIFIED': return 'primary';
    case 'REJECTED':
    case 'EXPIRED': return 'danger';
    default: return 'neutral';
  }
}

/* ─── Small building blocks ─────────────────────────── */

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function Divider() {
  return <View style={styles.divider} />;
}

type PillTone = 'primary' | 'neutral' | 'danger';

function Pill({ label, tone, mono = false }: { label: string; tone: PillTone; mono?: boolean }) {
  const bg = tone === 'primary' ? color.primaryFaint : tone === 'danger' ? color.dangerFaint : color.surfaceSunken;
  const borderColor = tone === 'primary' ? color.primaryBorder : tone === 'danger' ? color.dangerBorder : color.border;
  const textColor = tone === 'primary' ? color.primary : tone === 'danger' ? color.danger : color.inkMuted;
  return (
    <View style={[styles.pill, { backgroundColor: bg, borderColor }]}>
      <Text style={[mono ? styles.pillLabelMono : styles.pillLabel, { color: textColor }]}>{label}</Text>
    </View>
  );
}

type ActionButtonVariant = 'primary' | 'outline' | 'text' | 'danger';

function ActionButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  onPress?: () => void;
  variant?: ActionButtonVariant;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={[
        styles.actionButton,
        {
          backgroundColor: variant === 'primary' ? color.primary : variant === 'text' ? 'transparent' : color.surface,
          borderColor:
            variant === 'danger' ? color.dangerBorder : variant === 'text' ? 'transparent' : color.primaryBorder,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.actionButtonLabel,
          { color: variant === 'primary' ? color.onPrimary : variant === 'danger' ? color.danger : color.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function XGlyph() {
  return (
    <View style={styles.xGlyph}>
      <View style={[styles.xGlyphBar, { transform: [{ rotate: '45deg' }] }]} />
      <View style={[styles.xGlyphBar, { transform: [{ rotate: '-45deg' }] }]} />
    </View>
  );
}

function StaticChip({ label, outline = false }: { label: string; outline?: boolean }) {
  return (
    <View style={[styles.staticChip, outline ? styles.staticChipOutline : null]}>
      <Text style={styles.staticChipLabel}>{label}</Text>
    </View>
  );
}

function RemovableChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <View style={styles.removableChip}>
      <Text style={styles.staticChipLabel}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8} style={styles.removableChipButton}>
        <XGlyph />
      </Pressable>
    </View>
  );
}

function LabelValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.labelValueRow}>
      <Text style={styles.labelValueLabel}>{label}</Text>
      <Text style={styles.labelValueValue}>{value}</Text>
    </View>
  );
}

/* ─── Top state bars ─────────────────────────────────── */

function OwnerBar({ onPreview }: { onPreview?: () => void }) {
  return (
    <View style={styles.topBar}>
      <View style={{ minWidth: 0 }}>
        <Text style={styles.topBarTitle}>Your business profile</Text>
        <Text style={styles.topBarNote}>Verified records and Trustlink activity are fixed.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <ActionButton label="Preview public profile" variant="outline" onPress={onPreview} />
    </View>
  );
}

function PreviewBar({ onExit }: { onExit?: () => void }) {
  return (
    <View style={[styles.topBar, styles.topBarPreview]}>
      <Text style={styles.topBarPreviewTitle}>You&apos;re viewing your profile as others see it.</Text>
      <View style={{ flex: 1 }} />
      <ActionButton label="Back to editing" variant="primary" onPress={onExit} />
    </View>
  );
}

/* ─── Header: name, badges, facts, message ──────────── */

function NameReadRow({
  business,
  isOwner,
  onEdit,
}: {
  business: Business;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const name = business.displayName ?? business.registeredName;
  const c = business.credibility;
  return (
    <View style={{ gap: space.sm }}>
      <View style={styles.nameRow}>
        <Text style={styles.displayName}>{name}</Text>
        {isOwner && (
          <Pressable style={styles.editChip} onPress={onEdit}>
            <Text style={styles.editChipLabel}>Edit</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.badgeRow}>
        <Pill label={businessStatusLabel(c.status)} tone={statusTone(c.status)} />
        {c.tier !== null && <Pill label={tierLabel(c.tier)} tone="neutral" mono />}
      </View>
    </View>
  );
}

function NameEditRow({
  registeredName,
  draft,
  onChange,
  onSave,
  onCancel,
}: {
  registeredName: string;
  draft: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={{ maxWidth: 480, gap: space.sm }}>
      <FieldLabel>Display name</FieldLabel>
      <TextInput value={draft} onChangeText={onChange} style={styles.input} />
      <Text style={styles.mutedSmall}>
        Registered name stays <Text style={styles.mutedSmallStrong}>{registeredName}</Text>.
      </Text>
      <View style={styles.editActionsRow}>
        <ActionButton label="Save" variant="primary" onPress={onSave} />
        <ActionButton label="Cancel" variant="text" onPress={onCancel} />
      </View>
    </View>
  );
}

function FactsRow({ business }: { business: Business }) {
  return (
    <View style={styles.factsRow}>
      <Text style={styles.factText}>{businessTypeLabel(business.businessType)}</Text>
      <Text style={styles.factText}>{business.category}</Text>
      <Text style={styles.factText}>{business.city}, {business.province}</Text>
    </View>
  );
}

function MessageColumn({ canMessage, onMessage }: { canMessage: boolean; onMessage?: () => void }) {
  return (
    <View style={styles.messageColumn}>
      <ActionButton label="Message" variant={canMessage ? 'primary' : 'outline'} disabled={!canMessage} onPress={onMessage} />
      <Text style={styles.messageNote}>
        {canMessage ? 'Open — you have an award with them' : 'Opens after an award between you'}
      </Text>
    </View>
  );
}

/* ─── Capabilities: read + combined edit with service areas ─ */

function CapabilitiesRead({
  label,
  capabilities,
  expanded,
  onToggleExpand,
  isOwner,
  onEdit,
}: {
  label: string;
  capabilities: string[];
  expanded: boolean;
  onToggleExpand: () => void;
  isOwner: boolean;
  onEdit: () => void;
}) {
  const shown = expanded ? capabilities : capabilities.slice(0, 3);
  const hasMore = capabilities.length > 3;
  return (
    <View style={styles.block}>
      <View style={styles.blockHeaderRow}>
        <SectionLabel>{label}</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && (
          <Pressable onPress={onEdit}>
            <Text style={styles.linkText}>Edit capabilities and areas</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.chipsWrap}>
        {shown.map((c) => <StaticChip key={c} label={c} />)}
        {hasMore && (
          <Pressable onPress={onToggleExpand} style={styles.moreChip}>
            <Text style={styles.moreChipLabel}>{expanded ? 'Show less' : `+${capabilities.length - 3} more`}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function CapsAreasEdit({
  capsDraft,
  areasDraft,
  newCap,
  newArea,
  onChangeNewCap,
  onChangeNewArea,
  onAddCap,
  onAddArea,
  onRemoveCap,
  onRemoveArea,
  onSave,
  onCancel,
}: {
  capsDraft: string[];
  areasDraft: string[];
  newCap: string;
  newArea: string;
  onChangeNewCap: (v: string) => void;
  onChangeNewArea: (v: string) => void;
  onAddCap: () => void;
  onAddArea: () => void;
  onRemoveCap: (index: number) => void;
  onRemoveArea: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.block}>
      <Text style={styles.editHint}>
        Capabilities and service areas decide which requirements Trustlink matches and recommends to you.
      </Text>

      <FieldLabel>Capabilities</FieldLabel>
      <View style={styles.chipsWrap}>
        {capsDraft.map((c, i) => <RemovableChip key={`${c}-${i}`} label={c} onRemove={() => onRemoveCap(i)} />)}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={newCap}
          onChangeText={onChangeNewCap}
          placeholder="Add a capability"
          placeholderTextColor={color.inkFaint}
          style={[styles.input, styles.addInput]}
        />
        <ActionButton label="Add" variant="outline" onPress={onAddCap} />
      </View>

      <FieldLabel>Service areas</FieldLabel>
      <View style={styles.chipsWrap}>
        {areasDraft.map((a, i) => <RemovableChip key={`${a}-${i}`} label={a} onRemove={() => onRemoveArea(i)} />)}
      </View>
      <View style={styles.addRow}>
        <TextInput
          value={newArea}
          onChangeText={onChangeNewArea}
          placeholder="Add a city or province"
          placeholderTextColor={color.inkFaint}
          style={[styles.input, styles.addInput]}
        />
        <ActionButton label="Add" variant="outline" onPress={onAddArea} />
      </View>

      <View style={styles.editActionsRow}>
        <ActionButton label="Save changes" variant="primary" onPress={onSave} />
        <ActionButton label="Cancel" variant="text" onPress={onCancel} />
      </View>
    </View>
  );
}

/* ─── Trustlink activity ─────────────────────────────── */

function ActivityStats({ credibility, isOwner }: { credibility: CredibilityBlock; isOwner: boolean }) {
  const items = [
    { label: 'Requirements posted', value: credibility.requirementsPosted },
    { label: 'Requirements awarded', value: credibility.requirementsAwarded },
    { label: 'Quotations submitted', value: credibility.quotationsSubmitted },
    { label: 'Quotations awarded', value: credibility.quotationsAwarded },
  ];
  return (
    <View style={styles.block}>
      <View style={styles.blockHeaderRow}>
        <SectionLabel>Trustlink activity</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && <Text style={styles.mutedMicro}>Counted by Trustlink · not editable</Text>}
      </View>
      <View style={styles.statsGrid}>
        {items.map((it) => (
          <View key={it.label} style={styles.statTile}>
            <Text style={styles.statValue}>{it.value}</Text>
            <Text style={styles.statLabel}>{it.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── Sidebar blocks ─────────────────────────────────── */

function VerifiedPanel({ credibility, isOwner }: { credibility: CredibilityBlock; isOwner: boolean }) {
  return (
    <View style={styles.sideBlock}>
      <View style={styles.verifiedHeaderRow}>
        <Pill label={businessStatusLabel(credibility.status)} tone={statusTone(credibility.status)} />
        <Text style={styles.sideTitle}>Verified business</Text>
      </View>
      <View style={{ gap: space.xs, marginTop: space.md }}>
        <LabelValueRow label="Trust tier" value={tierLabel(credibility.tier)} />
        <LabelValueRow label="Verified" value={credibility.verifiedAt ? formatDate(credibility.verifiedAt) : '—'} />
        <LabelValueRow label="Next re-check" value={credibility.recheckDueAt ? formatDate(credibility.recheckDueAt) : '—'} />
      </View>
      <Text style={styles.sideBody}>
        {isOwner
          ? 'Trustlink checked these records against the issuing agencies. To correct any of them, submit a re-verification.'
          : 'Trustlink checks registration, tax, and permit records against the issuing agencies. It verifies documents, not performance.'}
      </Text>
    </View>
  );
}

function BusinessDetailsBlock({
  business,
  isOwner,
  editing,
  cityDraft,
  provinceDraft,
  onEdit,
  onChangeCity,
  onChangeProvince,
  onSave,
  onCancel,
}: {
  business: Business;
  isOwner: boolean;
  editing: boolean;
  cityDraft: string;
  provinceDraft: string;
  onEdit: () => void;
  onChangeCity: (v: string) => void;
  onChangeProvince: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.sideBlock}>
      <View style={styles.blockHeaderRow}>
        <SectionLabel>Business details</SectionLabel>
        <View style={{ flex: 1 }} />
        {isOwner && !editing && (
          <Pressable onPress={onEdit}>
            <Text style={styles.linkText}>Edit</Text>
          </Pressable>
        )}
      </View>
      {!editing ? (
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <LabelValueRow label="Registered name" value={business.registeredName} />
          <LabelValueRow label="Business type" value={businessTypeLabel(business.businessType)} />
          <LabelValueRow label="Industry" value={business.category} />
          <LabelValueRow label="Registered location" value={`${business.city}, ${business.province}`} />
        </View>
      ) : (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <FieldLabel>City</FieldLabel>
          <TextInput value={cityDraft} onChangeText={onChangeCity} style={styles.input} />
          <FieldLabel>Province</FieldLabel>
          <TextInput value={provinceDraft} onChangeText={onChangeProvince} style={styles.input} />
          <Text style={styles.mutedSmall}>
            Registered name, business type, and industry come from your verified record.
          </Text>
          <View style={styles.editActionsRow}>
            <ActionButton label="Save" variant="primary" onPress={onSave} />
            <ActionButton label="Cancel" variant="text" onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}

function ContactBlock({
  business,
  editing,
  contactDraft,
  mobileDraft,
  onEdit,
  onChangeContact,
  onChangeMobile,
  onSave,
  onCancel,
}: {
  business: Business;
  editing: boolean;
  contactDraft: string;
  mobileDraft: string;
  onEdit: () => void;
  onChangeContact: (v: string) => void;
  onChangeMobile: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.sideBlock}>
      <View style={styles.blockHeaderRow}>
        <SectionLabel>Contact person</SectionLabel>
        <View style={{ flex: 1 }} />
        {!editing && (
          <Pressable onPress={onEdit}>
            <Text style={styles.linkText}>Edit</Text>
          </Pressable>
        )}
      </View>
      {!editing ? (
        <View style={{ marginTop: space.md }}>
          <Text style={styles.bodyTextSemi}>{business.contactPerson}</Text>
          <Text style={styles.mono}>{business.contactMobile}</Text>
          <Text style={styles.mutedSmall}>Shown to another business only after an award between you.</Text>
        </View>
      ) : (
        <View style={{ marginTop: space.md, gap: space.sm }}>
          <FieldLabel>Contact person</FieldLabel>
          <TextInput value={contactDraft} onChangeText={onChangeContact} style={styles.input} />
          <FieldLabel>Mobile number</FieldLabel>
          <TextInput value={mobileDraft} onChangeText={onChangeMobile} style={[styles.input, styles.mono]} />
          <View style={styles.editActionsRow}>
            <ActionButton label="Save" variant="primary" onPress={onSave} />
            <ActionButton label="Cancel" variant="text" onPress={onCancel} />
          </View>
        </View>
      )}
    </View>
  );
}

function OperateBlock({ serviceAreas, isOwner }: { serviceAreas: string[]; isOwner: boolean }) {
  return (
    <View style={styles.sideBlock}>
      <SectionLabel>{isOwner ? 'Where you operate' : 'Where they operate'}</SectionLabel>
      <View style={[styles.chipsWrap, { marginTop: space.md }]}>
        {serviceAreas.map((a) => <StaticChip key={a} label={a} outline />)}
      </View>
      <Text style={styles.sideBody}>
        {isOwner
          ? 'Where you accept delivery and site work. Requirements here are recommended to you.'
          : 'Where this business accepts delivery and site work.'}
      </Text>
    </View>
  );
}

function InteractionBlock({
  isOwner,
  canMessage,
  onMessage,
}: {
  isOwner: boolean;
  canMessage: boolean;
  onMessage?: () => void;
}) {
  return (
    <View style={styles.sideBlock}>
      <SectionLabel>Interaction</SectionLabel>
      <Text style={styles.sideBody}>
        {isOwner
          ? 'Another business can message you only after an award exists between you. Until then, everything happens through the requirement.'
          : canMessage
            ? 'You have an award with this business, so direct messages are open.'
            : 'Direct messaging opens once an award exists between the two of you. Until then, everything happens through the requirement.'}
      </Text>
      {!isOwner && (
        <View style={{ marginTop: space.md }}>
          <ActionButton
            label="Message business"
            variant={canMessage ? 'primary' : 'outline'}
            disabled={!canMessage}
            onPress={onMessage}
          />
        </View>
      )}
    </View>
  );
}

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

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: space.md,
    borderWidth: 1,
    borderColor: color.borderFaint,
    borderRadius: radius.lg,
    backgroundColor: color.surfaceSunken,
    padding: space.lg,
  },
  topBarPreview: { backgroundColor: color.primaryFaint, borderColor: color.primaryBorder },
  topBarTitle: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },
  topBarNote: { marginTop: 2, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  topBarPreviewTitle: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.primary },

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
  nameRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.md },
  displayName: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  editChip: {
    borderWidth: 1,
    borderColor: color.border,
    borderRadius: radius.pill,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  editChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },

  badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.sm },
  pill: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  pillLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
  pillLabelMono: { fontFamily: font.monoMedium, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },

  factsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  factText: { fontFamily: font.body, fontSize: fontSize.base, color: color.inkMuted },

  messageColumn: { alignItems: 'flex-end', gap: space.xs, minWidth: 160 },
  messageNote: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint, textAlign: 'right', maxWidth: 180 },

  divider: { height: 1, backgroundColor: color.borderFaint },

  block: { gap: space.md },
  blockHeaderRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: space.md },
  sectionLabel: { fontFamily: font.mono, fontSize: fontSize.micro, letterSpacing: letterSpacing.label, textTransform: 'uppercase', color: color.inkMuted },
  linkText: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.primary },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  staticChip: { borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs, backgroundColor: color.surfaceSunken },
  staticChipOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: color.border },
  staticChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.ink },
  moreChip: { borderWidth: 1, borderStyle: 'dashed', borderColor: color.borderStrong, borderRadius: radius.pill, paddingHorizontal: space.md, paddingVertical: space.xs },
  moreChipLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm, color: color.inkMuted },

  removableChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    borderRadius: radius.pill,
    paddingLeft: space.md,
    paddingRight: space.xs,
    paddingVertical: space.xs,
    backgroundColor: color.surfaceSunken,
  },
  removableChipButton: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill, backgroundColor: color.border },
  xGlyph: { width: 8, height: 8 },
  xGlyphBar: { position: 'absolute', width: 8, height: 1.4, top: 3.3, backgroundColor: color.inkMuted },

  editHint: { fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted, backgroundColor: color.primaryFaint, borderRadius: radius.md, padding: space.md },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
  addInput: { flex: 1, minWidth: 160, marginTop: 0 },
  editActionsRow: { flexDirection: 'row', alignItems: 'center', gap: space.lg },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  statTile: { flexGrow: 1, minWidth: 130, backgroundColor: color.surfaceSunken, borderRadius: radius.lg, padding: space.md },
  statValue: { fontFamily: font.display, fontSize: fontSize.xl, color: color.ink },
  statLabel: { marginTop: space.xs, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  mutedMicro: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkFaint },

  sidebar: { width: '100%', borderWidth: 1, borderColor: color.border, borderRadius: radius.xl, backgroundColor: color.surface, padding: space.xl, gap: space.lg },
  sidebarWide: { flex: 1, minWidth: layout.sideColumnMinWidth, maxWidth: 352 },

  sideBlock: { gap: space.sm },
  sideTitle: { fontFamily: font.display, fontSize: fontSize.md, color: color.ink },
  sideBody: { marginTop: space.sm, fontFamily: font.body, fontSize: fontSize.sm, lineHeight: lineHeight.sm, color: color.inkMuted },
  verifiedHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },

  labelValueRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md },
  labelValueLabel: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  labelValueValue: { fontFamily: font.bodyMedium, fontSize: fontSize.base, color: color.ink, textAlign: 'right' },

  fieldLabel: { fontFamily: font.bodySemi, fontSize: fontSize.sm, color: color.ink },
  input: { marginTop: space.xs, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.border, borderRadius: radius.lg, paddingHorizontal: space.md, paddingVertical: space.sm, fontFamily: font.body, fontSize: fontSize.base, color: color.ink },
  mono: { fontFamily: font.monoMedium, fontSize: fontSize.base, color: color.inkMuted },
  mutedSmall: { fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted },
  mutedSmallStrong: { fontFamily: font.bodyMedium, color: color.ink },
  bodyTextSemi: { fontFamily: font.bodySemi, fontSize: fontSize.base, color: color.ink },

  actionButton: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: space.lg, paddingVertical: space.sm, alignItems: 'center', justifyContent: 'center' },
  actionButtonLabel: { fontFamily: font.bodyMedium, fontSize: fontSize.sm },
});
