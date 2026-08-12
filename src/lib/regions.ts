import type { Region } from "@/types/ping";

/**
 * The 10 League of Legends regional servers mapped to the AWS DynamoDB
 * endpoint that hosts each region's game servers. The `/ping` path is a
 * simple CORS-open health check (exploration-verified: `Access-Control-Allow-Origin: *`).
 *
 * Table order is the deterministic tie-break for "best region" when two
 * regions measure the same latency (design D10).
 */
export const REGIONS: Region[] = [
  {
    code: "NA",
    name: "North America",
    flag: "🇺🇸",
    endpoint: "https://dynamodb.us-east-2.amazonaws.com/ping",
  },
  {
    code: "EUW",
    name: "EU West",
    flag: "🇬🇧",
    endpoint: "https://dynamodb.eu-west-2.amazonaws.com/ping",
  },
  {
    code: "EUNE",
    name: "EU Nordic & East",
    flag: "🇪🇺",
    endpoint: "https://dynamodb.eu-central-1.amazonaws.com/ping",
  },
  {
    code: "KR",
    name: "Korea",
    flag: "🇰🇷",
    endpoint: "https://dynamodb.ap-northeast-2.amazonaws.com/ping",
  },
  {
    code: "BR",
    name: "Brazil",
    flag: "🇧🇷",
    endpoint: "https://dynamodb.sa-east-1.amazonaws.com/ping",
  },
  {
    code: "LAS",
    name: "Latin America South",
    flag: "🌎",
    endpoint: "https://dynamodb.sa-east-1.amazonaws.com/ping",
  },
  {
    code: "OCE",
    name: "Oceania",
    flag: "🇦🇺",
    endpoint: "https://dynamodb.ap-southeast-2.amazonaws.com/ping",
  },
  {
    code: "JP",
    name: "Japan",
    flag: "🇯🇵",
    endpoint: "https://dynamodb.ap-northeast-1.amazonaws.com/ping",
  },
  {
    code: "SEA",
    name: "South East Asia",
    flag: "🌏",
    endpoint: "https://dynamodb.ap-southeast-1.amazonaws.com/ping",
  },
  {
    code: "CN",
    name: "China",
    flag: "🇨🇳",
    endpoint: "https://dynamodb.cn-north-1.amazonaws.com.cn/ping",
  },
];
