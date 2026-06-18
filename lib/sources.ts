import type { SourceConfig } from "./types";

/**
 * 監視対象の公式サイト一覧。
 *
 * 各サイトは同じCMS（アソビシステム系のファンクラブサイト基盤）を使っており、
 * 「/live_information/schedule/list/」がイベント（ライブ・出演情報）の一覧ページ、
 * 「/live_information/detail/{id}」が個別イベントの詳細ページになっている。
 *
 * サイト側の仕様が変わってこのURLが使えなくなった場合は、
 * scheduleListUrl を実際のEVENT/NEWSページのURLに書き換えればよい。
 */
export const SOURCES: SourceConfig[] = [
  {
    id: "kawaii-lab",
    groupName: "KAWAII LAB.",
    origin: "https://kawaiilab.asobisystem.com",
    scheduleListUrl:
      "https://kawaiilab.asobisystem.com/live_information/schedule/list/",
  },
  {
    id: "fruits-zipper",
    groupName: "FRUITS ZIPPER",
    origin: "https://fruitszipper.asobisystem.com",
    scheduleListUrl:
      "https://fruitszipper.asobisystem.com/live_information/schedule/list/",
  },
  {
    id: "candy-tune",
    groupName: "CANDY TUNE",
    origin: "https://candytune.asobisystem.com",
    scheduleListUrl:
      "https://candytune.asobisystem.com/live_information/schedule/list/",
  },
  {
    id: "sweet-steady",
    groupName: "SWEET STEADY",
    origin: "https://sweetsteady.asobisystem.com",
    scheduleListUrl:
      "https://sweetsteady.asobisystem.com/live_information/schedule/list/",
  },
  {
    id: "cutie-street",
    groupName: "CUTIE STREET",
    origin: "https://cutiestreet.asobisystem.com",
    scheduleListUrl:
      "https://cutiestreet.asobisystem.com/live_information/schedule/list/",
  },
  {
    id: "more-star",
    groupName: "MORE STAR",
    origin: "https://morestar.fanpla.jp",
    scheduleListUrl:
      "https://morestar.fanpla.jp/live_information/schedule/list/",
  },
];
