import { Text, type StyleProp, type TextStyle } from "react-native";

const GLYPHS = {
  add: 57669,
  add_shopping_cart: 59476,
  arrow_back_ios_new: 58090,
  arrow_forward: 58824,
  auto_stories: 58982,
  bookmark: 59494,
  bookmark_added: 58777,
  bookmark_border: 59495,
  calendar_today: 59701,
  cancel: 58825,
  check_circle: 59500,
  chevron_left: 58827,
  chevron_right: 58828,
  close: 58829,
  description: 59507,
  domain: 59374,
  done: 59510,
  expand_more: 58831,
  format_quote: 57924,
  home: 59530,
  inventory_2: 57761,
  local_shipping: 58712,
  location_on: 57544,
  lock: 59543,
  lock_reset: 60126,
  menu_book: 59929,
  nature_people: 58375,
  notifications: 59380,
  rate_review: 58720,
  receipt_long: 61294,
  remove: 57691,
  repeat: 57408,
  schedule: 59573,
  search: 59574,
  sell: 61531,
  share: 59405,
  shopping_bag: 61900,
  star: 59448,
  star_half: 59449,
  storefront: 59922,
  support_agent: 61666,
  translate: 59618,
  tune: 58409,
  verified: 61302,
  wallet: 63743,
} as const;

export type IconName = keyof typeof GLYPHS;

type Props = {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
  style?: StyleProp<TextStyle>;
};

export function Icon({ name, size = 24, color, filled = false, style }: Props) {
  return (
    <Text
      style={[
        {
          fontFamily: "MaterialSymbols_400Regular",
          fontSize: size,
          lineHeight: size,
          color,
          width: size,
          height: size,
          textAlign: "center",
          fontVariationSettings: filled
            ? "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24"
            : "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24",
        } as TextStyle,
        style,
      ]}>
      {String.fromCharCode(GLYPHS[name])}
    </Text>
  );
}

export function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating - full > 0;
  const icons: Array<"star" | "star_half" | "empty"> = [];
  for (let i = 0; i < full && icons.length < 5; i += 1) icons.push("star");
  if (half && icons.length < 5) icons.push("star_half");
  while (icons.length < 5) icons.push("empty");

  return (
    <>
      {icons.map((kind, index) => (
        <Icon
          key={`${kind}-${index}`}
          name={kind === "empty" ? "star" : kind}
          size={size}
          color={kind === "empty" ? "#E7DFD3" : "#C85A32"}
          filled={kind !== "empty"}
        />
      ))}
    </>
  );
}
