const DEFAULT_PROFILE_TOPIC = '共通の興味から、ゆっくり話してみたいです。';

const LEGACY_PROFILE_TOPIC_MAP: Record<string, string> = {
  '自然体で長く付き合える関係': DEFAULT_PROFILE_TOPIC,
  '価値観が合えば前向きに進めたい': '興味や活動の方向性が合えば、少しずつ話してみたいです。',
  '安心感があれば会ってみたい': 'まずは安心できる距離感で、気軽に話してみたいです。',
  '自然体で応援し合える関係': '好きなことや活動の話をきっかけに、自然に会話できたら嬉しいです。',
};

const LEGACY_PROFILE_TOPIC_PATTERNS: Array<[RegExp, string]> = [
  [/長く付き合える/, DEFAULT_PROFILE_TOPIC],
  [/会ってみたい/, 'まずは安心できる距離感で、気軽に話してみたいです。'],
  [/関係/, '好きなことや活動の話をきっかけに、自然に会話できたら嬉しいです。'],
];

export function toProfileTopic(value: string | null | undefined): string {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return DEFAULT_PROFILE_TOPIC;

  const mappedTopic = LEGACY_PROFILE_TOPIC_MAP[trimmedValue];
  if (mappedTopic) return mappedTopic;

  const patternMatch = LEGACY_PROFILE_TOPIC_PATTERNS.find(([pattern]) => pattern.test(trimmedValue));
  return patternMatch?.[1] ?? trimmedValue;
}
