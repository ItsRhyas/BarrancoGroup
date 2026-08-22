import { assetRegistry } from "../game/assets";
import type { AssetId } from "../game/types";

interface AssetViewProps {
  assetId: AssetId;
  label?: string;
  className?: string;
}

export function AssetView({ assetId, label, className = "" }: AssetViewProps) {
  const asset = assetRegistry[assetId];
  if (!asset) {
    return <span className={className}>❓</span>;
  }

  if (asset.type === "emoji") {
    return (
      <span
        className={`asset-emoji ${className}`}
        role="img"
        aria-label={label ?? assetId}
      >
        {asset.emoji}
      </span>
    );
  }

  return (
    <img
      className={`asset-image ${className}`}
      src={asset.src}
      alt={label ?? assetId}
      aria-label={label ?? assetId}
      draggable={false}
      style={
        asset.aspectRatio
          ? { aspectRatio: String(asset.aspectRatio) }
          : undefined
      }
    />
  );
}
