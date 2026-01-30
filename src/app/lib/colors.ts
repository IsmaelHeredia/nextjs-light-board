export const getContrastColor = (hexColor: string | null): string => {
    if (!hexColor) return "text.secondary";

    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 180 ? "rgba(0, 0, 0, 0.75)" : "white";
};