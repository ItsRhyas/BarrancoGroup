import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { DragType, AssetId } from "../game/types";
import { AssetView } from "./AssetView";

interface DraggableItemProps {
  id: string;
  dragType: DragType;
  assetId: AssetId;
  iconAssetId?: AssetId;
  label: string;
}

export function DraggableItem({ id, dragType, assetId, iconAssetId, label }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { dragType, id },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      className="draggable-item"
      style={style}
      {...listeners}
      {...attributes}
      role="button"
      aria-label={`Arrastrar ${label}`}
    >
      <AssetView assetId={iconAssetId ?? assetId} label={label} />
      <span className="draggable-label">{label}</span>
    </div>
  );
}
