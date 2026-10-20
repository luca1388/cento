import { useFonts } from 'expo-font';
import {
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_700Bold } from '@expo-google-fonts/dm-sans';

export const CARD_FONT = {
  fraunces: 'CardFraunces',
  bricolage: 'CardBricolage',
  bricolageMedium: 'CardBricolageMedium',
  dmSans: 'CardDMSans',
  dmSansBold: 'CardDMSansBold',
} as const;

export function useCardFonts() {
  const [loaded, error] = useFonts({
    [CARD_FONT.fraunces]: Fraunces_700Bold,
    [CARD_FONT.bricolage]: BricolageGrotesque_800ExtraBold,
    [CARD_FONT.bricolageMedium]: BricolageGrotesque_500Medium,
    [CARD_FONT.dmSans]: DMSans_400Regular,
    [CARD_FONT.dmSansBold]: DMSans_700Bold,
  });
  return { ready: loaded || !!error, loaded };
}