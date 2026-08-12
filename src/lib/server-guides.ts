import type { Region } from "@/types/ping";

/** Extended guide info per region — location, best for, and typical ping notes. */
export interface RegionGuide extends Region {
  location: string;
  bestFor: string;
}

export const REGION_GUIDES: RegionGuide[] = [
  {
    code: "NA",
    name: "North America",
    flag: "🇺🇸",
    endpoint: "",
    location: "Chicago, Illinois, USA",
    bestFor:
      "Players in the United States, Canada, and Mexico. The NA server is the primary choice for North American players and offers the lowest ping for anyone west of the Atlantic.",
  },
  {
    code: "EUW",
    name: "EU West",
    flag: "🇬🇧",
    endpoint: "",
    location: "Amsterdam, Netherlands",
    bestFor:
      "Western Europe — UK, France, Germany, Spain, Netherlands, Portugal, and Scandinavia. EUW is the most populated LoL server globally and the competitive hub for European esports.",
  },
  {
    code: "EUNE",
    name: "EU Nordic & East",
    flag: "🇪🇺",
    endpoint: "",
    location: "Frankfurt, Germany",
    bestFor:
      "Eastern and Northern Europe — Poland, Czech Republic, Greece, Hungary, Romania, and the Baltic states. Some Nordic players use EUNE for slightly better ping than EUW.",
  },
  {
    code: "KR",
    name: "Korea",
    flag: "🇰🇷",
    endpoint: "",
    location: "Seoul, South Korea",
    bestFor:
      "South Korea. The KR server is legendary for its low-latency infrastructure — Korean players routinely play at sub-10ms ping. Considered the most competitive solo queue in the world.",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    endpoint: "",
    location: "São Paulo, Brazil",
    bestFor:
      "Brazil and neighboring South American countries. Most other South American players prefer LAS due to routing, but test both to compare.",
  },
  {
    code: "LAS",
    name: "Latin America South",
    flag: "🌎",
    endpoint: "",
    location: "Santiago, Chile",
    bestFor:
      "Argentina, Chile, Peru, Uruguay, and Paraguay. LAS offers better routing for the southern cone of South America than the NA or BR servers.",
  },
  {
    code: "OCE",
    name: "Oceania",
    flag: "🇦🇺",
    endpoint: "",
    location: "Sydney, Australia",
    bestFor:
      "Australia, New Zealand, and Pacific islands. OCE migrated to AWS infrastructure in 2024, significantly improving routing from southeast Australia.",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    endpoint: "",
    location: "Tokyo, Japan",
    bestFor:
      "Japan. Japanese players get excellent ping to their local server, typically 5-20ms. Also used by some Korean and Taiwanese players during off-peak hours.",
  },
  {
    code: "SEA",
    name: "South East Asia",
    flag: "🌏",
    endpoint: "",
    location: "Singapore",
    bestFor:
      "Singapore, Malaysia, Thailand, Indonesia, Philippines, and Vietnam. SEA is the newest Riot-operated region and serves the fastest-growing LoL player base.",
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    endpoint: "",
    location: "Beijing, China",
    bestFor:
      "Mainland China. The CN server is operated by Tencent and is isolated from the global Riot infrastructure — pings from outside China will always be high or unreachable.",
  },
];
