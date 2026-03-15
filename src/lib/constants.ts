import {
  Zap,
  SlidersHorizontal,
  Users,
  Gauge,
  Keyboard,
  Power,
  Eye,
  Download,
  ShieldOff,
  Rocket,
  MonitorSmartphone,
  Feather,
} from "lucide-react";

export const GITHUB_REPO = "JayKayDude/Inertia";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const RELEASE_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`;
export const ASSET_NAME = "Inertia.zip";

export const FEATURES = [
  {
    icon: Zap,
    title: "Physics-Based Scrolling",
    description: "Smooth inertial momentum that feels as natural as a trackpad.",
  },
  {
    icon: SlidersHorizontal,
    title: "Easing Curves",
    description: "Five presets plus a visual curve editor for fine-tuned deceleration.",
  },
  {
    icon: Users,
    title: "Per-App Profiles",
    description: "Custom speed and behavior settings for each application.",
  },
  {
    icon: Gauge,
    title: "Speed & Smoothness Controls",
    description: "Presets and sliders for speed, smoothness, and scroll distance.",
  },
  {
    icon: Keyboard,
    title: "Modifier Hotkeys",
    description: "Hold a key to scroll faster or slower with adjustable multipliers.",
  },
  {
    icon: Power,
    title: "Global Toggle",
    description: "Custom keyboard shortcut to enable or disable Inertia anywhere.",
  },
  {
    icon: Eye,
    title: "Live Preview",
    description: "Test your scroll settings inside the app before applying system-wide.",
  },
  {
    icon: Download,
    title: "Export & Import",
    description: "Back up your settings to a file or share them between machines.",
  },
  {
    icon: ShieldOff,
    title: "App Blacklist",
    description: "Disable smooth scrolling for specific apps that don't need it.",
  },
  {
    icon: Rocket,
    title: "Launch at Login",
    description: "Starts automatically so smooth scrolling is always ready.",
  },
  {
    icon: MonitorSmartphone,
    title: "Menubar Only",
    description: "Lives in the menubar — no Dock icon, no clutter.",
  },
  {
    icon: Feather,
    title: "Tiny Footprint",
    description: "Under 2 MB. Native Swift — no Electron, no bloat.",
  },
] as const;

export const EASING_PRESETS = ["Smooth", "Snappy", "Linear", "Gradual"] as const;

