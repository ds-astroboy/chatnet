import { Preload } from "./types";
interface IframeSrcOptions {
    muted?: boolean;
    loop?: boolean;
    autoplay?: boolean;
    controls?: boolean;
    poster?: string;
    primaryColor?: string;
    letterboxColor?: string;
    startTime?: string | number;
    adUrl?: string;
    defaultTextTrack?: string;
    preload?: Preload;
    customerCode?: string;
}
export declare function useIframeSrc(src: string, { muted, preload, loop, autoplay, controls, poster, primaryColor, letterboxColor, adUrl, startTime, defaultTextTrack, customerCode }: IframeSrcOptions): string;
export {};
