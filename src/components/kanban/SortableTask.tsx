import {
    Box, Typography, Card, CardContent,
} from "@mui/material";

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tag } from "@/type";
import { getContrastColor } from "@/app/lib/colors";

function SortableTask({ id, task, onClick }: any) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: id,
        data: { type: 'Task', task }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 101 : 1,
        opacity: isDragging ? 0.3 : 1,
        marginBottom: '8px'
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            sx={{ width: '100%', minWidth: 0 }}
        >
            <Card
                onClick={onClick}
                sx={{
                    width: '100%',
                    cursor: "pointer",
                    borderRadius: 1.5,
                    boxShadow: '0px 1px 1px #091e4240',
                    "&:hover": { bgcolor: "action.hover" },
                    overflow: 'hidden'
                }}
            >
                <CardContent sx={{
                    p: '8px 12px !important',
                    display: 'block',
                }}>
                    <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px',
                        mb: 1
                    }}>
                        {task.tags?.map((tag: Tag) => (
                            <Box
                                key={tag.id}
                                sx={{
                                    bgcolor: tag.color,
                                    color: getContrastColor(tag.color),
                                    px: '8px',
                                    py: '2px',
                                    borderRadius: '3px',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    maxWidth: '100%',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {tag.name}
                            </Box>
                        ))}
                    </Box>

                    <Typography
                        sx={{
                            fontSize: '16px',
                            lineHeight: 1.5,
                            color: 'text.primary',
                            wordBreak: 'break-all',
                            overflowWrap: 'anywhere',
                            display: 'block',
                            whiteSpace: 'normal'
                        }}
                    >
                        {task.title}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}

export default SortableTask;