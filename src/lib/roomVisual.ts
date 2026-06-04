import { Coffee, Lightbulb, MessageCircle, type LucideIcon } from 'lucide-react';

type RoomVisualSource = {
  slug: string;
};

export type RoomVisual = {
  Icon: LucideIcon;
  className: string;
};

export function getRoomVisual(room: RoomVisualSource): RoomVisual {
  if (room.slug === 'creative') {
    return {
      Icon: Lightbulb,
      className: 'from-theme-yellow/85 via-theme-cyan/30 to-theme-sky/35 text-theme-main-dark shadow-theme-yellow/20',
    };
  }

  if (room.slug === 'casual') {
    return {
      Icon: Coffee,
      className: 'from-amber-100 via-theme-yellow/35 to-theme-cyan/25 text-amber-700 shadow-amber-100/40',
    };
  }

  return {
    Icon: MessageCircle,
    className: 'from-theme-yellow/80 via-theme-sky/25 to-theme-cyan/30 text-theme-main-dark shadow-theme-sky/15',
  };
}
