import { Theme } from '../theme/tokens';
import { FamilyMember } from '../types/models';

// Cycle of {bg, text} pairs assigned round-robin by a member's color_index,
// mirroring the prototype's fixed moi/julie palette but generalized to N members.
export function personColor(member: FamilyMember | null, theme: Theme): { bg: string; text: string } {
  if (!member) return { bg: theme.neutral[600], text: theme.neutral[100] };
  const cycle: { bg: string; text: string }[] = [
    { bg: theme.accent[300], text: theme.accent[800] },
    { bg: theme.accent2[300], text: theme.accent2[800] },
    { bg: theme.accent[500], text: '#fff' },
    { bg: theme.accent2[500], text: '#fff' },
  ];
  return cycle[member.color_index % cycle.length];
}

export function personInitial(member: FamilyMember | null, allMembers: FamilyMember[]): string {
  if (!member) {
    return allMembers.map((m) => m.name.trim().charAt(0).toUpperCase()).join('').slice(0, 2) || '??';
  }
  return member.name.trim().charAt(0).toUpperCase() || '?';
}

export function personName(member: FamilyMember | null): string {
  return member ? member.name : 'Tout le monde';
}

// Cycle order used for "tap the avatar to reassign": each real member in turn, then everyone.
export function cyclePersonId(members: FamilyMember[], currentId: string | null): string | null {
  const order: (string | null)[] = [...members.map((m) => m.id), null];
  const idx = order.indexOf(currentId);
  return order[(idx + 1 + order.length) % order.length];
}
